import { createHash, randomBytes } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CLIENT_COOKIE = "docinbox_client";
const SESSION_DAYS = 60;

function getClientSecret() {
  const secret = process.env.CLIENT_SESSION_SECRET;
  if (!secret) throw new Error("CLIENT_SESSION_SECRET no configurado");
  return new TextEncoder().encode(secret);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRawToken(): string {
  return randomBytes(32).toString("base64url");
}

export async function createMagicLink(clientId: string, expiresInDays = 90) {
  const rawToken = generateRawToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await prisma.magicLink.create({
    data: { clientId, tokenHash, expiresAt },
  });

  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  return {
    token: rawToken,
    url: `${appUrl}/c/${rawToken}`,
    expiresAt,
  };
}

export async function consumeMagicLink(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const link = await prisma.magicLink.findUnique({
    where: { tokenHash },
    include: { client: true },
  });

  if (!link || link.revokedAt || link.expiresAt < new Date()) {
    return null;
  }

  return link.client;
}

export type ClientSessionPayload = {
  clientId: string;
  organizationId: string;
};

export async function setClientSession(payload: ClientSessionPayload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getClientSecret());

  const cookieStore = await cookies();
  cookieStore.set(CLIENT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getClientSession(): Promise<ClientSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CLIENT_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getClientSecret());
    if (typeof payload.clientId !== "string" || typeof payload.organizationId !== "string") {
      return null;
    }
    return {
      clientId: payload.clientId,
      organizationId: payload.organizationId,
    };
  } catch {
    return null;
  }
}

export async function clearClientSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_COOKIE);
}

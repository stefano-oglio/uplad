import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getClientSession } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { getStorage } from "@/lib/storage";

type Params = Promise<{ id: string }>;

export async function GET(
  _req: NextRequest,
  { params }: { params: Params }
) {
  const { id } = await params;
  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      clientPeriod: {
        include: { client: true },
      },
    },
  });
  if (!doc) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const advisor = await auth();
  const clientSession = await getClientSession();

  const orgId = doc.clientPeriod.client.organizationId;
  const allowedAsAdvisor =
    advisor?.user?.organizationId === orgId;
  const allowedAsClient =
    clientSession?.clientId === doc.clientPeriod.clientId;

  if (!allowedAsAdvisor && !allowedAsClient) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const storage = getStorage();
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "s3") {
    const url = await storage.getSignedDownloadUrl(doc.storageKey, 300);
    return NextResponse.redirect(url);
  }

  const buffer = await storage.getObjectBuffer(doc.storageKey);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalFileName)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

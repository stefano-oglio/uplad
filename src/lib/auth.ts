import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      organizationId: string;
    };
  }

  interface User {
    role: UserRole;
    organizationId: string;
  }
}

type AppToken = {
  id?: string;
  role?: UserRole;
  organizationId?: string;
  email?: string | null;
  name?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationId: user.organizationId,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      const t = token as AppToken;
      if (user) {
        t.id = user.id!;
        t.role = user.role;
        t.organizationId = user.organizationId;
      }
      return t;
    },
    async session({ session, token }) {
      const t = token as AppToken;
      session.user.id = t.id ?? "";
      session.user.email = t.email ?? "";
      session.user.name = t.name ?? "";
      session.user.role = t.role ?? "ADVISOR";
      session.user.organizationId = t.organizationId ?? "";
      return session;
    },
  },
  trustHost: true,
});

export async function requireAdvisorSession() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("No autorizado");
  }
  return session;
}

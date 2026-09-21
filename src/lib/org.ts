import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAdvisorContext() {
  const session = await auth();
  if (!session?.user?.organizationId) return null;
  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    role: session.user.role,
    name: session.user.name,
    email: session.user.email,
  };
}

export async function requireOrgId() {
  const ctx = await getAdvisorContext();
  if (!ctx) throw new Error("No autorizado");
  return ctx;
}

export async function getActivePeriod(organizationId: string) {
  return prisma.period.findFirst({
    where: { organizationId, isActive: true },
    orderBy: { deadlineDate: "desc" },
  });
}

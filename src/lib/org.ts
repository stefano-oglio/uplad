import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Period } from "@prisma/client";

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

export async function listOrgPeriods(organizationId: string) {
  return prisma.period.findMany({
    where: { organizationId },
    orderBy: [{ year: "desc" }, { quarter: "desc" }, { startDate: "desc" }],
  });
}

/**
 * Periodo en vista (navegación) vs periodo activo (operativo para clientes).
 * Si no hay `periodId` o es inválido → cae al activo.
 */
export async function resolveViewPeriod(
  organizationId: string,
  periodId?: string | null
): Promise<{ viewing: Period | null; active: Period | null }> {
  const active = await getActivePeriod(organizationId);
  if (!periodId) {
    return { viewing: active, active };
  }

  const requested = await prisma.period.findFirst({
    where: { id: periodId, organizationId },
  });

  return {
    viewing: requested ?? active,
    active,
  };
}

export function periodQuery(periodId: string | undefined | null, extra?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (periodId) params.set("period", periodId);
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientPeriodStatus } from "@prisma/client";
import { requireOrgId, getActivePeriod } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { computeDisplayStatus } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { formatDateEs } from "@/lib/utils";
import { DashboardFilters } from "./dashboard-filters";

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

  const params = await searchParams;
  const period = await getActivePeriod(ctx.organizationId);

  if (!period) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        <p className="text-slate-600">
          No hay periodo activo.{" "}
          <Link href="/app/periods" className="text-teal-800 underline">
            Crear periodo
          </Link>
        </p>
      </div>
    );
  }

  const clients = await prisma.client.findMany({
    where: { organizationId: ctx.organizationId },
    include: {
      clientPeriods: {
        where: { periodId: period.id },
        include: { _count: { select: { documents: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  const rows = clients.map((c) => {
    const cp = c.clientPeriods[0];
    const docsCount = cp?._count.documents ?? 0;
    const status = cp
      ? computeDisplayStatus(cp, period, docsCount)
      : ClientPeriodStatus.AT_RISK;
    return {
      id: c.id,
      name: c.name,
      nif: c.nif,
      phone: c.phone,
      email: c.email,
      remindersPaused: c.remindersPaused,
      status,
      docsCount,
      clientPeriodId: cp?.id,
    };
  });

  const statusFilter = params.status as ClientPeriodStatus | "ALL" | undefined;
  const q = (params.q ?? "").toLowerCase().trim();

  const filtered = rows.filter((r) => {
    if (statusFilter && statusFilter !== "ALL" && r.status !== statusFilter) {
      return false;
    }
    if (q && !r.name.toLowerCase().includes(q) && !(r.nif ?? "").toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });

  const counts = {
    COMPLETE: rows.filter((r) => r.status === "COMPLETE").length,
    IN_PROGRESS: rows.filter((r) => r.status === "IN_PROGRESS").length,
    AT_RISK: rows.filter((r) => r.status === "AT_RISK").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Periodo <strong>{period.label}</strong> · Cierre orientativo{" "}
            {formatDateEs(period.deadlineDate)}
          </p>
        </div>
        <div className="flex gap-3 text-sm font-medium">
          <span title="Completo">🟢 {counts.COMPLETE}</span>
          <span title="En curso">🟡 {counts.IN_PROGRESS}</span>
          <span title="En riesgo">🔴 {counts.AT_RISK}</span>
        </div>
      </div>

      <DashboardFilters
        currentStatus={statusFilter ?? "ALL"}
        currentQ={params.q ?? ""}
      />

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Docs</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr
                key={r.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{r.name}</div>
                  {r.nif && (
                    <div className="text-xs text-slate-500">{r.nif}</div>
                  )}
                  {r.remindersPaused && (
                    <div className="text-xs text-amber-700">Recordatorios pausados</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-4 py-3 tabular-nums text-slate-700">
                  {r.docsCount}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{r.phone ?? "—"}</div>
                  <div className="text-xs">{r.email ?? ""}</div>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/app/clients/${r.id}`}
                    className="text-teal-800 hover:underline"
                  >
                    Ver ficha
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No hay clientes con estos filtros
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

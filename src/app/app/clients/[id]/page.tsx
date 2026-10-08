import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ClientPeriodStatus } from "@prisma/client";
import {
  requireOrgId,
  resolveViewPeriod,
  listOrgPeriods,
  periodQuery,
} from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { computeDisplayStatus } from "@/lib/status";
import { StatusBadge } from "@/components/status-badge";
import { formatBytes, formatDateEs, formatDateTimeEs } from "@/lib/utils";
import { STEP_LABEL } from "@/lib/reminders";
import { ClientActions } from "./client-actions";
import { PeriodViewBanner } from "@/components/app/period-view-banner";
import { ClientPeriodNav } from "@/components/app/client-period-nav";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ period?: string }>;

export default async function ClientDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

  const { id } = await params;
  const sp = await searchParams;

  const client = await prisma.client.findFirst({
    where: { id, organizationId: ctx.organizationId },
  });
  if (!client) notFound();

  const periods = await listOrgPeriods(ctx.organizationId);
  const { viewing: period, active } = await resolveViewPeriod(
    ctx.organizationId,
    sp.period
  );

  if (!period) {
    return (
      <p className="text-slate-600">
        Sin periodos.{" "}
        <Link href="/app/periods" className="text-emerald-800 underline">
          Crear uno en Ajustes
        </Link>
      </p>
    );
  }

  const isHistorical = Boolean(active && active.id !== period.id);

  // All ClientPeriods for this client (for the period strip)
  const allCps = await prisma.clientPeriod.findMany({
    where: { clientId: client.id },
    include: { _count: { select: { documents: true } }, period: true },
  });
  const cpByPeriod = new Map(allCps.map((cp) => [cp.periodId, cp]));

  const navItems = periods.map((p) => {
    const existing = cpByPeriod.get(p.id);
    const docsCount = existing?._count.documents ?? 0;
    const status = existing
      ? computeDisplayStatus(existing, p, docsCount)
      : ClientPeriodStatus.AT_RISK;
    return {
      periodId: p.id,
      label: p.label,
      isActive: p.isActive,
      status,
      docsCount,
    };
  });

  let cp = await prisma.clientPeriod.findUnique({
    where: {
      clientId_periodId: { clientId: client.id, periodId: period.id },
    },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
      reminderJobs: { orderBy: { scheduledFor: "asc" } },
      reminderEvents: { orderBy: { createdAt: "desc" }, take: 30 },
    },
  });

  if (!cp) {
    cp = await prisma.clientPeriod.create({
      data: {
        clientId: client.id,
        periodId: period.id,
        status: "AT_RISK",
      },
      include: {
        documents: true,
        reminderJobs: true,
        reminderEvents: true,
      },
    });
  }

  const status = computeDisplayStatus(cp, period, cp.documents.length);

  const docsWithUrls = cp.documents;

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href={`/app${periodQuery(period.id)}`}
            className="text-emerald-800 hover:underline"
          >
            ← Inicio
          </Link>
          <Link
            href="/app/clients"
            className="text-slate-500 hover:text-emerald-800 hover:underline"
          >
            Clientes
          </Link>
          <Link
            href={`/app/clients/${client.id}/edit`}
            className="text-slate-500 hover:text-emerald-800 hover:underline"
          >
            Editar perfil
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{client.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {client.nif ?? "Sin NIF"} · {client.phone ?? "Sin teléfono"} ·{" "}
              {client.email ?? "Sin email"}
            </p>
            {client.notes && (
              <p className="mt-2 text-sm text-slate-500">{client.notes}</p>
            )}
          </div>
        </div>
      </div>

      <ClientPeriodNav
        clientId={client.id}
        items={navItems}
        currentPeriodId={period.id}
      />

      {isHistorical && active && (
        <PeriodViewBanner
          viewingLabel={period.label}
          activeLabel={active.label}
          activePeriodId={active.id}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div>
          <p className="text-sm text-slate-500">Viendo periodo</p>
          <p className="font-semibold text-slate-900">
            {period.label}{" "}
            <span className="font-normal text-slate-500">
              · cierre {formatDateEs(period.deadlineDate)}
            </span>
          </p>
        </div>
        <StatusBadge status={status} className="text-sm" />
      </div>

      <ClientActions
        clientId={client.id}
        clientPeriodId={cp.id}
        status={status}
        remindersPaused={client.remindersPaused}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Documentos de {period.label}
          <span className="ml-2 text-sm font-normal text-slate-500">
            ({docsWithUrls.length})
          </span>
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white">
          {docsWithUrls.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              Este cliente no ha subido documentos en {period.label}
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {docsWithUrls.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{d.originalFileName}</div>
                    <div className="text-xs text-slate-500">
                      {formatBytes(d.sizeBytes)} ·{" "}
                      {formatDateTimeEs(d.createdAt)}
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${d.id}/download`}
                    className="text-emerald-800 hover:underline"
                  >
                    Descargar
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          Recordatorios · {period.label}
        </h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Escalón</th>
                <th className="px-4 py-2">Programado</th>
                <th className="px-4 py-2">Estado</th>
                <th className="px-4 py-2">Canal</th>
              </tr>
            </thead>
            <tbody>
              {cp.reminderJobs.map((j) => (
                <tr
                  key={j.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-4 py-2">{STEP_LABEL[j.step]}</td>
                  <td className="px-4 py-2">
                    {formatDateTimeEs(j.scheduledFor)}
                  </td>
                  <td className="px-4 py-2">{j.status}</td>
                  <td className="px-4 py-2">{j.channel}</td>
                </tr>
              ))}
              {cp.reminderJobs.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-500"
                  >
                    Sin jobs de recordatorio en este periodo
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Historial · {period.label}</h2>
        <ul className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
          {cp.reminderEvents.length === 0 && (
            <li className="text-slate-500">Sin eventos en este periodo</li>
          )}
          {cp.reminderEvents.map((e) => (
            <li
              key={e.id}
              className="flex justify-between gap-4 border-b border-slate-50 pb-2 last:border-0"
            >
              <span className="font-medium text-slate-800">{e.type}</span>
              <span className="shrink-0 text-xs text-slate-500">
                {formatDateTimeEs(e.createdAt)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

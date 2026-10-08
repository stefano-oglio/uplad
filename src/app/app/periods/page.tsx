import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/utils";
import { createPeriodAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SetActiveButton } from "./set-active-button";

export default async function PeriodsPage() {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

  const periods = await prisma.period.findMany({
    where: { organizationId: ctx.organizationId },
    include: {
      _count: { select: { clientPeriods: true } },
      clientPeriods: {
        select: { status: true },
      },
    },
    orderBy: [{ year: "desc" }, { quarter: "desc" }],
  });

  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;

  // Group by year for timeline
  const byYear = periods.reduce<Record<number, typeof periods>>((acc, p) => {
    (acc[p.year] ??= []).push(p);
    return acc;
  }, {});
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm">
          <Link href="/app/settings" className="text-emerald-800 hover:underline">
            ← Ajustes
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Periodos</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          El <strong>periodo activo</strong> es al que suben los clientes. Puedes{" "}
          <strong>ver</strong> cualquier periodo pasado en Inicio sin cambiar el
          activo.
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-8">
        {years.length === 0 && (
          <p className="text-slate-500">Todavía no hay periodos creados.</p>
        )}
        {years.map((y) => (
          <section key={y} className="space-y-3">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900">
              {y}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {byYear[y].map((p) => {
                const complete = p.clientPeriods.filter(
                  (c) => c.status === "COMPLETE"
                ).length;
                const inProgress = p.clientPeriods.filter(
                  (c) => c.status === "IN_PROGRESS"
                ).length;
                const atRisk = p.clientPeriods.filter(
                  (c) => c.status === "AT_RISK"
                ).length;
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border bg-white p-4 ${
                      p.isActive
                        ? "border-emerald-300 ring-1 ring-emerald-200"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{p.label}</p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Cierre {formatDateEs(p.deadlineDate)}
                        </p>
                      </div>
                      {p.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                          Activo
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                          Histórico
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs text-slate-500">
                      {p._count.clientPeriods} clientes · 🟢 {complete} · 🟡{" "}
                      {inProgress} · 🔴 {atRisk}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={`/app?period=${p.id}`}>Ver en Inicio</Link>
                      </Button>
                      {!p.isActive && (
                        <SetActiveButton periodId={p.id} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <form
        action={async (fd) => {
          "use server";
          await createPeriodAction(fd);
        }}
        className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6"
      >
        <h2 className="font-medium">Nuevo periodo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="label">Etiqueta</Label>
            <Input
              id="label"
              name="label"
              required
              defaultValue={`${quarter}T ${year}`}
              placeholder="3T 2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="year">Año</Label>
            <Input
              id="year"
              name="year"
              type="number"
              required
              defaultValue={year}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quarter">Trimestre</Label>
            <Input
              id="quarter"
              name="quarter"
              type="number"
              min={1}
              max={4}
              defaultValue={quarter}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              required
              defaultValue={new Date(year, (quarter - 1) * 3, 1)
                .toISOString()
                .slice(0, 10)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Fin</Label>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              required
              defaultValue={new Date(year, quarter * 3, 0)
                .toISOString()
                .slice(0, 10)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="deadlineDate">Cierre orientativo</Label>
            <Input
              id="deadlineDate"
              name="deadlineDate"
              type="date"
              required
              defaultValue={new Date(Date.now() + 25 * 86400000)
                .toISOString()
                .slice(0, 10)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              className="rounded border-slate-300"
            />
            Activar este periodo ahora (los clientes subirán aquí)
          </label>
        </div>
        <Button type="submit">Crear periodo</Button>
      </form>
    </div>
  );
}

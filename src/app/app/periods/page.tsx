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
    orderBy: [{ year: "desc" }, { quarter: "desc" }],
  });

  const now = new Date();
  const year = now.getFullYear();
  const quarter = Math.floor(now.getMonth() / 3) + 1;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Periodos</h1>
        <p className="mt-1 text-sm text-slate-600">
          Crea periodos tipo 2026-Q3 con fecha de cierre orientativo.
        </p>
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
            <Input id="year" name="year" type="number" required defaultValue={year} />
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
              defaultValue={new Date(year, quarter * 3, 0).toISOString().slice(0, 10)}
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
            <input type="checkbox" name="isActive" className="rounded border-slate-300" />
            Activar este periodo (crea ClientPeriod para todos los clientes)
          </label>
        </div>
        <Button type="submit">Crear periodo</Button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Periodo</th>
              <th className="px-4 py-3">Cierre orientativo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3 font-medium">{p.label}</td>
                <td className="px-4 py-3">{formatDateEs(p.deadlineDate)}</td>
                <td className="px-4 py-3">
                  {p.isActive ? (
                    <span className="text-emerald-700">Activo</span>
                  ) : (
                    <span className="text-slate-400">Inactivo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {!p.isActive && <SetActiveButton periodId={p.id} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

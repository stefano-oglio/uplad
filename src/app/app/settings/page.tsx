import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { formatDateEs } from "@/lib/utils";
import { OrgSettingsForm } from "./org-settings-form";
import { Button } from "@/components/ui/button";

export default async function SettingsPage() {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

  const org = await prisma.organization.findUniqueOrThrow({
    where: { id: ctx.organizationId },
  });

  const periods = await prisma.period.findMany({
    where: { organizationId: ctx.organizationId },
    orderBy: [{ year: "desc" }, { quarter: "desc" }],
    take: 5,
  });

  const active = periods.find((p) => p.isActive);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ajustes</h1>
        <p className="mt-1 text-sm text-slate-600">
          Configuración básica del despacho.
        </p>
      </div>

      <section className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-slate-900">Despacho</h2>
        <OrgSettingsForm initialName={org.name} />
      </section>

      <section className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="font-medium text-slate-900">Tu cuenta</h2>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium text-slate-900">{ctx.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium text-slate-900">{ctx.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Rol</dt>
            <dd className="font-medium text-slate-900">
              {ctx.role === "ADMIN" ? "Administrador" : "Asesor"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="max-w-xl space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-medium text-slate-900">Periodos fiscales</h2>
            <p className="mt-1 text-sm text-slate-600">
              {active
                ? `Activo: ${active.label} · cierre ${formatDateEs(active.deadlineDate)}`
                : "No hay periodo activo"}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/app/periods">Gestionar</Link>
          </Button>
        </div>
        {periods.length > 0 && (
          <ul className="divide-y divide-slate-100 text-sm">
            {periods.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-2 text-slate-700"
              >
                <span>{p.label}</span>
                <span className="text-xs text-slate-400">
                  {p.isActive ? "Activo" : "Inactivo"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

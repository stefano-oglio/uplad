import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

type SearchParams = Promise<{ q?: string }>;

export default async function ClientsDirectoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

  const params = await searchParams;
  const q = (params.q ?? "").trim();

  const clients = await prisma.client.findMany({
    where: {
      organizationId: ctx.organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { nif: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Alta y edición de perfiles. {clients.length} en el despacho.
          </p>
        </div>
        <Button asChild>
          <Link href="/app/clients/new">Nuevo cliente</Link>
        </Button>
      </div>

      <form className="max-w-sm">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, NIF, email…"
          className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">NIF</th>
              <th className="px-4 py-3 font-medium">Contacto</th>
              <th className="px-4 py-3 font-medium">Notas</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.id}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">{c.name}</div>
                  {c.remindersPaused && (
                    <div className="text-xs text-amber-700">
                      Recordatorios pausados
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">{c.nif ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  <div>{c.phone ?? "—"}</div>
                  <div className="text-xs">{c.email ?? ""}</div>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-slate-500">
                  {c.notes ?? "—"}
                </td>
                <td className="space-x-3 px-4 py-3 text-right whitespace-nowrap">
                  <Link
                    href={`/app/clients/${c.id}/edit`}
                    className="text-emerald-800 hover:underline"
                  >
                    Editar
                  </Link>
                  <Link
                    href={`/app/clients/${c.id}`}
                    className="text-slate-600 hover:underline"
                  >
                    Periodo
                  </Link>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-500"
                >
                  {q
                    ? "Ningún cliente coincide con la búsqueda"
                    : "Aún no hay clientes. Crea el primero."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

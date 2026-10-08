import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrgId } from "@/lib/org";
import { prisma } from "@/lib/prisma";
import { ClientForm } from "../../client-form";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ created?: string }>;

export default async function EditClientPage({
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

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app/clients"
          className="text-sm text-emerald-800 hover:underline"
        >
          ← Clientes
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          Editar cliente
        </h1>
        <p className="mt-1 text-sm text-slate-600">{client.name}</p>
        {sp.created === "1" && (
          <p className="mt-2 text-sm text-emerald-700">
            Cliente creado. Puedes completar o ajustar los datos.
          </p>
        )}
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ClientForm
          mode="edit"
          clientId={client.id}
          initial={{
            name: client.name,
            nif: client.nif ?? "",
            phone: client.phone ?? "",
            email: client.email ?? "",
            notes: client.notes ?? "",
            remindersPaused: client.remindersPaused,
          }}
        />
      </div>
      <p className="text-sm text-slate-500">
        Para documentos y semáforo del periodo activo, ve a{" "}
        <Link
          href={`/app/clients/${client.id}`}
          className="text-emerald-800 underline"
        >
          la ficha de periodo
        </Link>
        .
      </p>
    </div>
  );
}

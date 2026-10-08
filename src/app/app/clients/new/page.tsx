import Link from "next/link";
import { redirect } from "next/navigation";
import { requireOrgId } from "@/lib/org";
import { ClientForm } from "../client-form";

export default async function NewClientPage() {
  const ctx = await requireOrgId().catch(() => null);
  if (!ctx) redirect("/login");

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
          Nuevo cliente
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Rellena el perfil. Si hay periodo activo, se añade automáticamente al
          panel de Inicio.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-6">
        <ClientForm mode="create" />
      </div>
    </div>
  );
}

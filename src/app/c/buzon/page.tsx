import { redirect } from "next/navigation";
import { getClientSession } from "@/lib/magic-link";
import { prisma } from "@/lib/prisma";
import { formatBytes, formatDateTimeEs } from "@/lib/utils";
import { ClientUploadPanel } from "./upload-panel";

export default async function ClientMailboxPage() {
  const session = await getClientSession();
  if (!session) redirect("/");

  const client = await prisma.client.findUnique({
    where: { id: session.clientId },
  });
  if (!client) redirect("/");

  const period = await prisma.period.findFirst({
    where: { organizationId: session.organizationId, isActive: true },
  });

  if (!period) {
    return (
      <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-teal-950">
          Uplad
        </h1>
        <p className="mt-4 text-slate-600">
          Tu gestoría aún no ha activado un periodo. Vuelve más tarde.
        </p>
      </main>
    );
  }

  let cp = await prisma.clientPeriod.findUnique({
    where: {
      clientId_periodId: { clientId: client.id, periodId: period.id },
    },
    include: {
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!cp) {
    cp = await prisma.clientPeriod.create({
      data: {
        clientId: client.id,
        periodId: period.id,
        status: "AT_RISK",
      },
      include: { documents: true },
    });
  }

  const isComplete = cp.status === "COMPLETE";

  return (
    <main className="mx-auto min-h-screen max-w-lg px-4 pb-16 pt-8">
      <p className="text-sm font-medium uppercase tracking-wide text-teal-800/80">
        Uplad
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-teal-950">
        Sube facturas de {period.label}
      </h1>
      <p className="mt-2 text-slate-600">Hola, {client.name}</p>

      {isComplete ? (
        <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-lg font-medium text-emerald-900">
            Perfecto. No te molestaremos más por este periodo.
          </p>
          <p className="mt-2 text-sm text-emerald-800/80">
            Si necesitas subir algo más, pide a tu asesor que reabra el periodo.
          </p>
        </div>
      ) : (
        <ClientUploadPanel />
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Ya subidos
        </h2>
        {cp.documents.length === 0 ? (
          <p className="mt-3 text-slate-500">Todavía no hay documentos</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {cp.documents.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{d.originalFileName}</p>
                  <p className="text-xs text-slate-500">
                    {formatBytes(d.sizeBytes)} · {formatDateTimeEs(d.createdAt)}
                  </p>
                </div>
                <span className="text-emerald-700 text-sm">Recibido</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

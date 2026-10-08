import Link from "next/link";

export function PeriodViewBanner({
  viewingLabel,
  activeLabel,
  activePeriodId,
}: {
  viewingLabel: string;
  activeLabel: string;
  activePeriodId: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p>
        Estás viendo el periodo histórico <strong>{viewingLabel}</strong>. Los
        clientes suben al periodo activo (<strong>{activeLabel}</strong>).
      </p>
      <Link
        href={`/app?period=${activePeriodId}`}
        className="shrink-0 font-medium text-amber-900 underline underline-offset-2"
      >
        Ir al activo
      </Link>
    </div>
  );
}

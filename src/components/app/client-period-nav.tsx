import Link from "next/link";
import { ClientPeriodStatus } from "@prisma/client";
import { STATUS_EMOJI } from "@/lib/status";
import { cn } from "@/lib/utils";

export type ClientPeriodNavItem = {
  periodId: string;
  label: string;
  isActive: boolean;
  status: ClientPeriodStatus;
  docsCount: number;
};

export function ClientPeriodNav({
  clientId,
  items,
  currentPeriodId,
}: {
  clientId: string;
  items: ClientPeriodNavItem[];
  currentPeriodId: string;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Periodos de este cliente
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">
            Elige un periodo para ver qué ha subido y el estado del cierre.
          </p>
        </div>
      </div>

      <div
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
        role="tablist"
        aria-label="Periodos del cliente"
      >
        {items.map((item) => {
          const selected = item.periodId === currentPeriodId;
          return (
            <Link
              key={item.periodId}
              href={`/app/clients/${clientId}?period=${item.periodId}`}
              role="tab"
              aria-selected={selected}
              className={cn(
                "min-w-[8.5rem] shrink-0 rounded-xl border px-3 py-3 transition",
                selected
                  ? "border-[#0b1628] bg-[#0b1628] text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{item.label}</span>
                <span aria-hidden>{STATUS_EMOJI[item.status]}</span>
              </div>
              <p
                className={cn(
                  "mt-1 text-xs",
                  selected ? "text-white/60" : "text-slate-500"
                )}
              >
                {item.docsCount} doc{item.docsCount === 1 ? "" : "s"}
                {item.isActive ? " · activo" : ""}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

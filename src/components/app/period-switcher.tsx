"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export type PeriodOption = {
  id: string;
  label: string;
  isActive: boolean;
  year: number;
  quarter: number | null;
};

export function PeriodSwitcher({
  periods,
  currentPeriodId,
}: {
  periods: PeriodOption[];
  currentPeriodId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const idx = periods.findIndex((p) => p.id === currentPeriodId);
  const prev = idx >= 0 && idx < periods.length - 1 ? periods[idx + 1] : null; // list is desc
  const next = idx > 0 ? periods[idx - 1] : null;

  function goTo(periodId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", periodId);
    // Reset status filter when changing period — cleaner context switch
    params.delete("status");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={!prev}
        onClick={() => prev && goTo(prev.id)}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-30"
        title={prev ? `Anterior: ${prev.label}` : undefined}
      >
        ←
      </button>

      <label className="sr-only" htmlFor="period-switcher">
        Periodo
      </label>
      <select
        id="period-switcher"
        value={currentPeriodId}
        onChange={(e) => goTo(e.target.value)}
        className="h-9 min-w-[10rem] rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
      >
        {periods.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
            {p.isActive ? " · activo" : ""}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={!next}
        onClick={() => next && goTo(next.id)}
        className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-600 transition enabled:hover:bg-slate-50 disabled:opacity-30"
        title={next ? `Siguiente: ${next.label}` : undefined}
      >
        →
      </button>
    </div>
  );
}

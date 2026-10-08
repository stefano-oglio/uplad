"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function DashboardFilters({
  currentStatus,
  currentQ,
  periodId,
}: {
  currentStatus: string;
  currentQ: string;
  periodId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function update(next: { status?: string; q?: string }) {
    const params = new URLSearchParams();
    params.set("period", periodId);
    const status = next.status ?? currentStatus;
    const q = next.q ?? currentQ;
    if (status && status !== "ALL") params.set("status", status);
    if (q) params.set("q", q);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex gap-1 rounded-md border border-slate-200 bg-white p-1 text-sm">
        {(
          [
            ["ALL", "Todos"],
            ["AT_RISK", "🔴 Rojo"],
            ["IN_PROGRESS", "🟡 Amarillo"],
            ["COMPLETE", "🟢 Verde"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => update({ status: value })}
            className={`rounded px-3 py-1.5 transition-colors ${
              currentStatus === value
                ? "bg-[#0b1628] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <Input
        className="max-w-xs"
        placeholder="Buscar cliente o NIF…"
        defaultValue={currentQ}
        onChange={(e) => {
          const value = e.target.value;
          window.clearTimeout((window as unknown as { __q?: number }).__q);
          (window as unknown as { __q?: number }).__q = window.setTimeout(() => {
            update({ q: value });
          }, 300);
        }}
      />
    </div>
  );
}

"use client";

import { useEffect, useState, useTransition } from "react";

type Status = "AT_RISK" | "IN_PROGRESS" | "COMPLETE";

type DemoClient = {
  id: string;
  name: string;
  status: Status;
  docs: number;
};

const INITIAL: DemoClient[] = [
  { id: "1", name: "Bar La Esquina", status: "COMPLETE", docs: 12 },
  { id: "2", name: "Taxi García", status: "IN_PROGRESS", docs: 4 },
  { id: "3", name: "Reformas Norte", status: "AT_RISK", docs: 0 },
  { id: "4", name: "Farmacia Sol", status: "COMPLETE", docs: 9 },
  { id: "5", name: "Café Central", status: "AT_RISK", docs: 0 },
  { id: "6", name: "Fontanería Méndez", status: "IN_PROGRESS", docs: 2 },
];

const STATUS_UI: Record<
  Status,
  { emoji: string; label: string; row: string; pill: string }
> = {
  COMPLETE: {
    emoji: "🟢",
    label: "Completo",
    row: "bg-emerald-500/10",
    pill: "text-emerald-300",
  },
  IN_PROGRESS: {
    emoji: "🟡",
    label: "En curso",
    row: "bg-amber-400/10",
    pill: "text-amber-200",
  },
  AT_RISK: {
    emoji: "🔴",
    label: "En riesgo",
    row: "bg-rose-500/10",
    pill: "text-rose-300",
  },
};

export function InteractiveDashboardDemo() {
  const [clients, setClients] = useState(INITIAL);
  const [selected, setSelected] = useState<string>("3");
  const [flash, setFlash] = useState<string | null>(null);
  const [, start] = useTransition();

  const counts = {
    COMPLETE: clients.filter((c) => c.status === "COMPLETE").length,
    IN_PROGRESS: clients.filter((c) => c.status === "IN_PROGRESS").length,
    AT_RISK: clients.filter((c) => c.status === "AT_RISK").length,
  };

  const active = clients.find((c) => c.id === selected) ?? clients[0];

  function simulateUpload() {
    start(() => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selected
            ? {
                ...c,
                docs: c.docs + 1,
                status: c.status === "COMPLETE" ? "COMPLETE" : "IN_PROGRESS",
              }
            : c
        )
      );
      setFlash("Documento recibido");
    });
  }

  function markComplete() {
    start(() => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selected
            ? { ...c, status: "COMPLETE" as const }
            : c
        )
      );
      setFlash("Periodo cerrado · recordatorios cancelados");
    });
  }

  function reopenRisk() {
    start(() => {
      setClients((prev) =>
        prev.map((c) =>
          c.id === selected
            ? {
                ...c,
                status: c.docs > 0 ? "IN_PROGRESS" : "AT_RISK",
              }
            : c
        )
      );
      setFlash(null);
    });
  }

  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(t);
  }, [flash]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <p className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wide">
              Uplad · Panel
            </p>
            <p className="text-xs text-white/50">Periodo 3T 2026 · interactivo</p>
          </div>
          <div className="flex gap-3 text-sm font-medium tabular-nums">
            <span title="Completo">🟢 {counts.COMPLETE}</span>
            <span title="En curso">🟡 {counts.IN_PROGRESS}</span>
            <span title="En riesgo">🔴 {counts.AT_RISK}</span>
          </div>
        </div>
        <ul className="divide-y divide-white/5">
          {clients.map((c) => {
            const ui = STATUS_UI[c.status];
            const isActive = c.id === selected;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition-colors ${
                    isActive ? ui.row : "hover:bg-white/5"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-white/45">{c.docs} docs</p>
                  </div>
                  <span className={`text-xs font-medium ${ui.pill}`}>
                    {ui.emoji} {ui.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0f1c31] p-5 text-white">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Ficha cliente
          </p>
          <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
            {active.name}
          </h3>
          <p className={`mt-2 text-sm ${STATUS_UI[active.status].pill}`}>
            {STATUS_UI[active.status].emoji} {STATUS_UI[active.status].label} ·{" "}
            {active.docs} documentos
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Prueba el flujo: sube un documento (pasa a amarillo) y cierra el
            periodo (pasa a verde y cancela recordatorios).
          </p>
        </div>

        <div className="mt-6 space-y-2">
          {flash && (
            <p className="animate-uplad-slide rounded-lg bg-[#3dffa8]/15 px-3 py-2 text-sm text-[#3dffa8]">
              {flash}
            </p>
          )}
          <button
            type="button"
            onClick={simulateUpload}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#0b1220] transition hover:bg-[#3dffa8]"
          >
            Simular subida de factura
          </button>
          {active.status !== "COMPLETE" ? (
            <button
              type="button"
              onClick={markComplete}
              className="w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:border-[#3dffa8]/50 hover:text-[#3dffa8]"
            >
              Marcar periodo completo
            </button>
          ) : (
            <button
              type="button"
              onClick={reopenRisk}
              className="w-full rounded-xl border border-white/20 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/5"
            >
              Reabrir periodo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

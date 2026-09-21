"use client";

import { useState } from "react";

const CHAOS = [
  { who: "Ana (asesora)", text: "¿Me pasas las facturas del 3T?", time: "09:14" },
  { who: "Cliente", text: "ahora las miro 👍", time: "11:02" },
  { who: "Ana (asesora)", text: "¿Alguna novedad?", time: "Ayer" },
  { who: "Cliente", text: "[foto borrosa]", time: "Ayer" },
  { who: "Ana (asesora)", text: "Falta el ticket del material…", time: "Hoy" },
];

const STEPS = [
  "Abre el enlace",
  "Hace foto / elige archivo",
  "Pulsa «He subido todo»",
];

export function ChaosVsUpladDemo() {
  const [mode, setMode] = useState<"chaos" | "uplad">("chaos");
  const [step, setStep] = useState(0);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_30px_80px_-40px_rgba(7,17,31,0.45)]">
      <div className="flex border-b border-slate-100 p-2">
        <button
          type="button"
          onClick={() => setMode("chaos")}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === "chaos"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Antes: WhatsApp eterno
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("uplad");
            setStep(0);
          }}
          className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            mode === "uplad"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Con Uplad
        </button>
      </div>

      <div className="grid min-h-[360px] md:grid-cols-2">
        {mode === "chaos" ? (
          <>
            <div className="space-y-3 bg-[#e5ddd5] p-5">
              {CHAOS.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm animate-uplad-rise ${
                    m.who.includes("Ana")
                      ? "ml-auto bg-[#dcf8c6] text-slate-800"
                      : "bg-white text-slate-800"
                  }`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {m.who} · {m.time}
                  </p>
                  <p className="mt-0.5">{m.text}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col justify-center bg-slate-50 p-8">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
                14 mensajes. 0 certezas.
              </p>
              <p className="mt-3 text-slate-600 leading-relaxed">
                No sabes quién ha cerrado el periodo, qué falta, ni cuándo
                volver a escribir. El cierre se come horas que no facturas.
              </p>
              <button
                type="button"
                onClick={() => setMode("uplad")}
                className="mt-6 self-start text-sm font-semibold text-emerald-700 hover:underline"
              >
                Ver cómo queda con Uplad →
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#0b1628] to-[#132033] p-6 text-white">
              <div className="w-full max-w-[260px] rounded-[2rem] border border-white/15 bg-[#07111f] p-4 shadow-xl animate-uplad-glow">
                <p className="text-center text-[10px] uppercase tracking-[0.25em] text-[#3dffa8]/80">
                  Uplad
                </p>
                <p className="mt-3 text-center font-[family-name:var(--font-display)] text-xl font-semibold">
                  Sube facturas de 3T 2026
                </p>
                <div className="mt-6 space-y-2">
                  {STEPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStep(i)}
                      className={`w-full rounded-xl px-3 py-3 text-left text-sm transition ${
                        step === i
                          ? "bg-[#3dffa8] font-semibold text-[#07111f]"
                          : step > i
                            ? "bg-white/10 text-[#3dffa8]"
                            : "bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {step > i ? "✓ " : `${i + 1}. `}
                      {label}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-center text-xs text-white/45">
                  Toca los pasos · demo del cliente
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-white p-8">
              <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-900">
                Un enlace. Un toque. Semáforo en verde.
              </p>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {step === 0 &&
                  "El cliente abre el magic link desde WhatsApp o email. Sin contraseña. Sin app que instalar."}
                {step === 1 &&
                  "Hace foto o elige el PDF. Tú lo ves al instante en la ficha, con historial limpio."}
                {step === 2 &&
                  "Marca «He subido todo»: periodo 🟢 y se cancelan los recordatorios pendientes."}
              </p>
              <div className="mt-6 flex gap-2">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Paso ${i + 1}`}
                    onClick={() => setStep(i)}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      step >= i ? "bg-emerald-600" : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

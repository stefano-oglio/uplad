"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "¿Mis clientes necesitan instalar una app?",
    a: "No. Abren un enlace, suben la foto o el PDF y listo. Sin contraseñas ni cuentas nuevas.",
  },
  {
    q: "¿Sustituye a WhatsApp?",
    a: "Sustituye el caos de perseguir documentos por WhatsApp. Puedes seguir avisando por WhatsApp: Uplad te genera el mensaje con el enlace para pegar.",
  },
  {
    q: "¿Funciona para un despacho con muchos autónomos?",
    a: "Sí. El panel está pensado para ver de un vistazo quién está 🔴, 🟡 o 🟢 en el periodo activo — y actuar solo donde hace falta.",
  },
  {
    q: "¿Y si el cliente dice que ya lo envió?",
    a: "La fuente de verdad es el periodo: documentos recibidos, estado y historial de recordatorios. Se acabó el «yo te lo mandé».",
  },
  {
    q: "¿Hay OCR o presentación a Hacienda?",
    a: "En esta versión el foco es recepción + control. OCR y presentación AEAT quedan fuera a propósito: primero cerrar el cuello de botella.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="divide-y divide-slate-200 border-y border-slate-200">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              className="flex w-full items-start justify-between gap-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-slate-900 md:text-xl">
                {item.q}
              </span>
              <span
                className={`mt-1 text-slate-400 transition ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="animate-uplad-slide pb-5 pr-10 text-slate-600 leading-relaxed">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

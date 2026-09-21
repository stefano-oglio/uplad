import Link from "next/link";
import { ChaosVsUpladDemo } from "@/components/landing/chaos-vs-uplad-demo";
import { InteractiveDashboardDemo } from "@/components/landing/interactive-dashboard-demo";
import { LandingFaq } from "@/components/landing/landing-faq";

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      {/* ——— HERO: one composition, brand-first, full-bleed visual ——— */}
      <section className="landing-grain relative min-h-[100svh] bg-[#07111f] text-white">
        <div
          className="pointer-events-none absolute inset-0 animate-uplad-pulse"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 70% 40%, rgba(61,255,168,0.16) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 15% 80%, rgba(56,120,255,0.12) 0%, transparent 50%), linear-gradient(165deg, #07111f 0%, #0c1a2e 55%, #091420 100%)",
          }}
        />

        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight text-white">
            Uplad
          </span>
          <nav className="flex items-center gap-3">
            <a
              href="#dolor"
              className="hidden text-sm text-white/60 transition hover:text-white sm:inline"
            >
              El problema
            </a>
            <a
              href="#demo"
              className="hidden text-sm text-white/60 transition hover:text-white md:inline"
            >
              Demo
            </a>
            <Link
              href="/login"
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-[#3dffa8]/50 hover:text-[#3dffa8]"
            >
              Acceso asesores
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto grid max-w-6xl items-end gap-10 px-6 pb-16 pt-10 lg:grid-cols-[1fr_1.15fr] lg:pb-20 lg:pt-8">
          <div className="max-w-xl">
            <p className="animate-uplad-rise font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Uplad
            </p>
            <h1 className="animate-uplad-rise-delay-1 mt-5 text-2xl font-medium leading-snug text-white/90 sm:text-3xl lg:text-[2.15rem]">
              Deja de perseguir facturas. Controla cada periodo de un vistazo.
            </h1>
            <p className="animate-uplad-rise-delay-2 mt-4 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
              Tus clientes suben en un toque. Tú ves semáforos por periodo
              fiscal — y solo escribes a quien falta.
            </p>
            <div className="animate-uplad-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#3dffa8] px-7 text-sm font-bold text-[#07111f] transition hover:bg-white"
              >
                Entrar al panel
              </Link>
              <a
                href="#demo"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium text-white transition hover:border-white/50"
              >
                Probar la demo
              </a>
            </div>
          </div>

          {/* Full-bleed product plane — not a card collage */}
          <div
            className="animate-uplad-rise-delay-2 relative min-h-[320px] overflow-hidden rounded-tl-[2rem] border border-white/10 bg-[#0b1628]/80 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] backdrop-blur-sm lg:min-h-[420px] lg:translate-x-6 lg:rounded-tl-[2.5rem]"
            aria-hidden
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(7,17,31,0.35)_100%)]" />
            <div className="relative flex h-full flex-col p-5 sm:p-6">
              <div className="flex items-center justify-between text-xs text-white/45">
                <span>Periodo activo · 3T 2026</span>
                <span className="tabular-nums">🟢 4 · 🟡 6 · 🔴 10</span>
              </div>
              <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-white sm:text-3xl">
                Semáforos que cierran trimestres
              </p>
              <div className="mt-6 flex-1 space-y-2">
                {[
                  ["Bar La Esquina", "COMPLETE", "12 docs"],
                  ["Taxi García", "IN_PROGRESS", "4 docs"],
                  ["Reformas Norte", "AT_RISK", "0 docs"],
                  ["Café Central", "AT_RISK", "0 docs"],
                  ["Farmacia Sol", "COMPLETE", "9 docs"],
                ].map(([name, status, docs], i) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm"
                    style={{ animationDelay: `${0.4 + i * 0.08}s` }}
                  >
                    <span className="text-white/85">{name}</span>
                    <span className="text-xs text-white/50">
                      {status === "COMPLETE" && "🟢 Completo"}
                      {status === "IN_PROGRESS" && "🟡 En curso"}
                      {status === "AT_RISK" && "🔴 En riesgo"}
                      <span className="ml-2 hidden text-white/30 sm:inline">
                        {docs}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— PAIN ——— */}
      <section id="dolor" className="scroll-mt-16 bg-[#f3f5f4] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            El coste invisible
          </p>
          <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Cada trimestre se te va en perseguir papeles, no en asesorar.
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
            {[
              {
                title: "WhatsApp sin estado",
                body: "Hilos eternos, fotos borrosas y «ya te lo mandé». Nadie sabe qué falta de verdad.",
              },
              {
                title: "Email que se pierde",
                body: "Adjuntos en carpetas personales, asuntos distintos, cero visión de despacho.",
              },
              {
                title: "Cierres a ciegas",
                body: "Descubres el agujero el día del deadline. Entonces ya es tarde — y caro.",
              },
            ].map((item) => (
              <div key={item.title} className="border-t border-slate-300 pt-6">
                <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— BEFORE / AFTER INTERACTIVE ——— */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            Antes y después
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            El mismo cliente. Dos realidades.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-slate-600">
            Cambia de pestaña. Es el argumento entero del producto en treinta
            segundos.
          </p>
          <div className="mt-12">
            <ChaosVsUpladDemo />
          </div>
        </div>
      </section>

      {/* ——— INTERACTIVE DASHBOARD DEMO ——— */}
      <section
        id="demo"
        className="scroll-mt-16 bg-[#07111f] px-6 py-20 text-white md:py-28"
      >
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3dffa8]/70">
            Demo en vivo
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
            Toca un cliente. Cambia un semáforo.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-white/55">
            Así ve el asesor el periodo: prioriza rojos, acompaña amarillos,
            ignora verdes. Sin Excel. Sin persecución.
          </p>
          <div className="mt-12">
            <InteractiveDashboardDemo />
          </div>
        </div>
      </section>

      {/* ——— HOW IT WORKS ——— */}
      <section className="bg-[#f3f5f4] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            Cómo funciona
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Tres pasos. Cero fricción.
          </h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Activas el periodo",
                body: "Defines el trimestre y la fecha de cierre orientativo. Uplad prepara los recordatorios J-21, J-14, J-7 y J-3.",
              },
              {
                n: "02",
                title: "Envías el enlace",
                body: "Copias el magic link o el mensaje de WhatsApp. El cliente entra sin password y sube desde el móvil.",
              },
              {
                n: "03",
                title: "Cierras con semáforos",
                body: "Cuando marca «He subido todo» — o lo marcas tú — el periodo pasa a 🟢 y se cancelan los avisos pendientes.",
              },
            ].map((s) => (
              <li key={s.n} className="relative">
                <span className="font-[family-name:var(--font-display)] text-5xl font-extrabold text-emerald-900/15">
                  {s.n}
                </span>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-slate-900">
                  {s.title}
                </h3>
                <p className="mt-3 text-slate-600 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ——— OUTCOMES ——— */}
      <section className="bg-white px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            Qué ganas
          </p>
          <h2 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Menos persecución. Más cierre a tiempo.
          </h2>
          <div className="mt-14 grid gap-8 border-t border-slate-200 pt-10 md:grid-cols-3">
            {[
              {
                metric: "1 toque",
                label: "para que el cliente entregue",
              },
              {
                metric: "3 colores",
                label: "para priorizar el despacho entero",
              },
              {
                metric: "0 passwords",
                label: "para el autónomo o la PYME",
              },
            ].map((m) => (
              <div key={m.metric}>
                <p className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                  {m.metric}
                </p>
                <p className="mt-2 text-slate-600">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— WHO ——— */}
      <section className="bg-[#0b1628] px-6 py-20 text-white md:py-24">
        <div className="mx-auto max-w-6xl md:grid md:grid-cols-[1fr_1fr] md:items-center md:gap-16">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3dffa8]/70">
              Para quién
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              Despachos que viven de cerrar periodos, no de cazar PDFs.
            </h2>
          </div>
          <ul className="mt-10 space-y-5 text-lg text-white/65 md:mt-0">
            <li className="border-l-2 border-[#3dffa8]/40 pl-4">
              Gestorías con cartera de autónomos y microPYMEs
            </li>
            <li className="border-l-2 border-[#3dffa8]/40 pl-4">
              Asesores hartos del «te lo mando ahora» que nunca llega
            </li>
            <li className="border-l-2 border-[#3dffa8]/40 pl-4">
              Equipos que quieren un único estado de verdad por cliente-periodo
            </li>
          </ul>
        </div>
      </section>

      {/* ——— FAQ ——— */}
      <section className="bg-[#f3f5f4] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/70">
            Dudas
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Preguntas que ya te estás haciendo
          </h2>
          <div className="mt-10">
            <LandingFaq />
          </div>
        </div>
      </section>

      {/* ——— FINAL CTA ——— */}
      <section className="landing-grain relative overflow-hidden bg-[#07111f] px-6 py-24 text-white md:py-32">
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(61,255,168,0.2) 0%, transparent 60%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <p className="font-[family-name:var(--font-display)] text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
            Uplad
          </p>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/60">
            Entra al panel demo. Mira los semáforos. Copia un enlace. En cinco
            minutos entiendes por qué el WhatsApp documental se acaba aquí.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[#3dffa8] px-8 text-sm font-bold text-[#07111f] transition hover:bg-white"
            >
              Entrar al panel demo
            </Link>
            <a
              href="#demo"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 text-sm font-medium transition hover:border-white/50"
            >
              Volver a la demo
            </a>
          </div>
          <p className="mt-6 text-sm text-white/35">
            Demo · asesor@demo.local / demo1234
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#07111f] px-6 py-8 text-sm text-white/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <span className="font-[family-name:var(--font-display)] font-semibold text-white/70">
            Uplad
          </span>
          <p>Recepción documental para gestorías · España</p>
          <Link href="/login" className="hover:text-white">
            Acceso asesores
          </Link>
        </div>
      </footer>
    </main>
  );
}

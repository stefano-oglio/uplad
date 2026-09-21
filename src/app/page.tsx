import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-teal-900">
          DocInbox
        </span>
        <Button asChild variant="outline" size="sm">
          <Link href="/login">Acceso asesores</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:items-center md:pt-16">
        <div className="space-y-6">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-teal-950 md:text-5xl">
            DocInbox
          </h1>
          <p className="text-lg text-slate-700 md:text-xl">
            Sustituye el caos de WhatsApp y email. Tus clientes suben facturas en
            un toque; tú ves semáforos por periodo fiscal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">Entrar al panel</Link>
            </Button>
          </div>
          <p className="text-sm text-slate-500">
            Demo: asesor@demo.local / demo1234
          </p>
        </div>

        <div
          className="relative min-h-[280px] overflow-hidden rounded-2xl border border-teal-900/10 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-800 p-8 text-teal-50 shadow-lg"
          aria-hidden
        >
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-400/20 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-32 w-48 rounded-full bg-emerald-300/10 blur-2xl" />
          <p className="relative text-sm uppercase tracking-widest text-teal-200/80">
            Periodo activo
          </p>
          <p className="relative mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
            Semáforos claros
          </p>
          <ul className="relative mt-8 space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <span>🟢</span> Completo — sin perseguir
            </li>
            <li className="flex items-center gap-3">
              <span>🟡</span> En curso — ya hay docs
            </li>
            <li className="flex items-center gap-3">
              <span>🔴</span> En riesgo — falta documentación
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}

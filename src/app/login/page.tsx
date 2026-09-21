import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";
import Link from "next/link";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07111f] px-4">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(61,255,168,0.14) 0%, transparent 55%)",
        }}
      />
      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-white"
          >
            Uplad
          </Link>
          <p className="mt-2 text-white/55">Acceso asesores</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-2xl">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-xs text-white/35">
          Demo · asesor@demo.local / demo1234
        </p>
      </div>
    </main>
  );
}

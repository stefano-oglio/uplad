import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/app");

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_#e8f5f2_0%,_#f8fafc_55%,_#eef2f7_100%)] px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-teal-900">
            DocInbox
          </p>
          <p className="mt-2 text-slate-600">Acceso asesores</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-sm backdrop-blur">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

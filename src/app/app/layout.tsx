import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link
              href="/app"
              className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-slate-900"
            >
              Uplad
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-slate-600 sm:flex">
              <Link href="/app" className="hover:text-teal-900">
                Clientes
              </Link>
              <Link href="/app/periods" className="hover:text-teal-900">
                Periodos
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span className="hidden sm:inline">{session.user.name}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
    </div>
  );
}

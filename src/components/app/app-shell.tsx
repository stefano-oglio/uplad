"use client";

import { useState } from "react";
import Link from "next/link";
import { AppSidebar } from "@/components/app/sidebar";
import { logoutAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

export function AppShell({
  userName,
  orgName,
  children,
}: {
  userName: string;
  orgName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f5f4]">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <AppSidebar userName={userName} orgName={orgName} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 h-full" onClick={() => setOpen(false)}>
            <AppSidebar userName={userName} orgName={orgName} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link
              href="/app"
              className="font-[family-name:var(--font-display)] text-lg font-bold md:hidden"
            >
              Uplad
            </Link>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span className="hidden sm:inline">{userName}</span>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Salir
              </Button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

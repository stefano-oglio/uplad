"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Inicio", match: (p: string) => p === "/app" },
  {
    href: "/app/clients",
    label: "Clientes",
    match: (p: string) => p.startsWith("/app/clients"),
  },
  {
    href: "/app/settings",
    label: "Ajustes",
    match: (p: string) =>
      p.startsWith("/app/settings") || p.startsWith("/app/periods"),
  },
] as const;

export function AppSidebar({
  userName,
  orgName,
}: {
  userName: string;
  orgName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-200 bg-[#0b1628] text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/app"
          className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight"
        >
          Uplad
        </Link>
        <p className="mt-1 truncate text-xs text-white/45">{orgName}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV.map((item) => {
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-[#3dffa8] text-[#07111f]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-white/45">
        <p className="truncate font-medium text-white/70">{userName}</p>
        <p className="mt-0.5">Asesor</p>
      </div>
    </aside>
  );
}

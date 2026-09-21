import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocInbox — Recepción documental para gestorías",
  description:
    "Tus clientes suben facturas en un toque. Tú ves semáforos por periodo fiscal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${fraunces.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-sans)] antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}

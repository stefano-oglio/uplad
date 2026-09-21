import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Uplad — Deja de perseguir facturas. Empieza a controlar periodos.",
  description:
    "Uplad sustituye el caos de WhatsApp y email en la recepción documental de gestorías. Tus clientes suben en un toque; tú ves semáforos por periodo fiscal.",
  openGraph: {
    title: "Uplad — Recepción documental para gestorías",
    description:
      "Clientes que suben solos. Semáforos claros. Cierres sin persecución.",
    locale: "es_ES",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${dmSans.variable} ${syne.variable} h-full`}>
      <body className="min-h-full font-[family-name:var(--font-sans)] antialiased text-slate-900">
        {children}
      </body>
    </html>
  );
}

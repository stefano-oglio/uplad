import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-teal-950">
        Página no encontrada
      </h1>
      <p className="mt-2 text-slate-600">
        El enlace no es válido o ha caducado.
      </p>
      <Link href="/" className="mt-6 text-teal-800 underline">
        Volver al inicio
      </Link>
    </main>
  );
}

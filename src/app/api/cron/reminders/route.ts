import { NextRequest, NextResponse } from "next/server";
import { processDueReminders } from "@/lib/reminders";

/**
 * Endpoint para procesar recordatorios vencidos.
 * En local: llama con curl o el botón de demo.
 * En producción: cron de Vercel cada 5–15 min.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const result = await processDueReminders();
  return NextResponse.json(result);
}

export async function GET(req: NextRequest) {
  return POST(req);
}

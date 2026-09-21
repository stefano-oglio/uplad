import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "docinbox",
    time: new Date().toISOString(),
  });
}

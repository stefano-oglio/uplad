import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "uplad",
    time: new Date().toISOString(),
  });
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    subsystems: {
      realtime: "available",
      offlineCache: "healthy",
      diagnostics: "green"
    }
  });
}

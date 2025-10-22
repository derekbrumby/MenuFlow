import { NextResponse } from "next/server";
import { readMenu } from "@/lib/menu-store";

export async function GET() {
  const menu = await readMenu();
  const now = new Date();
  const soldOut = menu.items.filter((item) => item.soldOutUntil && new Date(item.soldOutUntil) > now);
  const hidden = menu.items.filter((item) => !item.visible);
  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    subsystems: {
      realtime: soldOut.length ? "degraded" : "available",
      offlineCache: "healthy",
      diagnostics: hidden.length ? "attention" : "green"
    },
    menu: {
      version: menu.version,
      totalItems: menu.items.length,
      soldOutItems: soldOut.map((item) => ({ id: item.id, name: item.name, soldOutUntil: item.soldOutUntil })),
      hiddenItems: hidden.map((item) => ({ id: item.id, name: item.name }))
    }
  });
}

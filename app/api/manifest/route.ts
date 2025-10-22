import { NextResponse } from "next/server";
import { readMenu } from "@/lib/menu-store";

export async function GET() {
  const menu = await readMenu();
  return NextResponse.json({ menu, publishedAt: new Date().toISOString(), version: menu.version });
}

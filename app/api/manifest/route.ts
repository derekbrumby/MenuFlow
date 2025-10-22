import { NextResponse } from "next/server";
import { sampleMenu } from "@/packages/types/src/sample-data";

export async function GET() {
  return NextResponse.json({ menu: sampleMenu, publishedAt: new Date().toISOString() });
}

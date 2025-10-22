import { NextResponse } from "next/server";
import { z } from "zod";
import { setItemSoldOut } from "@/lib/menu-store";

const BodySchema = z.object({
  soldOutUntil: z.string().datetime().nullable().optional()
});

type Params = { params: { itemId: string } };

export async function PATCH(request: Request, { params }: Params) {
  const json = (await request.json().catch(() => ({}))) as unknown;
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const soldOutUntil = parsed.data.soldOutUntil ?? null;

  try {
    const menu = await setItemSoldOut(params.itemId, soldOutUntil);
    return NextResponse.json({ ok: true, menu });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

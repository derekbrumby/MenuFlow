import { NextResponse } from "next/server";
import { z } from "zod";
import { updateMenuItem } from "@/lib/menu-store";

const BodySchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    price: z.number().nonnegative().optional(),
    visible: z.boolean().optional(),
    calories: z.number().nonnegative().optional(),
    allergens: z.array(z.string()).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update"
  });

type Params = { params: { itemId: string } };

export async function PATCH(request: Request, { params }: Params) {
  const json = (await request.json().catch(() => ({}))) as unknown;
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const menu = await updateMenuItem(params.itemId, parsed.data);
    return NextResponse.json({ ok: true, menu });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 404 });
  }
}

import { z } from "zod";

export const MenuItemSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().nonnegative(),
  calories: z.number().nonnegative().optional(),
  allergens: z.array(z.string()).default([]),
  visible: z.boolean().default(true),
  soldOutUntil: z.string().datetime().nullable().default(null)
});

export const MenuCategorySchema = z.object({
  id: z.string(),
  storeId: z.string(),
  name: z.string(),
  order: z.number().int(),
  daypartRules: z.array(z.string()).default([])
});

export const MenuSchema = z.object({
  id: z.string(),
  storeId: z.string(),
  version: z.number().int().min(1),
  categories: z.array(MenuCategorySchema),
  items: z.array(MenuItemSchema)
});

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type MenuCategory = z.infer<typeof MenuCategorySchema>;
export type Menu = z.infer<typeof MenuSchema>;

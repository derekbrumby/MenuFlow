import { promises as fs } from "fs";
import path from "path";
import { sampleMenu } from "@/packages/types/src/sample-data";
import { MenuSchema, type Menu, type MenuItem } from "@/packages/types/src/menu";

function getDataPath(): string {
  const customPath = process.env.MENU_DATA_PATH;
  const resolved = customPath ? path.resolve(process.cwd(), customPath) : path.join(process.cwd(), "data", "menu.json");
  return resolved;
}

async function ensureDataFile(): Promise<void> {
  const dataPath = getDataPath();
  try {
    await fs.access(dataPath);
  } catch {
    await fs.mkdir(path.dirname(dataPath), { recursive: true });
    await fs.writeFile(dataPath, JSON.stringify(sampleMenu, null, 2));
  }
}

async function readRawMenu(): Promise<Menu> {
  await ensureDataFile();
  const dataPath = getDataPath();
  const buffer = await fs.readFile(dataPath, "utf8");
  return MenuSchema.parse(JSON.parse(buffer));
}

async function persistMenu(menu: Menu): Promise<Menu> {
  const nextMenu = MenuSchema.parse(menu);
  const dataPath = getDataPath();
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(nextMenu, null, 2));
  return nextMenu;
}

function touchVersion(menu: Menu): Menu {
  return { ...menu, version: menu.version + 1 };
}

export async function readMenu(): Promise<Menu> {
  return readRawMenu();
}

export async function setItemSoldOut(itemId: string, soldOutUntil: string | null): Promise<Menu> {
  const menu = await readRawMenu();
  const nextMenu = touchVersion(menu);
  const item = nextMenu.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Menu item ${itemId} not found`);
  }
  item.soldOutUntil = soldOutUntil;
  return persistMenu(nextMenu);
}

type ItemUpdates = Partial<Pick<MenuItem, "name" | "description" | "price" | "visible" | "calories" | "allergens">>;

export async function updateMenuItem(itemId: string, updates: ItemUpdates): Promise<Menu> {
  const menu = await readRawMenu();
  const nextMenu = touchVersion(menu);
  const item = nextMenu.items.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error(`Menu item ${itemId} not found`);
  }
  Object.assign(item, updates);
  return persistMenu(nextMenu);
}

export async function replaceMenuForTesting(menu: Menu): Promise<void> {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("replaceMenuForTesting is only available during tests");
  }
  await persistMenu(menu);
}

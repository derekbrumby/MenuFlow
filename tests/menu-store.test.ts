import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { sampleMenu } from "@/packages/types/src/sample-data";

let menuStore: typeof import("@/lib/menu-store");
let dataPath: string;

async function seedMenuFile() {
  await fs.mkdir(path.dirname(dataPath), { recursive: true });
  await fs.writeFile(dataPath, JSON.stringify(sampleMenu, null, 2));
}

describe("menu-store", () => {
  beforeEach(async () => {
    vi.resetModules();
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "menuflow-"));
    dataPath = path.join(dir, "menu.json");
    process.env.MENU_DATA_PATH = dataPath;
    await seedMenuFile();
    menuStore = await import("@/lib/menu-store");
  });

  afterEach(() => {
    delete process.env.MENU_DATA_PATH;
  });

  it("reads the current menu", async () => {
    const menu = await menuStore.readMenu();
    expect(menu.id).toBe(sampleMenu.id);
    expect(menu.items).toHaveLength(sampleMenu.items.length);
  });

  it("sets sold out flags and increments version", async () => {
    const before = await menuStore.readMenu();
    const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const after = await menuStore.setItemSoldOut(sampleMenu.items[0].id, until);
    expect(after.version).toBe(before.version + 1);
    const updated = after.items.find((item) => item.id === sampleMenu.items[0].id);
    expect(updated?.soldOutUntil).toBe(until);
    const persisted = JSON.parse(await fs.readFile(dataPath, "utf8"));
    expect(persisted.version).toBe(after.version);
  });

  it("updates pricing and visibility", async () => {
    const updatedMenu = await menuStore.updateMenuItem(sampleMenu.items[1].id, { price: 99, visible: false });
    const item = updatedMenu.items.find((entry) => entry.id === sampleMenu.items[1].id);
    expect(item?.price).toBe(99);
    expect(item?.visible).toBe(false);
    const persisted = JSON.parse(await fs.readFile(dataPath, "utf8"));
    const persistedItem = persisted.items.find((entry: { id: string }) => entry.id === sampleMenu.items[1].id);
    expect(persistedItem.price).toBe(99);
    expect(persistedItem.visible).toBe(false);
  });
});

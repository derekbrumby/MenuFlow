import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { readMenu, setItemSoldOut } from "@/lib/menu-store";

export const manifestRouter: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/latest", async () => {
    const manifest = await readMenu();
    return { manifest, version: manifest.version };
  });

  app.post<{ Body: { itemId: string; soldOutUntil?: string | null } }>("/items/86", async (request, reply) => {
    const { itemId, soldOutUntil = null } = request.body;
    try {
      const manifest = await setItemSoldOut(itemId, soldOutUntil);
      return {
        ok: true,
        manifest,
        itemId,
        soldOutUntil,
        propagatedAt: new Date().toISOString()
      };
    } catch (error) {
      reply.status(404);
      return { ok: false, error: (error as Error).message };
    }
  });
};

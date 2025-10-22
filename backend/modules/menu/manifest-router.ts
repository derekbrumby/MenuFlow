import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import { sampleMenu } from "@/packages/types/src/sample-data";

export const manifestRouter: FastifyPluginAsync = async (app: FastifyInstance) => {
  app.get("/latest", async () => ({ manifest: sampleMenu, version: sampleMenu.version }));
  app.post<{ Body: { itemId: string; soldOutUntil?: string | null } }>("/items/86", async (request) => {
    const { itemId, soldOutUntil = null } = request.body;
    return {
      ok: true,
      itemId,
      soldOutUntil,
      propagatedAt: new Date().toISOString()
    };
  });
};

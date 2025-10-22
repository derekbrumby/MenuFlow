import Fastify from "fastify";
import type { FastifyInstance } from "fastify";
import { manifestRouter } from "../modules/menu/manifest-router";

export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });
  app.register(manifestRouter, { prefix: "/manifest" });
  app.get("/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));
  return app;
}

if (require.main === module) {
  const port = Number(process.env.PORT ?? 4000);
  buildServer()
    .then((app) => app.listen({ port, host: "0.0.0.0" }))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}

import { buildServer } from "../src/server";

async function main() {
  const app = await buildServer();
  await app.close();
}

main().catch((error) => {
  console.error("Backend build check failed", error);
  process.exitCode = 1;
});

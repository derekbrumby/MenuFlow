import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["packages/**/*.{test,spec}.ts", "packages/**/*.{test,spec}.tsx", "backend/**/*.{test,spec}.ts"]
  }
});

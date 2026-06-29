import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only. Scope `include` to our own source/tests so Vitest never
// tries to run the hundreds of *.test.ts files shipped inside node_modules.
// The `@/` alias mirrors tsconfig.json paths ("@/*" -> "./src/*").
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.ts", "src/**/*.{test,spec}.ts"],
    exclude: ["node_modules", ".next", "e2e", "SquareSpaceDemo"],
  },
});

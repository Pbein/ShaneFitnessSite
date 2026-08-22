import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests only. Scope `include` to our own source/tests so Vitest never
// tries to run the hundreds of *.test.ts files shipped inside node_modules.
// The `@/` alias mirrors tsconfig.json paths ("@/*" -> "./src/*").
export default defineConfig({
  // Use the automatic JSX runtime so .tsx modules can be imported in tests
  // without each one importing React. Without this, esbuild emits classic
  // `React.createElement` calls and any component test dies on
  // "React is not defined".
  esbuild: { jsx: "automatic" },
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

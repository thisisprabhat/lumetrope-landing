import { defineConfig } from "vitest/config";

const common = { exclude: ["tests/e2e/**", "node_modules/**"], setupFiles: ["./tests/setup.ts"] };
// jsdom for *.test.tsx, node for *.test.ts
export default defineConfig({
  test: {
    projects: [
      { test: { ...common, name: "node", environment: "node", include: ["{tests,src}/**/*.test.ts"] } },
      { test: { ...common, name: "dom", environment: "jsdom", include: ["{tests,src}/**/*.test.tsx"] } },
    ],
  },
});

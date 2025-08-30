import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    include: ["**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@bmad/core-protocol": path.resolve(__dirname, "packages/core-protocol/src/index.ts"),
      "@bmad/server-core": path.resolve(__dirname, "packages/server-core/src/index.ts"),
      "@bmad/agent-registry": path.resolve(__dirname, "packages/agent-registry/src/index.ts"),
    },
  },
});


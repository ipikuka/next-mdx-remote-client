import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup-tests.js"],
    include: ["tests/**/*.spec.ts?(x)"],
    exclude: ["tests/integration-test/**"],
    poolOptions: {
      vmThreads: {
        memoryLimit: "1 MB",
      },
    },
    coverage: {
      provider: "v8",
      reporter: [
        ["lcov", { projectRoot: "./src" }],
        ["json", { file: "coverage.json" }],
      ],
      exclude: [
        "archive",
        "tests",
        "**/types.ts",
        "**/*.d.ts",
        "src/csr/idle-callback-polyfill.js",
      ],
    },
  },
});

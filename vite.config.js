import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

/// <reference types="vitest" />
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest-setup-tests.js"],
    include: ["tests/**/*.spec.ts?(x)"],
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
        "text",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
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

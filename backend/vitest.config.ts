import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration & database suites require live Postgres/Mongo; they are
    // excluded from the default run and enabled explicitly via npm scripts.
    exclude: ["node_modules/**", "dist/**", "tests/integration/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/services/**", "src/types/**"],
      exclude: ["src/index.ts", "src/lib/**", "src/models/**", "**/*.d.ts"],
      thresholds: {
        // Domain / services target per Quality Strategy checklist
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});

import { defineConfig } from "vitest/config";

// Integration suite: exercises real HTTP routes via Supertest against the
// in-process Express app. Requires a reachable PostgreSQL (DATABASE_URL) and
// MongoDB (MONGODB_URI) with seed data. Run with: npm run test:integration
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    setupFiles: ["tests/integration/helpers/setup.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});

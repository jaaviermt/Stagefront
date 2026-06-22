import { defineConfig } from "vitest/config";

// Database suite: validates Prisma (PostgreSQL) constraints + transactions and
// Mongoose (MongoDB) schema/index behaviour directly against live databases.
// Run with: npm run test:db
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/database/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 30000,
    fileParallelism: false,
  },
});

import { defineConfig } from "cypress";

/**
 * Cypress E2E configuration for StageFront.
 *
 * Prerequisites before running `npm run test:e2e`:
 *   1. Backend running on :3001   (cd backend && npm run dev)
 *   2. Frontend running on :5173  (cd frontend && npm run dev)
 *   3. Databases seeded           (cd backend && npm run db:setup)
 *
 * Override the target with CYPRESS_BASE_URL.
 */
export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL ?? "http://localhost:5173",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    fixturesFolder: "cypress/fixtures",
    video: false,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 800,
    retries: { runMode: 2, openMode: 0 },
  },
});

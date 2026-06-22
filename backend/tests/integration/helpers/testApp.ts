import type { Express } from "express";
import { createApp } from "../../../src/app.js";

/**
 * Shared Supertest target. The app is built in-process (no listening socket),
 * so each test file can `request(app)` without port management.
 *
 * NOTE: routes backed by Prisma/Mongoose require live databases. When
 * DATABASE_URL / MONGODB_URI are unreachable those specific assertions will
 * fail with 500 — see docs/quality/API_TEST_REPORT.md for the environment
 * matrix and how to provision local services (docker-compose up).
 */
export const app: Express = createApp();

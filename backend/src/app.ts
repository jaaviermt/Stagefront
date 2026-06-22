import express, { type Express } from "express";
import cors from "cors";
import router from "./routes/index.js";

/**
 * Builds the Express application without starting the HTTP server or opening
 * database connections. Extracted from index.ts so integration tests
 * (Supertest) can mount the same routing/middleware stack in-process.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", router);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

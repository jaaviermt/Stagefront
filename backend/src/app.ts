import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

/**
 * Builds the Express application without starting the HTTP server or opening
 * database connections. Extracted from index.ts so integration tests
 * (Supertest) can mount the same routing/middleware stack in-process.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", router);

  if (process.env.NODE_ENV === "production") {
    // Serve the Vite build from frontend/dist as static files.
    // __dirname resolves to backend/dist at runtime, so ../../frontend/dist
    // points to the sibling frontend/dist folder.
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const clientDist = path.resolve(__dirname, "../../frontend/dist");
    app.use(express.static(clientDist));
    // SPA catch-all: any non-API route returns index.html
    app.get("*", (_req, res) => {
      res.sendFile(path.join(clientDist, "index.html"));
    });
  } else {
    app.use(notFoundHandler);
  }

  app.use(errorHandler);

  return app;
}

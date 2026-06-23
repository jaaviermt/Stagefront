import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { correlationId } from "./middleware/correlationId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { globalLimiter } from "./middleware/rateLimiter.js";

const isProd = process.env.NODE_ENV === "production";

/**
 * Builds the Express application without starting the HTTP server or opening
 * database connections. Extracted from index.ts so integration tests
 * (Supertest) can mount the same routing/middleware stack in-process.
 */
export function createApp(): Express {
  const app = express();

  // A05 OWASP — security headers
  app.use(helmet());

  // A05 OWASP — CORS restrictivo en producción
  app.use(
    cors({
      origin: isProd
        ? ["https://stagefront-pi0i.onrender.com"]
        : ["http://localhost:5173", "http://localhost:3001"],
      credentials: true,
    })
  );

  // A07 OWASP — rate limiting solo en producción (en dev/test interfiere con k6)
  if (isProd) app.use(globalLimiter);
  app.use(express.json());

  // Correlation ID para trazabilidad end-to-end (Sec. 11.1)
  app.use(correlationId);
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/v1", router);

  if (isProd) {
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

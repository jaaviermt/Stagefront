import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes/index.js";
import { correlationId } from "./middleware/correlationId.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

const isProd = process.env.NODE_ENV === "production";

// A01/A05 OWASP — rate limit global (protección DoS básica)
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// A07 OWASP — rate limit estricto en rutas de autenticación (máx 5/min por IP)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many login attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

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

  app.use(globalLimiter);
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

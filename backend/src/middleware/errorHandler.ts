import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "../lib/logger.js";

/** Catch-all 404 for unmatched routes (kept JSON for API consistency). */
export const notFoundHandler: RequestHandler = (req, res) => {
  logger.warn("http.not_found", { method: req.method, url: req.originalUrl });
  res.status(404).json({ error: "Not found" });
};

/**
 * Express error handler of last resort. Any error reaching here is logged at
 * `error` level with its stack and a 500 is returned without leaking details.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error("http.unhandled_error", {
    method: req.method,
    url: req.originalUrl,
    message: error.message,
    stack: error.stack,
  });
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
};

export default errorHandler;

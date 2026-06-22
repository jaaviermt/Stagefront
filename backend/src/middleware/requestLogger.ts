import morgan, { type StreamOptions } from "morgan";
import type { RequestHandler } from "express";
import { logger } from "../lib/logger.js";

/**
 * HTTP request logger: Morgan pipes one structured line per request into
 * Winston at the `http` level (method, url, status, response time).
 */
const stream: StreamOptions = {
  write: (message: string) => {
    const trimmed = message.trim();
    try {
      logger.http("http.request", JSON.parse(trimmed));
    } catch {
      logger.http(trimmed);
    }
  },
};

// Emit JSON tokens so the dashboard can parse method/url/status/responseTime.
const format = JSON.stringify({
  method: ":method",
  url: ":url",
  status: ":status",
  responseTimeMs: ":response-time",
  contentLength: ":res[content-length]",
});

export const requestLogger: RequestHandler = morgan(format, { stream });

export default requestLogger;

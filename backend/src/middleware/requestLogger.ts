import morgan, { type StreamOptions } from "morgan";
import type { Request, RequestHandler } from "express";
import { logger } from "../lib/logger.js";

morgan.token("correlationId", (req: Request) => req.correlationId ?? "-");

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

// Structured JSON log line includes correlationId for end-to-end traceability.
const format = JSON.stringify({
  correlationId: ":correlationId",
  method: ":method",
  url: ":url",
  status: ":status",
  responseTimeMs: ":response-time",
  contentLength: ":res[content-length]",
});

export const requestLogger: RequestHandler = morgan(format, { stream });

export default requestLogger;

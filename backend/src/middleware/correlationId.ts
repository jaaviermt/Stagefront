import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
    }
  }
}

/**
 * Assigns a unique correlation ID to every incoming request.
 * Re-uses the client-provided x-correlation-id if present, otherwise generates one.
 * The ID is echoed back in the response header for end-to-end traceability (Sec. 11.1).
 */
export function correlationId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id =
    (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
  req.correlationId = id;
  res.setHeader("x-correlation-id", id);
  next();
}

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Assigns a unique correlation ID to every incoming request.
 * Stored in res.locals to avoid ESM namespace augmentation.
 * Echoed back in x-correlation-id response header for end-to-end traceability (Sec. 11.1).
 */
export function correlationId(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const id =
    (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
  res.locals["correlationId"] = id;
  res.setHeader("x-correlation-id", id);
  next();
}

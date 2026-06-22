import { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";
import { LOG_DIR } from "../lib/logger.js";

type LogEntry = {
  timestamp?: string;
  level?: string;
  message?: string;
  [key: string]: unknown;
};

/** Read & parse a daily combined log file into structured entries (newest first). */
function readLogFile(date: string): LogEntry[] {
  const file = path.join(LOG_DIR, `combined-${date}.log`);
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf-8");
  const entries: LogEntry[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      entries.push(JSON.parse(trimmed) as LogEntry);
    } catch {
      // Skip malformed lines instead of failing the whole request.
    }
  }
  return entries.reverse();
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** GET /api/v1/admin/logs — paginated log entries, optional level/date filters. */
export async function getLogs(req: Request, res: Response): Promise<void> {
  try {
    const date = (req.query.date as string) || today();
    const level = (req.query.level as string) || "all";
    const limit = Math.min(Number(req.query.limit) || 100, 500);
    const offset = Number(req.query.offset) || 0;

    let entries = readLogFile(date);
    if (level !== "all") {
      entries = entries.filter((e) => e.level === level);
    }

    res.json({
      data: entries.slice(offset, offset + limit),
      total: entries.length,
    });
  } catch {
    res.status(500).json({ error: "Failed to read logs" });
  }
}

/** GET /api/v1/admin/logs/stats — aggregated counts for today's logs dashboard. */
export async function getLogStats(_req: Request, res: Response): Promise<void> {
  try {
    const entries = readLogFile(today());

    const counts = { error: 0, warn: 0, info: 0, http: 0 } as Record<string, number>;
    const errorsByHour = Array.from({ length: 24 }, (_, h) => ({
      hour: `${String(h).padStart(2, "0")}:00`,
      count: 0,
    }));
    const errorMessages = new Map<string, number>();
    const recentErrors: LogEntry[] = [];

    for (const e of entries) {
      if (e.level && e.level in counts) counts[e.level] += 1;
      if (e.level === "error") {
        if (e.timestamp) {
          const hour = new Date(e.timestamp).getHours();
          if (errorsByHour[hour]) errorsByHour[hour].count += 1;
        }
        const msg = e.message ?? "unknown";
        errorMessages.set(msg, (errorMessages.get(msg) ?? 0) + 1);
        if (recentErrors.length < 10) recentErrors.push(e);
      }
    }

    const topErrors = [...errorMessages.entries()]
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({ data: { counts, errorsByHour, topErrors, recentErrors } });
  } catch {
    res.status(500).json({ error: "Failed to compute log stats" });
  }
}

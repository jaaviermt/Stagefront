import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import winston from "winston";
import "winston-daily-rotate-file";

/**
 * Centralized Winston logger for StageFront.
 *
 * - Structured JSON output (one object per line) so logs are machine-parseable
 *   and can be served back through the admin logs dashboard.
 * - Levels follow the npm scale: error > warn > info > http.
 * - File transports: `error.log` (permanent) + `combined-YYYY-MM-DD.log`
 *   (daily rotation, 30d retention). See LOGGING.md.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// backend/src/lib -> backend/logs
export const LOG_DIR = path.resolve(__dirname, "../../logs");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: winston.transport[] = [
  // Errors only — permanent file, never rotates.
  new winston.transports.File({
    filename: path.join(LOG_DIR, "error.log"),
    level: "error",
    format: jsonFormat,
  }),
  // Everything (error + warn + info + http) — rotated daily.
  new winston.transports.DailyRotateFile({
    dirname: LOG_DIR,
    filename: "combined-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    maxSize: "20m",
    maxFiles: "30d",
    level: "http",
    format: jsonFormat,
  }),
];

// In local/dev show a colorized console line; stay silent during tests.
if (!isTest) {
  transports.push(
    new winston.transports.Console({
      level: "http",
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const rest = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `${timestamp as string} ${level} ${message as string}${rest}`;
        })
      ),
    })
  );
}

export const logger = winston.createLogger({
  level: "http",
  defaultMeta: { service: "stagefront" },
  format: jsonFormat,
  transports,
  silent: isTest && process.env.LOG_IN_TEST !== "true",
});

export default logger;

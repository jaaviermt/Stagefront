import rateLimit from "express-rate-limit";

// A01/A05 OWASP — rate limit global (protección DoS básica)
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

// A07 OWASP — rate limit estricto en escritura crítica (máx 5/min por IP)
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

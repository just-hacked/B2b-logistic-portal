import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config/env";
import { applySecurityMiddleware } from "./middleware/security";
import { generalLimiter, speedLimiter } from "./middleware/rateLimiter";
import { sanitizeInput } from "./middleware/sanitize";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import v1Router from "./api/v1/index";

const app = express();

app.set("trust proxy", 1);

// ── 1. Security headers (helmet + hpp + disable x-powered-by) ─────────────────
applySecurityMiddleware(app);

import { isOriginAllowed } from "./config/origins";

// ── 2. CORS — strict origin allowlist ─────────────────────────────────────────
// Exact-match origins: local dev + the configured production frontend(s).
// CORS_ORIGINS (comma-separated) lets ops add domains without a redeploy
// (e.g. a future custom domain like https://elioswholesale.in). Trailing
// slashes are stripped so a value like "https://site/" still matches the
// browser Origin header (which never has one).

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no Origin header (Postman, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ── 3. Rate limiting — applied globally in production before any route ───────
if (config.NODE_ENV === "production") {
  app.use(generalLimiter);
  app.use(speedLimiter);
}

// ── 5. Body + cookie parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ── 6. Input sanitization — strip $-prefixed and dot-path keys ───────────────
app.use(sanitizeInput);

// ── 7. Health check (public, no auth required) ────────────────────────────────
// Two paths are registered:
//   • /health          — used by UptimeRobot / keep-alive pings and Render's
//                        own health-check probe (no path prefix needed).
//   • /api/v1/health   — used by railway.json and any internal callers.
const healthHandler = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    message: "Elios API is running",
    timestamp: new Date(),
  });
};
app.get("/health", healthHandler);
app.get("/api/v1/health", healthHandler);

// ── 8. API v1 routes ──────────────────────────────────────────────────────────
app.use("/api/v1", v1Router);

// ── 9 & 10. 404 handler + global error handler — must be last ─────────────────
app.use(notFound);
app.use(errorHandler);

export default app;

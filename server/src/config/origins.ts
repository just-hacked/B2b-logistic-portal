import config from "./env";

const staticAllowedOrigins = [
  config.CLIENT_URL,
  config.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS?.split(",") ?? []),
  "https://elioswholesale.in",
  "https://www.elioswholesale.in",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3004",
  "http://localhost:5173",
  "http://82.180.145.145:3004",
]
  .map((o) => o?.trim().replace(/\/$/, ""))
  .filter((o): o is string => Boolean(o));

const allowedOriginPatterns = [
  /^https:\/\/elioswholesale-[a-z0-9-]+-palaashika26-3692s-projects\.vercel\.app$/,
  /^https:\/\/b2b-logistic-portal-[a-z0-9-]+-just-hacked(?:-s-projects)?\.vercel\.app$/,
  /^https:\/\/b2b-logistic-portal-[a-z0-9-]+-just-hacked\.vercel\.app$/,
  /^https:\/\/b2b-logistic-portal\.vercel\.app$/,
];

export const isOriginAllowed = (origin: string): boolean =>
  staticAllowedOrigins.includes(origin) ||
  allowedOriginPatterns.some((pattern) => pattern.test(origin));

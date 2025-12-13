import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { rateLimiter } from "./middleware/rate-limit";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/error-handler";
import { validateEnvironment } from "./middleware/env-validation";
import { requestId } from "./middleware/request-id";
import type { AppEnv } from "./types/bindings";

import propertiesApp from "./features/properties";
import tenantsApp from "./features/tenants";
import ticketsApp from "./features/tickets";
import applicationsApp from "./features/applications";
import uploadApp from "./features/upload";
import healthApp from "./routes/health";

const app = new OpenAPIHono<AppEnv>();

// Global error handler
app.onError(errorHandler);

// Request ID tracing
app.use("*", requestId());

// Logging
app.use("*", logger());

// Environment validation (runs once on first request)
app.use("*", validateEnvironment());

// CORS - configure allowed origins
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server (admin)
  "http://localhost:3000", // Next.js dev server (landing)
  "https://admin.auto-landlord.com",
  "https://auto-landlord.com",
  "https://www.auto-landlord.com",
];

app.use(
  "*",
  cors({
    origin: (origin) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return "*";
      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) return origin;
      // For Cloudflare Pages preview deployments
      if (origin.endsWith(".pages.dev")) return origin;
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
    credentials: true,
    maxAge: 86400, // 24 hours
  })
);

// Rate limiting (100 requests per minute per IP)
app.use("*", rateLimiter());

// Authentication
app.use("*", authMiddleware);

// Register the OpenAPI document
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Auto Landlord API",
  },
});

// Swagger UI
app.get("/ui", swaggerUI({ url: "/doc" }));

// Health checks (no auth required)
app.route("/", healthApp);

// API routes (require auth)
app.route("/api/properties", propertiesApp);
app.route("/api/tenants", tenantsApp);
app.route("/api/tickets", ticketsApp);
app.route("/api/applications", applicationsApp);
app.route("/api/upload", uploadApp);

export default app;

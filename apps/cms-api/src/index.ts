import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

import { articlesHandler } from "./handlers/articles";
import { imagesHandler } from "./handlers/images";
import { importExportHandler } from "./handlers/import-export";
import { tagsHandler } from "./handlers/tags";
import { webhookHandler } from "./handlers/webhook";
import { authMiddleware } from "./middleware/auth";
import { rateLimitMiddleware } from "./middleware/rateLimit";

export interface Env {
  DB: D1Database;
  R2_BUCKET: R2Bucket;
  API_KEY: string;
  ENVIRONMENT: string;
  R2_PUBLIC_URL?: string;
  VERCEL_DEPLOY_HOOK_URL?: string;
  WEBHOOK_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use("*", logger());
app.use("*", rateLimitMiddleware);
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3100",
      "https://blog.tqer39.dev",
    ],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check (no auth required)
app.get("/health", (c) => c.json({ status: "ok" }));

// API v1 routes (auth required)
const v1 = new Hono<{ Bindings: Env }>();
v1.use("*", authMiddleware);
v1.route("/articles", articlesHandler);
v1.route("/tags", tagsHandler);
v1.route("/images", imagesHandler);
v1.route("/import", importExportHandler);
v1.route("/export", importExportHandler);
v1.route("/webhook", webhookHandler);

app.route("/v1", v1);

// 404 handler
app.notFound((c) => c.json({ error: "Not Found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("Error:", err);
  const message =
    c.env.ENVIRONMENT === "production"
      ? "Internal Server Error"
      : err.message || "Internal Server Error";
  return c.json({ error: message }, 500);
});

export default app;

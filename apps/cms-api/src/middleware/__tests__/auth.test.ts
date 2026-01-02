import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "../auth";
import type { Env } from "../../index";

function createTestApp(apiKey = "test-api-key") {
  const app = new Hono<{ Bindings: Env }>();

  // Mock environment
  app.use("*", async (c, next) => {
    c.env = { API_KEY: apiKey } as Env;
    await next();
  });

  // Apply auth middleware
  app.use("/protected/*", authMiddleware);

  // Test route
  app.get("/protected/test", (c) => c.json({ success: true }));

  return app;
}

describe("authMiddleware", () => {
  it("should allow request with valid Bearer token", async () => {
    const app = createTestApp("valid-key");
    const res = await app.request("/protected/test", {
      headers: { Authorization: "Bearer valid-key" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ success: true });
  });

  it("should reject request without Authorization header", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test");

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized: Missing or invalid token");
  });

  it("should reject request without Bearer prefix", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test", {
      headers: { Authorization: "test-api-key" },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized: Missing or invalid token");
  });

  it("should reject request with invalid API key", async () => {
    const app = createTestApp("correct-key");
    const res = await app.request("/protected/test", {
      headers: { Authorization: "Bearer wrong-key" },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe("Unauthorized: Invalid API key");
  });

  it("should reject request with empty Bearer token", async () => {
    const app = createTestApp("test-api-key");
    const res = await app.request("/protected/test", {
      headers: { Authorization: "Bearer " },
    });

    expect(res.status).toBe(401);
    const data = await res.json();
    // Empty token after "Bearer " is treated as missing token
    expect(data.error).toBe("Unauthorized: Missing or invalid token");
  });
});

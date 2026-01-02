import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { rateLimitMiddleware } from "../rateLimit";
import type { Env } from "../../index";

function createTestApp() {
  const app = new Hono<{ Bindings: Env }>();

  app.use("*", rateLimitMiddleware);
  app.get("/test", (c) => c.json({ success: true }));

  return app;
}

describe("rateLimitMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow requests under the limit", async () => {
    const app = createTestApp();

    const res = await app.request("/test", {
      headers: { "cf-connecting-ip": "192.168.1.100" },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });

  it("should track requests per IP", async () => {
    const app = createTestApp();
    const ip = `test-ip-${Date.now()}`;

    // Make multiple requests
    for (let i = 0; i < 5; i++) {
      const res = await app.request("/test", {
        headers: { "cf-connecting-ip": ip },
      });
      expect(res.status).toBe(200);
    }
  });

  it("should block requests over the limit (60 per minute)", async () => {
    const app = createTestApp();
    const ip = `rate-limit-test-${Date.now()}`;

    // Make 60 requests (should all succeed)
    for (let i = 0; i < 60; i++) {
      const res = await app.request("/test", {
        headers: { "cf-connecting-ip": ip },
      });
      expect(res.status).toBe(200);
    }

    // 61st request should be rate limited
    const res = await app.request("/test", {
      headers: { "cf-connecting-ip": ip },
    });

    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.error).toContain("Too many requests");
  });

  it("should use x-forwarded-for if cf-connecting-ip is not present", async () => {
    const app = createTestApp();

    const res = await app.request("/test", {
      headers: { "x-forwarded-for": "10.0.0.1, 10.0.0.2" },
    });

    expect(res.status).toBe(200);
  });

  it("should handle missing IP headers", async () => {
    const app = createTestApp();

    const res = await app.request("/test");

    expect(res.status).toBe(200);
  });

  it("should allow different IPs independently", async () => {
    const app = createTestApp();
    const timestamp = Date.now();

    // Different IPs should have independent rate limits
    const res1 = await app.request("/test", {
      headers: { "cf-connecting-ip": `ip-a-${timestamp}` },
    });
    const res2 = await app.request("/test", {
      headers: { "cf-connecting-ip": `ip-b-${timestamp}` },
    });

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
  });
});

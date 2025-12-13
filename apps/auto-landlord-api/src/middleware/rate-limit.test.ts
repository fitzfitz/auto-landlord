import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { rateLimiter } from "./rate-limit";

describe("Rate Limiter Middleware", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
  });

  it("allows requests when KV is not available", async () => {
    app.use("*", rateLimiter());
    app.get("/test", (c) => c.json({ success: true }));

    const res = await app.request("/test");
    expect(res.status).toBe(200);
  });

  it("allows requests within rate limit", async () => {
    const mockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    app.use("*", async (c, next) => {
      c.env = { RATE_LIMITS: mockKV };
      await next();
    });
    app.use("*", rateLimiter({ maxRequests: 10 }));
    app.get("/test", (c) => c.json({ success: true }));

    const res = await app.request("/test", {
      headers: { "CF-Connecting-IP": "127.0.0.1" },
    });

    expect(res.status).toBe(200);
    expect(mockKV.put).toHaveBeenCalled();
  });

  it("blocks requests over rate limit", async () => {
    const now = Date.now();
    const mockEntry = JSON.stringify({
      count: 100,
      resetAt: now + 60000,
    });

    const mockKV = {
      get: vi.fn().mockResolvedValue(mockEntry),
      put: vi.fn().mockResolvedValue(undefined),
    };

    app.use("*", async (c, next) => {
      c.env = { RATE_LIMITS: mockKV };
      await next();
    });
    app.use("*", rateLimiter({ maxRequests: 100 }));
    app.get("/test", (c) => c.json({ success: true }));

    const res = await app.request("/test", {
      headers: { "CF-Connecting-IP": "127.0.0.1" },
    });

    expect(res.status).toBe(429);
    // HTTPException returns plain text message in test environment
    const body = await res.text();
    expect(body).toContain("Rate limit exceeded");
    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("sets rate limit headers", async () => {
    const mockKV = {
      get: vi.fn().mockResolvedValue(null),
      put: vi.fn().mockResolvedValue(undefined),
    };

    app.use("*", async (c, next) => {
      c.env = { RATE_LIMITS: mockKV };
      await next();
    });
    app.use("*", rateLimiter({ maxRequests: 100 }));
    app.get("/test", (c) => c.json({ success: true }));

    const res = await app.request("/test", {
      headers: { "CF-Connecting-IP": "127.0.0.1" },
    });

    expect(res.headers.get("X-RateLimit-Limit")).toBe("100");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("99");
    expect(res.headers.get("X-RateLimit-Reset")).toBeTruthy();
  });

  it("resets count after window expires", async () => {
    const now = Date.now();
    // Entry with expired reset time
    const expiredEntry = JSON.stringify({
      count: 50,
      resetAt: now - 1000, // Already expired
    });

    const mockKV = {
      get: vi.fn().mockResolvedValue(expiredEntry),
      put: vi.fn().mockResolvedValue(undefined),
    };

    app.use("*", async (c, next) => {
      c.env = { RATE_LIMITS: mockKV };
      await next();
    });
    app.use("*", rateLimiter({ maxRequests: 100 }));
    app.get("/test", (c) => c.json({ success: true }));

    const res = await app.request("/test", {
      headers: { "CF-Connecting-IP": "127.0.0.1" },
    });

    expect(res.status).toBe(200);
    // Should have reset the counter
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("99");
  });
});


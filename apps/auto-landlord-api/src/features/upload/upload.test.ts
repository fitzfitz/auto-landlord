import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { AppEnv } from "../../types/bindings";

// Mock Clerk auth
vi.mock("@hono/clerk-auth", () => ({
  clerkMiddleware: () => async (c: any, next: any) => {
    c.set("clerk", {
      userId: "test-user-123",
      sessionClaims: { email: "test@example.com" },
    });
    await next();
  },
  getAuth: (c: any) => ({
    userId: "test-user-123",
    sessionClaims: { email: "test@example.com" },
  }),
}));

// Mock the auth middleware to always pass
vi.mock("../../middleware/auth", () => ({
  requireAuth: async (c: any, next: any) => {
    c.set("userId", "test-user-123");
    await next();
  },
}));

// Import after mocking
const uploadAppModule = await import("./index");
const uploadApp = uploadAppModule.default;

// Mock R2 bucket
const mockBucket = {
  put: vi.fn(),
  get: vi.fn(),
};

// Mock environment
const mockEnv: AppEnv["Bindings"] = {
  DB: {} as any,
  BUCKET: mockBucket as any,
  RATE_LIMIT_KV: {} as any,
  CLERK_PUBLISHABLE_KEY: "pk_test_xxx",
  CLERK_SECRET_KEY: "sk_test_xxx",
};

describe("Upload Security", () => {
  let app: Hono<AppEnv>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Create a fresh app for each test
    app = new Hono<AppEnv>();
    app.route("/upload", uploadApp);
  });

  it("rejects files larger than 1.5MB", async () => {
    // Create a file larger than 1.5MB (1.6MB)
    const largeFile = new File(
      [new ArrayBuffer(1.6 * 1024 * 1024)],
      "large.jpg",
      { type: "image/jpeg" }
    );

    const formData = new FormData();
    formData.append("file", largeFile);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("File too large");
    expect(body.message).toContain("1.5MB");
  });

  it("rejects invalid file types", async () => {
    const txtFile = new File(["hello"], "test.txt", { type: "text/plain" });

    const formData = new FormData();
    formData.append("file", txtFile);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid file type");
  });

  it("rejects files with invalid extensions", async () => {
    // Even if MIME type is correct, extension must match
    const file = new File(["data"], "test.php", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", file);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid file extension");
  });

  it("rejects empty files", async () => {
    const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("file", emptyFile);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Empty file");
  });

  it("accepts valid image files", async () => {
    const validFile = new File(
      [new ArrayBuffer(500 * 1024)], // 500KB
      "test.jpg",
      { type: "image/jpeg" }
    );

    const formData = new FormData();
    formData.append("file", validFile);

    mockBucket.put.mockResolvedValue(undefined);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBeDefined();
    expect(body.key).toBeDefined();
    expect(body.size).toBe(500 * 1024);
    expect(mockBucket.put).toHaveBeenCalledOnce();
  });

  it("sanitizes filenames", async () => {
    const file = new File(
      [new ArrayBuffer(100 * 1024)],
      "My Photo!@#$%^&*().jpg",
      { type: "image/jpeg" }
    );

    const formData = new FormData();
    formData.append("file", file);

    mockBucket.put.mockResolvedValue(undefined);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    expect(res.status).toBe(200);
    const body = await res.json();

    // Check that the key was sanitized (should only contain lowercase, numbers, dots, and hyphens)
    const keyParts = body.key.split("-");
    const filename = keyParts.slice(1).join("-"); // Remove UUID part
    expect(filename).toMatch(/^[a-z0-9.-]+$/);
  });

  it("returns proper error structure with limits", async () => {
    const largeFile = new File(
      [new ArrayBuffer(2 * 1024 * 1024)],
      "large.jpg",
      { type: "image/jpeg" }
    );

    const formData = new FormData();
    formData.append("file", largeFile);

    const res = await app.request(
      "/upload",
      {
        method: "POST",
        body: formData,
      },
      mockEnv
    );

    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.message).toBeDefined();
    expect(body.limits).toBeDefined();
    expect(body.limits.maxSizeMB).toBe(1.5);
    expect(body.limits.allowedTypes).toBeDefined();
    expect(body.limits.allowedExtensions).toBeDefined();
  });
});


import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyPrefix?: string; // Prefix for KV keys
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyPrefix: "rate_limit:",
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * Rate limiting middleware using Cloudflare KV
 * Limits requests per IP address within a time window
 */
export const rateLimiter = (config: Partial<RateLimitConfig> = {}) => {
  const { windowMs, maxRequests, keyPrefix } = { ...defaultConfig, ...config };

  return async (c: Context, next: Next) => {
    const rateLimitsKV = c.env?.RATE_LIMITS as KVNamespace | undefined;

    // Skip rate limiting if KV is not available (local dev without KV)
    if (!rateLimitsKV) {
      return next();
    }

    // Get client IP (Cloudflare provides this header)
    const clientIP =
      c.req.header("CF-Connecting-IP") ||
      c.req.header("X-Forwarded-For")?.split(",")[0] ||
      "unknown";

    const key = `${keyPrefix}${clientIP}`;
    const now = Date.now();

    try {
      // Get current rate limit entry
      const entryJson = await rateLimitsKV.get(key);
      let entry: RateLimitEntry;

      if (entryJson) {
        entry = JSON.parse(entryJson);

        // Reset if window has passed
        if (now > entry.resetAt) {
          entry = { count: 0, resetAt: now + windowMs };
        }
      } else {
        entry = { count: 0, resetAt: now + windowMs };
      }

      // Increment count
      entry.count++;

      // Check if over limit
      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

        c.header("X-RateLimit-Limit", String(maxRequests));
        c.header("X-RateLimit-Remaining", "0");
        c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
        c.header("Retry-After", String(retryAfter));

        throw new HTTPException(429, {
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        });
      }

      // Store updated entry
      // KV requires TTL to be at least 60 seconds
      const ttl = Math.ceil((entry.resetAt - now) / 1000);
      const minTtl = Math.max(ttl, 60); // Ensure TTL is at least 60 seconds
      await rateLimitsKV.put(key, JSON.stringify(entry), {
        expirationTtl: minTtl,
      });

      // Set rate limit headers
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(maxRequests - entry.count));
      c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

      return next();
    } catch (error) {
      // If it's our rate limit error, rethrow
      if (error instanceof HTTPException) {
        throw error;
      }
      // For other errors (KV issues), log and continue
      console.error("Rate limit error:", error);
      return next();
    }
  };
};

/**
 * Stricter rate limiter for sensitive endpoints (auth, uploads, etc.)
 */
export const strictRateLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  keyPrefix: "rate_limit_strict:",
});

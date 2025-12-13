/**
 * Shared Cloudflare Worker bindings type
 * Used across all route handlers
 */
export type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  CONFIG: KVNamespace;
  SESSIONS: KVNamespace;
  RATE_LIMITS: KVNamespace;
  PROPERTY_CACHE: KVNamespace;
  USER_CACHE: KVNamespace;
  LISTING_SLUGS: KVNamespace;
};

/**
 * Extended context variables set by middleware
 */
export type Variables = {
  userId: string;
};

/**
 * Combined environment type for Hono app
 */
export type AppEnv = {
  Bindings: Bindings;
  Variables: Variables;
};


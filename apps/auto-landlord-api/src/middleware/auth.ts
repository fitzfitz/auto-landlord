import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../types/bindings";
import { createDb } from "../db";
import { ensureUserExists } from "../lib/user-sync";

/**
 * Base Clerk middleware - initializes Clerk auth
 */
export const authMiddleware = clerkMiddleware();

/**
 * Require authentication middleware
 * Sets userId on context for downstream handlers
 * Also ensures the user exists in our database (syncs from Clerk)
 */
export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const auth = await getAuth(c);
  if (!auth?.userId) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  // Sync user from Clerk to database on first API call
  // This ensures Clerk users are automatically created in our DB
  const db = createDb(c.env.DB);
  // Get user info from Clerk session claims
  // Note: Email might not be in claims - use placeholder if not available
  const email =
    (auth.sessionClaims?.email as string | undefined) ||
    `${auth.userId}@placeholder.local`;
  const name = auth.sessionClaims?.name as string | undefined;

  try {
    // Always ensure user exists - this creates them if they don't
    await ensureUserExists(db, auth.userId, email, name);
  } catch (error) {
    console.error("[Auth] User sync failed:", error);
    // This is critical - if we can't create the user, subsequent operations will fail
    throw new HTTPException(500, {
      message: "Failed to initialize user account. Please try again.",
    });
  }

  // Set userId on context variables for easy access in handlers
  c.set("userId", auth.userId);

  await next();
};

/**
 * Helper to get authenticated user ID from context
 * Use this in route handlers after requireAuth middleware
 */
export const getUserId = (c: Context<AppEnv>): string => {
  const userId = c.get("userId");
  if (!userId) {
    throw new HTTPException(401, { message: "Unauthorized - no user context" });
  }
  return userId;
};

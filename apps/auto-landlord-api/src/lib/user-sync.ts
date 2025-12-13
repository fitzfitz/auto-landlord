import { users, subscriptions, plans } from "@auto-landlord/shared";
import { eq } from "drizzle-orm";
import type { createDb } from "../db";

/**
 * Get or create user in database from Clerk user ID
 * This ensures Clerk users are synced to our database
 */
export async function getOrCreateUser(
  db: ReturnType<typeof createDb>,
  clerkUserId: string,
  email: string,
  name?: string | null
) {
  // Try to find existing user by Clerk ID
  let user = await db.query.users.findFirst({
    where: eq(users.id, clerkUserId),
  });

  if (user) {
    console.log(`[User Sync] Found existing user: ${clerkUserId}`);
    return user;
  }

  // User doesn't exist - create them
  console.log(`[User Sync] Creating new user: ${clerkUserId} with email: ${email}`);

  try {
    // Create user first (subscription is optional)
    const [newUser] = await db
      .insert(users)
      .values({
        id: clerkUserId,
        email: email,
        name: name || null,
        role: "LANDLORD",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log(`[User Sync] Successfully created user: ${newUser.id}`);

    // Try to create default subscription with starter plan
    // If plan doesn't exist, user can still use the app (subscription is optional)
    try {
      const starterPlan = await db.query.plans.findFirst({
        where: eq(plans.slug, "starter"),
      });

      if (starterPlan) {
        await db.insert(subscriptions).values({
          userId: newUser.id,
          planId: starterPlan.id,
          status: "active",
          startDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log(`[User Sync] Created subscription for user ${newUser.id}`);
      }
    } catch (subError) {
      console.warn(`[User Sync] Subscription creation failed (non-critical):`, subError);
    }

    return newUser;
  } catch (insertError: unknown) {
    // If insert fails due to unique constraint (email already exists),
    // try to find user again - might have been created by another request
    const errorMessage = insertError instanceof Error ? insertError.message : String(insertError);
    if (errorMessage.includes("UNIQUE") || errorMessage.includes("unique")) {
      console.log(`[User Sync] Insert failed with unique constraint, checking if user exists...`);
      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, clerkUserId),
      });
      if (existingUser) {
        return existingUser;
      }
    }
    throw insertError;
  }
}

/**
 * Middleware to ensure user exists in database
 * Call this early in authenticated routes
 * Returns the user if successful, throws if user cannot be created
 */
export async function ensureUserExists(
  db: ReturnType<typeof createDb>,
  clerkUserId: string,
  email: string,
  name?: string | null
) {
  return await getOrCreateUser(db, clerkUserId, email, name);
}

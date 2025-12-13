import { Hono } from "hono";
import type { AppEnv } from "../types/bindings";
import { createDb } from "../db";

const app = new Hono<AppEnv>();

/**
 * Health check endpoint
 * Returns 200 if API is running and can connect to database
 */
app.get("/health", async (c) => {
  try {
    const db = createDb(c.env.DB);
    
    // Test database connection
    const result = await db.query.users.findFirst();
    
    return c.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      version: "1.0.0",
    });
  } catch (error) {
    console.error("[Health Check] Failed:", error);
    return c.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      503
    );
  }
});

/**
 * Database status endpoint
 * Returns table counts and migration status
 */
app.get("/health/db", async (c) => {
  try {
    const db = createDb(c.env.DB);

    const [usersCount, propertiesCount, plansCount, subscriptionsCount] =
      await Promise.all([
        db.query.users.findMany().then((r) => r.length),
        db.query.properties.findMany().then((r) => r.length),
        db.query.plans.findMany().then((r) => r.length),
        db.query.subscriptions.findMany().then((r) => r.length),
      ]);

    return c.json({
      status: "healthy",
      tables: {
        users: usersCount,
        properties: propertiesCount,
        plans: plansCount,
        subscriptions: subscriptionsCount,
      },
      warnings:
        plansCount === 0
          ? ["No plans in database - run seed script"]
          : [],
    });
  } catch (error) {
    return c.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Database error",
      },
      500
    );
  }
});

export default app;


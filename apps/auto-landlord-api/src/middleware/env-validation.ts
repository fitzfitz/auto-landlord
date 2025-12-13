import { Context, Next } from "hono";

/**
 * Validates that required environment variables are present
 * This runs once on first request to avoid startup issues
 */
let validated = false;
let validationError: string | null = null;

export const validateEnvironment = () => {
  return async (c: Context, next: Next) => {
    // Only validate once
    if (!validated) {
      const required: Record<string, unknown> = {
        CLERK_PUBLISHABLE_KEY: c.env.CLERK_PUBLISHABLE_KEY,
        CLERK_SECRET_KEY: c.env.CLERK_SECRET_KEY,
        DB: c.env.DB,
      };

      const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([key]) => key);

      if (missing.length > 0) {
        validationError = `
❌ Missing required environment variables or bindings:
${missing.map((v) => `  - ${v}`).join("\n")}

For local development:
1. Create apps/auto-landlord-api/.dev.vars with:
   CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_secret

2. Ensure wrangler.json has correct D1 binding

For production:
1. Set secrets: wrangler secret put CLERK_PUBLISHABLE_KEY
2. Set secrets: wrangler secret put CLERK_SECRET_KEY
        `.trim();

        console.error(validationError);
      }

      validated = true;
    }

    // If validation failed, return error response
    if (validationError) {
      return c.json(
        {
          error: "Configuration Error",
          message: "Server is not properly configured",
          details:
            process.env.NODE_ENV === "development"
              ? validationError
              : "Please contact administrator",
        },
        500
      );
    }

    return next();
  };
};

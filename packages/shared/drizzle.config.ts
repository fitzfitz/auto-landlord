import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: "5dfcf091-d371-492d-9d55-8cdbfc449b4d",
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;

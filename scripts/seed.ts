#!/usr/bin/env node
/**
 * Database Seed Script
 * Populates the database with initial required data
 * 
 * Usage:
 *   pnpm tsx scripts/seed.ts
 */

import { drizzle } from "drizzle-orm/d1";
import { createClient } from "@libsql/client";
import * as schema from "../packages/shared/src/db/schema";

// This script expects these environment variables
const requiredEnvVars = [
  "CLOUDFLARE_ACCOUNT_ID",
  "CLOUDFLARE_API_TOKEN",
  "D1_DATABASE_ID",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing environment variable: ${envVar}`);
    process.exit(1);
  }
}

const PLANS = [
  {
    id: crypto.randomUUID(),
    name: "Starter",
    slug: "starter",
    price: 0,
    features: JSON.stringify([
      "Up to 2 properties",
      "Basic tenant screening",
      "Email support",
    ]),
    maxProperties: 2,
  },
  {
    id: crypto.randomUUID(),
    name: "Pro",
    slug: "pro",
    price: 2900, // $29.00 in cents
    features: JSON.stringify([
      "Up to 10 properties",
      "Advanced tenant screening",
      "Online rent collection",
      "Priority support",
      "Analytics dashboard",
    ]),
    maxProperties: 10,
  },
  {
    id: crypto.randomUUID(),
    name: "Enterprise",
    slug: "enterprise",
    price: 9900, // $99.00 in cents
    features: JSON.stringify([
      "Unlimited properties",
      "API access",
      "Custom branding",
      "Dedicated account manager",
      "White-label option",
    ]),
    maxProperties: 999999,
  },
];

async function seed() {
  console.log("🌱 Seeding database...\n");

  // This is a placeholder - you'll need to adapt this for D1
  // For local development with Wrangler, you can use SQL commands directly
  console.log("📋 Plans to seed:");
  PLANS.forEach((plan) => {
    console.log(`  - ${plan.name}: $${plan.price / 100}/mo (${plan.maxProperties} properties)`);
  });

  console.log("\n⚠️  Note: This script needs to be run via wrangler d1 execute");
  console.log("\nTo seed the database, run:");
  console.log("\n1. For local development:");
  console.log("   npx wrangler d1 execute auto-landlord-db --local --file=scripts/seed.sql\n");
  console.log("2. For production:");
  console.log("   npx wrangler d1 execute auto-landlord-db --file=scripts/seed.sql\n");

  // Generate SQL
  const sql = generateSeedSQL();
  console.log("Generated SQL (copy to scripts/seed.sql):");
  console.log("─".repeat(60));
  console.log(sql);
  console.log("─".repeat(60));
}

function generateSeedSQL(): string {
  const planInserts = PLANS.map((plan) => {
    return `INSERT OR IGNORE INTO plans (id, name, slug, price, features, max_properties) 
VALUES ('${plan.id}', '${plan.name}', '${plan.slug}', ${plan.price}, '${plan.features}', ${plan.maxProperties});`;
  }).join("\n");

  return `-- Seed Script Generated: ${new Date().toISOString()}
-- This populates required initial data

${planInserts}

-- Verify inserts
SELECT 'Seeded ' || COUNT(*) || ' plans' as result FROM plans;
`;
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});


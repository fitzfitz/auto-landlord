-- Database Seed Script
-- Run with: npx wrangler d1 execute auto-landlord-db --local --file=scripts/seed.sql

-- Clear existing plans (optional - remove if you want to keep existing)
-- DELETE FROM plans;

-- Insert subscription plans
INSERT OR IGNORE INTO plans (id, name, slug, price, features, max_properties) 
VALUES ('starter-plan-id-001', 'Starter', 'starter', 0, '["Up to 2 properties","Basic tenant screening","Email support"]', 2);

INSERT OR IGNORE INTO plans (id, name, slug, price, features, max_properties) 
VALUES ('pro-plan-id-002', 'Pro', 'pro', 2900, '["Up to 10 properties","Advanced tenant screening","Online rent collection","Priority support","Analytics dashboard"]', 10);

INSERT OR IGNORE INTO plans (id, name, slug, price, features, max_properties) 
VALUES ('enterprise-plan-id-003', 'Enterprise', 'enterprise', 9900, '["Unlimited properties","API access","Custom branding","Dedicated account manager","White-label option"]', 999999);

-- Verify inserts
SELECT COUNT(*) as plan_count FROM plans;
SELECT * FROM plans;


#!/bin/bash
# Auto Landlord - Development Setup Script (macOS/Linux)
# This script sets up the development environment

set -e

echo "🚀 Auto Landlord - Development Setup"
echo "======================================"
echo ""

# Colors
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm is not installed${NC}"
    echo "Install with: npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}⚠️  wrangler not found, installing...${NC}"
    pnpm add -g wrangler
fi

echo "✅ wrangler found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Check for environment files
echo "🔍 Checking environment configuration..."

ENV_MISSING=0

if [ ! -f "apps/auto-landlord-admin/.env" ]; then
    echo -e "${YELLOW}⚠️  apps/auto-landlord-admin/.env missing${NC}"
    ENV_MISSING=1
fi

if [ ! -f "packages/shared/.env" ]; then
    echo -e "${YELLOW}⚠️  packages/shared/.env missing${NC}"
    ENV_MISSING=1
fi

if [ $ENV_MISSING -eq 1 ]; then
    echo ""
    echo -e "${RED}❌ Environment files missing!${NC}"
    echo ""
    echo "Please create the following files:"
    echo ""
    echo "1. apps/auto-landlord-admin/.env"
    echo "   VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx"
    echo "   VITE_API_URL=http://localhost:8787/api"
    echo ""
    echo "2. packages/shared/.env"
    echo "   CLOUDFLARE_ACCOUNT_ID=your_account_id"
    echo "   CLOUDFLARE_API_TOKEN=your_api_token"
    echo ""
    echo "Get Clerk keys from: https://dashboard.clerk.com"
    echo "Get Cloudflare credentials from: https://dash.cloudflare.com"
    echo ""
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Check if logged into wrangler
echo "🔐 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Cloudflare${NC}"
    echo "Running: wrangler login"
    wrangler login
fi

echo "✅ Cloudflare authenticated"
echo ""

# Check if database exists
echo "🗄️  Checking D1 database..."
DB_EXISTS=$(wrangler d1 list | grep "auto-landlord-db" || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo -e "${YELLOW}⚠️  Database doesn't exist, creating...${NC}"
    wrangler d1 create auto-landlord-db
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Update apps/auto-landlord-api/wrangler.json${NC}"
    echo "   Replace the database_id with the one shown above"
    echo ""
    read -p "Press enter once you've updated wrangler.json..."
fi

echo "✅ Database exists"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
cd packages/shared
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
cd ../..

echo "✅ Migrations complete"
echo ""

# Seed database
echo "🌱 Seeding database..."
if [ -f "scripts/seed.sql" ]; then
    wrangler d1 execute auto-landlord-db --local --file=scripts/seed.sql
    echo "✅ Database seeded"
else
    echo -e "${YELLOW}⚠️  Seed file not found, skipping...${NC}"
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set Cloudflare secrets:"
echo "   cd apps/auto-landlord-api"
echo "   npx wrangler secret put CLERK_PUBLISHABLE_KEY"
echo "   npx wrangler secret put CLERK_SECRET_KEY"
echo ""
echo "2. Start development:"
echo "   pnpm dev"
echo ""
echo "3. Open:"
echo "   - Admin: http://localhost:5173"
echo "   - API: http://localhost:8787"
echo "   - Landing: http://localhost:3000"
echo ""


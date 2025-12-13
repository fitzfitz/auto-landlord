# Quick Start Guide - Auto Landlord

**Status**: ✅ Setup Complete! All servers running.

> **Note**: If you've already completed setup, your app is running on:
> - Admin: http://localhost:5173
> - API: http://localhost:8787
> - Landing: http://localhost:3000
>
> See [PROJECT_STATUS.md](PROJECT_STATUS.md) for current progress.

---

## For New Setup (First Time)

This guide will get the app running in ~15 minutes.

## Prerequisites Checklist

- [ ] Node.js 20+ installed
- [ ] pnpm installed (`npm install -g pnpm`)
- [ ] Clerk account ([clerk.com](https://clerk.com))
- [ ] Cloudflare account ([cloudflare.com](https://cloudflare.com))

## Setup Steps

### 1. Get Clerk API Keys

1. Go to https://dashboard.clerk.com
2. Create a new application (or use existing)
3. Go to **API Keys**
4. Copy:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

### 2. Create Environment Files

**apps/auto-landlord-admin/.env**:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
VITE_API_URL=http://localhost:8787/api
```

**packages/shared/.env** (if running migrations):

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

### 3. Setup Cloudflare

```bash
# Login to Cloudflare
npx wrangler login

# Create D1 database
npx wrangler d1 create auto-landlord-db
```

**Important**: Copy the `database_id` from the output and update:

- `apps/auto-landlord-api/wrangler.json` line 10

### 4. Initialize Database

```bash
# Option A: From API directory (recommended)
cd apps/auto-landlord-api

# Run migrations
echo "Y" | npx wrangler d1 migrations apply auto-landlord-db --local

# Seed data
npx wrangler d1 execute auto-landlord-db --local --file=../../scripts/seed.sql

# Verify (should show 3 plans)
npx wrangler d1 execute auto-landlord-db --local --command "SELECT * FROM plans"

cd ../..

# Option B: From root (all-in-one)
pnpm db:reset:local
```

**Note**: The app will work even without seed data (users can be created), but subscription plans won't be assigned.

### 5. Configure Cloudflare Secrets

For the API to authenticate with Clerk:

```bash
cd apps/auto-landlord-api

# Set secrets (paste your keys when prompted)
npx wrangler secret put CLERK_PUBLISHABLE_KEY
npx wrangler secret put CLERK_SECRET_KEY

cd ../..
```

### 6. Start Development Servers

```bash
# Start all apps
pnpm dev
```

Or start individually:

```bash
# Terminal 1 - API
pnpm --filter auto-landlord-api dev

# Terminal 2 - Admin
pnpm --filter auto-landlord-admin dev

# Terminal 3 - Landing (optional)
pnpm --filter auto-landlord-landing dev
```

### 7. Test the Flow

1. Open http://localhost:5173 (admin app)
2. Click "Sign In" - should redirect to Clerk
3. Sign up with a test email
4. After auth, should redirect to dashboard
5. Check terminal - should see `[User Sync] Creating new user: user_xxxxx`
6. Dashboard should load (will be empty)
7. Try creating a property
8. Verify it appears in the list

---

## Verification Checklist

After setup, verify each piece works:

### ✅ Database

```bash
npx wrangler d1 execute auto-landlord-db --local --command "SELECT COUNT(*) FROM plans"
# Should return: 3
```

### ✅ API Health

```bash
curl http://localhost:8787/health
# Should return: {"status":"healthy",...}
```

### ✅ Authentication

1. Open http://localhost:5173
2. Open DevTools > Network tab
3. Sign in via Clerk
4. Make any API call
5. Check request headers - should include `Authorization: Bearer xxx`
6. Response should be 200 (not 401)

### ✅ User Sync

```bash
# After signing in, check user was created:
npx wrangler d1 execute auto-landlord-db --local --command "SELECT * FROM users"
# Should show your user with Clerk ID
```

---

## Common Issues

### Issue: "Missing VITE_CLERK_PUBLISHABLE_KEY"

**Solution**: Create `apps/auto-landlord-admin/.env` file (see step 2)

### Issue: "table users does not exist"

**Solution**: Run migrations: `pnpm db:migrate:local`

### Issue: "Starter plan not found"

**Solution**: Run seed script: `npx wrangler d1 execute auto-landlord-db --local --file=scripts/seed.sql`

### Issue: API returns 401 even after login

**Solutions**:

1. Check CORS is allowing your origin (should be `localhost:5173`)
2. Verify Clerk secrets are set: `npx wrangler secret list`
3. Check Clerk keys match between admin and API

### Issue: Properties don't show up after creation

**Solution**: Check user was created in database. If not, the user sync failed. Check API logs.

---

## Development URLs

| Service         | URL                          | Purpose                 |
| --------------- | ---------------------------- | ----------------------- |
| Admin Dashboard | http://localhost:5173        | Main landlord interface |
| API             | http://localhost:8787        | Backend API             |
| API Docs        | http://localhost:8787/ui     | Swagger UI              |
| API Health      | http://localhost:8787/health | Health check            |
| Landing Page    | http://localhost:3000        | Public site             |

---

## Next Steps After Setup

1. Create your first property
2. Test image upload
3. Test creating a maintenance ticket
4. Review the [ROADMAP.md](docs/ROADMAP.md) for next features
5. Check [SETUP_REQUIRED.md](SETUP_REQUIRED.md) for remaining tech debt

---

## Need Help?

- Check `SETUP_REQUIRED.md` for detailed infrastructure issues
- Check API logs: `pnpm --filter auto-landlord-api dev` (look for errors)
- Check database: `npx wrangler d1 execute auto-landlord-db --local --command "SELECT * FROM users"`

# AutoLandlord - Environment Setup Guide

## Overview

This project uses **two different database configurations**:

- **Local Development**: SQLite (file-based database)
- **Production**: Cloudflare D1 (serverless database)

## Quick Start for New Team Members

### 1. Clone the Repository

```bash
git clone <repository-url>
cd auto-landlord
```

### 2. Run Setup Script

**For macOS/Linux:**

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**For Windows:**

```bash
scripts\setup.bat
```

This script will:

- ✅ Install dependencies
- ✅ Create `.env` file
- ✅ Generate Prisma Client
- ✅ Run database migrations
- ✅ Seed sample data

### 3. Update Environment Variables

Edit `.env` and add your actual credentials:

```env
# Database (Local Development - SQLite)
DATABASE_URL="file:./dev.db"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..." # Get from clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..." # Get from clerk.com

# Email (Resend)
RESEND_API_KEY="re_..." # Get from resend.com

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cloudflare R2 (Storage)
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key"
R2_SECRET_ACCESS_KEY="your_secret_key"
R2_BUCKET_NAME="auto-landlord-images"
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Demo Accounts

After running the setup script, you can log in with:

| Role     | Email             | Password            |
| -------- | ----------------- | ------------------- |
| Landlord | landlord@demo.com | (Use Clerk sign-in) |
| Tenant   | tenant@demo.com   | (Use Clerk sign-in) |

## Database Commands

### Reset Database

```bash
# Delete database and start fresh
rm prisma/dev.db
npx prisma migrate dev
npm run seed
```

### View Database

```bash
# Open Prisma Studio (Database GUI)
npx prisma studio
```

### Create Migration

```bash
# After changing schema.prisma
npx prisma migrate dev --name your_migration_name
```

## Production Setup (Cloudflare D1)

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

### 3. Create D1 Database

```bash
npx wrangler d1 create auto-landlord-db
```

Copy the `database_id` and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "auto-landlord-db"
database_id = "YOUR_DATABASE_ID_HERE" # Paste here
```

### 4. Generate Migration SQL

```bash
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > prisma/migrations/init.sql
```

### 5. Apply Migration to D1

```bash
npx wrangler d1 execute auto-landlord-db --file=./prisma/migrations/init.sql
```

### 6. Seed Production Database

```bash
# Seed plans only (no demo data)
NODE_ENV=production npx wrangler d1 execute auto-landlord-db --command="$(npx prisma db seed)"
```

## Important Notes

### ⚠️ Database Files in Git

- SQLite database files (`*.db`, `*.db-journal`) are **gitignored**
- Each developer has their own local database
- Never commit database files to Git

### ⚠️ Environment Files

- `.env` files are **gitignored**
- Each developer configures their own `.env`
- Never commit secrets to Git

### ⚠️ Prisma Migrations

- Migrations **are** committed to Git
- They keep the database schema in sync across the team

## Troubleshooting

### "Prisma Client is not generated"

```bash
npx prisma generate
```

### "Database does not exist"

```bash
npx prisma migrate dev
```

### "Port 3000 is already in use"

```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill
```

### "Missing environment variables"

Ensure all required variables are set in `.env` file.

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Clerk Documentation](https://clerk.com/docs)

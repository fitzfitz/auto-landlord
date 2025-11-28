# AutoLandlord

A modern property management platform built with Next.js, Cloudflare, and Prisma.

## Features

- 🏠 **Property Management** - Manage multiple properties with detailed information
- 👥 **Tenant Management** - Invite and manage tenants with automated emails
- 🎫 **Maintenance Tickets** - Track and manage maintenance requests
- 📄 **Application System** - Handle property applications efficiently
- 🖼️ **Image Upload** - Cloudflare R2 integration for property photos
- 🔐 **Authentication** - Secure auth with Clerk
- 📧 **Email Notifications** - Automated emails via Resend
- 🌍 **Public Listings** - SEO-friendly property listings

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Cloudflare D1 (Production) / SQLite (Local)
- **Authentication**: Clerk
- **Storage**: Cloudflare R2
- **Email**: Resend
- **Styling**: Tailwind CSS 4
- **ORM**: Prisma

## Quick Start

### Prerequisites

- Node.js 20 or higher
- npm or pnpm

### Setup

**For macOS/Linux:**

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**For Windows:**

```bash
scripts\setup.bat
```

This will:

- Install dependencies
- Create `.env` file
- Run database migrations
- Seed sample data

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Accounts

- **Landlord**: `landlord@demo.com`
- **Tenant**: `tenant@demo.com`

## Deployment

### Production Deployment

1. Push a release tag:

```bash
git tag release-v1.0.0
git push origin release-v1.0.0
```

2. GitHub Actions will automatically:
   - Build the application
   - Deploy to Cloudflare Pages
   - Run database migrations

### CI/CD

Every push to `main`:

- ✅ Lints code
- ✅ Runs type checks
- ✅ Builds application
- ❌ Does NOT deploy

## Environment Variables

See `.env.example` for required variables.

**Required for Local Development:**

- `DATABASE_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`

**Additional for Production:**

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## Database Commands

```bash
# View database (GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
rm prisma/dev.db
npx prisma migrate dev
npm run seed
```

## Project Structure

```
.
├── .github/workflows/      # GitHub Actions
├── prisma/                 # Database schema and migrations
├── scripts/                # Setup and utility scripts
├── src/
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── lib/               # Utilities and helpers
├── SETUP.md               # Detailed setup guide
└── wrangler.toml          # Cloudflare configuration
```

## Documentation

- [Setup Guide](./SETUP.md) - Comprehensive setup instructions
- [Deployment Guide](./deployment_guide.md) - Cloudflare deployment details
- [Action Checklist](./action_checklist.md) - Production deployment steps

## License

MIT

## Support

For questions or issues, please open a GitHub issue.

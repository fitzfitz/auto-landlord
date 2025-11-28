#!/bin/bash

# AutoLandlord - Team Setup Script
# This script sets up the local development environment with SQLite database and sample data

echo "🚀 AutoLandlord - Development Setup"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Setup environment file
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ .env file created"
        echo "⚠️  Please update .env with your actual credentials"
    else
        echo "⚠️  No .env.example found. Creating minimal .env..."
        cat > .env << EOL
DATABASE_URL="file:./dev.db"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
RESEND_API_KEY="your_resend_api_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
R2_ACCOUNT_ID="your_r2_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key"
R2_SECRET_ACCESS_KEY="your_r2_secret_key"
R2_BUCKET_NAME="auto-landlord-images"
EOL
        echo "✅ Minimal .env created"
        echo "⚠️  Please update .env with your actual credentials"
    fi
else
    echo "ℹ️  .env file already exists, skipping..."
fi

echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi

echo "✅ Migrations completed"
echo ""

# Seed database
echo "🌱 Seeding database with sample data..."
npm run seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded"
echo ""

# Final instructions
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your actual credentials"
echo "2. Run 'npm run dev' to start the development server"
echo ""
echo "Demo accounts:"
echo "  Landlord: landlord@demo.com"
echo "  Tenant: tenant@demo.com"
echo ""
echo "Happy coding! 🎉"

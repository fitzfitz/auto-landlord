@echo off
REM AutoLandlord - Team Setup Script (Windows)
REM This script sets up the local development environment with SQLite database and sample data

echo ====================================
echo AutoLandlord - Development Setup
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 20 or higher.
    exit /b 1
)

echo [OK] Node.js version:
node --version
echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)

echo [OK] Dependencies installed
echo.

REM Setup environment file
if not exist ".env" (
    echo [INFO] Creating .env file...
    if exist ".env.example" (
        copy .env.example .env
        echo [OK] .env file created from .env.example
        echo [WARNING] Please update .env with your actual credentials
    ) else (
        echo [WARNING] No .env.example found. Creating minimal .env...
        (
            echo DATABASE_URL="file:./dev.db"
            echo CLERK_SECRET_KEY="your_clerk_secret_key"
            echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
            echo RESEND_API_KEY="your_resend_api_key"
            echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
            echo R2_ACCOUNT_ID="your_r2_account_id"
            echo R2_ACCESS_KEY_ID="your_r2_access_key"
            echo R2_SECRET_ACCESS_KEY="your_r2_secret_key"
            echo R2_BUCKET_NAME="auto-landlord-images"
        ) > .env
        echo [OK] Minimal .env created
        echo [WARNING] Please update .env with your actual credentials
    )
) else (
    echo [INFO] .env file already exists, skipping...
)

echo.

REM Generate Prisma Client
echo [INFO] Generating Prisma Client...
call npx prisma generate

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to generate Prisma Client
    exit /b 1
)

echo [OK] Prisma Client generated
echo.

REM Run database migrations
echo [INFO] Running database migrations...
call npx prisma migrate dev --name init

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to run migrations
    exit /b 1
)

echo [OK] Migrations completed
echo.

REM Seed database
echo [INFO] Seeding database with sample data...
call npm run seed

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to seed database
    exit /b 1
)

echo [OK] Database seeded
echo.

REM Final instructions
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Update .env file with your actual credentials
echo 2. Run 'npm run dev' to start the development server
echo.
echo Demo accounts:
echo   Landlord: landlord@demo.com
echo   Tenant: tenant@demo.com
echo.
echo Happy coding!
echo.
pause

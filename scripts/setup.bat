@echo off
REM Auto Landlord - Development Setup Script (Windows)
REM This script sets up the development environment

echo.
echo ================================================
echo  Auto Landlord - Development Setup
echo ================================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] pnpm is not installed
    echo Install with: npm install -g pnpm
    exit /b 1
)
echo [OK] pnpm found

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] wrangler not found, installing...
    call pnpm add -g wrangler
)
echo [OK] wrangler found
echo.

REM Install dependencies
echo Installing dependencies...
call pnpm install
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%
echo [OK] Dependencies installed
echo.

REM Check for environment files
echo Checking environment configuration...

set ENV_MISSING=0

if not exist "apps\auto-landlord-admin\.env" (
    echo [WARN] apps\auto-landlord-admin\.env missing
    set ENV_MISSING=1
)

if not exist "packages\shared\.env" (
    echo [WARN] packages\shared\.env missing
    set ENV_MISSING=1
)

if %ENV_MISSING% EQU 1 (
    echo.
    echo [ERROR] Environment files missing!
    echo.
    echo Please create the following files:
    echo.
    echo 1. apps\auto-landlord-admin\.env
    echo    VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
    echo    VITE_API_URL=http://localhost:8787/api
    echo.
    echo 2. packages\shared\.env
    echo    CLOUDFLARE_ACCOUNT_ID=your_account_id
    echo    CLOUDFLARE_API_TOKEN=your_api_token
    echo.
    echo Get Clerk keys from: https://dashboard.clerk.com
    echo Get Cloudflare credentials from: https://dash.cloudflare.com
    echo.
    exit /b 1
)

echo [OK] Environment files found
echo.

REM Check Cloudflare auth
echo Checking Cloudflare authentication...
call wrangler whoami >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Not logged into Cloudflare
    echo Running: wrangler login
    call wrangler login
)
echo [OK] Cloudflare authenticated
echo.

REM Check database
echo Checking D1 database...
call wrangler d1 list | find "auto-landlord-db" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Database doesn't exist, creating...
    call wrangler d1 create auto-landlord-db
    echo.
    echo [IMPORTANT] Update apps\auto-landlord-api\wrangler.json
    echo Replace the database_id with the one shown above
    echo.
    pause
)
echo [OK] Database exists
echo.

REM Run migrations
echo Running database migrations...
cd packages\shared
call pnpm drizzle-kit generate
call pnpm drizzle-kit migrate
cd ..\..
echo [OK] Migrations complete
echo.

REM Seed database
echo Seeding database...
if exist "scripts\seed.sql" (
    call wrangler d1 execute auto-landlord-db --local --file=scripts/seed.sql
    echo [OK] Database seeded
) else (
    echo [WARN] Seed file not found, skipping...
)

echo.
echo ================================================
echo  Setup complete!
echo ================================================
echo.
echo Next steps:
echo 1. Set Cloudflare secrets:
echo    cd apps\auto-landlord-api
echo    npx wrangler secret put CLERK_PUBLISHABLE_KEY
echo    npx wrangler secret put CLERK_SECRET_KEY
echo.
echo 2. Start development:
echo    pnpm dev
echo.
echo 3. Open:
echo    - Admin: http://localhost:5173
echo    - API: http://localhost:8787
echo    - Landing: http://localhost:3000
echo.
pause


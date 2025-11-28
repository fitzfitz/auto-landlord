# Phase 4 Setup Guide

## Required Environment Variables

Add these to your `.env` file:

```env
# Cloudflare R2 (Required for image uploads)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=autolandlord-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# OpenAI (Optional - for AI descriptions)
# OPENAI_API_KEY=sk-...
```

## Cloudflare R2 Setup Steps

1. \*\*Create

Cloudflare Account\*\*

- Go to https://cloudflare.com
- Sign up (free tier available)

2. **Create R2 Bucket**

   - Dashboard → R2 → Create bucket
   - Name: `autolandlord-images`
   - Location: Automatic

3. **Get API Credentials**

   - R2 → Manage R2 API Tokens
   - Create API Token
   - Copy: Access Key ID + Secret Access Key
   - Copy: Account ID (from R2 dashboard)

4. **Setup Public Access**

   - Bucket Settings → Public Access
   - Enable public access
   - Copy public URL (format: `https://pub-xxx.r2.dev`)

5. **Add to .env**
   - Paste all credentials into `.env` file

## Testing

Once configured, the image upload should work automatically when adding properties.

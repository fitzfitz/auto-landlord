import { NextRequest, NextResponse } from "next/server";
import { S3Client, ListObjectsCommand } from "@aws-sdk/client-s3";

export async function GET(request: NextRequest) {
  const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
  const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

  const missingVars = [];
  if (!R2_ACCOUNT_ID) missingVars.push("R2_ACCOUNT_ID");
  if (!R2_ACCESS_KEY_ID) missingVars.push("R2_ACCESS_KEY_ID");
  if (!R2_SECRET_ACCESS_KEY) missingVars.push("R2_SECRET_ACCESS_KEY");
  if (!R2_BUCKET_NAME) missingVars.push("R2_BUCKET_NAME");
  if (!R2_PUBLIC_URL) missingVars.push("R2_PUBLIC_URL");

  if (missingVars.length > 0) {
    return NextResponse.json(
      {
        status: "error",
        message: "Missing environment variables",
        missing: missingVars,
      },
      { status: 500 }
    );
  }

  // Check for common configuration error
  if (R2_PUBLIC_URL?.includes("r2.cloudflarestorage.com")) {
    return NextResponse.json(
      {
        status: "warning",
        message: "Configuration Error Detected",
        details:
          "Your R2_PUBLIC_URL appears to be the S3 API endpoint, not the public access URL.",
        instruction:
          'Please go to your Cloudflare R2 Bucket Settings -> Public Access, enable it, and use the "Public R2.dev Bucket URL" (e.g., https://pub-xxx.r2.dev).',
      },
      { status: 400 }
    );
  }

  try {
    const r2Client = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    });

    const command = new ListObjectsCommand({
      Bucket: R2_BUCKET_NAME,
      MaxKeys: 1,
    });

    await r2Client.send(command);

    return NextResponse.json({
      status: "success",
      message: "Successfully connected to Cloudflare R2",
      bucket: R2_BUCKET_NAME,
      publicUrl: R2_PUBLIC_URL,
    });
  } catch (error: any) {
    console.error("R2 Connection Error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to R2",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Cloudflare R2 is S3-compatible
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

// Validate credentials
if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME
) {
  console.error(
    "Missing R2 environment variables. Please check your .env file."
  );
}

// Initialize S3 client for Cloudflare R2
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

export interface UploadResult {
  url: string;
  publicId: string;
  size: number;
}

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<UploadResult> {
  if (
    !R2_ACCOUNT_ID ||
    !R2_ACCESS_KEY_ID ||
    !R2_SECRET_ACCESS_KEY ||
    !R2_BUCKET_NAME
  ) {
    throw new Error(
      "R2 credentials are missing. Please check R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME in your .env file."
    );
  }

  // Generate unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = filename.split(".").pop();
  const publicId = `properties/${timestamp}-${randomString}.${extension}`;

  const upload = new Upload({
    client: r2Client,
    params: {
      Bucket: R2_BUCKET_NAME,
      Key: publicId,
      Body: buffer,
      ContentType: mimetype,
    },
  });

  await upload.done();

  // Normalize Public URL
  let publicUrl = R2_PUBLIC_URL || "";
  if (publicUrl && !publicUrl.startsWith("http")) {
    publicUrl = `https://${publicUrl}`;
  }
  if (publicUrl && publicUrl.endsWith("/")) {
    publicUrl = publicUrl.slice(0, -1);
  }

  const url = `${publicUrl}/${publicId}`;

  return {
    url,
    publicId,
    size: buffer.length,
  };
}

export async function deleteFromR2(publicId: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: publicId,
  });

  await r2Client.send(command);
}

export async function uploadMultipleToR2(
  files: { buffer: Buffer; filename: string; mimetype: string }[]
): Promise<UploadResult[]> {
  return Promise.all(
    files.map((file) => uploadToR2(file.buffer, file.filename, file.mimetype))
  );
}

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { requireAuth } from "../../middleware/auth";
import type { AppEnv } from "../../types/bindings";

const app = new Hono<AppEnv>();

// File upload configuration
const MAX_FILE_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

/**
 * Validates uploaded file against security rules
 */
function validateFile(file: File): {
  valid: boolean;
  error?: string;
  details?: string;
} {
  // Check if file exists
  if (!file || !file.name) {
    return {
      valid: false,
      error: "Invalid file",
      details: "No file provided or file is corrupted",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: "File too large",
      details: `File size ${sizeMB}MB exceeds maximum of ${maxMB}MB`,
    };
  }

  // Check for empty files
  if (file.size === 0) {
    return {
      valid: false,
      error: "Empty file",
      details: "File has no content",
    };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: "Invalid file type",
      details: `File type '${file.type}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  // Check file extension (additional security layer)
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    return {
      valid: false,
      error: "Invalid file extension",
      details: `File extension must be one of: ${ALLOWED_EXTENSIONS.join(", ")}`,
    };
  }

  return { valid: true };
}

// Serve R2 files (public endpoint for images)
app.get("/r2/:key", async (c) => {
  const key = c.req.param("key");
  const object = await c.env.BUCKET.get(key);

  if (!object) {
    return c.json({ error: "Not found" }, 404);
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType || "application/octet-stream");
  headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

  return new Response(object.body, { headers });
});

// Protected upload endpoint
app.use("/", requireAuth);

app.post("/", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body["file"];

    // Validate file exists
    if (!file || !(file instanceof File)) {
      throw new HTTPException(400, {
        message: "No file uploaded or invalid file format",
      });
    }

    // Validate file against security rules
    const validation = validateFile(file);
    if (!validation.valid) {
      return c.json(
        {
          error: validation.error,
          message: validation.details,
          limits: {
            maxSizeMB: MAX_FILE_SIZE / (1024 * 1024),
            allowedTypes: ALLOWED_MIME_TYPES,
            allowedExtensions: ALLOWED_EXTENSIONS,
          },
        },
        400
      );
    }

    // Generate secure filename (UUID + sanitized original name)
    const sanitizedName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 100); // Limit filename length

    const key = `${crypto.randomUUID()}-${sanitizedName}`;

    // Upload to R2
    await c.env.BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Return success response with file details
    const url = `/upload/r2/${key}`;
    return c.json({
      url,
      key,
      size: file.size,
      type: file.type,
      originalName: file.name,
    });
  } catch (error) {
    // Handle HTTP exceptions
    if (error instanceof HTTPException) {
      throw error;
    }

    // Log and return generic error for unexpected issues
    console.error("[Upload] Unexpected error:", error);
    throw new HTTPException(500, {
      message: "Failed to upload file. Please try again.",
    });
  }
});

export default app;

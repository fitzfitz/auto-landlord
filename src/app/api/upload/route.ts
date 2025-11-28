import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import {
  checkImageSize,
  compressImages,
  type ImageFile,
} from "@/lib/image-compression";
import { uploadMultipleToR2 } from "@/lib/r2-upload";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const MAX_FILES = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const propertyId = formData.get("propertyId") as string;
    const shouldCompress = formData.get("compress") === "true";

    if (!propertyId) {
      return NextResponse.json(
        { error: "Property ID required" },
        { status: 400 }
      );
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { id: propertyId, landlordId: user.id },
    });

    if (!property) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    // Process uploaded files
    const files: ImageFile[] = [];
    const fileEntries = Array.from(formData.entries()).filter(([key]) =>
      key.startsWith("file")
    );

    if (fileEntries.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    if (fileEntries.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed` },
        { status: 400 }
      );
    }

    for (const [, value] of fileEntries) {
      const file = value as File;

      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP`,
          },
          { status: 400 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      files.push({
        buffer,
        filename: file.name,
        mimetype: file.type,
        size: buffer.length,
      });
    }

    // Check if any files need compression
    const sizeCheck = await checkImageSize(files);

    if (sizeCheck.needsCompression && !shouldCompress) {
      // Return list of oversized files for user confirmation
      return NextResponse.json({
        needsConfirmation: true,
        oversizedFiles: sizeCheck.oversized,
      });
    }

    // Compress if needed
    const processedFiles =
      shouldCompress || sizeCheck.needsCompression
        ? await compressImages(files)
        : files.map((f) => ({ ...f, originalSize: f.size, compressed: false }));

    // Upload to R2
    const uploadResults = await uploadMultipleToR2(processedFiles);

    // Get current image count for ordering
    const existingCount = await prisma.propertyImage.count({
      where: { propertyId },
    });

    // Save to database
    const propertyImages = await Promise.all(
      uploadResults.map((result, index) =>
        prisma.propertyImage.create({
          data: {
            url: result.url,
            publicId: result.publicId,
            size: result.size,
            order: existingCount + index,
            propertyId,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      images: propertyImages,
      compressionApplied: processedFiles.some((f) => f.compressed),
      stats: processedFiles.map((f) => ({
        filename: f.filename,
        originalSize: f.originalSize,
        finalSize: f.size,
        saved: f.originalSize - f.size,
      })),
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Delete image endpoint
export async function DELETE(request: NextRequest) {
  try {
    const user = await getOrCreateUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      return NextResponse.json({ error: "Image ID required" }, { status: 400 });
    }

    // Verify image belongs to user's property
    const image = await prisma.propertyImage.findFirst({
      where: {
        id: imageId,
        property: { landlordId: user.id },
      },
    });

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from R2 if publicId exists
    if (image.publicId) {
      const { deleteFromR2 } = await import("@/lib/r2-upload");
      await deleteFromR2(image.publicId);
    }

    // Delete from database
    await prisma.propertyImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

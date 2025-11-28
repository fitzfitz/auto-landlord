import sharp from "sharp";

const MAX_SIZE_BYTES = 1.5 * 1024 * 1024; // 1.5MB
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

export interface ImageFile {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  size: number;
}

export interface CompressedImage extends ImageFile {
  originalSize: number;
  compressed: boolean;
}

export async function checkImageSize(images: ImageFile[]): Promise<{
  oversized: { filename: string; size: number; sizeInMB: string }[];
  needsCompression: boolean;
}> {
  const oversized = images
    .filter((img) => img.size > MAX_SIZE_BYTES)
    .map((img) => ({
      filename: img.filename,
      size: img.size,
      sizeInMB: (img.size / (1024 * 1024)).toFixed(2) + " MB",
    }));

  return {
    oversized,
    needsCompression: oversized.length > 0,
  };
}

export async function compressImage(
  image: ImageFile
): Promise<CompressedImage> {
  const originalSize = image.size;

  // If already under limit, return as-is
  if (originalSize <= MAX_SIZE_BYTES) {
    return {
      ...image,
      originalSize,
      compressed: false,
    };
  }

  let compressedBuffer = image.buffer;
  let quality = 90;
  const sharpInstance = sharp(image.buffer);

  // Get image metadata
  const metadata = await sharpInstance.metadata();

  // Strategy 1: Try reducing quality
  while (compressedBuffer.length > MAX_SIZE_BYTES && quality >= 60) {
    if (metadata.format === "png") {
      compressedBuffer = await sharp(image.buffer).webp({ quality }).toBuffer();
    } else {
      compressedBuffer = await sharp(image.buffer).jpeg({ quality }).toBuffer();
    }

    quality -= 10;
  }

  // Strategy 2: If still too large, resize
  if (compressedBuffer.length > MAX_SIZE_BYTES) {
    const width = metadata.width || MAX_WIDTH;
    const height = metadata.height || MAX_HEIGHT;

    const scaleFactor =
      Math.sqrt(MAX_SIZE_BYTES / compressedBuffer.length) * 0.9;
    const newWidth = Math.min(Math.floor(width * scaleFactor), MAX_WIDTH);
    const newHeight = Math.min(Math.floor(height * scaleFactor), MAX_HEIGHT);

    compressedBuffer = await sharp(image.buffer)
      .resize(newWidth, newHeight, { fit: "inside" })
      .webp({ quality: 75 })
      .toBuffer();
  }

  // Update filename to webp if converted
  let filename = image.filename;
  if (
    metadata.format === "png" &&
    compressedBuffer.length < image.buffer.length
  ) {
    filename = filename.replace(/\\.png$/i, ".webp");
  }

  return {
    buffer: compressedBuffer,
    filename,
    mimetype:
      compressedBuffer.length < originalSize ? "image/webp" : image.mimetype,
    size: compressedBuffer.length,
    originalSize,
    compressed: true,
  };
}

export async function compressImages(
  images: ImageFile[]
): Promise<CompressedImage[]> {
  return Promise.all(images.map((img) => compressImage(img)));
}

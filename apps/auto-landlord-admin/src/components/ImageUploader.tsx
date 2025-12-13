import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  file: File;
  preview: string;
  uploadProgress?: number;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
}

export const ImageUploader = ({
  images,
  onImagesChange,
  maxImages = 10,
  maxSizeMB = 1.5, // Updated default to 1.5MB to match backend
}: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Allowed file types (sync with backend)
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setError(null); // Clear previous errors
    const newImages: UploadedImage[] = [];
    const maxSize = maxSizeMB * 1024 * 1024;
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file extension
      const fileName = file.name.toLowerCase();
      const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext)
      );

      if (!hasValidExtension) {
        errors.push(
          `${file.name}: Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`
        );
        return;
      }

      // Check MIME type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(
          `${file.name}: Invalid MIME type '${file.type}'. Must be an image file.`
        );
        return;
      }

      // Check size
      if (file.size > maxSize) {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        errors.push(
          `${file.name}: File too large (${fileSizeMB}MB). Maximum ${maxSizeMB}MB allowed.`
        );
        return;
      }

      // Check for empty files
      if (file.size === 0) {
        errors.push(`${file.name}: File is empty`);
        return;
      }

      // Check if we've reached max images
      if (images.length + newImages.length >= maxImages) {
        errors.push(`Maximum ${maxImages} images allowed`);
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      newImages.push({ file, preview });
    });

    // Show errors if any
    if (errors.length > 0) {
      setError(errors.join("\n"));
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    // Revoke preview URL to free memory
    URL.revokeObjectURL(images[index].preview);
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
          <p className="font-semibold mb-1">Upload Error:</p>
          <p className="text-sm whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
          isDragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/20 hover:border-white/40 hover:bg-white/5"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="p-4 rounded-full bg-white/5">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>

          <div>
            <p className="text-lg font-medium">
              {isDragging
                ? "Drop images here"
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              PNG, JPG, WEBP, GIF up to {maxSizeMB}MB (max {maxImages} images)
            </p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-4 text-sm text-gray-400">
            {images.length} of {maxImages} images uploaded
          </div>
        )}
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden bg-white/5 border border-white/10 group"
            >
              <img
                src={img.preview}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Upload Progress */}
              {img.uploadProgress !== undefined && img.uploadProgress < 100 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-blue-500 animate-spin mb-2" />
                    <p className="text-sm font-medium">{img.uploadProgress}%</p>
                  </div>
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X size={16} />
              </button>

              {/* Index Badge */}
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs font-medium rounded">
                {index === 0 ? "Cover" : `#${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-16 h-16 mx-auto mb-3 opacity-20" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

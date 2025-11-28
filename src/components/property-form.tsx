"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, AlertCircle } from "lucide-react";
import Image from "next/image";

interface OversizedFile {
  filename: string;
  size: number;
  sizeInMB: string;
}

interface PropertyImage {
  id: string;
  url: string;
  publicId: string | null;
}

interface PropertyData {
  id?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  rentAmount: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  propertyType?: string | null;
  description?: string | null;
  images?: PropertyImage[];
}

interface PropertyFormProps {
  initialData?: PropertyData;
  mode: "create" | "edit";
}

export function PropertyForm({ initialData, mode }: PropertyFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<PropertyImage[]>(
    initialData?.images || []
  );
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);
  const [showCompressionModal, setShowCompressionModal] = useState(false);
  const [oversizedFiles, setOversizedFiles] = useState<OversizedFile[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(
    initialData?.id || null
  );

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedImages((prev) => [...prev, ...files].slice(0, 10));
    }
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setDeletedImageIds((prev) => [...prev, imageId]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        address: formData.get("address"),
        city: formData.get("city"),
        state: formData.get("state"),
        zip: formData.get("zip"),
        rentAmount: parseInt(formData.get("rentAmount") as string),
        bedrooms: parseInt(formData.get("bedrooms") as string) || null,
        bathrooms: parseFloat(formData.get("bathrooms") as string) || null,
        propertyType: formData.get("propertyType") || null,
        description: formData.get("description") || null,
      };

      let currentPropertyId = propertyId;

      if (mode === "create") {
        const response = await fetch("/api/properties", {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to create property");
        const result = await response.json();
        currentPropertyId = result.property.id;
        setPropertyId(currentPropertyId);
      } else {
        // Edit mode
        const response = await fetch("/api/properties", {
          method: "PUT",
          body: JSON.stringify({
            ...data,
            id: initialData?.id,
            deletedImageIds,
          }),
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error("Failed to update property");
        currentPropertyId = initialData!.id!;
      }

      // Upload new images if any
      if (selectedImages.length > 0 && currentPropertyId) {
        await uploadImages(currentPropertyId, false);
      } else {
        router.push("/dashboard/properties");
        router.refresh();
      }
    } catch (error) {
      console.error("Error:", error);
      alert(
        mode === "create"
          ? "Failed to create property"
          : "Failed to update property"
      );
      setIsSubmitting(false);
    }
  };

  const uploadImages = async (propId: string, compress: boolean) => {
    const uploadFormData = new FormData();
    uploadFormData.append("propertyId", propId);
    uploadFormData.append("compress", compress.toString());

    selectedImages.forEach((file, index) => {
      uploadFormData.append(`file${index}`, file);
    });

    const uploadResponse = await fetch("/api/upload", {
      method: "POST",
      body: uploadFormData,
    });

    const uploadResult = await uploadResponse.json();

    if (uploadResult.needsConfirmation) {
      setOversizedFiles(uploadResult.oversizedFiles);
      setShowCompressionModal(true);
      setIsSubmitting(false);
    } else if (uploadResult.success) {
      router.push("/dashboard/properties");
      router.refresh();
    } else {
      throw new Error(uploadResult.error || "Upload failed");
    }
  };

  const handleConfirmCompression = async () => {
    setShowCompressionModal(false);
    setIsSubmitting(true);
    if (propertyId) {
      await uploadImages(propertyId, true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
          <h2 className="text-xl font-semibold">Property Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              name="address"
              type="text"
              required
              defaultValue={initialData?.address}
              className="w-full border rounded-md p-2"
              placeholder="123 Main St"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                name="city"
                type="text"
                required
                defaultValue={initialData?.city}
                className="w-full border rounded-md p-2"
                placeholder="New York"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <input
                name="state"
                type="text"
                required
                defaultValue={initialData?.state}
                className="w-full border rounded-md p-2"
                placeholder="NY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code *
              </label>
              <input
                name="zip"
                type="text"
                required
                defaultValue={initialData?.zip}
                className="w-full border rounded-md p-2"
                placeholder="10001"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent ($) *
              </label>
              <input
                name="rentAmount"
                type="number"
                required
                defaultValue={initialData?.rentAmount}
                className="w-full border rounded-md p-2"
                placeholder="2500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                name="bedrooms"
                type="number"
                defaultValue={initialData?.bedrooms || ""}
                className="w-full border rounded-md p-2"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                name="bathrooms"
                type="number"
                step="0.5"
                defaultValue={initialData?.bathrooms || ""}
                className="w-full border rounded-md p-2"
                placeholder="1.5"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              name="propertyType"
              defaultValue={initialData?.propertyType || ""}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select type...</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
              <option value="STUDIO">Studio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              defaultValue={initialData?.description || ""}
              className="w-full border rounded-md p-2"
              placeholder="Describe the property..."
            />
          </div>
        </div>

        {/* Images */}
        <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
          <h2 className="text-xl font-semibold">Property Images</h2>
          <p className="text-sm text-gray-500">
            Upload up to 10 images (max 1.5MB each)
          </p>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={48} />
              <p className="text-gray-600">Click to upload images</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP</p>
            </label>
          </div>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">
                Current Images
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <div className="relative h-32 w-full">
                      <Image
                        src={img.url}
                        alt="Property"
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {selectedImages.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">New Images</h3>
              <div className="grid grid-cols-4 gap-4">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-32 w-full">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 font-medium disabled:opacity-50"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Property"
            : "Update Property"}
        </button>
      </form>

      {/* Compression Confirmation Modal */}
      {showCompressionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-orange-500 shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-lg">
                  Images Need Compression
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  The following images exceed 1.5MB and need to be compressed:
                </p>
              </div>
            </div>

            <ul className="space-y-2 mb-6">
              {oversizedFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                >
                  <span className="truncate">{file.filename}</span>
                  <span className="font-medium text-orange-600">
                    {file.sizeInMB}
                  </span>
                </li>
              ))}
            </ul>

            <p className="text-sm text-gray-600 mb-6">
              We can automatically compress these images to meet the size limit
              while maintaining quality.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCompressionModal(false);
                  setIsSubmitting(false);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompression}
                className="flex-1 bg-black text-white py-2 rounded-md hover:bg-gray-800"
              >
                Compress & Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, PropertyInput, Property } from "@auto-landlord/shared";
import { ImageUploader, UploadedImage } from "@/components/ImageUploader";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PropertyFormProps {
  property?: Property | null;
  onSubmit: (data: PropertyInput, images: UploadedImage[]) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const AMENITIES_OPTIONS = [
  "Air Conditioning",
  "Heating",
  "Washer/Dryer",
  "Dishwasher",
  "Parking",
  "Garage",
  "Pool",
  "Gym",
  "Balcony",
  "Patio",
  "Pet Friendly",
  "Furnished",
];

export const PropertyForm = ({
  property,
  onSubmit,
  onCancel,
  isLoading = false,
}: PropertyFormProps) => {
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Parse amenities safely
  const parseAmenities = (
    amenities: string[] | string | null | undefined
  ): string[] => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === "string") {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    parseAmenities(property?.amenities)
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema) as any,
    defaultValues: property
      ? {
          address: property.address,
          city: property.city,
          state: property.state,
          zip: property.zip,
          rentAmount: property.rentAmount,
          bedrooms: property.bedrooms || undefined,
          bathrooms: property.bathrooms || undefined,
          propertyType: property.propertyType as
            | "HOUSE"
            | "APARTMENT"
            | "CONDO"
            | "TOWNHOUSE"
            | undefined,
          description: property.description || undefined,
          isListed: property.isListed || false,
        }
      : {
          isListed: false,
        },
  });

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const onFormSubmit = async (data: PropertyInput) => {
    await onSubmit({ ...data, amenities: selectedAmenities }, images);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Address Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2">
          Property Address
        </h3>

        <div>
          <label className="block text-sm font-medium mb-2">
            Street Address <span className="text-red-400">*</span>
          </label>
          <input
            {...register("address")}
            className={cn(
              "w-full px-4 py-2 rounded-lg bg-white/5 border transition-colors",
              errors.address
                ? "border-red-500 focus:border-red-500"
                : "border-white/20 focus:border-blue-500"
            )}
            placeholder="123 Main St"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-400">
              {errors.address.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <input
              {...register("city")}
              className={cn(
                "w-full px-4 py-2 rounded-lg bg-white/5 border transition-colors",
                errors.city
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/20 focus:border-blue-500"
              )}
              placeholder="San Francisco"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-400">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              State <span className="text-red-400">*</span>
            </label>
            <input
              {...register("state")}
              className={cn(
                "w-full px-4 py-2 rounded-lg bg-white/5 border transition-colors uppercase",
                errors.state
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/20 focus:border-blue-500"
              )}
              placeholder="CA"
              maxLength={2}
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-400">
                {errors.state.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ZIP Code <span className="text-red-400">*</span>
            </label>
            <input
              {...register("zip")}
              className={cn(
                "w-full px-4 py-2 rounded-lg bg-white/5 border transition-colors",
                errors.zip
                  ? "border-red-500 focus:border-red-500"
                  : "border-white/20 focus:border-blue-500"
              )}
              placeholder="94102"
            />
            {errors.zip && (
              <p className="mt-1 text-sm text-red-400">{errors.zip.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2">
          Property Details
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Property Type
            </label>
            <select
              {...register("propertyType")}
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-blue-500"
            >
              <option value="">Select Type</option>
              <option value="HOUSE">House</option>
              <option value="APARTMENT">Apartment</option>
              <option value="CONDO">Condo</option>
              <option value="TOWNHOUSE">Townhouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly Rent <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                $
              </span>
              <input
                {...register("rentAmount")}
                type="number"
                className={cn(
                  "w-full pl-8 pr-4 py-2 rounded-lg bg-white/5 border transition-colors",
                  errors.rentAmount
                    ? "border-red-500 focus:border-red-500"
                    : "border-white/20 focus:border-blue-500"
                )}
                placeholder="2000"
              />
            </div>
            {errors.rentAmount && (
              <p className="mt-1 text-sm text-red-400">
                {errors.rentAmount.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bedrooms</label>
            <input
              {...register("bedrooms")}
              type="number"
              min="0"
              step="1"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-blue-500"
              placeholder="2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bathrooms</label>
            <input
              {...register("bathrooms")}
              type="number"
              min="0"
              step="0.5"
              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-blue-500"
              placeholder="1.5"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20 focus:border-blue-500 resize-none"
            placeholder="Describe your property..."
          />
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2">
          Amenities
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AMENITIES_OPTIONS.map((amenity) => (
            <label
              key={amenity}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors",
                selectedAmenities.includes(amenity)
                  ? "bg-blue-500/20 border-blue-500"
                  : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              <input
                type="checkbox"
                checked={selectedAmenities.includes(amenity)}
                onChange={() => toggleAmenity(amenity)}
                className="w-4 h-4 rounded border-white/20"
              />
              <span className="text-sm">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      {!property && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">
            Property Images
          </h3>
          <ImageUploader images={images} onImagesChange={setImages} />
        </div>
      )}

      {/* Listing Status */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2">
          Listing
        </h3>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            {...register("isListed")}
            type="checkbox"
            className="w-5 h-5 rounded border-white/20"
          />
          <div>
            <p className="font-medium">Make property publicly visible</p>
            <p className="text-sm text-gray-400">
              Enable this to list the property on the public website
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg border border-white/20 hover:bg-white/5 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 font-medium transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {property ? "Updating..." : "Creating..."}
            </span>
          ) : property ? (
            "Update Property"
          ) : (
            "Create Property"
          )}
        </button>
      </div>
    </form>
  );
};

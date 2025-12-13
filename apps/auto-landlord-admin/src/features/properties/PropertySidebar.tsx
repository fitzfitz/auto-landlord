import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  X,
  Edit2,
  Trash2,
  MapPin,
  DollarSign,
  Home,
  Calendar,
} from "lucide-react";
import { Property, PropertyInput } from "@auto-landlord/shared";
import { PropertyForm } from "./PropertyForm";
import { getImageUrl } from "@/lib/api";
import { sanitizeText, sanitizeRichText } from "@/lib/sanitize";
import {
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  useUploadImages,
  useAddPropertyImages,
} from "./usePropertyMutations";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { UploadedImage } from "@/components/ImageUploader";

interface PropertySidebarProps {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit" | "view";
  property: Property | null;
  onEdit: () => void;
}

export const PropertySidebar = ({
  open,
  onClose,
  mode,
  property,
  onEdit,
}: PropertySidebarProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const deleteMutation = useDeleteProperty();
  const uploadMutation = useUploadImages();
  const addImagesMutation = useAddPropertyImages();

  const handleCreate = async (data: PropertyInput, images: UploadedImage[]) => {
    try {
      // Create property first
      const newProperty = await createMutation.mutateAsync(data);

      // Upload images and link them to the property
      if (images.length > 0) {
        try {
          const uploadedImages = await uploadMutation.mutateAsync(
            images.map((img) => img.file)
          );

          // Link uploaded images to the property
          await addImagesMutation.mutateAsync({
            propertyId: newProperty.id,
            images: uploadedImages,
          });
        } catch (uploadError: any) {
          // Property created but images failed - show warning
          console.error("Image upload failed:", uploadError);
          alert(
            `Property created successfully, but some images failed to upload:\n\n${uploadError.message}\n\nYou can edit the property to add images later.`
          );
        }
      }

      onClose();
    } catch (error: any) {
      console.error("Error creating property:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert(`Failed to create property:\n${errorMessage}`);
    }
  };

  const handleUpdate = async (data: PropertyInput, images: UploadedImage[]) => {
    if (!property) return;

    try {
      // Update property first
      await updateMutation.mutateAsync({
        id: property.id,
        data: data,
      });

      // Upload and link any new images
      if (images.length > 0) {
        try {
          const uploadedImages = await uploadMutation.mutateAsync(
            images.map((img) => img.file)
          );

          // Link uploaded images to the property
          await addImagesMutation.mutateAsync({
            propertyId: property.id,
            images: uploadedImages,
          });
        } catch (uploadError: any) {
          // Property updated but images failed - show warning
          console.error("Image upload failed:", uploadError);
          alert(
            `Property updated successfully, but some images failed to upload:\n\n${uploadError.message}\n\nYou can try uploading them again.`
          );
        }
      }

      onClose();
    } catch (error: any) {
      console.error("Error updating property:", error);
      const errorMessage =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert(`Failed to update property:\n${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (!property) return;

    try {
      setDeleteError(null);
      await deleteMutation.mutateAsync(property.id);
      setShowDeleteDialog(false);
      onClose();
    } catch (error: any) {
      setDeleteError(
        error.response?.data?.error || "Failed to delete property"
      );
      console.error("Error deleting property:", error);
    }
  };

  const renderViewMode = () => {
    if (!property) return null;

    // Get images from property (cast to any since images may not be in base type)
    const images = (property as any).images || [];

    return (
      <div className="space-y-6">
        {/* Property Images */}
        {images.length > 0 && (
          <div className="space-y-3">
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-800/50">
              <img
                src={getImageUrl(images[0].url)}
                alt={property.address}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.slice(1, 5).map((img: any, index: number) => (
                  <div
                    key={img.id || index}
                    className="aspect-square rounded-lg overflow-hidden bg-gray-800/50"
                  >
                    <img
                      src={getImageUrl(img.url)}
                      alt={`${property.address} - ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {images.length > 5 && (
                  <div className="aspect-square rounded-lg bg-gray-800/50 flex items-center justify-center text-gray-400">
                    +{images.length - 5} more
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div className="border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold mb-2">{sanitizeText(property.address)}</h2>
          <p className="text-gray-400">
            {sanitizeText(property.city)}, {sanitizeText(property.state)} {sanitizeText(property.zip)}
          </p>

          {/* Status Badges */}
          <div className="flex gap-2 mt-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                property.status === "OCCUPIED"
                  ? "bg-green-500/20 text-green-400"
                  : property.status === "MAINTENANCE"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
              }`}
            >
              {property.status}
            </span>
            {property.isListed && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                Listed
              </span>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <DollarSign size={16} />
              <span>Monthly Rent</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">
              ${property.rentAmount.toLocaleString()}
            </p>
          </div>

          {property.bedrooms !== null && property.bedrooms !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Home size={16} />
                <span>Bedrooms</span>
              </div>
              <p className="text-2xl font-bold">{property.bedrooms}</p>
            </div>
          )}

          {property.bathrooms !== null && property.bathrooms !== undefined && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Home size={16} />
                <span>Bathrooms</span>
              </div>
              <p className="text-2xl font-bold">{property.bathrooms}</p>
            </div>
          )}

          {property.propertyType && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={16} />
                <span>Property Type</span>
              </div>
              <p className="text-lg font-medium">{sanitizeText(property.propertyType)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Description</h3>
            <p className="text-gray-300 leading-relaxed">
              {sanitizeRichText(property.description)}
            </p>
          </div>
        )}

        {/* Amenities */}
        {property.amenities &&
          Array.isArray(property.amenities) &&
          property.amenities.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((amenity: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm"
                  >
                    {sanitizeText(amenity)}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Created Date */}
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar size={16} />
            <span>
              Created on {new Date(property.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-white/10">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 font-medium transition-colors"
          >
            <Edit2 size={18} />
            Edit Property
          </button>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium transition-colors"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    );
  };

  const renderFormMode = () => {
    const isLoading =
      createMutation.isPending ||
      updateMutation.isPending ||
      uploadMutation.isPending;

    return (
      <div>
        <div className="mb-6 border-b border-white/10 pb-4">
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Create New Property" : "Edit Property"}
          </h2>
          <p className="text-gray-400 mt-1">
            {mode === "create"
              ? "Fill in the details to add a new property"
              : "Update the property information"}
          </p>
        </div>

        <PropertyForm
          property={mode === "edit" ? property : null}
          onSubmit={mode === "create" ? handleCreate : handleUpdate}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    );
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40" onClose={onClose}>
          {/* Backdrop */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
          </Transition.Child>

          {/* Sidebar Panel */}
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col overflow-y-scroll bg-gray-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl">
                      {/* Close Button */}
                      <div className="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                        <button
                          onClick={onClose}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>

                      {/* Content */}
                      <div className="flex-1 px-6 py-6">
                        {mode === "view" ? renderViewMode() : renderFormMode()}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeleteError(null);
        }}
        onConfirm={handleDelete}
        title="Delete Property"
        message={`Are you sure you want to delete "${property?.address}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
          {deleteError}
        </div>
      )}
    </>
  );
};

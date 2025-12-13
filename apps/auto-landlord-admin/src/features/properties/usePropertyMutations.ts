import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PropertyInput, Property } from "@auto-landlord/shared";

export const useCreateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PropertyInput) => {
      const { data: property } = await api.post<Property>("/properties", data);
      return property;
    },
    onSuccess: () => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PropertyInput>;
    }) => {
      const { data: property } = await api.patch<Property>(
        `/properties/${id}`,
        data
      );
      return property;
    },
    onSuccess: () => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/properties/${id}`);
    },
    onSuccess: () => {
      // Invalidate and refetch properties list
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
    onError: (error) => {
      console.error("Error deleting property:", error);
    },
  });
};

// Hook to upload images to R2
export const useUploadImages = () => {
  return useMutation({
    mutationFn: async (files: File[]) => {
      const uploadedImages: { url: string; key: string; size: number }[] = [];
      const errors: string[] = [];

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const { data } = await api.post<{
            url: string;
            key: string;
            size: number;
          }>("/upload", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          uploadedImages.push({
            url: data.url,
            key: data.key,
            size: data.size,
          });
        } catch (error: any) {
          // Collect error details from backend
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            `Failed to upload ${file.name}`;
          errors.push(errorMessage);
          console.error(`[Upload] Error uploading ${file.name}:`, error);
        }
      }

      // If any uploads failed, throw an error with details
      if (errors.length > 0) {
        throw new Error(
          `Upload failed:\n${errors.join("\n")}\n\n${uploadedImages.length} of ${files.length} images uploaded successfully.`
        );
      }

      return uploadedImages;
    },
  });
};

// Hook to add images to a property
export const useAddPropertyImages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      propertyId,
      images,
    }: {
      propertyId: string;
      images: { url: string; key?: string; size?: number }[];
    }) => {
      const { data } = await api.post(`/properties/${propertyId}/images`, {
        images,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

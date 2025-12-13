import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { sanitizeText } from "@/lib/sanitize";
import { GlassCard } from "@/components/Glass";
import { PropertiesListSkeleton } from "@/components/LoadingSkeleton";
import { Plus } from "lucide-react";
import { Property } from "@auto-landlord/shared";
import { PropertySidebar } from "./PropertySidebar";
import { useAuthContext } from "@/providers/AuthProvider";

// Feature specific queries
const useProperties = () => {
  const { isTokenReady } = useAuthContext();

  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await api.get<Property[]>("/properties");
      return data;
    },
    // Only fetch when auth token is ready to avoid 401 errors
    enabled: isTokenReady,
  });
};

export const PropertiesPage = () => {
  const { data: properties, isLoading } = useProperties();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"create" | "edit" | "view">(
    "view"
  );
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const handleOpenCreate = () => {
    setSidebarMode("create");
    setSelectedProperty(null);
    setSidebarOpen(true);
  };

  const handleOpenView = (property: Property) => {
    setSidebarMode("view");
    setSelectedProperty(property);
    setSidebarOpen(true);
  };

  const handleEdit = () => {
    setSidebarMode("edit");
  };

  const handleClose = () => {
    setSidebarOpen(false);
    // Reset after animation completes
    setTimeout(() => {
      setSelectedProperty(null);
      setSidebarMode("view");
    }, 300);
  };

  if (isLoading) return <PropertiesListSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Properties</h1>
        <button
          onClick={handleOpenCreate}
          className="glass-button flex items-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 text-blue-300"
        >
          <Plus size={20} />
          Add Property
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties?.map((property) => {
          // Get the first image if available
          const firstImage = (property as any).images?.[0];

          return (
            <div
              key={property.id}
              onClick={() => handleOpenView(property)}
              className="cursor-pointer"
            >
              <GlassCard className="group">
                <div className="aspect-video rounded-lg bg-gray-800/50 mb-4 overflow-hidden relative">
                  {firstImage ? (
                    <img
                      src={getImageUrl(firstImage.url)}
                      alt={property.address}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 group-hover:scale-105 transition-transform duration-500">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-black/50 backdrop-blur-md border border-white/10 uppercase">
                    {property.isListed ? (
                      <span className="text-green-400">Listed</span>
                    ) : (
                      <span className="text-gray-400">Draft</span>
                    )}
                  </div>
                </div>

              <h3 className="text-lg font-bold truncate">{sanitizeText(property.address)}</h3>
              <p className="text-gray-400 text-sm">
                {sanitizeText(property.city)}, {sanitizeText(property.state)} {sanitizeText(property.zip)}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                <span className="text-xl font-bold text-blue-400">
                  ${property.rentAmount.toLocaleString()}
                  <span className="text-xs text-gray-500 font-normal ml-1">
                    /mo
                  </span>
                </span>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  {property.bedrooms && <span>{property.bedrooms} Beds</span>}
                  {property.bathrooms && (
                    <span>{property.bathrooms} Baths</span>
                  )}
                </div>
              </div>
            </GlassCard>
          </div>
          );
        })}
        {properties?.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No properties found. Create your first one!
          </div>
        )}
      </div>

      {/* Property Sidebar */}
      <PropertySidebar
        open={sidebarOpen}
        onClose={handleClose}
        mode={sidebarMode}
        property={selectedProperty}
        onEdit={handleEdit}
      />
    </div>
  );
};

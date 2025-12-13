import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { sanitizeText } from "@/lib/sanitize";
import { GlassCard } from "@/components/Glass";
import { TableRowSkeleton } from "@/components/LoadingSkeleton";
import { Plus, User } from "lucide-react";
import { TenantResponse } from "@auto-landlord/shared";
import { useAuthContext } from "@/providers/AuthProvider";

const useTenants = () => {
  const { isTokenReady } = useAuthContext();
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await api.get<TenantResponse[]>("/tenants");
      return data;
    },
    enabled: isTokenReady,
  });
};

// Helper to determine if lease is active
const isLeaseActive = (leaseEnd: Date | string | null | undefined): boolean => {
  if (!leaseEnd) return false;
  const endDate = new Date(leaseEnd);
  return endDate > new Date();
};

export const TenantsPage = () => {
  const { data: tenants, isLoading } = useTenants();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-white/5 animate-pulse rounded" />
          <div className="h-10 w-32 bg-white/5 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <GlassCard key={i}>
              <TableRowSkeleton />
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <button className="glass-button flex items-center gap-2 bg-primary-500/20 hover:bg-primary-500/30 text-blue-300">
          <Plus size={20} />
          Invite Tenant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants?.map((tenant) => {
          const isActive = isLeaseActive(tenant.leaseEnd);
          return (
            <GlassCard key={tenant.id} className="group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-300">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold">
                    {sanitizeText(tenant.user?.name || "Unknown Name")}
                  </h3>
                  <p className="text-sm text-gray-400">{sanitizeText(tenant.user?.email)}</p>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Property:</span>
                  <span className="font-medium text-right truncate w-40">
                    {sanitizeText(tenant.property?.address || "N/A")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lease Status:</span>
                  <span className={isActive ? "text-green-400" : "text-red-400"}>
                    {isActive ? "Active" : "Expired"}
                  </span>
                </div>
                {tenant.leaseEnd && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Lease Ends:</span>
                    <span className="text-gray-300">
                      {new Date(tenant.leaseEnd).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
        {tenants?.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No tenants found.
          </div>
        )}
      </div>
    </div>
  );
};

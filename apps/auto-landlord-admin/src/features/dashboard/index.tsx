import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/Glass";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { useUser } from "@clerk/clerk-react";
import { Property, Ticket } from "@auto-landlord/shared";
import { Building2, Users, AlertCircle, TrendingUp } from "lucide-react";
import { useAuthContext } from "@/providers/AuthProvider";

// Dashboard data hooks
const useProperties = () => {
  const { isTokenReady } = useAuthContext();
  return useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data } = await api.get<Property[]>("/properties");
      return data;
    },
    enabled: isTokenReady,
  });
};

const useTenants = () => {
  const { isTokenReady } = useAuthContext();
  return useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data } = await api.get("/tenants");
      return data;
    },
    enabled: isTokenReady,
  });
};

const useTickets = () => {
  const { isTokenReady } = useAuthContext();
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data } = await api.get<Ticket[]>("/tickets");
      return data;
    },
    enabled: isTokenReady,
  });
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  subtitleColor?: string;
  icon: React.ReactNode;
}

const StatCard = ({
  title,
  value,
  subtitle,
  subtitleColor = "text-gray-400",
  icon,
}: StatCardProps) => (
  <GlassCard className="relative overflow-hidden">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-gray-400 font-medium">{title}</h3>
        <p className="text-4xl font-bold mt-2">{value}</p>
        <div className={`mt-4 text-sm flex items-center ${subtitleColor}`}>
          {subtitle}
        </div>
      </div>
      <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">{icon}</div>
    </div>
  </GlassCard>
);

export const DashboardPage = () => {
  const { user } = useUser();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const { data: tickets, isLoading: ticketsLoading } = useTickets();

  const isLoading = propertiesLoading || tenantsLoading || ticketsLoading;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const totalProperties = properties?.length || 0;
  const totalTenants = Array.isArray(tenants) ? tenants.length : 0;
  const openTickets =
    tickets?.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS")
      .length || 0;
  const occupiedProperties =
    properties?.filter((p) => p.status === "OCCUPIED").length || 0;
  const occupancyRate =
    totalProperties > 0
      ? Math.round((occupiedProperties / totalProperties) * 100)
      : 0;

  // Calculate monthly rent potential
  const monthlyRent =
    properties?.reduce((sum, p) => sum + (p.rentAmount || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back, {user?.firstName || "Landlord"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Properties"
          value={totalProperties}
          subtitle={`${occupiedProperties} occupied`}
          subtitleColor="text-green-400"
          icon={<Building2 size={24} />}
        />

        <StatCard
          title="Active Tenants"
          value={totalTenants}
          subtitle={`${occupancyRate}% Occupancy`}
          subtitleColor="text-green-400"
          icon={<Users size={24} />}
        />

        <StatCard
          title="Open Tickets"
          value={openTickets}
          subtitle={openTickets > 0 ? "Needs Attention" : "All clear"}
          subtitleColor={openTickets > 0 ? "text-yellow-400" : "text-green-400"}
          icon={<AlertCircle size={24} />}
        />

        <StatCard
          title="Monthly Rent"
          value={`$${monthlyRent.toLocaleString()}`}
          subtitle="Potential income"
          subtitleColor="text-blue-400"
          icon={<TrendingUp size={24} />}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Recent Properties</h2>
          {properties && properties.length > 0 ? (
            <div className="space-y-3">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{property.address}</p>
                    <p className="text-sm text-gray-400">
                      {property.city}, {property.state}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-400">
                      ${property.rentAmount?.toLocaleString()}/mo
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        property.status === "OCCUPIED"
                          ? "bg-green-500/20 text-green-400"
                          : property.status === "VACANT"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {property.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No properties yet. Add your first property!
            </p>
          )}
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Recent Tickets</h2>
          {tickets && tickets.length > 0 ? (
            <div className="space-y-3">
              {tickets.slice(0, 5).map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-gray-400 line-clamp-1">
                      {ticket.description}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                      ticket.status === "OPEN"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : ticket.status === "IN_PROGRESS"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                    }`}
                  >
                    {ticket.status?.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No tickets yet. All is well!
            </p>
          )}
        </GlassCard>
      </div>
    </div>
  );
};

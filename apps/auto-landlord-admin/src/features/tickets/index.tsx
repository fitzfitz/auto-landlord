import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { sanitizeText } from "@/lib/sanitize";
import { GlassCard } from "@/components/Glass";
import { Skeleton } from "@/components/LoadingSkeleton";
import { Ticket, type LucideIcon } from "lucide-react";
import { TicketResponse } from "@auto-landlord/shared";
import { useAuthContext } from "@/providers/AuthProvider";

const useTickets = () => {
  const { isTokenReady } = useAuthContext();
  return useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data } = await api.get<TicketResponse[]>("/tickets");
      return data;
    },
    enabled: isTokenReady,
  });
};

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    OPEN: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    IN_PROGRESS: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    RESOLVED: "text-green-400 bg-green-500/10 border-green-500/20",
    CLOSED: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs border ${
        colors[status] || colors.CLOSED
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
};

export const TicketsPage = () => {
  const { data: tickets, isLoading } = useTickets();
  const TicketIcon: LucideIcon = Ticket;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance Tickets</h1>
      </div>

      <div className="space-y-4">
        {tickets?.map((ticket) => (
          <GlassCard
            key={ticket.id}
            className="flex items-center gap-4 py-4 px-6 hover:bg-white/5 transition-colors"
          >
            <div className="p-3 rounded-full bg-white/5">
              <TicketIcon size={24} className="text-gray-400" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-bold truncate">{sanitizeText(ticket.title)}</h3>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="text-sm text-gray-400 truncate mt-1">
                {sanitizeText(ticket.property?.address)} •{" "}
                <span className="text-gray-500">
                  Reported on {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <div
                className={`text-sm font-medium ${
                  ticket.priority === "URGENT"
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {ticket.priority} Priority
              </div>
              <button className="text-sm text-blue-400 hover:text-blue-300">
                View Details
              </button>
            </div>
          </GlassCard>
        ))}
        {tickets?.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No tickets found.
          </div>
        )}
      </div>
    </div>
  );
};

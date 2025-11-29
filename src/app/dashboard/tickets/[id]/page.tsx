import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TicketStatusDropdown from "@/components/ticket-status-dropdown";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getOrCreateUser();
  const { id } = await params;

  if (!user) {
    return <div>Please sign in.</div>;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      property: {
        include: {
          landlord: true,
        },
      },
      creator: true,
    },
  });

  if (!ticket) {
    return <div>Ticket not found.</div>;
  }

  // Authorization check
  const isLandlord = ticket.property.landlordId === user.id;
  const isCreator = ticket.creatorId === user.id;

  if (!isLandlord && !isCreator) {
    return <div>Unauthorized.</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard/tickets"
        className="flex items-center text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Tickets
      </Link>

      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span>Ticket #{ticket.id.slice(-6)}</span>
              <span>•</span>
              <span>
                Created {new Date(ticket.createdAt).toLocaleDateString()}
              </span>
              <span>•</span>
              <span
                className={`px-2 py-0.5 rounded font-medium border ${
                  ticket.priority === "URGENT"
                    ? "bg-red-100 text-red-800 border-red-200"
                    : ticket.priority === "HIGH"
                    ? "bg-orange-100 text-orange-800 border-orange-200"
                    : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {ticket.priority}
              </span>
            </div>
          </div>
          <div>
            {isLandlord ? (
              <TicketStatusDropdown
                ticketId={ticket.id}
                currentStatus={ticket.status}
              />
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  ticket.status === "OPEN"
                    ? "bg-blue-100 text-blue-800 border-blue-200"
                    : ticket.status === "IN_PROGRESS"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-green-100 text-green-800 border-green-200"
                }`}
              >
                {ticket.status.replace("_", " ")}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Description
            </h3>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Property
              </h3>
              <p className="font-medium">{ticket.property.address}</p>
              <p className="text-gray-600 text-sm">
                {ticket.property.city}, {ticket.property.state}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                Reported By
              </h3>
              <p className="font-medium">{ticket.creator.name}</p>
              <p className="text-gray-600 text-sm">{ticket.creator.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

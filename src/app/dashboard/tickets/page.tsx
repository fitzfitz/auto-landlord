import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TicketsPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in.</div>;
  }

  let tickets;

  if (user.role === "TENANT") {
    tickets = await prisma.ticket.findMany({
      where: { creatorId: user.id },
      include: { property: true, creator: true },
      orderBy: { createdAt: "desc" },
    });
  } else {
    tickets = await prisma.ticket.findMany({
      where: { property: { landlordId: user.id } },
      include: { property: true, creator: true },
      orderBy: { createdAt: "desc" },
    });
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Maintenance Tickets</h1>
        {user.role === "TENANT" && (
          <Link
            href="/dashboard/tickets/new"
            className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            Create Ticket
          </Link>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No open tickets.</p>
          <p className="text-sm text-gray-400">
            Tickets submitted by tenants will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="block bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition">
                      {ticket.title}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium border ${
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
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {ticket.description}
                  </p>
                  <div className="text-sm text-gray-500 flex items-center gap-4">
                    <span>{ticket.property.address}</span>
                    <span>•</span>
                    <span>Reported by {ticket.creator.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      ticket.status === "OPEN"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : ticket.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                        : "bg-green-100 text-green-800 border-green-200"
                    }`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

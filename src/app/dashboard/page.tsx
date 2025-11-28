import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { getOrCreateUser } from "@/lib/auth";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const dbUser = await getOrCreateUser();

  if (!dbUser) {
    return <div>Error loading user</div>;
  }

  // Tenant View
  if (dbUser.role === "TENANT") {
    const tenant = await prisma.tenant.findUnique({
      where: { userId: dbUser.id },
      include: {
        property: {
          include: {
            landlord: true,
          },
        },
      },
    });

    if (!tenant) {
      return (
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">
              Tenant record not found. Please contact support.
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          Welcome home, {user?.firstName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Your Home</h2>
            <p className="text-2xl font-bold mb-2">{tenant.property.address}</p>
            <p className="text-gray-600 mb-4">
              {tenant.property.city}, {tenant.property.state}{" "}
              {tenant.property.zip}
            </p>
            <div className="border-t pt-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Lease Start</p>
                  <p className="font-medium">
                    {tenant.leaseStart.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Lease End</p>
                  <p className="font-medium">
                    {tenant.leaseEnd.toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Landlord Contact */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Landlord Contact</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">
                  {tenant.property.landlord.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{tenant.property.landlord.email}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link
                href="/dashboard/tickets"
                className="block w-full text-center bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
              >
                Report an Issue
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landlord View (Existing Code)
  // Fetch real statistics
  const totalProperties = await prisma.property.count({
    where: { landlordId: dbUser.id },
  });

  const vacantProperties = await prisma.property.count({
    where: {
      landlordId: dbUser.id,
      status: "VACANT",
    },
  });

  const openTickets = await prisma.ticket.count({
    where: {
      property: { landlordId: dbUser.id },
      status: { in: ["OPEN", "IN_PROGRESS"] },
    },
  });

  // Fetch recent properties
  const recentProperties = await prisma.property.findMany({
    where: { landlordId: dbUser.id },
    take: 3,
    orderBy: { id: "desc" },
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Welcome back, {user?.firstName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-gray-500 text-sm font-medium">
            Total Properties
          </h2>
          <p className="text-3xl font-bold mt-2">{totalProperties}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-gray-500 text-sm font-medium">Vacant Units</h2>
          <p className="text-3xl font-bold mt-2 text-orange-500">
            {vacantProperties}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-gray-500 text-sm font-medium">Open Tickets</h2>
          <p className="text-3xl font-bold mt-2 text-blue-500">{openTickets}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
        {recentProperties.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
            You haven&apos;t added any properties yet.
            <br />
            <Link
              href="/dashboard/properties/new"
              className="mt-4 inline-block bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
            >
              Add Property
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white border rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{property.address}</h3>
                  <p className="text-gray-500 text-sm">
                    {property.city}, {property.state}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      property.status === "VACANT"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {property.status}
                  </span>
                  <span className="font-bold">${property.rentAmount}/mo</span>
                </div>
              </div>
            ))}
            <Link
              href="/dashboard/properties"
              className="block text-center text-blue-600 hover:underline"
            >
              View all properties →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

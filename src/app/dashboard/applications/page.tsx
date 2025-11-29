import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ApplicationCard from "./application-card";

export default async function ApplicationsPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  // Get all applications for landlord's properties
  const applications = await prisma.application.findMany({
    where: {
      property: {
        landlordId: user.id,
      },
    },
    include: {
      property: {
        select: {
          address: true,
          city: true,
          state: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    VIEWED: "bg-gray-100 text-gray-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    ACCEPTED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="p-8">
      <Link
        href="/dashboard/properties"
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to Properties
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Property Applications</h1>
        <p className="text-gray-600">
          Manage applications from prospective tenants
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">No applications yet</p>
          <p className="text-gray-400">
            Applications will appear here when prospects apply through public
            listings
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              statusColors={statusColors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

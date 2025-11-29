import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PropertyActions } from "@/components/property-actions";

export default async function PropertiesPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in.</div>;
  }

  const properties = await prisma.property.findMany({
    where: { landlordId: user.id },
    include: { tenants: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Properties</h1>
        <Link
          href="/dashboard/properties/new"
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} />
          Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No properties found.</p>
          <Link
            href="/dashboard/properties/new"
            className="text-blue-600 hover:underline"
          >
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center text-gray-400">
                No Image
              </div>
              <h2 className="font-semibold text-lg">{property.address}</h2>
              <p className="text-gray-500 text-sm">
                {property.city}, {property.state}
              </p>
              <div className="mt-4 flex justify-between items-center mb-4">
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

              <PropertyActions property={property} />

              {property.isListed && property.slug && (
                <div className="mt-4 pt-4 border-t">
                  <a
                    href={`/listings/${property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View Public Listing →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

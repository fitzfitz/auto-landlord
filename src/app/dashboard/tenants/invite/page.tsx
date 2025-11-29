import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { inviteTenant } from "../actions";

export default async function InviteTenantPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in</div>;
  }

  // Get landlord's properties
  const properties = await prisma.property.findMany({
    where: {
      landlordId: user.id,
      status: "VACANT", // Only show vacant properties
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/dashboard/tenants"
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to Tenants
      </Link>

      <h1 className="text-3xl font-bold mb-8">Invite Tenant</h1>

      {properties.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-800 mb-4">
            You don&apos;t have any vacant properties available.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="text-yellow-900 underline hover:text-yellow-700"
          >
            Add a new property
          </Link>
        </div>
      ) : (
        <form
          action={inviteTenant}
          className="space-y-6 bg-white p-6 rounded-lg border shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tenant Name *
            </label>
            <input
              name="name"
              type="text"
              required
              className="w-full border rounded-md p-2"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full border rounded-md p-2"
              placeholder="tenant@example.com"
            />
            <p className="text-sm text-gray-500 mt-1">
              An account will be created if one doesn&apos;t exist
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property *
            </label>
            <select
              name="propertyId"
              required
              className="w-full border rounded-md p-2"
            >
              <option value="">Select a property...</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}, {property.city} - ${property.rentAmount}
                  /mo
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease Start Date *
              </label>
              <input
                name="leaseStart"
                type="date"
                required
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lease End Date *
              </label>
              <input
                name="leaseEnd"
                type="date"
                required
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This will create a tenant account and mark
              the property as OCCUPIED. The tenant will need to sign in
              separately using their email.
            </p>
          </div>

          <button
            type="submit"
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 font-medium"
          >
            Invite Tenant
          </button>
        </form>
      )}
    </div>
  );
}

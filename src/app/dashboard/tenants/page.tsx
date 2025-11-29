import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ResendButton } from "@/components/resend-button";

export default async function TenantsPage() {
  const user = await getOrCreateUser();

  if (!user) {
    return <div>Please sign in.</div>;
  }

  // Find properties owned by user, then get tenants
  const properties = await prisma.property.findMany({
    where: { landlordId: user.id },
    include: { tenants: { include: { user: true } } },
  });

  const tenants = properties.flatMap((p) =>
    p.tenants.map((t) => ({ ...t, property: p }))
  );

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tenants</h1>
        <Link
          href="/dashboard/tenants/invite"
          className="bg-black text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-800"
        >
          <Plus size={20} />
          Invite Tenant
        </Link>
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <p className="text-gray-500 mb-4">No tenants found.</p>
          <Link
            href="/dashboard/tenants/invite"
            className="text-blue-600 hover:underline"
          >
            Invite your first tenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-500">
                  Name
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Email
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Property
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Lease End
                </th>
                <th className="text-left p-4 font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{tenant.user.name}</td>
                  <td className="p-4 text-gray-600">{tenant.user.email}</td>
                  <td className="p-4 text-gray-600">
                    {tenant.property.address}
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(tenant.leaseEnd).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <ResendButton tenantId={tenant.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/property-form";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getOrCreateUser();
  const { id } = await params;

  if (!user) {
    return <div>Please sign in</div>;
  }

  const property = await prisma.property.findUnique({
    where: {
      id,
      landlordId: user.id,
    },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard/properties"
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to Properties
      </Link>

      <h1 className="text-3xl font-bold mb-8">Edit Property</h1>

      <PropertyForm mode="edit" initialData={property} />
    </div>
  );
}

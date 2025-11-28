"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PropertyForm } from "@/components/property-form";

export default function NewPropertyPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link
        href="/dashboard/properties"
        className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back to Properties
      </Link>

      <h1 className="text-3xl font-bold mb-8">Add New Property</h1>

      <PropertyForm mode="create" />
    </div>
  );
}

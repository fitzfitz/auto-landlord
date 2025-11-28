"use client";

import { useState } from "react";
import { Eye, EyeOff, Trash2, Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  rentAmount: number;
  status: string;
  isListed: boolean;
}

export function PropertyActions({ property }: { property: Property }) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleListing = async () => {
    setIsToggling(true);
    try {
      const response = await fetch("/api/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId: property.id,
          isListed: !property.isListed,
        }),
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to update listing status");
      }
    } catch (error) {
      console.error("Toggle error:", error);
      alert("Failed to update listing status");
    } finally {
      setIsToggling(false);
    }
  };

  const deleteProperty = async () => {
    try {
      const response = await fetch(`/api/properties?id=${property.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to delete property");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete property");
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={toggleListing}
        disabled={isToggling}
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
          property.isListed
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
        } disabled:opacity-50`}
      >
        {property.isListed ? (
          <>
            <Eye size={16} />
            Published
          </>
        ) : (
          <>
            <EyeOff size={16} />
            Private
          </>
        )}
      </button>

      <Link
        href={`/dashboard/properties/${property.id}/edit`}
        className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-md text-sm font-medium"
      >
        <Edit size={16} />
        Edit
      </Link>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 hover:bg-red-200 rounded-md text-sm font-medium"
      >
        <Trash2 size={16} />
        Delete
      </button>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-lg mb-2">Delete Property?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <strong>{property.address}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteProperty}
                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

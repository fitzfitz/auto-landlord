"use client";

import { Eye, EyeOff, Trash2 } from "lucide-react";
import { updateStatus } from "./actions";

interface ApplicationCardProps {
  application: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    message: string | null;
    status: string;
    createdAt: Date;
    property: {
      address: string;
      city: string;
      state: string;
    };
  };
  statusColors: Record<string, string>;
}

export default function ApplicationCard({
  application,
  statusColors,
}: ApplicationCardProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{application.name}</h3>
          <p className="text-gray-600">
            {application.property.address}, {application.property.city},{" "}
            {application.property.state}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            statusColors[application.status] || "bg-gray-100"
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <a
            href={`mailto:${application.email}`}
            className="text-blue-600 hover:underline"
          >
            {application.email}
          </a>
        </div>
        {application.phone && (
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <a
              href={`tel:${application.phone}`}
              className="text-blue-600 hover:underline"
            >
              {application.phone}
            </a>
          </div>
        )}
      </div>

      {application.message && (
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">Message</p>
          <p className="text-gray-700 bg-gray-50 p-3 rounded">
            {application.message}
          </p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => updateStatus(application.id, "VIEWED")}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
        >
          <Eye size={16} />
          Mark Viewed
        </button>
        <button
          onClick={() => updateStatus(application.id, "CONTACTED")}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-100 hover:bg-yellow-200 rounded-md text-sm"
        >
          <EyeOff size={16} />
          Contacted
        </button>
        <button
          onClick={() => updateStatus(application.id, "ACCEPTED")}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-md text-sm"
        >
          Accept
        </button>
        <button
          onClick={() => updateStatus(application.id, "REJECTED")}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-sm ml-auto"
        >
          <Trash2 size={16} />
          Reject
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Applied {new Date(application.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

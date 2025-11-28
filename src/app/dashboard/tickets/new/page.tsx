"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTicket } from "../actions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewTicketPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      await createTicket(formData);
      router.push("/dashboard/tickets");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link
        href="/dashboard/tickets"
        className="flex items-center text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={20} className="mr-2" />
        Back to Tickets
      </Link>

      <h1 className="text-3xl font-bold mb-8">Create Maintenance Ticket</h1>

      <div className="bg-white border rounded-lg p-8 shadow-sm">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form action={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g., Leaky Faucet in Kitchen"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              name="priority"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="LOW">Low (Minor issue)</option>
              <option value="MEDIUM">Medium (Needs attention)</option>
              <option value="HIGH">High (Urgent)</option>
              <option value="URGENT">Critical (Emergency)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Please reserve &quot;Critical&quot; for emergencies like flooding
              or power outages.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              required
              rows={6}
              placeholder="Please describe the issue in detail. Include location and any relevant context..."
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? "Creating Ticket..." : "Submit Ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

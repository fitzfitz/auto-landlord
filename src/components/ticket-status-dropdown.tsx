"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TicketStatusDropdown({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true);

    try {
      const response = await fetch("/api/tickets/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status: newStatus }),
      });

      if (response.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <select
      value={status}
      disabled={isUpdating}
      onChange={(e) => handleStatusChange(e.target.value)}
      className="border rounded-md text-sm p-1 bg-gray-50 disabled:opacity-50"
    >
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="RESOLVED">Resolved</option>
    </select>
  );
}

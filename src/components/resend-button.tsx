"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { resendInvitation } from "@/app/dashboard/tenants/actions";

export function ResendButton({ tenantId }: { tenantId: string }) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleResend = async () => {
    setStatus("loading");
    try {
      await resendInvitation(tenantId);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to resend:", error);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <button
      onClick={handleResend}
      disabled={status === "loading" || status === "success"}
      className={`p-2 rounded-full transition-colors ${
        status === "success"
          ? "text-green-600 bg-green-50"
          : status === "error"
          ? "text-red-600 bg-red-50"
          : "text-gray-400 hover:text-black hover:bg-gray-100"
      }`}
      title="Resend Invitation"
    >
      {status === "loading" ? (
        <Loader2 size={18} className="animate-spin" />
      ) : status === "success" ? (
        <Check size={18} />
      ) : (
        <Mail size={18} />
      )}
    </button>
  );
}

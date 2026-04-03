"use client";

import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";

interface Props {
  email: string;
  orderNumber: string;
  total: number;
}

export default function SendAbandonedEmailButton({ email, orderNumber, total }: Props) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSend() {
    if (status === "sent") return;
    setStatus("sending");

    try {
      const res = await fetch("/api/admin/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber, total }),
      });

      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
        <Check className="h-3 w-3" />
        Sent
      </span>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={status === "sending"}
      className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
    >
      {status === "sending" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Mail className="h-3 w-3" />
      )}
      {status === "sending" ? "Sending..." : status === "error" ? "Failed — Retry" : "Send Email"}
    </button>
  );
}

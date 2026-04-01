"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function CleanupOrdersButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCleanup() {
    if (!confirm("Cancel all pending orders older than 1 hour that were never paid?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/cleanup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert(data.message);
      router.refresh();
    } catch {
      alert("Failed to clean up orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCleanup}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? "Cleaning..." : "Cancel Unpaid Orders"}
    </button>
  );
}

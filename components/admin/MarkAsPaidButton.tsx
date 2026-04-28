"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function MarkAsPaidButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!confirm("Confirm payment received? This will move the order to processing, decrement stock, and email the customer their order confirmation.")) {
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status: "processing" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to mark as paid");
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to mark as paid");
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Marking as paid...
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Mark as Paid
          </>
        )}
      </button>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "awaiting_payment",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      if (!res.ok) throw new Error("Update failed");
      router.refresh();
    } catch {
      alert("Failed to update status");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Update Status
      </label>
      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          onClick={handleSave}
          disabled={saving || status === currentStatus}
          className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#09326a] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

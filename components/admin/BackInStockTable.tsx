"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Request {
  id: string;
  email: string;
  product_id: string;
  product_name: string;
  notified: boolean;
  created_at: string;
}

export default function BackInStockTable({ requests }: { requests: Request[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "notified">("all");
  const [sending, setSending] = useState<string | null>(null);

  const filtered = requests.filter((r) => {
    if (filter === "pending") return !r.notified;
    if (filter === "notified") return r.notified;
    return true;
  });

  const pendingCount = requests.filter((r) => !r.notified).length;

  // Group pending requests by product for the "Notify All" action
  const pendingByProduct = new Map<string, Request[]>();
  for (const r of requests) {
    if (!r.notified) {
      const list = pendingByProduct.get(r.product_id) ?? [];
      list.push(r);
      pendingByProduct.set(r.product_id, list);
    }
  }

  async function handleNotify(productId: string) {
    setSending(productId);
    try {
      const res = await fetch("/api/admin/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      alert("Failed to send notifications");
    } finally {
      setSending(null);
    }
  }

  return (
    <div>
      {/* Summary + Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm text-gray-500">
          {requests.length} total &middot;{" "}
          <span className="font-medium text-amber-600">{pendingCount} pending</span>
        </span>
        <div className="ml-auto flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          {(["all", "pending", "notified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                filter === f
                  ? "bg-[#0b3d7a] text-white"
                  : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {f === "all" ? "All" : f === "pending" ? "Pending" : "Notified"}
            </button>
          ))}
        </div>
      </div>

      {/* Notify buttons per product */}
      {pendingByProduct.size > 0 && filter !== "notified" && (
        <div className="mb-4 flex flex-wrap gap-2">
          {Array.from(pendingByProduct.entries()).map(([productId, reqs]) => (
            <button
              key={productId}
              onClick={() => handleNotify(productId)}
              disabled={sending === productId}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a6de3] bg-[#1a6de3]/5 px-3 py-1.5 text-xs font-semibold text-[#1a6de3] transition-colors hover:bg-[#1a6de3] hover:text-white disabled:opacity-50"
            >
              {sending === productId ? "Sending..." : `Notify ${reqs.length} for ${reqs[0].product_name}`}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900">{r.email}</td>
                <td className="px-4 py-3 text-gray-600">{r.product_name}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-0.5 text-xs font-medium",
                      r.notified
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    )}
                  >
                    {r.notified ? "Notified" : "Pending"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(r.created_at).toLocaleDateString("en-CA", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

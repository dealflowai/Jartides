"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Download, Loader2, Package, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  awaiting_payment: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<OrderStatus, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting Payment",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

type OrderRow = Order & { order_items?: OrderItem[] };

type RowResult =
  | { state: "pending" }
  | { state: "running" }
  | { state: "success"; trackingNumber: string; labelUrl: string }
  | { state: "error"; message: string };

async function downloadMergedLabels(labelUrls: string[]) {
  if (labelUrls.length === 0) return;
  const res = await fetch("/api/shipping/labels/merge", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ labelUrls }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(typeof data.error === "string" ? data.error : "Merge failed");
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shipping-labels-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function OrdersBulkLabelTable({ orders }: { orders: OrderRow[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, RowResult>>({});

  // Eligible: paid order, not yet labeled, not cancelled/refunded
  const eligibleIds = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            !o.shipping_label_url &&
            o.status !== "awaiting_payment" &&
            o.status !== "cancelled" &&
            o.status !== "refunded",
        )
        .map((o) => o.id),
    [orders],
  );

  const allEligibleSelected =
    eligibleIds.length > 0 && eligibleIds.every((id) => selected.has(id));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allEligibleSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(eligibleIds));
    }
  }

  async function handleGenerate() {
    if (selected.size === 0 || running) return;
    setRunning(true);
    setDownloadError(null);

    const ids = Array.from(selected);
    setResults(Object.fromEntries(ids.map((id) => [id, { state: "pending" } as RowResult])));

    const successUrls: string[] = [];

    for (const id of ids) {
      setResults((r) => ({ ...r, [id]: { state: "running" } }));
      try {
        const res = await fetch("/api/shipping/label", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: id }),
        });
        const data = await res.json();
        if (!res.ok) {
          const msg =
            typeof data.error === "string" ? data.error : JSON.stringify(data.error);
          setResults((r) => ({ ...r, [id]: { state: "error", message: msg || "Failed" } }));
        } else {
          if (data.labelUrl) successUrls.push(data.labelUrl);
          setResults((r) => ({
            ...r,
            [id]: {
              state: "success",
              trackingNumber: data.trackingNumber,
              labelUrl: data.labelUrl,
            },
          }));
        }
      } catch (e) {
        setResults((r) => ({
          ...r,
          [id]: { state: "error", message: e instanceof Error ? e.message : "Network error" },
        }));
      }
    }

    setRunning(false);
    router.refresh();

    // Merge all successful labels into a single PDF and auto-download.
    if (successUrls.length > 0) {
      setDownloading(true);
      try {
        await downloadMergedLabels(successUrls);
      } catch (e) {
        setDownloadError(e instanceof Error ? e.message : "Auto-download failed");
      } finally {
        setDownloading(false);
      }
    }
  }

  function clearResults() {
    setResults({});
    setSelected(new Set());
    setDownloadError(null);
  }

  async function handleRedownload() {
    const urls = Object.values(results)
      .filter((r): r is Extract<RowResult, { state: "success" }> => r.state === "success")
      .map((r) => r.labelUrl);
    if (urls.length === 0) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadMergedLabels(urls);
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  const summary = useMemo(() => {
    const list = Object.values(results);
    return {
      total: list.length,
      success: list.filter((r) => r.state === "success").length,
      error: list.filter((r) => r.state === "error").length,
      done: list.filter((r) => r.state === "success" || r.state === "error").length,
    };
  }, [results]);

  const showResultsBar = summary.total > 0;

  return (
    <div className="space-y-3">
      {/* Bulk action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
        <div className="text-sm text-gray-600">
          {selected.size > 0 ? (
            <>
              <span className="font-semibold text-gray-900">{selected.size}</span> selected
              {eligibleIds.length > 0 && (
                <span className="text-gray-400"> &middot; {eligibleIds.length} eligible</span>
              )}
            </>
          ) : eligibleIds.length > 0 ? (
            <>
              <span className="font-semibold text-gray-900">{eligibleIds.length}</span> orders
              ready for a label
            </>
          ) : (
            <span className="text-gray-400">No orders need a label.</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {showResultsBar && (
            <button
              type="button"
              onClick={clearResults}
              disabled={running}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={running || selected.size === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#09326a] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating {summary.done + 1}/{summary.total}...
              </>
            ) : (
              <>
                <Package className="h-4 w-4" />
                Generate {selected.size > 0 ? `${selected.size} ` : ""}Label{selected.size === 1 ? "" : "s"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results summary */}
      {showResultsBar && !running && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-semibold text-gray-900">Batch complete</span>
            <span className="text-green-700">
              <CheckCircle className="mr-1 inline h-4 w-4" />
              {summary.success} succeeded
            </span>
            {summary.error > 0 && (
              <span className="text-red-700">
                <XCircle className="mr-1 inline h-4 w-4" />
                {summary.error} failed
              </span>
            )}
            {downloading && (
              <span className="inline-flex items-center gap-1 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing combined PDF...
              </span>
            )}
            {summary.success > 0 && !downloading && (
              <button
                type="button"
                onClick={handleRedownload}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <Download className="h-3.5 w-3.5" />
                Download all labels (PDF)
              </button>
            )}
            {downloadError && (
              <span className="text-red-700">
                <XCircle className="mr-1 inline h-4 w-4" />
                {downloadError}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={allEligibleSelected}
                  onChange={toggleAll}
                  disabled={eligibleIds.length === 0 || running}
                  aria-label="Select all eligible orders"
                  className="h-4 w-4 rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
                />
              </th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => {
              const result = results[order.id];
              const eligible = eligibleIds.includes(order.id);
              const isSelected = selected.has(order.id);
              const hasLabel = !!order.shipping_label_url;

              return (
                <tr
                  key={order.id}
                  className={`transition-colors ${isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                >
                  <td className="px-3 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!eligible || running}
                      onChange={() => toggle(order.id)}
                      aria-label={`Select order ${order.order_number}`}
                      title={
                        hasLabel
                          ? "Already has a label"
                          : order.status === "awaiting_payment"
                            ? "Awaiting payment"
                            : order.status === "cancelled" || order.status === "refunded"
                              ? `Order is ${order.status}`
                              : undefined
                      }
                      className="h-4 w-4 rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3] disabled:cursor-not-allowed disabled:opacity-40"
                    />
                  </td>
                  <td className="px-4 py-3 align-top font-medium">{order.order_number}</td>
                  <td className="px-4 py-3 align-top text-gray-600">
                    {order.guest_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-xs text-gray-600 max-w-[250px]">
                    {order.order_items && order.order_items.length > 0 ? (
                      <div className="space-y-0.5">
                        {order.order_items.map((item) => (
                          <div key={item.id}>
                            {item.product_name}
                            {item.variant_size && ` (${item.variant_size})`}{" "}
                            <span className="font-medium">&times;{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                    {hasLabel && (
                      <p className="mt-1 text-[11px] font-medium text-green-700">
                        Label generated
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3 align-top text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col items-start gap-1.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-[#1a6de3] hover:underline"
                      >
                        View
                      </Link>
                      {result?.state === "running" && (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin" /> Generating...
                        </span>
                      )}
                      {result?.state === "pending" && (
                        <span className="text-xs text-gray-400">Queued</span>
                      )}
                      {result?.state === "success" && (
                        <a
                          href={result.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-green-700 hover:underline"
                        >
                          <CheckCircle className="h-3 w-3" /> Download label
                        </a>
                      )}
                      {result?.state === "error" && (
                        <span
                          title={result.message}
                          className="inline-flex max-w-[180px] items-center gap-1 truncate text-xs font-medium text-red-700"
                        >
                          <XCircle className="h-3 w-3 shrink-0" /> {result.message}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

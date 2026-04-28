"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import { formatPrice } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  awaiting_payment: "bg-amber-100 text-amber-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: orderNumber.trim(), email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Something went wrong. Please try again."
        );
        return;
      }

      setOrder(data as Order);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Track Your Order"
        description="Enter your order number and email address to check the status of your order."
        breadcrumbs={[{ label: "Track Order" }]}
      />

      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/account"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#0b3d7a] transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Account
        </Link>

        {/* Lookup form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5"
        >
          <div>
            <label
              htmlFor="orderNumber"
              className="block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)] mb-1"
            >
              Order Number
            </label>
            <input
              id="orderNumber"
              type="text"
              required
              placeholder="e.g. JRT-A2B3C4"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-2 focus:ring-[#1a6de3]/20 outline-none transition font-[family-name:var(--font-body)]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)] mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-2 focus:ring-[#1a6de3]/20 outline-none transition font-[family-name:var(--font-body)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-[family-name:var(--font-body)]"
          >
            {loading ? "Looking up..." : "Track Order"}
          </button>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 font-[family-name:var(--font-body)]">
            {error}
          </div>
        )}

        {/* Order details */}
        {order && (
          <div className="mt-8 space-y-6">
            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
                Order {order.order_number}
              </h2>
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 font-[family-name:var(--font-body)]">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-CA", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Tracking number */}
            {order.tracking_number && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-4">
                <p className="text-sm font-semibold text-indigo-900 font-[family-name:var(--font-body)]">
                  Tracking Number
                </p>
                <p className="mt-1 text-sm text-indigo-700 font-mono">
                  {order.tracking_url_provider ? (
                    <a
                      href={order.tracking_url_provider}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-indigo-900"
                    >
                      {order.tracking_number}
                    </a>
                  ) : (
                    order.tracking_number
                  )}
                  {order.carrier && (
                    <span className="ml-2 text-indigo-500">
                      ({order.carrier})
                    </span>
                  )}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 font-[family-name:var(--font-heading)]">
                  Items
                </h3>
              </div>
              <ul className="divide-y divide-gray-100">
                {order.items?.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between px-5 py-3 text-sm font-[family-name:var(--font-body)]"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product_name}
                      </p>
                      <p className="text-gray-500">
                        Qty: {item.quantity}
                        {item.purchase_type === "subscription" && (
                          <span className="ml-2 text-xs text-[#1a6de3]">
                            (Subscription)
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.unit_price * item.quantity, order.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Totals */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4 space-y-2 text-sm font-[family-name:var(--font-body)]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal, order.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{formatPrice(order.shipping_cost, order.currency)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax</span>
                <span>{formatPrice(order.tax, order.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2">
                <span>Total</span>
                <span>{formatPrice(order.total, order.currency)}</span>
              </div>
            </div>

            {/* Shipping address (partially redacted for privacy) */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-5 py-4">
              <h3 className="text-sm font-semibold text-gray-700 font-[family-name:var(--font-heading)] mb-2">
                Shipping To
              </h3>
              <p className="text-sm text-gray-600 font-[family-name:var(--font-body)]">
                {order.shipping_city}, {order.shipping_province}, {order.shipping_country}
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

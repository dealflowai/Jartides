import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import ReorderButton from "@/components/account/ReorderButton";
import DownloadInvoice from "@/components/account/DownloadInvoice";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Try by user_id first, then fall back to guest_email match
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .or(`user_id.eq.${user!.id},guest_email.eq.${user!.email}`)
    .single<Order>();

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)
    .returns<OrderItem[]>();

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-[#1a6de3] hover:underline"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-[#0b3d7a]">
            Order #{order.order_number}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-CA", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ReorderButton items={items ?? []} />
          <DownloadInvoice order={order} items={items ?? []} />
          <span
            className={`text-sm font-medium px-3 py-1.5 rounded-full capitalize ${
              statusColors[order.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-5 py-3">Product</th>
              <th className="px-5 py-3 text-center">Qty</th>
              <th className="px-5 py-3 text-right">Price</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items?.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-4 text-sm text-gray-900">
                  {item.product_name}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 text-center">
                  {item.quantity}
                </td>
                <td className="px-5 py-4 text-sm text-gray-600 text-right">
                  ${item.unit_price.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right">
                  ${(item.unit_price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{order.shipping_name}</p>
            <p>{order.shipping_line1}</p>
            {order.shipping_line2 && <p>{order.shipping_line2}</p>}
            <p>
              {order.shipping_city}, {order.shipping_province}{" "}
              {order.shipping_postal}
            </p>
            <p>{order.shipping_country}</p>
          </div>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">
              Tracking Information
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              {order.carrier && (
                <p>
                  <span className="font-medium text-gray-700">Carrier:</span>{" "}
                  {order.carrier}
                </p>
              )}
              <p>
                <span className="font-medium text-gray-700">Tracking #:</span>{" "}
                {order.tracking_url_provider ? (
                  <a
                    href={order.tracking_url_provider}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1a6de3] underline hover:text-[#0b3d7a]"
                  >
                    {order.tracking_number}
                  </a>
                ) : (
                  order.tracking_number
                )}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>
              {order.shipping_cost === 0
                ? "Free"
                : `$${order.shipping_cost.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>${order.total.toFixed(2)} {order.currency.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

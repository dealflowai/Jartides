import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single<Order>();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const orderItems = (items ?? []) as OrderItem[];

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order {order.order_number}
          </h1>
          <p className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Customer</h2>
          <p className="text-sm text-gray-600">
            {order.guest_email ?? "Registered user"}
          </p>
          {order.payment_method && (
            <p className="mt-1 text-sm text-gray-500">
              Payment: {order.payment_method}
            </p>
          )}
          {order.stripe_payment_intent_id && (
            <p className="mt-1 text-xs text-gray-400">
              Stripe: {order.stripe_payment_intent_id}
            </p>
          )}
          {order.paypal_order_id && (
            <p className="mt-1 text-xs text-gray-400">
              PayPal: {order.paypal_order_id}
            </p>
          )}
        </div>

        {/* Shipping */}
        <div className="rounded-xl border border-gray-200 p-5">
          <h2 className="mb-3 font-semibold text-gray-900">Shipping Address</h2>
          <p className="text-sm text-gray-600">{order.shipping_name}</p>
          <p className="text-sm text-gray-600">{order.shipping_line1}</p>
          {order.shipping_line2 && (
            <p className="text-sm text-gray-600">{order.shipping_line2}</p>
          )}
          <p className="text-sm text-gray-600">
            {order.shipping_city}, {order.shipping_province}{" "}
            {order.shipping_postal}
          </p>
          <p className="text-sm text-gray-600">{order.shipping_country}</p>

          {order.tracking_number && (
            <div className="mt-3 border-t pt-3">
              <p className="text-xs text-gray-500">
                Tracking: {order.carrier && `${order.carrier} — `}
                {order.tracking_number}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="mb-6 rounded-xl border border-gray-200">
        <div className="border-b px-5 py-3">
          <h2 className="font-semibold text-gray-900">Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-5 py-2 text-left">Product</th>
              <th className="px-5 py-2 text-right">Qty</th>
              <th className="px-5 py-2 text-right">Unit Price</th>
              <th className="px-5 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orderItems.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">{item.product_name}</td>
                <td className="px-5 py-3 text-right">{item.quantity}</td>
                <td className="px-5 py-3 text-right">
                  {formatPrice(item.unit_price)}
                </td>
                <td className="px-5 py-3 text-right">
                  {formatPrice(item.unit_price * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t text-sm">
            <tr>
              <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                Subtotal
              </td>
              <td className="px-5 py-2 text-right">
                {formatPrice(order.subtotal)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                Shipping
              </td>
              <td className="px-5 py-2 text-right">
                {formatPrice(order.shipping_cost)}
              </td>
            </tr>
            <tr>
              <td colSpan={3} className="px-5 py-2 text-right text-gray-500">
                Tax
              </td>
              <td className="px-5 py-2 text-right">
                {formatPrice(order.tax)}
              </td>
            </tr>
            <tr className="font-semibold">
              <td colSpan={3} className="px-5 py-2 text-right">
                Total
              </td>
              <td className="px-5 py-2 text-right">
                {formatPrice(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Status update & actions */}
      <div className="flex flex-wrap items-end gap-4">
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
        <button
          disabled
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-400"
          title="Coming soon"
        >
          Generate Shipping Label
        </button>
      </div>
    </div>
  );
}

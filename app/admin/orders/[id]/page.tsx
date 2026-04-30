import { notFound, redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffPage } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import OrderNotes from "@/components/admin/OrderNotes";
import ShippingLabelGenerator from "@/components/admin/ShippingLabelGenerator";
import DeleteOrderButton from "@/components/admin/DeleteOrderButton";
import MarkAsPaidButton from "@/components/admin/MarkAsPaidButton";
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

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireStaffPage();
  const isAdmin = staff.role === "admin";
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single<Order>();

  if (!order) notFound();

  // Fulfillment users only access paid orders. Bounce them off unpaid orders.
  if (!isAdmin && order.status === "awaiting_payment") {
    redirect("/admin/orders");
  }

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
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[order.status]}`}
          >
            {statusLabels[order.status]}
          </span>
          {isAdmin && <DeleteOrderButton orderId={order.id} />}
        </div>
      </div>

      {/* Awaiting payment banner */}
      {order.status === "awaiting_payment" && (
        <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-amber-900">Awaiting customer PayPal payment</p>
              <p className="mt-1 text-sm text-amber-800">
                Verify the F&amp;F payment came in for{" "}
                <span className="font-mono font-semibold">{formatPrice(order.total)} {order.currency.toUpperCase()}</span>{" "}
                with note{" "}
                <span className="font-mono font-semibold">{order.guest_email ?? "—"}</span>,
                then click below to confirm. This decrements stock and emails the customer.
              </p>
            </div>
            <MarkAsPaidButton orderId={order.id} />
          </div>
        </div>
      )}

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
                <td className="px-5 py-3">
                  {item.product_name}
                  {item.variant_size && (
                    <span className="ml-2 text-xs text-gray-500">({item.variant_size})</span>
                  )}
                </td>
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
      <div className="flex flex-wrap items-end gap-4 mb-6">
        <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
      </div>

      {/* Shipping Label */}
      <div className="mb-6">
        <ShippingLabelGenerator
          orderId={order.id}
          hasLabel={!!order.shipping_label_url}
          existingLabelUrl={order.shipping_label_url}
          existingTrackingNumber={order.tracking_number}
          existingTrackingUrl={order.tracking_url_provider}
          existingCarrier={order.carrier}
          rateId={order.shippo_rate_id}
          shippingPhone={order.shipping_phone}
          shippingCountry={order.shipping_country}
        />
      </div>

      {/* Internal Notes */}
      <OrderNotes orderId={order.id} />
    </div>
  );
}

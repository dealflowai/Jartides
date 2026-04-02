import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdminPage } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import CleanupOrdersButton from "@/components/admin/CleanupOrdersButton";
import ExportOrdersButton from "@/components/admin/ExportOrdersButton";
import type { Order, OrderStatus } from "@/lib/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminOrdersPage() {
  await requireAdminPage();
  const supabase = await createClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as Order[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2">
          <ExportOrdersButton />
          <CleanupOrdersButton />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">
                  {order.order_number}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {order.guest_email ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status]}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(order.total)}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-[#1a6de3] hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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

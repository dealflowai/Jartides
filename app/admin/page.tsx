import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";
import type { Order, OrderStatus } from "@/lib/types";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminDashboard() {
  const supabase = await createClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [ordersRes, revenueRes, productsRes, lowStockRes, recentRes] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total")
        .neq("status", "cancelled")
        .gte("created_at", thirtyDaysAgo.toISOString()),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
      supabase
        .from("products")
        .select("id, stock_quantity, low_stock_threshold")
        .eq("active", true),
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const totalOrders = ordersRes.count ?? 0;
  const revenue =
    revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const activeProducts = productsRes.count ?? 0;
  const lowStock =
    lowStockRes.data?.filter(
      (p) => p.stock_quantity <= p.low_stock_threshold
    ).length ?? 0;
  const recentOrders = (recentRes.data ?? []) as Order[];

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Revenue (30 days)",
      value: formatPrice(revenue),
      icon: DollarSign,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Active Products",
      value: activeProducts.toLocaleString(),
      icon: Package,
      color: "text-[#0b3d7a] bg-[#1a6de3]/10",
    },
    {
      label: "Low Stock",
      value: lowStock.toLocaleString(),
      icon: AlertTriangle,
      color: lowStock > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent orders */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Recent Orders
      </h2>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {recentOrders.map((order) => (
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
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
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

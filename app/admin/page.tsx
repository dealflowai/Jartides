import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
  ClipboardList,
  Settings,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus } from "@/lib/types";
import SendAbandonedEmailButton from "@/components/admin/SendAbandonedEmailButton";
import DeleteAbandonedButton from "@/components/admin/DeleteAbandonedButton";
import DashboardTabs from "@/components/admin/DashboardTabs";

const statusColors: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default async function AdminDashboard() {
  await requireAdminPage();
  const supabase = createAdminClient();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    ordersRes,
    revenueRes,
    allTimeRevenueRes,
    productsRes,
    lowStockRes,
    customersRes,
    recentRes,
    topProductsRes,
    abandonedRes,
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }).neq("status", "pending"),
    supabase
      .from("orders")
      .select("total")
      .neq("status", "cancelled")
      .neq("status", "refunded")
      .neq("status", "pending")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("orders")
      .select("total")
      .neq("status", "cancelled")
      .neq("status", "refunded")
      .neq("status", "pending"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase
      .from("products")
      .select("id, stock_quantity, low_stock_threshold")
      .eq("active", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*")
      .neq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("order_items")
      .select("product_id, product_name, quantity, unit_price"),
    supabase
      .from("orders")
      .select("id, order_number, guest_email, total, created_at, stripe_payment_intent_id")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalOrders = ordersRes.count ?? 0;
  const revenue30d =
    revenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const totalRevenue =
    allTimeRevenueRes.data?.reduce((sum, o) => sum + (o.total ?? 0), 0) ?? 0;
  const activeProducts = productsRes.count ?? 0;
  const lowStock =
    lowStockRes.data?.filter(
      (p) => p.stock_quantity <= p.low_stock_threshold
    ).length ?? 0;
  const totalCustomers = customersRes.count ?? 0;
  const recentOrders = (recentRes.data ?? []) as Order[];
  const abandonedCheckouts = abandonedRes.data ?? [];

  // Aggregate top products by total quantity sold
  const productSales = new Map<
    string,
    { name: string; totalQty: number; totalRevenue: number }
  >();
  for (const item of topProductsRes.data ?? []) {
    const existing = productSales.get(item.product_id);
    if (existing) {
      existing.totalQty += item.quantity;
      existing.totalRevenue += item.quantity * item.unit_price;
    } else {
      productSales.set(item.product_id, {
        name: item.product_name,
        totalQty: item.quantity,
        totalRevenue: item.quantity * item.unit_price,
      });
    }
  }
  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const abandonedCount = abandonedCheckouts.length;

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(totalRevenue),
      sub: "All time",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50",
      href: "/admin/analytics",
    },
    {
      label: "Revenue (30 days)",
      value: formatPrice(revenue30d),
      sub: "Last 30 days",
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
      href: "/admin/analytics",
    },
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      sub: "All time",
      icon: ShoppingBag,
      color: "text-blue-600 bg-blue-50",
      href: "/admin/orders",
    },
    {
      label: "Total Customers",
      value: totalCustomers.toLocaleString(),
      sub: "Registered accounts",
      icon: Users,
      color: "text-violet-600 bg-violet-50",
      href: "/admin/customers",
    },
    {
      label: "Active Products",
      value: activeProducts.toLocaleString(),
      sub: "In catalog",
      icon: Package,
      color: "text-[#0b3d7a] bg-[#1a6de3]/10",
      href: "/admin/products",
    },
    {
      label: "Low Stock",
      value: lowStock.toLocaleString(),
      sub: lowStock > 0 ? "Needs attention" : "All stocked",
      icon: AlertTriangle,
      color:
        lowStock > 0 ? "text-red-600 bg-red-50" : "text-gray-600 bg-gray-50",
      href: "/admin/inventory",
    },
    {
      label: "Avg Order Value",
      value: formatPrice(avgOrderValue),
      sub: "All time",
      icon: CreditCard,
      color: "text-amber-600 bg-amber-50",
      href: "/admin/analytics",
    },
    {
      label: "Abandoned Carts",
      value: abandonedCount.toLocaleString(),
      sub: abandonedCount > 0 ? "Awaiting follow-up" : "None pending",
      icon: ShoppingCart,
      color:
        abandonedCount > 0 ? "text-orange-600 bg-orange-50" : "text-gray-600 bg-gray-50",
      href: "#abandoned",
    },
  ];

  const quickActions = [
    {
      label: "Add Product",
      href: "/admin/products?action=new",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700 text-white",
    },
    {
      label: "View Orders",
      href: "/admin/orders",
      icon: ClipboardList,
      color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    },
    {
      label: "Site Settings",
      href: "/admin/settings",
      icon: Settings,
      color: "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300",
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${action.color}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <DashboardTabs>
      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-xl border border-gray-200 bg-white p-5 transition-all hover:shadow-md hover:border-[#1a6de3]/30 group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 group-hover:text-[#0b3d7a] transition-colors">{stat.label}</p>
                  <p className="truncate text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-400">{stat.sub}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Products */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-1">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Products
            </h2>
            <p className="text-xs text-gray-400">By units sold</p>
          </div>
          <div className="divide-y max-h-[280px] overflow-y-auto">
            {topProducts.map((product, i) => (
              <div
                key={product.name}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {product.totalQty} sold &middot;{" "}
                    {formatPrice(product.totalRevenue)}
                  </p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">
                No sales data yet.
              </p>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <div className="border-b border-gray-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <p className="text-xs text-gray-400">Last 10 orders</p>
              </div>
              <Link
                href="/admin/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500 sticky top-0 bg-white z-10">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gray-50/50"
                  >
                    <td className="whitespace-nowrap px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-blue-600 hover:text-blue-700"
                      >
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {order.guest_email ?? "\u2014"}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium">
                      {formatPrice(order.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-gray-400"
                    >
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Abandoned Checkouts */}
      {abandonedCheckouts.length > 0 && (
        <div id="abandoned" className="mb-8 rounded-xl border border-amber-200 bg-amber-50/50">
          <div className="border-b border-amber-200 px-5 py-4">
            <h2 className="text-lg font-semibold text-amber-800">
              Abandoned Checkouts
            </h2>
            <p className="text-xs text-amber-600">
              Started checkout but didn&apos;t pay - consider following up via email
            </p>
          </div>
          <div className="overflow-x-auto max-h-[440px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-amber-200 text-xs uppercase text-amber-700 sticky top-0 bg-amber-50 z-10">
                <tr>
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {abandonedCheckouts.map((checkout: { id: string; order_number: string; guest_email: string | null; total: number; created_at: string; stripe_payment_intent_id: string | null }) => (
                  <tr key={checkout.id} className={`hover:bg-amber-50 ${checkout.stripe_payment_intent_id ? "bg-green-50/50" : ""}`}>
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-gray-900">
                      <Link href={`/admin/orders/${checkout.id}`} className="text-blue-600 hover:text-blue-700">
                        {checkout.order_number}
                      </Link>
                      {checkout.stripe_payment_intent_id && (
                        <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                          May have paid
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      {checkout.guest_email ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right font-medium text-gray-900">
                      {formatPrice(checkout.total)}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-gray-500">
                      {new Date(checkout.created_at).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {checkout.guest_email && (
                          <SendAbandonedEmailButton
                            email={checkout.guest_email}
                            orderNumber={checkout.order_number}
                            total={checkout.total}
                          />
                        )}
                        <DeleteAbandonedButton orderId={checkout.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </DashboardTabs>
    </div>
  );
}

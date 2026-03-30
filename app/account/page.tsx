import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Jartides account, orders, and addresses.",
};
import { createClient } from "@/lib/supabase/server";
import type { Order } from "@/lib/types";
import { Package, MapPin, ShoppingBag, Shield } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const { data: orders, count } = await supabase
    .from("orders")
    .select("*", { count: "exact" })
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)
    .returns<Order[]>();

  // Check admin role using admin client to bypass RLS
  const adminSupabase = createAdminClient();
  const { data: adminProfile } = await adminSupabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  const isAdmin = adminProfile?.role === "admin";
  const displayName = profile?.full_name || user!.email || "User";
  const memberSince = new Date(user!.created_at).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-[family-name:var(--font-heading)] tracking-wide text-[#0b3d7a]">
          Welcome, {displayName}
        </h1>
        <p className="text-sm text-gray-500 mt-1">Member since {memberSince}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-[#0b3d7a]">{count ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Account Created</p>
          <p className="text-sm font-semibold text-[#0b3d7a] mt-1">
            {memberSince}
          </p>
        </div>
      </div>

      {/* Quick Links */}
      <div className={`grid gap-4 ${isAdmin ? "grid-cols-4" : "grid-cols-3"}`}>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex flex-col items-center gap-2 bg-[#0b3d7a] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
          >
            <Shield className="w-6 h-6 text-white" />
            <span className="text-sm font-medium text-white">Admin Dashboard</span>
          </Link>
        )}
        <Link
          href="/account/orders"
          className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <Package className="w-6 h-6 text-[#1a6de3]" />
          <span className="text-sm font-medium text-gray-700">Orders</span>
        </Link>
        <Link
          href="/account/addresses"
          className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <MapPin className="w-6 h-6 text-[#1a6de3]" />
          <span className="text-sm font-medium text-gray-700">Addresses</span>
        </Link>
        <Link
          href="/shop"
          className="flex flex-col items-center gap-2 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center"
        >
          <ShoppingBag className="w-6 h-6 text-[#1a6de3]" />
          <span className="text-sm font-medium text-gray-700">Shop</span>
        </Link>
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-lg font-semibold text-[#0b3d7a] mb-3">
          Recent Orders
        </h2>

        {orders && orders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm divide-y">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    #{order.order_number}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-CA")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      statusColors[order.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <Link
              href="/shop"
              className="text-[#1a6de3] text-sm font-medium hover:underline mt-2 inline-block"
            >
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

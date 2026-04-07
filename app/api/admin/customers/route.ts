import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  // Fetch all profiles
  const { data: profiles, error: profilesError } = await db
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { error: profilesError.message },
      { status: 500 }
    );
  }

  // Fetch order counts and totals per user
  const { data: orderStats, error: ordersError } = await db
    .from("orders")
    .select("user_id, total, status");

  if (ordersError) {
    return NextResponse.json(
      { error: ordersError.message },
      { status: 500 }
    );
  }

  // Aggregate order stats by user
  const statsMap: Record<
    string,
    { order_count: number; total_spent: number }
  > = {};
  for (const order of orderStats ?? []) {
    if (!order.user_id || order.status === "cancelled" || order.status === "refunded") continue;
    if (!statsMap[order.user_id]) {
      statsMap[order.user_id] = { order_count: 0, total_spent: 0 };
    }
    statsMap[order.user_id].order_count++;
    statsMap[order.user_id].total_spent += order.total ?? 0;
  }

  const customers = (profiles ?? []).map((p) => ({
    ...p,
    order_count: statsMap[p.id]?.order_count ?? 0,
    total_spent: statsMap[p.id]?.total_spent ?? 0,
  }));

  return NextResponse.json(customers);
}

export async function PATCH(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, role } = body as { userId?: string; role?: string };

  if (!userId || !role || !["customer", "admin", "fulfillment"].includes(role)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Prevent admins from demoting themselves
  if (userId === admin.id && role !== "admin") {
    return NextResponse.json(
      { error: "You cannot remove your own admin role" },
      { status: 400 }
    );
  }

  const db = createAdminClient();
  const { error } = await db
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

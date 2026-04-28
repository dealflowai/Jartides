import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/admin";

/**
 * GET /api/admin/orders/export?status=processing&from=2026-01-01&to=2026-12-31
 *
 * Exports orders as CSV for accounting/tax purposes.
 */
export async function GET(req: NextRequest) {
  const admin = await requireStaff();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const db = createAdminClient();

  let query = db
    .from("orders")
    .select("*, order_items:order_items(product_name, quantity, unit_price)")
    .order("created_at", { ascending: false });

  // Exclude unpaid orders by default. Fulfillment users never see
  // awaiting_payment orders, even if they request a specific status.
  if (status) {
    if (admin.role !== "admin" && status === "awaiting_payment") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    query = query.eq("status", status);
  } else {
    const excluded = admin.role === "admin"
      ? "(pending)"
      : "(pending,awaiting_payment)";
    query = query.not("status", "in", excluded);
  }
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);

  const { data: orders, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build CSV
  const headers = [
    "Order Number",
    "Date",
    "Status",
    "Customer Email",
    "Shipping Name",
    "Shipping City",
    "Shipping Province",
    "Shipping Country",
    "Items",
    "Subtotal",
    "Shipping",
    "Tax",
    "Total",
    "Currency",
    "Payment Method",
    "Tracking Number",
    "Carrier",
  ];

  const rows = (orders ?? []).map((order) => {
    const items = (order.order_items ?? [])
      .map(
        (i: { product_name: string; quantity: number; unit_price: number }) =>
          `${i.product_name} x${i.quantity} @ $${i.unit_price}`
      )
      .join("; ");

    return [
      order.order_number,
      new Date(order.created_at).toISOString().split("T")[0],
      order.status,
      order.guest_email ?? "",
      order.shipping_name,
      order.shipping_city,
      order.shipping_province,
      order.shipping_country,
      items,
      order.subtotal,
      order.shipping_cost,
      order.tax,
      order.total,
      order.currency,
      order.payment_method ?? "",
      order.tracking_number ?? "",
      order.carrier ?? "",
    ];
  });

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

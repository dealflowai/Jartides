import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { sendLowStockAlert } from "@/lib/email";

// GET - check for low stock products and send email alert
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();

  const { data: products, error } = await db
    .from("products")
    .select("name, sku, stock_quantity, low_stock_threshold")
    .eq("active", true)
    .filter("stock_quantity", "lte", "low_stock_threshold");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const lowStockProducts = (products ?? []).filter(
    (p: { stock_quantity: number; low_stock_threshold: number }) =>
      p.stock_quantity <= p.low_stock_threshold
  );

  if (lowStockProducts.length === 0) {
    return NextResponse.json({ message: "No low stock products", count: 0 });
  }

  try {
    await sendLowStockAlert(lowStockProducts);
    return NextResponse.json({
      message: `Alert sent for ${lowStockProducts.length} products`,
      count: lowStockProducts.length,
    });
  } catch (e) {
    console.error("Low stock alert failed:", e);
    return NextResponse.json(
      { error: "Failed to send alert", count: lowStockProducts.length },
      { status: 500 }
    );
  }
}

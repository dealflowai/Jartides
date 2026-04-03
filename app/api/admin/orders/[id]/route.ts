import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = createAdminClient();

  // Fetch order details before deleting for the audit log
  const { data: order } = await db
    .from("orders")
    .select("order_number, status, guest_email")
    .eq("id", id)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Delete order items first (foreign key constraint)
  await db.from("order_items").delete().eq("order_id", id);
  await db.from("order_notes").delete().eq("order_id", id);

  const { error } = await db.from("orders").delete().eq("id", id);

  if (error) {
    logger.error("Failed to delete order", { orderId: id, error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "order.status_change",
    entity_type: "order",
    entity_id: id,
    details: {
      action: "deleted",
      order_number: order.order_number,
      status: order.status,
      email: order.guest_email,
    },
  });

  logger.info("Order deleted", { orderId: id, orderNumber: order.order_number });
  return NextResponse.json({ success: true });
}

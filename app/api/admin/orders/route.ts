import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendShippingNotification, sendReviewRequest } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { id, ...updates } = parsed.data;

  // Get current order to check if status is changing to shipped
  const db = createAdminClient();
  const { data: currentOrder } = await db
    .from("orders")
    .select("status, guest_email")
    .eq("id", id)
    .single();

  const { data, error } = await db
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log for order status change
  writeAuditLog({
    admin_id: admin.id,
    action: "order.status_change",
    entity_type: "order",
    entity_id: id,
    details: {
      from: currentOrder?.status,
      to: updates.status,
      tracking_number: updates.tracking_number ?? null,
      carrier: updates.carrier ?? null,
    },
  });

  // Send shipping notification when status changes to "shipped"
  if (
    updates.status === "shipped" &&
    currentOrder?.status !== "shipped"
  ) {
    try {
      await sendShippingNotification(data);
    } catch (e) {
      logger.error("Failed to send shipping notification", { orderId: id, error: String(e) });
    }
  }

  // Send review request when status changes to "delivered"
  if (
    updates.status === "delivered" &&
    currentOrder?.status !== "delivered" &&
    data.guest_email
  ) {
    try {
      const { data: orderItems } = await db
        .from("order_items")
        .select("product_name, product:products(slug)")
        .eq("order_id", id);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const items = (orderItems ?? []).map((item: any) => ({
        product_name: item.product_name as string,
        slug: (Array.isArray(item.product) ? item.product[0]?.slug : item.product?.slug) as string ?? "",
      }));

      if (items.length > 0) {
        await sendReviewRequest(data.guest_email, data.order_number, items);
      }
    } catch (e) {
      logger.error("Failed to send review request", { orderId: id, error: String(e) });
    }
  }

  return NextResponse.json(data);
}

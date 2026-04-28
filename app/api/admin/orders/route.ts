import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendShippingNotification, sendReviewRequest, sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { writeAuditLog } from "@/lib/audit";
import { logger } from "@/lib/logger";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const admin = await requireStaff();
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
    "awaiting_payment",
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

  const admin = await requireStaff();
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

  // Only admins can verify/mark PayPal payments. Fulfillment can't touch
  // awaiting_payment orders, nor can they move orders into that state.
  if (admin.role !== "admin") {
    if (currentOrder?.status === "awaiting_payment" || updates.status === "awaiting_payment") {
      return NextResponse.json(
        { error: "Only admins can change payment status." },
        { status: 403 }
      );
    }
  }

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

  // Manual payment confirmation: transitioning from awaiting_payment → processing
  // means the admin verified PayPal F&F payment came in. Decrement stock + send
  // customer confirmation + admin notification, mirroring the Stripe webhook path.
  if (
    updates.status === "processing" &&
    currentOrder?.status === "awaiting_payment"
  ) {
    try {
      const { data: orderItemsForStock } = await db
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", id);

      for (const item of orderItemsForStock ?? []) {
        const { error: stockError } = await db.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
        if (stockError) {
          logger.error("Failed to decrement stock on manual payment", {
            orderId: id,
            productId: item.product_id,
            error: stockError.message,
          });
        }
      }

      const { data: fullItems } = await db
        .from("order_items")
        .select("*")
        .eq("order_id", id);

      if (fullItems) {
        await Promise.allSettled([
          sendOrderConfirmation(data, fullItems),
          sendAdminOrderNotification(data, fullItems),
        ]);
      }
    } catch (e) {
      logger.error("Failed post-payment processing", { orderId: id, error: String(e) });
    }
  }

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

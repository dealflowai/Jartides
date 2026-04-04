import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayPalAccessToken, getPayPalBaseUrl } from "@/lib/paypal";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";

const RequestSchema = z.object({
  paypalOrderId: z.string().min(1),
});

const log = logger.child({ route: "/api/paypal/capture-order" });

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const rateLimited = await rateLimit(request, { limit: 5, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { paypalOrderId } = parsed.data;
    const supabase = createAdminClient();

    // Look up the order by its stored PayPal order ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, status, guest_email")
      .eq("paypal_order_id", paypalOrderId)
      .single();

    if (orderError || !order) {
      log.error("Order not found for PayPal order", {
        paypalOrderId,
        error: orderError?.message,
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotency — if already processed, return success
    if (order.status === "processing") {
      log.info("PayPal capture already processed", {
        orderId: order.id,
        paypalOrderId,
      });
      return NextResponse.json({
        success: true,
        orderId: order.id,
        orderNumber: order.order_number,
      });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order is no longer pending" },
        { status: 400 }
      );
    }

    // Capture the PayPal order
    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    const captureRes = await fetch(
      `${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!captureRes.ok) {
      const errorText = await captureRes.text();
      log.error("PayPal capture failed", {
        paypalOrderId,
        orderId: order.id,
        status: captureRes.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "PayPal payment capture failed" },
        { status: 502 }
      );
    }

    const captureData = await captureRes.json();

    if (captureData.status !== "COMPLETED") {
      log.error("PayPal capture not completed", {
        paypalOrderId,
        orderId: order.id,
        captureStatus: captureData.status,
      });
      return NextResponse.json(
        { error: "Payment was not completed" },
        { status: 400 }
      );
    }

    // Update order status to processing (only if still pending — idempotency)
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", order.id)
      .eq("status", "pending");

    if (updateError) {
      log.error("Failed to update order status after PayPal capture", {
        orderId: order.id,
        error: updateError.message,
      });
    }

    // Decrement stock for each item (mirrors Stripe webhook behaviour)
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", order.id);

    if (orderItems) {
      for (const item of orderItems) {
        const { error: stockError } = await supabase.rpc("decrement_stock", {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        });
        if (stockError) {
          log.error("Failed to decrement stock", {
            productId: item.product_id,
            quantity: item.quantity,
            orderId: order.id,
            error: stockError.message,
          });
        }
      }
    }

    log.info("PayPal payment captured, order processing", {
      orderId: order.id,
      paypalOrderId,
    });

    // Send confirmation + admin notification emails (non-blocking)
    try {
      const { data: fullOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("id", order.id)
        .single();

      const { data: fullItems } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", order.id);

      if (fullOrder && fullItems) {
        await Promise.allSettled([
          sendOrderConfirmation(fullOrder, fullItems),
          sendAdminOrderNotification(fullOrder, fullItems),
        ]);
      }
    } catch (emailErr) {
      log.error("Failed to send order emails", {
        orderId: order.id,
        error: String(emailErr),
      });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    log.error("PayPal capture-order error", { error: String(err) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

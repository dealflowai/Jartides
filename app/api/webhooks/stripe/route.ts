import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email";
import { logger } from "@/lib/logger";
import type Stripe from "stripe";

const log = logger.child({ route: "/api/webhooks/stripe" });

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    log.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err) {
    log.error("Webhook signature verification failed", { error: String(err) });
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        // Update order status to processing (only if still pending — idempotency)
        const { data: order, error: orderError } = await supabase
          .from("orders")
          .update({ status: "processing", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending")
          .select("id")
          .single();

        if (orderError || !order) {
          log.error("Failed to update order on payment success", {
            paymentIntentId: paymentIntent.id,
            error: orderError?.message,
          });
          break;
        }

        // Reduce stock quantities
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

        log.info("Payment succeeded, order processing", {
          orderId: order.id,
          paymentIntentId: paymentIntent.id,
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
          log.error("Failed to send order emails", { orderId: order.id, error: String(emailErr) });
        }

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id);

        log.warn("Payment failed, order cancelled", { paymentIntentId: paymentIntent.id });
        break;
      }

      case "payment_intent.canceled": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;

        await supabase
          .from("orders")
          .update({ status: "cancelled", updated_at: new Date().toISOString() })
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .eq("status", "pending");

        log.info("Payment intent cancelled", { paymentIntentId: paymentIntent.id });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = charge.payment_intent;

        if (piId) {
          await supabase
            .from("orders")
            .update({ status: "refunded", updated_at: new Date().toISOString() })
            .eq("stripe_payment_intent_id", piId);

          log.info("Charge refunded", { paymentIntentId: piId });
        }
        break;
      }

      default:
        log.info("Unhandled event type", { type: event.type });
    }
  } catch (err) {
    log.error("Webhook handler error", { error: String(err) });
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

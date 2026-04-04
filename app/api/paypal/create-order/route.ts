import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPayPalAccessToken, getPayPalBaseUrl } from "@/lib/paypal";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";

const RequestSchema = z.object({
  orderId: z.string().uuid(),
});

const log = logger.child({ route: "/api/paypal/create-order" });

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

    const { orderId } = parsed.data;
    const supabase = createAdminClient();

    // Fetch the order — must exist and still be pending
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, order_number, total, currency, status, guest_email, shipping_name, shipping_line1, shipping_line2, shipping_city, shipping_province, shipping_postal, shipping_country")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      log.error("Order not found", { orderId, error: orderError?.message });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "Order is no longer pending" },
        { status: 400 }
      );
    }

    // Fetch order items for the PayPal line-item breakdown
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name, variant_size, quantity, unit_price")
      .eq("order_id", order.id);

    const accessToken = await getPayPalAccessToken();
    const baseUrl = getPayPalBaseUrl();

    // Build PayPal order payload
    const paypalOrder = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: order.order_number,
          custom_id: order.id,
          description: `Order ${order.order_number}`,
          amount: {
            currency_code: "CAD",
            value: order.total.toFixed(2),
          },
          shipping: {
            name: { full_name: order.shipping_name },
            address: {
              address_line_1: order.shipping_line1,
              ...(order.shipping_line2
                ? { address_line_2: order.shipping_line2 }
                : {}),
              admin_area_2: order.shipping_city,
              admin_area_1: order.shipping_province,
              postal_code: order.shipping_postal,
              country_code: order.shipping_country,
            },
          },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Jartides",
            shipping_preference: "SET_PROVIDED_ADDRESS",
            user_action: "PAY_NOW",
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca"}/checkout/success?orderId=${order.id}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca"}/checkout`,
          },
        },
      },
    };

    const res = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paypalOrder),
    });

    if (!res.ok) {
      const errorText = await res.text();
      log.error("PayPal create order failed", {
        orderId,
        status: res.status,
        error: errorText,
      });
      return NextResponse.json(
        { error: "Failed to create PayPal order" },
        { status: 502 }
      );
    }

    const paypalData = await res.json();

    // Store PayPal order ID on the order for later capture verification
    await supabase
      .from("orders")
      .update({ paypal_order_id: paypalData.id })
      .eq("id", order.id);

    log.info("PayPal order created", {
      orderId: order.id,
      paypalOrderId: paypalData.id,
    });

    // Return the PayPal order ID and approval URL
    const approveLink = paypalData.links?.find(
      (l: { rel: string; href: string }) => l.rel === "payer-action"
    );

    return NextResponse.json({
      paypalOrderId: paypalData.id,
      approveUrl: approveLink?.href ?? null,
    });
  } catch (err) {
    log.error("PayPal create-order error", { error: String(err) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

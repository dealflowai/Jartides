import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendShippingNotification } from "@/lib/email";
import { z } from "zod";
import { Shippo } from "shippo";

const labelSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  rateId: z.string().optional(),
});

// Generate shipping label via Shippo (admin only)
export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = labelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderId, rateId } = parsed.data;
    const db = createAdminClient();

    // Fetch order
    const { data: order } = await db
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_TOKEN! });

    let shipmentId = rateId ? undefined : order.shippo_shipment_id;
    let selectedRateId = rateId || order.shippo_rate_id;

    // If no existing shipment/rate, create one with real product dimensions
    if (!shipmentId && !selectedRateId) {
      // Fetch order items and their product dimensions
      const { data: orderItems } = await db
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", orderId);

      let parcel = {
        length: "25",
        width: "20",
        height: "10",
        distanceUnit: "cm" as const,
        weight: "1",
        massUnit: "kg" as const,
      };

      if (orderItems && orderItems.length > 0) {
        const productIds = orderItems.map((i: { product_id: string }) => i.product_id);
        const { data: products } = await db
          .from("products")
          .select("id, weight_grams, length_cm, width_cm, height_cm")
          .in("id", productIds);

        if (products && products.length > 0) {
          let totalWeightGrams = 0;
          let maxLength = 0;
          let maxWidth = 0;
          let totalHeight = 0;

          for (const item of orderItems) {
            const product = products.find((p: { id: string }) => p.id === item.product_id);
            if (!product) continue;
            const qty = item.quantity || 1;
            totalWeightGrams += (product.weight_grams || 100) * qty;
            maxLength = Math.max(maxLength, product.length_cm || 15);
            maxWidth = Math.max(maxWidth, product.width_cm || 10);
            totalHeight += (product.height_cm || 5) * qty;
          }

          parcel = {
            length: String(Math.max(maxLength, 10)),
            width: String(Math.max(maxWidth, 10)),
            height: String(Math.max(totalHeight, 5)),
            distanceUnit: "cm",
            weight: String(Math.max(totalWeightGrams / 1000, 0.1)),
            massUnit: "kg",
          };
        }
      }

      const shipment = await shippo.shipments.create({
        addressFrom: {
          name: "J'Artides",
          street1: "4511 Walker Rd",
          street2: "Suite 1012",
          city: "Windsor",
          state: "ON",
          zip: "N8W 3T6",
          country: "CA",
        },
        addressTo: {
          name: order.shipping_name || "Customer",
          street1: order.shipping_line1 || "",
          street2: order.shipping_line2 || "",
          city: order.shipping_city || "",
          state: order.shipping_province || "",
          zip: order.shipping_postal || "",
          country: order.shipping_country || "CA",
        },
        parcels: [parcel],
      });

      shipmentId = shipment.objectId;

      // Pick the cheapest rate
      if (shipment.rates.length > 0) {
        const cheapest = shipment.rates.reduce((min, r) =>
          parseFloat(r.amount) < parseFloat(min.amount) ? r : min
        );
        selectedRateId = cheapest.objectId;
      }
    }

    if (!selectedRateId) {
      return NextResponse.json(
        { error: "No shipping rates available for this order" },
        { status: 400 }
      );
    }

    // Purchase the label
    const transaction = await shippo.transactions.create({
      rate: selectedRateId,
      labelFileType: "PDF",
      async: false,
    });

    if (transaction.status !== "SUCCESS") {
      return NextResponse.json(
        { error: transaction.messages?.map((m) => m.text).join(", ") || "Label purchase failed" },
        { status: 400 }
      );
    }

    const carrierName = transaction.rate
      ? typeof transaction.rate === "string" ? "Shippo" : transaction.rate.provider
      : "Shippo";

    // Update order with tracking info
    await db
      .from("orders")
      .update({
        tracking_number: transaction.trackingNumber || null,
        shipping_label_url: transaction.labelUrl || null,
        shippo_shipment_id: shipmentId || null,
        tracking_url_provider: transaction.trackingUrlProvider || null,
        carrier: carrierName,
        status: "shipped",
      })
      .eq("id", orderId);

    // Register tracking with Shippo for auto-updates
    if (transaction.trackingNumber) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";
        await shippo.trackingStatus.create({
          carrier: carrierName,
          trackingNumber: transaction.trackingNumber,
          metadata: orderId,
        });
      } catch (trackErr) {
        console.error("Failed to register Shippo tracking:", trackErr);
      }
    }

    // Send shipping notification email
    try {
      const { data: updatedOrder } = await db
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (updatedOrder) {
        await sendShippingNotification(updatedOrder);
      }
    } catch (e) {
      console.error("Failed to send shipping notification:", e);
    }

    return NextResponse.json({
      success: true,
      trackingNumber: transaction.trackingNumber,
      labelUrl: transaction.labelUrl,
      trackingUrl: transaction.trackingUrlProvider || null,
      carrier: carrierName,
    });
  } catch (err) {
    console.error("Shippo label error:", err);
    return NextResponse.json(
      { error: "Failed to generate shipping label" },
      { status: 500 }
    );
  }
}

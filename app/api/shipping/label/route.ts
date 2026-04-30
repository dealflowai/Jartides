import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaff } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { sendShippingNotification } from "@/lib/email";
import { logger } from "@/lib/logger";
import { SHIPPO_FROM_ADDRESS } from "@/lib/shipping-config";
import { z } from "zod";
import { Shippo } from "shippo";

const labelSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  rateId: z.string().optional(),
  regenerate: z.boolean().optional(),
});

// Generate shipping label via Shippo (admin only)
export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  try {
    const staff = await requireStaff();
    if (!staff) {
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

    const { orderId, rateId, regenerate } = parsed.data;
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

    // Stored shipmentId/rateId from checkout expire after ~24h (carrier rates are
    // time-bound). Always create a fresh shipment unless an explicit rateId is
    // passed in the request body (e.g. from a freshly-quoted admin UI).
    // The `regenerate` flag is kept for explicitness/back-compat but is now the default.
    void regenerate;
    let shipmentId: string | undefined = undefined;
    let selectedRateId: string | undefined = rateId;

    // If no existing shipment/rate, create one with real product dimensions
    if (!shipmentId && !selectedRateId) {
      // Fetch order items and their product dimensions
      const { data: orderItems } = await db
        .from("order_items")
        .select("product_id, product_name, quantity, unit_price")
        .eq("order_id", orderId);

      let parcel = {
        length: "25",
        width: "20",
        height: "10",
        distanceUnit: "cm" as const,
        weight: "1",
        massUnit: "kg" as const,
      };

      // Per-item weight in kg, keyed by product_id (used for customs items)
      const itemWeightsKg = new Map<string, number>();

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
            const unitWeightG = product.weight_grams || 100;
            totalWeightGrams += unitWeightG * qty;
            maxLength = Math.max(maxLength, product.length_cm || 15);
            maxWidth = Math.max(maxWidth, product.width_cm || 10);
            totalHeight += (product.height_cm || 5) * qty;
            itemWeightsKg.set(item.product_id, Math.max(unitWeightG / 1000, 0.01));
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

      // International shipment? Build a customs declaration so FedEx/UPS/etc. can issue a commercial invoice.
      const toCountry = (order.shipping_country || "CA").toUpperCase();
      const fromCountry = (SHIPPO_FROM_ADDRESS.country || "US").toUpperCase();
      let customsDeclarationId: string | undefined;

      if (toCountry !== fromCountry) {
        const currency = order.currency || "USD";
        const originCountry = process.env.SHIPPO_CUSTOMS_ORIGIN_COUNTRY || fromCountry;
        const customsItems = (orderItems || []).map((item: { product_id: string; product_name: string; quantity: number; unit_price: number }) => {
          const qty = item.quantity || 1;
          const lineValue = (item.unit_price || 0) * qty;
          const netWeightKg = itemWeightsKg.get(item.product_id) ?? 0.1;
          return {
            description: item.product_name || "Merchandise",
            quantity: qty,
            netWeight: netWeightKg.toFixed(3),
            massUnit: "kg" as const,
            valueAmount: lineValue.toFixed(2),
            valueCurrency: currency,
            originCountry,
          };
        });

        if (customsItems.length === 0) {
          customsItems.push({
            description: "Merchandise",
            quantity: 1,
            netWeight: parcel.weight,
            massUnit: "kg" as const,
            valueAmount: (Number(order.subtotal) || 1).toFixed(2),
            valueCurrency: currency,
            originCountry,
          });
        }

        // EEL/PFC: required for US-origin international exports.
        // US -> CA: NOEEI_30_36; US -> other (typical < $2,500): NOEEI_30_37_a.
        const eelPfc =
          fromCountry === "US"
            ? toCountry === "CA"
              ? "NOEEI_30_36"
              : "NOEEI_30_37_a"
            : undefined;

        const customsDeclaration = await shippo.customsDeclarations.create({
          contentsType: "MERCHANDISE",
          nonDeliveryOption: "RETURN",
          certify: true,
          certifySigner: process.env.SHIPPO_CUSTOMS_SIGNER || SHIPPO_FROM_ADDRESS.name,
          incoterm: "DDU",
          items: customsItems,
          ...(eelPfc ? { eelPfc } : {}),
        });

        customsDeclarationId = customsDeclaration.objectId;
      }

      const shipment = await shippo.shipments.create({
        addressFrom: SHIPPO_FROM_ADDRESS,
        addressTo: {
          name: order.shipping_name || "Customer",
          street1: order.shipping_line1 || "",
          street2: order.shipping_line2 || "",
          city: order.shipping_city || "",
          state: order.shipping_province || "",
          zip: order.shipping_postal || "",
          country: toCountry,
          email: order.guest_email || undefined,
        },
        parcels: [parcel],
        ...(customsDeclarationId ? { customsDeclaration: customsDeclarationId } : {}),
      });

      shipmentId = shipment.objectId;

      // Pick the cheapest rate, but skip carriers that aren't activated in Shippo.
      // Set SHIPPO_EXCLUDED_CARRIERS to a comma-separated list (e.g. "UPS,DHL Express").
      const excludedCarriers = (process.env.SHIPPO_EXCLUDED_CARRIERS || "")
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

      const candidateRates = shipment.rates
        .filter((r) => !excludedCarriers.includes((r.provider || "").toUpperCase()))
        .sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));

      if (candidateRates.length > 0) {
        selectedRateId = candidateRates[0].objectId;
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
      ? typeof transaction.rate === "string" ? "Shippo" : (transaction.rate.provider || "Shippo")
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
        await shippo.trackingStatus.create({
          carrier: carrierName,
          trackingNumber: transaction.trackingNumber,
          metadata: orderId,
        });
      } catch (trackErr) {
        logger.error("Failed to register Shippo tracking", { orderId, error: String(trackErr) });
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
      logger.error("Failed to send shipping notification", { orderId, error: String(e) });
    }

    return NextResponse.json({
      success: true,
      trackingNumber: transaction.trackingNumber,
      labelUrl: transaction.labelUrl,
      trackingUrl: transaction.trackingUrlProvider || null,
      carrier: carrierName,
    });
  } catch (err) {
    logger.error("Shippo label error", { error: String(err) });
    return NextResponse.json(
      { error: "Failed to generate shipping label" },
      { status: 500 }
    );
  }
}

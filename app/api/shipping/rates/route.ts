import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { SHIPPO_FROM_ADDRESS } from "@/lib/shipping-config";
import { Shippo } from "shippo";

interface CartItemInput {
  productId: string;
  quantity: number;
}

function calculateParcel(
  products: { weight_grams: number | null; length_cm: number | null; width_cm: number | null; height_cm: number | null }[]
) {
  let totalWeightGrams = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  for (const p of products) {
    totalWeightGrams += p.weight_grams || 100;
    maxLength = Math.max(maxLength, p.length_cm || 15);
    maxWidth = Math.max(maxWidth, p.width_cm || 10);
    totalHeight += p.height_cm || 5;
  }

  return {
    length: String(Math.max(maxLength, 10)),
    width: String(Math.max(maxWidth, 10)),
    height: String(Math.max(totalHeight, 5)),
    distanceUnit: "cm" as const,
    weight: String(Math.max(totalWeightGrams / 1000, 0.1)),
    massUnit: "kg" as const,
  };
}

export async function POST(request: NextRequest) {
  const rateLimited = await rateLimit(request, { limit: 15, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const { address, items } = await request.json();

    if (!address || !address.city || !address.country) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Fetch product dimensions from database
    const cartItems: CartItemInput[] = items || [];
    let parcel = {
      length: "25",
      width: "20",
      height: "10",
      distanceUnit: "cm" as const,
      weight: "1",
      massUnit: "kg" as const,
    };

    if (cartItems.length > 0) {
      const db = createAdminClient();
      const productIds = cartItems.map((i) => i.productId);
      const { data: products } = await db
        .from("products")
        .select("id, weight_grams, length_cm, width_cm, height_cm")
        .in("id", productIds);

      if (products && products.length > 0) {
        // Expand products by quantity
        const expanded = cartItems.flatMap((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) return [];
          return Array.from({ length: item.quantity }, () => product);
        });

        if (expanded.length > 0) {
          parcel = calculateParcel(expanded);
        }
      }
    }

    const shippo = new Shippo({ apiKeyHeader: process.env.SHIPPO_API_TOKEN! });

    const shipment = await shippo.shipments.create({
      addressFrom: SHIPPO_FROM_ADDRESS,
      addressTo: {
        name: address.name || "Customer",
        street1: address.line1 || address.street1 || "",
        street2: address.line2 || address.street2 || "",
        city: address.city,
        state: address.province || address.state || "",
        zip: address.postal || address.zip || "",
        country: address.country,
      },
      parcels: [parcel],
    });

    logger.info("Shippo shipment response", {
      objectId: shipment.objectId,
      status: shipment.status,
      ratesCount: shipment.rates.length,
    });

    const rates = shipment.rates.map((r) => ({
      id: r.objectId,
      carrier: r.provider,
      service: r.servicelevel.name || "",
      rate: parseFloat(r.amount),
      currency: r.currency,
      delivery_days: r.estimatedDays
        ? `${r.estimatedDays} business days`
        : "Varies",
      shipment_id: shipment.objectId,
    }));

    // Sort by price ascending
    rates.sort((a, b) => a.rate - b.rate);

    if (rates.length === 0) {
      const messages = shipment.messages?.map((m) => m.text).filter(Boolean) || [];
      logger.warn("Shippo returned 0 rates", { messages });
      return NextResponse.json({
        rates: [],
        error: "No shipping options available for this address. Please verify your address or try a different one.",
      });
    }

    return NextResponse.json({ rates });
  } catch (err) {
    logger.error("Shippo rates error", { error: String(err) });
    const message = err instanceof Error ? err.message : "Failed to calculate shipping rates";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

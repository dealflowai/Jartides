import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { z } from "zod";

const labelSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

// Generate shipping label via EasyPost (admin only)
// TODO: Wire up with real EasyPost API
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

    const { orderId } = parsed.data;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

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

    // TODO: Create EasyPost shipment and purchase label
    // const EasyPost = require('@easypost/api');
    // const easypost = new EasyPost(process.env.EASYPOST_API_KEY);
    // const shipment = await easypost.Shipment.create({ ... });
    // const boughtShipment = await shipment.buy(shipment.lowestRate());

    // Placeholder response
    const trackingNumber = `JRT${Date.now()}`;

    // Update order with tracking info
    await db
      .from("orders")
      .update({
        tracking_number: trackingNumber,
        status: "shipped",
        carrier: "Standard",
      })
      .eq("id", orderId);

    return NextResponse.json({
      success: true,
      trackingNumber,
      message:
        "Shipping label generated. Connect EasyPost API for real label generation.",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate shipping label" },
      { status: 500 }
    );
  }
}

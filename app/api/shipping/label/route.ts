import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Generate shipping label via EasyPost (admin only)
// TODO: Wire up with real EasyPost API
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Fetch order
    const { data: order } = await admin
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
    await admin
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

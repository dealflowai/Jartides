import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

const log = logger.child({ route: "/api/webhooks/shippo" });

// Shippo tracking status → order status mapping
function mapTrackingStatus(shippoStatus: string): string | null {
  switch (shippoStatus) {
    case "DELIVERED":
      return "delivered";
    case "TRANSIT":
    case "UNKNOWN":
      return null; // Already "shipped", no change needed
    case "RETURNED":
    case "FAILURE":
      return null; // Don't auto-update, let admin handle
    default:
      return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Shippo sends tracking updates with this structure
    const trackingStatus = body?.data?.tracking_status?.status;
    const trackingNumber = body?.data?.tracking_number;
    const carrier = body?.data?.carrier;

    if (!trackingNumber || !trackingStatus) {
      return NextResponse.json({ received: true });
    }

    log.info("Tracking update received", { trackingNumber, status: trackingStatus });

    const newStatus = mapTrackingStatus(trackingStatus);
    if (!newStatus) {
      // No status change needed
      return NextResponse.json({ received: true });
    }

    const db = createAdminClient();

    // Find order by tracking number
    const { data: order } = await db
      .from("orders")
      .select("id, status")
      .eq("tracking_number", trackingNumber)
      .maybeSingle();

    if (!order) {
      log.warn("No order found for tracking number", { trackingNumber });
      return NextResponse.json({ received: true });
    }

    // Only update if it's a forward progression (don't go backwards)
    const statusOrder = ["pending", "processing", "shipped", "delivered"];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (newIndex <= currentIndex) {
      return NextResponse.json({ received: true });
    }

    await db
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    log.info("Order status updated via tracking", { orderId: order.id, from: order.status, to: newStatus });

    return NextResponse.json({ received: true });
  } catch (err) {
    log.error("Shippo webhook error", { error: String(err) });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

/**
 * Resend webhook handler for email events (bounces, complaints, deliveries).
 *
 * Set up in Resend Dashboard > Webhooks:
 *   URL: https://jartides.ca/api/webhooks/resend
 *   Events: email.bounced, email.complained, email.delivered
 */
export async function POST(request: NextRequest) {
  const log = logger.child({ route: "/api/webhooks/resend" });

  try {
    const payload = await request.json();
    const eventType = payload.type as string;

    switch (eventType) {
      case "email.bounced": {
        const to = payload.data?.to?.[0];
        const reason = payload.data?.bounce?.description;
        log.warn("Email bounced", { to, reason, emailId: payload.data?.email_id });
        // Future: mark email as undeliverable in profiles table
        break;
      }

      case "email.complained": {
        const to = payload.data?.to?.[0];
        log.warn("Spam complaint received", { to, emailId: payload.data?.email_id });
        // Future: auto-unsubscribe the address
        break;
      }

      case "email.delivered": {
        log.info("Email delivered", { to: payload.data?.to?.[0], emailId: payload.data?.email_id });
        break;
      }

      default:
        log.info("Unhandled Resend event", { type: eventType });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    log.error("Resend webhook error", { error: String(err) });
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

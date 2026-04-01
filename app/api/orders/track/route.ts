import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const trackSchema = z.object({
  orderNumber: z.string().min(1, "Order number is required"),
  email: z.string().email("Valid email is required"),
});

/* Simple in-memory rate limiter: 5 requests per minute per IP */
const rateMap = new Map<string, number[]>();
const RATE_LIMIT = 5;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateMap.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT) {
    rateMap.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateMap.set(ip, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  /* Rate limit */
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  /* Parse & validate body */
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { orderNumber, email } = parsed.data;

  /* Lookup order using admin client (bypasses RLS) */
  const db = createAdminClient();

  // Try by order_number first, then fall back to order id
  let { data: order, error } = await db
    .from("orders")
    .select("*")
    .eq("order_number", orderNumber)
    .ilike("guest_email", email)
    .maybeSingle();

  // Fallback: try matching by order id (UUID)
  if (!order && !error) {
    const fallback = await db
      .from("orders")
      .select("*")
      .eq("id", orderNumber)
      .ilike("guest_email", email)
      .maybeSingle();
    order = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Order track lookup error:", error.message);
    return NextResponse.json(
      { error: "Unable to look up order. Please try again later." },
      { status: 500 }
    );
  }

  if (!order) {
    return NextResponse.json(
      { error: "No order found matching that order number and email." },
      { status: 404 }
    );
  }

  /* Fetch order items */
  const { data: items } = await db
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  // Strip sensitive fields from public response
  const { shipping_name, shipping_line1, shipping_line2, shipping_postal, guest_email, ...safeOrder } = order;

  return NextResponse.json({ ...safeOrder, items: items ?? [] });
}

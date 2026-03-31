import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rateLimited = await rateLimit(req, { limit: 10, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { valid: false, discount: 0, type: null, message: "Discount code is required." },
        { status: 400 }
      );
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return NextResponse.json(
        { valid: false, discount: 0, type: null, message: "Valid subtotal is required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: discountCode, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", code.toUpperCase().trim())
      .single();

    if (error || !discountCode) {
      return NextResponse.json(
        { valid: false, discount: 0, type: null, message: "Invalid discount code." },
        { status: 200 }
      );
    }

    // Validate code is usable (generic message to prevent enumeration)
    const invalidResponse = { valid: false, discount: 0, type: null, message: "Invalid or expired discount code." };

    if (!discountCode.active) {
      return NextResponse.json(invalidResponse, { status: 200 });
    }

    if (discountCode.expires_at && new Date(discountCode.expires_at) < new Date()) {
      return NextResponse.json(invalidResponse, { status: 200 });
    }

    if (
      discountCode.max_uses !== null &&
      discountCode.used_count >= discountCode.max_uses
    ) {
      return NextResponse.json(invalidResponse, { status: 200 });
    }

    // Check min order amount
    if (subtotal < Number(discountCode.min_order_amount)) {
      return NextResponse.json(
        {
          valid: false,
          discount: 0,
          type: null,
          message: `Minimum order amount of $${Number(discountCode.min_order_amount).toFixed(2)} is required for this code.`,
        },
        { status: 200 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (discountCode.type === "percentage") {
      discount = Math.round(subtotal * (Number(discountCode.value) / 100) * 100) / 100;
    } else {
      discount = Math.min(Number(discountCode.value), subtotal);
    }

    return NextResponse.json({
      valid: true,
      discount,
      type: discountCode.type,
      message: discountCode.type === "percentage"
        ? `${Number(discountCode.value)}% off applied!`
        : `$${Number(discountCode.value).toFixed(2)} off applied!`,
    });
  } catch {
    return NextResponse.json(
      { valid: false, discount: 0, type: null, message: "An error occurred validating the code." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// EasyPost shipping rate calculation
// TODO: Wire up with real EasyPost API key
export async function POST(request: NextRequest) {
  const rateLimited = await rateLimit(request, { limit: 15, windowMs: 60_000 });
  if (rateLimited) return rateLimited;
  try {
    const { address } = await request.json();

    if (!address || !address.city || !address.country) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      );
    }

    // Flat rate for now — replace with EasyPost integration
    const rates = [
      {
        id: "standard",
        carrier: "Standard Shipping",
        service: "Standard",
        rate: 15.0,
        currency: "CAD",
        delivery_days: "3-8 business days",
      },
    ];

    return NextResponse.json({ rates });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate shipping rates" },
      { status: 500 }
    );
  }
}

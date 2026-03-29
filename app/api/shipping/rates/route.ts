import { NextResponse } from "next/server";

// EasyPost shipping rate calculation
// TODO: Wire up with real EasyPost API key
export async function POST(request: Request) {
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

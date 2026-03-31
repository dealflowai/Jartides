import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

// GET reviews for a product (public)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "Missing product_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

const reviewSchema = z.object({
  product_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional(),
  body: z.string().max(1000).optional(),
  author_name: z.string().min(1).max(50),
});

// POST new review (authenticated users)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Must be logged in to review" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  // Check if user already reviewed this product
  const { data: existing } = await supabase
    .from("product_reviews")
    .select("id")
    .eq("product_id", parsed.data.product_id)
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
  }

  // Check if user has purchased this product (verified purchase)
  const { data: orderItem } = await supabase
    .from("order_items")
    .select("id, order:orders!inner(user_id, status)")
    .eq("product_id", parsed.data.product_id)
    .not("order.status", "in", "(cancelled,refunded)")
    .limit(1)
    .single();

  const verifiedPurchase = !!orderItem;

  const db = createAdminClient();
  const { data: review, error } = await db
    .from("product_reviews")
    .insert({
      ...parsed.data,
      user_id: user.id,
      verified_purchase: verifiedPurchase,
      approved: false, // Requires admin approval
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(review, { status: 201 });
}

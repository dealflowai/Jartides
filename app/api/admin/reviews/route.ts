import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

// GET all reviews (admin)
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createAdminClient();
  const { data, error } = await db
    .from("product_reviews")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// PUT - approve/reject review
export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, approved } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  const db = createAdminClient();

  // Get the review to find product_id
  const { data: review } = await db
    .from("product_reviews")
    .select("product_id")
    .eq("id", id)
    .single();

  // Update review
  const { data, error } = await db
    .from("product_reviews")
    .update({ approved, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Recalculate product avg_rating and review_count
  if (review) {
    const { data: stats } = await db
      .from("product_reviews")
      .select("rating")
      .eq("product_id", review.product_id)
      .eq("approved", true);

    const ratings = (stats ?? []).map((r: { rating: number }) => r.rating);
    const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

    await db
      .from("products")
      .update({ avg_rating: Math.round(avg * 10) / 10, review_count: ratings.length })
      .eq("id", review.product_id);
  }

  return NextResponse.json(data);
}

// DELETE review
export async function DELETE(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }

  const db = createAdminClient();

  // Get product_id before deleting
  const { data: review } = await db
    .from("product_reviews")
    .select("product_id")
    .eq("id", id)
    .single();

  const { error } = await db.from("product_reviews").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Recalculate product stats
  if (review) {
    const { data: stats } = await db
      .from("product_reviews")
      .select("rating")
      .eq("product_id", review.product_id)
      .eq("approved", true);

    const ratings = (stats ?? []).map((r: { rating: number }) => r.rating);
    const avg = ratings.length > 0 ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length : 0;

    await db
      .from("products")
      .update({ avg_rating: Math.round(avg * 10) / 10, review_count: ratings.length })
      .eq("id", review.product_id);
  }

  return NextResponse.json({ success: true });
}

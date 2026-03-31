import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const db = createAdminClient();

  // Fetch original product
  const { data: original, error: fetchError } = await db
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Create duplicate with modified name/slug
  const {
    id: _id,
    created_at: _ca,
    updated_at: _ua,
    ...productData
  } = original;

  const duplicateData = {
    ...productData,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${Date.now().toString(36)}`,
    sku: original.sku ? `${original.sku}-COPY` : null,
    active: false, // Start as inactive so admin can review
  };

  const { data: newProduct, error: insertError } = await db
    .from("products")
    .insert(duplicateData)
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Duplicate variants
  const { data: variants } = await db
    .from("product_variants")
    .select("*")
    .eq("product_id", id);

  if (variants && variants.length > 0) {
    const variantRows = variants.map((v: Record<string, unknown>) => {
      const { id: _vid, created_at: _vca, updated_at: _vua, product_id: _pid, ...rest } = v;
      return { ...rest, product_id: newProduct.id };
    });
    await db.from("product_variants").insert(variantRows);
  }

  return NextResponse.json({ id: newProduct.id }, { status: 201 });
}

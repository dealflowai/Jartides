import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin";
import { verifyCsrf } from "@/lib/csrf";
import { writeAuditLog } from "@/lib/audit";
import { sendBackInStockNotification } from "@/lib/email";
import { logger } from "@/lib/logger";
import { z } from "zod";

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  size: z.string().min(1),
  price: z.number().positive(),
  original_price: z.number().positive().nullable().optional(),
  stock_quantity: z.number().int().min(0).default(100),
  low_stock_threshold: z.number().int().min(0).default(10),
  images: z.array(z.string()).default([]),
  sort_order: z.number().int().default(0),
  active: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().nullable().optional(),
  description: z.string().min(1),
  research_description: z.string().nullable().optional(),
  meta_title: z.string().nullable().optional(),
  meta_description: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  category_id: z.string().uuid(),
  price: z.number().positive(),
  original_price: z.number().positive().nullable().optional(),
  badge: z.string().nullable().optional(),
  size: z.string().min(1),
  purity: z.string().nullable().optional(),
  images: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
  stock_quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(5),
  weight_grams: z.number().min(0).nullable().optional(),
  length_cm: z.number().min(0).nullable().optional(),
  width_cm: z.number().min(0).nullable().optional(),
  height_cm: z.number().min(0).nullable().optional(),
  sort_order: z.number().int().default(0),
  variants: z.array(variantSchema).optional(),
  tags: z.array(z.string()).optional(),
  related_product_ids: z.array(z.string().uuid()).optional(),
});

function slugifyTag(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveTags(db: any, productId: string, tagNames: string[]) {
  // Remove existing tag links
  await db.from("product_tag_links").delete().eq("product_id", productId);

  if (tagNames.length === 0) return;

  // Upsert tags (create if they don't exist)
  for (const name of tagNames) {
    const slug = slugifyTag(name);
    if (!slug) continue;

    // Try to find existing tag
    const { data: existing } = await db
      .from("product_tags")
      .select("id")
      .eq("slug", slug)
      .single();

    let tagId: string;
    if (existing) {
      tagId = existing.id;
    } else {
      const { data: created } = await db
        .from("product_tags")
        .insert({ name: name.trim(), slug })
        .select("id")
        .single();
      if (!created) continue;
      tagId = created.id;
    }

    await db.from("product_tag_links").insert({ product_id: productId, tag_id: tagId });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function saveRelatedProducts(db: any, productId: string, relatedIds: string[]) {
  await db.from("related_products").delete().eq("product_id", productId);

  if (relatedIds.length === 0) return;

  const rows = relatedIds.map((rid, i) => ({
    product_id: productId,
    related_product_id: rid,
    sort_order: i,
  }));
  await db.from("related_products").insert(rows);
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { variants, tags, related_product_ids, ...productData } = parsed.data;

  const db = createAdminClient();
  const { data, error } = await db
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Save variants if provided
  if (variants && variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: data.id,
      size: v.size,
      price: v.price,
      original_price: v.original_price ?? null,
      stock_quantity: v.stock_quantity,
      low_stock_threshold: v.low_stock_threshold,
      images: v.images ?? [],
      sort_order: v.sort_order,
      active: v.active,
    }));
    await db.from("product_variants").insert(variantRows);
  }

  // Save tags
  if (tags && tags.length > 0) {
    await saveTags(db, data.id, tags);
  }

  // Save related products
  if (related_product_ids && related_product_ids.length > 0) {
    await saveRelatedProducts(db, data.id, related_product_ids);
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "product.create",
    entity_type: "product",
    entity_id: data.id,
    details: { name: data.name, price: data.price },
  });

  return NextResponse.json(data, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const csrfError = verifyCsrf(req);
  if (csrfError) return csrfError;

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...rest } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const parsed = productSchema.safeParse(rest);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { variants, tags, related_product_ids, ...productData } = parsed.data;

  const db = createAdminClient();
  const { data, error } = await db
    .from("products")
    .update({ ...productData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check old variant stock before replacing (to detect restock)
  const { data: oldVariants } = await db
    .from("product_variants")
    .select("stock_quantity")
    .eq("product_id", id);
  const wasAllOutOfStock =
    oldVariants && oldVariants.length > 0
      ? oldVariants.every((v) => (v.stock_quantity ?? 0) <= 0)
      : (data.stock_quantity ?? 0) <= 0;

  // Replace all variants: delete existing, insert submitted set
  await db.from("product_variants").delete().eq("product_id", id);
  if (variants && variants.length > 0) {
    const variantRows = variants.map((v) => ({
      product_id: id,
      size: v.size,
      price: v.price,
      original_price: v.original_price ?? null,
      stock_quantity: v.stock_quantity,
      low_stock_threshold: v.low_stock_threshold,
      images: v.images ?? [],
      sort_order: v.sort_order,
      active: v.active,
    }));
    await db.from("product_variants").insert(variantRows);
  }

  // Send back-in-stock notifications if product was out of stock and now has stock
  const nowHasStock = variants
    ? variants.some((v) => v.stock_quantity > 0)
    : productData.stock_quantity > 0;

  if (wasAllOutOfStock && nowHasStock) {
    try {
      const { data: requests } = await db
        .from("back_in_stock_requests")
        .select("id, email, product_name")
        .eq("product_id", id)
        .eq("notified", false);

      if (requests && requests.length > 0) {
        let sent = 0;
        for (const request of requests) {
          try {
            await sendBackInStockNotification(
              request.email,
              request.product_name,
              data.slug
            );
            sent++;
          } catch (err) {
            logger.error("Back-in-stock email failed", {
              email: request.email,
              product_id: id,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        const reqIds = requests.map((r) => r.id);
        await db
          .from("back_in_stock_requests")
          .update({ notified: true })
          .in("id", reqIds);

        logger.info("Back-in-stock notifications auto-sent on product update", {
          product_id: id,
          sent,
          total: requests.length,
        });
      }
    } catch (err) {
      logger.error("Back-in-stock auto-notify failed", {
        product_id: id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // Replace tags
  if (tags !== undefined) {
    await saveTags(db, id, tags ?? []);
  }

  // Replace related products
  if (related_product_ids !== undefined) {
    await saveRelatedProducts(db, id, related_product_ids ?? []);
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "product.update",
    entity_type: "product",
    entity_id: id,
    details: { name: data.name, price: data.price },
  });

  return NextResponse.json(data);
}

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
    return NextResponse.json({ error: "Missing product id" }, { status: 400 });
  }

  const db = createAdminClient();
  const { error } = await db.from("products").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  writeAuditLog({
    admin_id: admin.id,
    action: "product.delete",
    entity_type: "product",
    entity_id: id,
  });

  return NextResponse.json({ success: true });
}

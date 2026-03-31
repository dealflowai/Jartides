import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import ProductForm from "@/components/admin/ProductForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import type { Product, Category, CoaDocument, ProductTag } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const supabase = createAdminClient();

  const [productRes, categoriesRes, coaRes, allProductsRes, tagsRes, relatedRes] = await Promise.all([
    supabase.from("products").select("*, variants:product_variants(*)").eq("id", id).single<Product>(),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("coa_documents").select("*").eq("product_id", id).order("created_at", { ascending: false }),
    supabase.from("products").select("id, name").eq("active", true).order("name"),
    supabase.from("product_tag_links").select("tag:product_tags(*)").eq("product_id", id),
    supabase.from("related_products").select("related_product_id").eq("product_id", id).order("sort_order"),
  ]);

  if (!productRes.data) notFound();

  const existingTags = (tagsRes.data ?? [])
    .map((row: Record<string, unknown>) => row.tag as ProductTag)
    .filter(Boolean);
  const relatedProductIds = (relatedRes.data ?? []).map(
    (row: Record<string, unknown>) => row.related_product_id as string
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <DeleteProductButton productId={id} />
      </div>
      <ProductForm
        product={productRes.data}
        categories={(categoriesRes.data ?? []) as Category[]}
        coaDocuments={(coaRes.data ?? []) as CoaDocument[]}
        allProducts={(allProductsRes.data ?? []) as Product[]}
        existingTags={existingTags}
        relatedProductIds={relatedProductIds}
      />
    </div>
  );
}

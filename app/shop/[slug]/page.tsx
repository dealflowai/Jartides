import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import ProductDetail from "@/components/shop/ProductDetail";
import ProductReviews from "@/components/shop/ProductReviews";
import ProductCard from "@/components/shop/ProductCard";
import ProductStructuredData from "@/components/shop/ProductStructuredData";
import type { Product, CoaDocument } from "@/lib/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*)")
    .eq("slug", slug)
    .single();

  if (!product) {
    return { title: "Product Not Found | Jartides" };
  }

  return {
    title: product.meta_title || `${product.name} | Jartides`,
    description:
      product.meta_description ||
      product.description?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      `Shop ${product.name} — premium Canadian research peptide with 99%+ purity.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*), variants:product_variants(*)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const typedProduct = product as Product;

  // Fetch COA documents for this product
  let coaDocuments: CoaDocument[] = [];
  try {
    const { data } = await supabase
      .from("coa_documents")
      .select("*")
      .eq("product_id", typedProduct.id)
      .order("created_at", { ascending: false });

    coaDocuments = (data as CoaDocument[]) ?? [];
  } catch {
    coaDocuments = [];
  }

  // Fetch related products — use manually linked ones first, fall back to same category
  let relatedProducts: Product[] = [];
  try {
    // Check for manually linked related products
    const { data: linkedRows } = await supabase
      .from("related_products")
      .select("related_product_id")
      .eq("product_id", typedProduct.id)
      .order("sort_order");

    const linkedIds = (linkedRows ?? []).map((r: { related_product_id: string }) => r.related_product_id);

    if (linkedIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("active", true)
        .in("id", linkedIds);
      // Preserve sort order
      const productMap = new Map((data ?? []).map((p: Product) => [p.id, p]));
      relatedProducts = linkedIds.map((id: string) => productMap.get(id)).filter(Boolean) as Product[];
    }

    // Fall back to same-category products if not enough linked
    if (relatedProducts.length < 4) {
      const excludeIds = [typedProduct.id, ...relatedProducts.map((p) => p.id)];
      const { data } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("active", true)
        .eq("category_id", typedProduct.category_id)
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(4 - relatedProducts.length);

      relatedProducts = [...relatedProducts, ...((data as Product[]) ?? [])];
    }

    // Still not enough? grab any other active products
    if (relatedProducts.length < 4) {
      const excludeIds = [typedProduct.id, ...relatedProducts.map((p) => p.id)];
      const { data: more } = await supabase
        .from("products")
        .select("*, category:categories(*), variants:product_variants(*)")
        .eq("active", true)
        .not("id", "in", `(${excludeIds.join(",")})`)
        .limit(4 - relatedProducts.length);

      relatedProducts = [...relatedProducts, ...((more as Product[]) ?? [])];
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <>
      <ProductStructuredData product={typedProduct} />
      <PageHeader
        title={typedProduct.name}
        breadcrumbs={[
          { label: "Shop", href: "/shop" },
          { label: typedProduct.name },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <ProductDetail product={typedProduct} coaDocuments={coaDocuments} />
        <ProductReviews
          productId={typedProduct.id}
          avgRating={typedProduct.avg_rating ?? 0}
          reviewCount={typedProduct.review_count ?? 0}
        />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="mb-6 text-2xl font-extrabold tracking-tight text-gray-900 font-[family-name:var(--font-heading)]">
            Related Products
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
            {relatedProducts.map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import ProductDetail from "@/components/shop/ProductDetail";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/lib/types";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) {
    return { title: "Product Not Found | Jartides" };
  }

  return {
    title: `${product.name} | Jartides`,
    description:
      product.description?.slice(0, 160) ??
      `Shop ${product.name} — premium Canadian research peptide with 99%+ purity.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();

  if (!product) notFound();

  const typedProduct = product as Product;

  // Fetch related products (same category, exclude current)
  let relatedProducts: Product[] = [];
  try {
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("active", true)
      .eq("category_id", typedProduct.category_id)
      .neq("id", typedProduct.id)
      .limit(4);

    relatedProducts = (data as Product[]) ?? [];
  } catch {
    relatedProducts = [];
  }

  return (
    <>
      <PageHeader
        title={typedProduct.name}
        breadcrumbs={[
          { label: "Shop", href: "/shop" },
          { label: typedProduct.name },
        ]}
      />

      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <ProductDetail product={typedProduct} />
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <h2 className="mb-6 text-2xl font-bold tracking-wide uppercase text-gray-900 font-[family-name:var(--font-heading)]">
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

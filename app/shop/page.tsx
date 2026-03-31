import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import ShopContent from "@/components/shop/ShopContent";
import type { Product, Category, ProductTag } from "@/lib/types";

export const metadata = {
  title: "Shop All Products | Jartides",
  description:
    "Browse our complete collection of research peptides, blends, nasal sprays, and laboratory supplies.",
};

export default async function ShopPage() {
  const supabase = await createClient();

  let products: Product[] = [];
  let categories: Category[] = [];
  let tags: ProductTag[] = [];

  try {
    const { data: productsData } = await supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    products = (productsData as Product[]) ?? [];
  } catch {
    products = [];
  }

  try {
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");

    categories = (categoriesData as Category[]) ?? [];
  } catch {
    categories = [];
  }

  try {
    const { data: tagsData } = await supabase
      .from("product_tags")
      .select("*")
      .order("name");
    tags = (tagsData as ProductTag[]) ?? [];
  } catch {
    tags = [];
  }

  return (
    <>
      <PageHeader
        title="SHOP ALL PRODUCTS"
        description="Browse our complete collection of research peptides, blends, nasal sprays, and laboratory supplies."
        breadcrumbs={[{ label: "Shop" }]}
        titleKey="shop_title"
        descriptionKey="shop_description"
      />

      <ShopContent products={products} categories={categories} tags={tags} />
    </>
  );
}

import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import ShopContent from "@/components/shop/ShopContent";
import type { Product, Category } from "@/lib/types";

export const metadata = {
  title: "Shop All Products | Jartides",
  description:
    "Browse our complete collection of research peptides, blends, nasal sprays, and laboratory supplies.",
};

export default async function ShopPage() {
  const supabase = await createClient();

  let products: Product[] = [];
  let categories: Category[] = [];

  try {
    const { data: productsData } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("active", true)
      .order("created_at");

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

  return (
    <>
      <PageHeader
        title="SHOP ALL PRODUCTS"
        description="Browse our complete collection of research peptides, blends, nasal sprays, and laboratory supplies."
        breadcrumbs={[{ label: "Shop" }]}
      />

      <ShopContent products={products} categories={categories} />
    </>
  );
}

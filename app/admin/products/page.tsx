import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import Button from "@/components/ui/Button";
import ProductsTable from "@/components/admin/ProductsTable";
import type { Product } from "@/lib/types";
import CategoriesSection from "./CategoriesSection";

export default async function AdminProductsPage() {
  await requireAdminPage();
  const supabase = createAdminClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const items = (productsRes.data ?? []) as Product[];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button href="/admin/products/new" size="sm">
          Add Product
        </Button>
      </div>

      {/* Products Table with Bulk Actions */}
      <div className="space-y-3 mb-10">
        <ProductsTable items={items} />
      </div>

      {/* Categories Section */}
      <CategoriesSection initialCategories={categories} />
    </div>
  );
}

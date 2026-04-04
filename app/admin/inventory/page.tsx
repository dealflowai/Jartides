import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import InventoryTable from "@/components/admin/InventoryTable";
import type { Product } from "@/lib/types";

export default async function AdminInventoryPage() {
  await requireAdminPage();
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("products")
    .select("id, name, stock_quantity, low_stock_threshold, category:categories(name)")
    .eq("active", true)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inventory</h1>
      <InventoryTable products={(data ?? []) as unknown as (Pick<Product, "id" | "name" | "stock_quantity" | "low_stock_threshold"> & { category: { name: string } | null })[]} />
    </div>
  );
}

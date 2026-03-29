import { createClient } from "@/lib/supabase/server";
import InventoryTable from "@/components/admin/InventoryTable";
import type { Product } from "@/lib/types";

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select("id, name, stock_quantity, low_stock_threshold, category:categories(name)")
    .eq("active", true)
    .order("stock_quantity", { ascending: true });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inventory</h1>
      <InventoryTable products={(data ?? []) as unknown as (Pick<Product, "id" | "name" | "stock_quantity" | "low_stock_threshold"> & { category: { name: string } | null })[]} />
    </div>
  );
}

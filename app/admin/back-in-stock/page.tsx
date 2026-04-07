import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdminPage } from "@/lib/admin";
import BackInStockTable from "@/components/admin/BackInStockTable";

export default async function BackInStockPage() {
  await requireAdminPage();
  const supabase = createAdminClient();

  const { data: requests } = await supabase
    .from("back_in_stock_requests")
    .select("id, email, product_id, product_name, notified, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Back-in-Stock Requests
      </h1>
      <BackInStockTable requests={requests ?? []} />
    </div>
  );
}

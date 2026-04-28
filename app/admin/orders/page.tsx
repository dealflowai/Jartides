import { createAdminClient } from "@/lib/supabase/admin";
import { requireStaffPage } from "@/lib/admin";
import CleanupOrdersButton from "@/components/admin/CleanupOrdersButton";
import ExportOrdersButton from "@/components/admin/ExportOrdersButton";
import OrdersBulkLabelTable from "@/components/admin/OrdersBulkLabelTable";
import type { Order, OrderItem } from "@/lib/types";

export default async function AdminOrdersPage() {
  const staff = await requireStaffPage();
  const isAdmin = staff.role === "admin";
  const supabase = createAdminClient();

  // Fulfillment users only see paid orders. Admins also see awaiting_payment so
  // they can verify PayPal F&F payments and click "Mark as Paid".
  const excludedStatuses = isAdmin
    ? "(pending)"
    : "(pending,awaiting_payment)";

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .not("status", "in", excludedStatuses)
    .order("created_at", { ascending: false });

  const orders = (data ?? []) as (Order & { order_items: OrderItem[] })[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center gap-2">
          <ExportOrdersButton />
          {isAdmin && <CleanupOrdersButton />}
        </div>
      </div>

      <OrdersBulkLabelTable orders={orders} />
    </div>
  );
}

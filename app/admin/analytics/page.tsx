import { requireAdminPage } from "@/lib/admin";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics — Admin",
};

export default async function AnalyticsPage() {
  await requireAdminPage();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500">
          Revenue, orders, customers, and product performance at a glance.
        </p>
      </div>
      <AnalyticsCharts />
    </div>
  );
}

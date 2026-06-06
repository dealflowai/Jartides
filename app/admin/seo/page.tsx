import { requireAdminPage } from "@/lib/admin";
import SeoAnalyzer from "@/components/admin/SeoAnalyzer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SEO — Admin",
};

export default async function SeoPage() {
  await requireAdminPage();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SEO Command Center</h1>
        <p className="text-sm text-gray-500">
          Audit every page, find what hurts your rankings, and fix it — built for the peptide niche.
        </p>
      </div>
      <SeoAnalyzer />
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Button from "@/components/ui/Button";
import type { CoaDocument } from "@/lib/types";

export default async function AdminCoaPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("coa_documents")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false });

  const coas = (data ?? []) as (CoaDocument & {
    product: { name: string } | null;
  })[];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">COA Documents</h1>
        <Button href="/admin/coa/new" size="sm">
          Add COA
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Purity %</th>
              <th className="px-4 py-3">Batch Number</th>
              <th className="px-4 py-3">Test Date</th>
              <th className="px-4 py-3">PDF</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coas.map((coa) => (
              <tr key={coa.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {coa.product?.name ?? "—"}
                </td>
                <td className="px-4 py-3">{coa.purity_percentage}%</td>
                <td className="px-4 py-3">{coa.batch_number}</td>
                <td className="px-4 py-3 text-gray-500">
                  {coa.test_date
                    ? new Date(coa.test_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {coa.pdf_url ? (
                    <a
                      href={coa.pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a6de3] hover:underline"
                    >
                      View PDF
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/coa/${coa.id}`}
                    className="text-[#1a6de3] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {coas.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No COA documents yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import CoaExplanation from "@/components/coa/CoaExplanation";
import { FileText, FlaskConical } from "lucide-react";

export const metadata = {
  title: "Certificates of Analysis | Jartides",
  description:
    "Every product batch is independently tested for purity and identity. View our COAs.",
};

interface CoaDocument {
  id: string;
  batch_number: string;
  purity_percentage: number;
  pdf_url: string | null;
  created_at: string;
  product: { name: string; slug: string } | null;
}

export default async function CoaPage() {
  const supabase = await createClient();

  let coas: CoaDocument[] = [];

  try {
    const { data } = await supabase
      .from("coa_documents")
      .select("*, product:products(name, slug)")
      .order("created_at");

    coas = (data as CoaDocument[]) ?? [];
  } catch {
    coas = [];
  }

  return (
    <>
      <PageHeader
        title="CERTIFICATES OF ANALYSIS"
        description="Every product batch is independently tested for purity and identity."
        breadcrumbs={[{ label: "Certificates of Analysis" }]}
        titleKey="coa_title"
        descriptionKey="coa_description"
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* Info Box */}
        <div className="mb-10 flex items-start gap-4 rounded-xl border border-[#1a6de3]/20 bg-[#1a6de3]/5 p-5">
          <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6de3]" />
          <p className="text-sm text-gray-700 font-[family-name:var(--font-body)]">
            All products undergo rigorous HPLC and Mass Spectrometry analysis by
            independent third-party laboratories.
          </p>
        </div>

        {/* COA Grid */}
        {coas.length > 0 ? (
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            }}
          >
            {coas.map((coa) => (
              <div
                key={coa.id}
                className="flex flex-col rounded-xl border border-[#dde2ea] bg-white p-5 shadow-sm"
              >
                <FileText className="mb-3 h-8 w-8 text-[#0b3d7a]" />

                <h3 className="text-sm font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
                  {coa.product?.name ?? "Unknown Product"}
                </h3>

                {coa.purity_percentage != null && (
                  <p className="mt-1 text-lg font-bold text-green-600 font-[family-name:var(--font-body)]">
                    {coa.purity_percentage}% Purity
                  </p>
                )}

                {coa.batch_number && (
                  <p className="mt-1 text-xs text-gray-500 font-[family-name:var(--font-body)]">
                    Batch: {coa.batch_number}
                  </p>
                )}

                <div className="mt-auto pt-4">
                  {coa.pdf_url ? (
                    <Button
                      href={coa.pdf_url}
                      size="sm"
                      variant="blue"
                      className="w-full"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View COA
                    </Button>
                  ) : (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-4 py-2 text-xs font-semibold text-gray-400 font-[family-name:var(--font-body)]"
                    >
                      View COA
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-500 font-[family-name:var(--font-body)]">
            No certificates of analysis are available at this time. Check back
            soon.
          </p>
        )}

        {/* Understanding Our COAs */}
        <CoaExplanation />
      </section>
    </>
  );
}

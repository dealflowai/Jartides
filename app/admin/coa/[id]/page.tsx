import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoaForm from "@/components/admin/CoaForm";
import type { CoaDocument, Product } from "@/lib/types";

export default async function EditCoaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const isNew = id === "new";

  const [coaRes, productsRes] = await Promise.all([
    isNew
      ? Promise.resolve({ data: null })
      : supabase
          .from("coa_documents")
          .select("*")
          .eq("id", id)
          .single<CoaDocument>(),
    supabase
      .from("products")
      .select("id, name")
      .eq("active", true)
      .order("name"),
  ]);

  if (!isNew && !coaRes.data) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        {isNew ? "Add COA Document" : "Edit COA Document"}
      </h1>
      <CoaForm
        coa={coaRes.data ?? undefined}
        products={(productsRes.data ?? []) as Product[]}
      />
    </div>
  );
}

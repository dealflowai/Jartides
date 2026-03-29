import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import type { Product, Category } from "@/lib/types";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [productRes, categoriesRes] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).single<Product>(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!productRes.data) notFound();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <DeleteProductButton productId={id} />
      </div>
      <ProductForm
        product={productRes.data}
        categories={(categoriesRes.data ?? []) as Category[]}
      />
    </div>
  );
}

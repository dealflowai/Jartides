import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/types";
import CategoriesSection from "./CategoriesSection";

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const [productsRes, categoriesRes] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  const items = (productsRes.data ?? []) as Product[];
  const categories = categoriesRes.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button href="/admin/products/new" size="sm">
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 mb-10">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Stock</th>
              <th className="px-4 py-3">Badge</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  {p.images?.[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatPrice(p.price)}
                </td>
                <td className="px-4 py-3 text-right">{p.stock_quantity}</td>
                <td className="px-4 py-3">
                  {p.badge ? (
                    <span className="inline-block rounded-full bg-[#1a6de3]/10 px-2.5 py-0.5 text-xs font-medium text-[#0b3d7a]">
                      {p.badge}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${
                      p.active ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-[#1a6de3] hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Categories Section */}
      <CategoriesSection initialCategories={categories} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface InventoryProduct {
  id: string;
  name: string;
  stock_quantity: number;
  low_stock_threshold: number;
  category: { name: string } | null;
}

function stockStatus(qty: number, threshold: number) {
  if (qty === 0) return { label: "Out", color: "text-red-700 bg-red-50" };
  if (qty <= threshold)
    return { label: "Low", color: "text-yellow-700 bg-yellow-50" };
  return { label: "OK", color: "text-green-700 bg-green-50" };
}

export default function InventoryTable({
  products,
}: {
  products: InventoryProduct[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveStock(id: string) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stock_quantity: parseInt(value) || 0 }),
      });
      if (!res.ok) throw new Error();
      setEditing(null);
      router.refresh();
    } catch {
      alert("Failed to update stock");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Threshold</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {products.map((p) => {
            const st = stockStatus(p.stock_quantity, p.low_stock_threshold);
            const isEditing = editing === p.id;
            return (
              <tr
                key={p.id}
                className={cn(
                  "transition",
                  p.stock_quantity === 0
                    ? "bg-red-50/50"
                    : p.stock_quantity <= p.low_stock_threshold
                      ? "bg-yellow-50/50"
                      : "hover:bg-gray-50"
                )}
              >
                <td className="px-4 py-3 font-medium text-gray-900">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {p.category?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  {isEditing ? (
                    <input
                      type="number"
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-right text-sm"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    p.stock_quantity
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {p.low_stock_threshold}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${st.color}`}
                  >
                    {st.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveStock(p.id)}
                        disabled={saving}
                        className="text-xs text-[#1a6de3] hover:underline"
                      >
                        {saving ? "..." : "Save"}
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="text-xs text-gray-400 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditing(p.id);
                        setValue(p.stock_quantity.toString());
                      }}
                      className="text-xs text-[#1a6de3] hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {products.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                No active products.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

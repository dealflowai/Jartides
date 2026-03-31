"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import DuplicateProductButton from "@/components/admin/DuplicateProductButton";
import BulkProductActions from "@/components/admin/BulkProductActions";
import type { Product } from "@/lib/types";

export default function ProductsTable({ items }: { items: Product[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = items.length > 0 && selected.size === items.length;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map((p) => p.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      <BulkProductActions
        selectedIds={[...selected]}
        onClear={() => setSelected(new Set())}
      />

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                />
              </th>
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
              <tr key={p.id} className={`hover:bg-gray-50 ${selected.has(p.id) ? "bg-blue-50/50" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                  />
                </td>
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
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-[#1a6de3] hover:underline"
                    >
                      Edit
                    </Link>
                    <DuplicateProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

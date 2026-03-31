"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
}

export default function DuplicateProductButton({ productId, productName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDuplicate() {
    if (!confirm(`Duplicate "${productName}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/duplicate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to duplicate");
      }

      const { id } = await res.json();
      router.push(`/admin/products/${id}`);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Duplicate failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={loading}
      className="inline-flex items-center gap-1 text-gray-400 hover:text-[#1a6de3] transition-colors disabled:opacity-50"
      title="Duplicate product"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="text-xs">Duplicate</span>
    </button>
  );
}

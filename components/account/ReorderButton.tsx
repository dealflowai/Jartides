"use client";

import { useState } from "react";
import { RefreshCw, Loader2, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import type { OrderItem } from "@/lib/types";

interface Props {
  items: OrderItem[];
}

export default function ReorderButton({ items }: Props) {
  const { addItem, openCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleReorder() {
    setLoading(true);

    try {
      // Fetch current product data to get slugs and images
      const productIds = [...new Set(items.map((i) => i.product_id))];
      const res = await fetch(`/api/search?ids=${productIds.join(",")}`);
      const products: { id: string; slug: string; images: string[]; price: number }[] = res.ok ? await res.json() : [];

      const productMap = new Map(products.map((p) => [p.id, p]));

      for (const item of items) {
        const product = productMap.get(item.product_id);
        addItem({
          productId: item.product_id,
          variantId: null,
          name: item.product_name,
          slug: product?.slug ?? "",
          price: product?.price ?? item.unit_price,
          size: "",
          image: product?.images?.[0] ?? null,
          purchaseType: "one-time",
          quantity: item.quantity,
        });
      }

      setDone(true);
      openCart();
      setTimeout(() => setDone(false), 3000);
    } catch {
      alert("Failed to add items to cart");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <Check className="h-4 w-4" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {done ? "Added to Cart!" : "Reorder"}
    </button>
  );
}

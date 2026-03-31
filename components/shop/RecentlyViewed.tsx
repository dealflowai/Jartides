"use client";

import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ProductCard from "@/components/shop/ProductCard";
import type { Product } from "@/lib/types";

interface RecentlyViewedProps {
  currentProductId: string;
  allProducts: Product[];
}

export default function RecentlyViewed({
  currentProductId,
  allProducts,
}: RecentlyViewedProps) {
  const { recentIds } = useRecentlyViewed();

  const products = recentIds
    .filter((id) => id !== currentProductId)
    .map((id) => allProducts.find((p) => p.id === id))
    .filter((p): p is Product => !!p)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)] mb-6">
        Recently Viewed
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {products.map((product) => (
          <div
            key={product.id}
            className="min-w-[260px] max-w-[300px] flex-shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

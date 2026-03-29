"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Product, Category } from "@/lib/types";

interface ShopContentProps {
  products: Product[];
  categories: Category[];
}

export default function ShopContent({ products, categories }: ShopContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") ?? "all";
  const [activeFilter, setActiveFilter] = useState(initialCategory);

  const handleFilter = useCallback(
    (slug: string) => {
      setActiveFilter(slug);
      const params = new URLSearchParams(searchParams.toString());
      if (slug === "all") {
        params.delete("category");
      } else {
        params.set("category", slug);
      }
      router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`, {
        scroll: false,
      });
    },
    [searchParams, router]
  );

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") return products;

    const matchedCategory = categories.find((c) => c.slug === activeFilter);
    if (!matchedCategory) return products;

    return products.filter((p) => p.category_id === matchedCategory.id);
  }, [activeFilter, products, categories]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Filter Pills */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => handleFilter(cat.slug)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 font-[family-name:var(--font-body)]",
              activeFilter === cat.slug
                ? "border-[#1a6de3] bg-[#1a6de3]/10 text-[#0b3d7a]"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lg text-gray-500 font-[family-name:var(--font-body)]">
            No products found in this category.
          </p>
        </div>
      )}
    </section>
  );
}

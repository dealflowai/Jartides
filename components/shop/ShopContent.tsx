"use client";

import { useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { X, ChevronDown, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/shop/ProductCard";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/constants";
import type { Product, Category, ProductTag } from "@/lib/types";

type SortOption =
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc"
  | "name-desc"
  | "best-sellers";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "best-sellers", label: "Best Sellers" },
];

function getEffectivePrice(product: Product): number {
  if (product.variants && product.variants.length > 0) {
    return Math.min(...product.variants.map((v) => v.price));
  }
  return product.price;
}

interface ShopContentProps {
  products: Product[];
  categories: Category[];
  tags?: ProductTag[];
}

export default function ShopContent({ products, categories, tags = [] }: ShopContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialCategory = searchParams.get("category") ?? "all";
  const searchQuery = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const [activeFilter, setActiveFilter] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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

  const clearAllFilters = useCallback(() => {
    setActiveFilter("all");
    setSortBy("newest");
    setPriceMin("");
    setPriceMax("");
    setActiveTag(null);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    router.replace(`/shop${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }, [searchParams, router]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilter !== "all") count++;
    if (sortBy !== "newest") count++;
    if (priceMin !== "") count++;
    if (priceMax !== "") count++;
    if (searchQuery) count++;
    if (activeTag) count++;
    return count;
  }, [activeFilter, sortBy, priceMin, priceMax, searchQuery, activeTag]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery) ||
          p.description?.toLowerCase().includes(searchQuery) ||
          p.category?.name?.toLowerCase().includes(searchQuery)
      );
    }

    // Filter by category
    if (activeFilter !== "all") {
      const matchedCategory = categories.find((c) => c.slug === activeFilter);
      if (matchedCategory) {
        filtered = filtered.filter((p) => p.category_id === matchedCategory.id);
      }
    }

    // Filter by tag
    if (activeTag) {
      filtered = filtered.filter((p) =>
        p.tags?.some((t) => t.slug === activeTag)
      );
    }

    // Filter by price range
    const min = priceMin !== "" ? parseFloat(priceMin) : null;
    const max = priceMax !== "" ? parseFloat(priceMax) : null;
    if (min !== null && !isNaN(min)) {
      filtered = filtered.filter((p) => getEffectivePrice(p) >= min);
    }
    if (max !== null && !isNaN(max)) {
      filtered = filtered.filter((p) => getEffectivePrice(p) <= max);
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "price-asc":
        sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
        break;
      case "price-desc":
        sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "best-sellers":
        sorted.sort((a, b) => {
          if (a.featured === b.featured) return 0;
          return a.featured ? -1 : 1;
        });
        break;
    }

    return sorted;
  }, [activeFilter, searchQuery, products, categories, priceMin, priceMax, sortBy, activeTag]);

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      {/* Search Banner */}
      {searchQuery && (
        <div className="mb-6 flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-sm text-gray-700">
            Showing results for <span className="font-semibold text-[#0b3d7a]">&quot;{searchQuery}&quot;</span>
            <span className="text-gray-400 ml-1">({filteredProducts.length} found)</span>
          </p>
          <button
            type="button"
            onClick={() => router.replace("/shop", { scroll: false })}
            className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Filter Pills Row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
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

      {/* Tag Pills */}
      {tags.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400 mr-1">Tags:</span>
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(activeTag === tag.slug ? null : tag.slug)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200",
                activeTag === tag.slug
                  ? "border-[#1a6de3] bg-[#1a6de3]/10 text-[#0b3d7a]"
                  : "border-gray-200 text-gray-500 hover:border-gray-400"
              )}
            >
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Sort, Price Range, and Active Filters Row */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={cn(
              "appearance-none rounded-full border border-gray-200 bg-white pl-4 pr-9 py-2 text-sm font-medium text-gray-600 transition-all duration-200 font-[family-name:var(--font-body)]",
              "hover:border-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]/30",
              sortBy !== "newest" && "border-[#1a6de3] bg-[#1a6de3]/10 text-[#0b3d7a]"
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Price Range Filter */}
        <div className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 transition-all duration-200 hover:border-gray-400 focus-within:border-[#1a6de3] focus-within:ring-1 focus-within:ring-[#1a6de3]/30">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <span className="text-xs text-gray-400 font-[family-name:var(--font-body)]">$</span>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min="0"
            className="w-16 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none font-[family-name:var(--font-body)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-gray-300">&ndash;</span>
          <span className="text-xs text-gray-400 font-[family-name:var(--font-body)]">$</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min="0"
            className="w-16 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none font-[family-name:var(--font-body)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active Filters Badge + Clear All */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#1a6de3]/10 px-3 py-1.5 text-xs font-semibold text-[#0b3d7a] font-[family-name:var(--font-body)]">
              {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"}
            </span>
            <button
              type="button"
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors font-[family-name:var(--font-body)]"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          </div>
        )}

        {/* Results Count */}
        <span className="text-sm text-gray-400 font-[family-name:var(--font-body)]">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </span>
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

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/shop/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function WishlistPage() {
  const { wishlistIds } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .in("id", wishlistIds)
      .eq("active", true)
      .then(({ data }) => {
        // Preserve wishlist order
        const map = new Map((data ?? []).map((p) => [p.id, p as Product]));
        setProducts(
          wishlistIds.map((id) => map.get(id)).filter((p): p is Product => !!p)
        );
        setLoading(false);
      });
  }, [wishlistIds]);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <h1 className="text-3xl font-bold tracking-tight text-[#0b3d7a] font-[family-name:var(--font-heading)] mb-8">
        My Wishlist
      </h1>

      {loading ? (
        <div className="py-20 text-center text-gray-400">Loading...</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <Heart className="mx-auto h-14 w-14 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500 font-[family-name:var(--font-body)] mb-2">
            Your wishlist is empty
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Browse our products and tap the heart icon to save items.
          </p>
          <Link
            href="/shop"
            className="inline-block rounded-lg bg-[#0b3d7a] px-7 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors"
          >
            Browse Products
          </Link>
        </div>
      )}
    </main>
  );
}

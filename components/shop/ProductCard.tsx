"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";
import { formatPrice, calculateSavings } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { ShoppingCart, Heart, Star, Bell } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const hasVariants = (product.variants?.length ?? 0) > 0;
  const isBackorder = product.badge?.toLowerCase() === "backorder";
  const isOutOfStock = isBackorder || (hasVariants
    ? product.variants!.every((v) => (v.stock_quantity ?? 0) <= 0)
    : (product.stock_quantity ?? 0) <= 0);
  const minPrice = hasVariants
    ? Math.min(...product.variants!.map((v) => v.price))
    : product.price;
  const savings = calculateSavings(
    minPrice,
    hasVariants ? product.variants![0].original_price : product.original_price
  );
  const image = product.images?.[0] ?? null;
  const hoverImage = product.images?.[1] ?? null;

  function handleAddToCart() {
    if (hasVariants) {
      router.push(`/shop/${product.slug}`);
      return;
    }
    addItem({
      productId: product.id,
      variantId: null,
      name: product.name,
      slug: product.slug,
      price: product.price,
      size: product.size,
      image,
      purchaseType: "one-time",
    });
  }

  return (
    <div
      className="group relative flex flex-col rounded-xl border bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 16px 32px rgba(11, 61, 122, 0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
        borderColor: hovered ? "#1a6de3" : "#e5e7eb",
      }}
    >
      {/* Badge */}
      {product.badge && (
        <span className="absolute top-3 left-3 z-10 rounded-md bg-[#1a6de3] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
          {product.badge}
        </span>
      )}

      {/* Savings badge */}
      {savings && (
        <span className="absolute top-3 right-3 z-10 rounded-md bg-green-500 px-2 py-1 text-[11px] font-bold text-white">
          -{savings}%
        </span>
      )}

      {/* Wishlist heart */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        className={`absolute ${savings ? "top-11" : "top-3"} right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 transition-colors hover:bg-white`}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart
          className={`h-4 w-4 transition-colors ${
            wishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        />
      </button>

      {/* Image with hover swap */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-[5/4] w-full overflow-hidden rounded-t-xl bg-white">
          {image ? (
            <>
              <Image
                src={image}
                alt={product.name}
                fill
                className={`object-contain p-1 transition-opacity duration-300 ${isOutOfStock ? "opacity-60 grayscale-[30%]" : ""}`}
                style={{ opacity: hovered && hoverImage && !isOutOfStock ? 0 : isOutOfStock ? 0.6 : 1 }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {hoverImage && !isOutOfStock && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} - Certificate of Analysis`}
                  fill
                  className="object-contain p-2 transition-opacity duration-300"
                  style={{ opacity: hovered ? 1 : 0 }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              <ShoppingCart className="h-12 w-12" />
            </div>
          )}

          {/* Out of Stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 bg-red-600/90 backdrop-blur-sm px-3 py-2 text-center">
              <p className="text-xs font-bold text-white uppercase tracking-wide">Out of Stock</p>
              <p className="text-[10px] text-red-100">Back in 1–2 Weeks</p>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-[#1a6de3] transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 text-xs text-gray-400">
          {product.category?.name}
          {hasVariants
            ? <> &middot; {product.variants!.slice().sort((a, b) => a.sort_order - b.sort_order).map((v) => v.size).join(", ")}</>
            : product.size && <> &middot; {product.size}</>}
        </p>

        {/* Star rating */}
        {(product.review_count ?? 0) > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3 w-3 ${s <= Math.round(product.avg_rating ?? 0) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.review_count})</span>
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#0b3d7a]">
            {hasVariants && "From "}{formatPrice(minPrice)}
          </span>
          {!hasVariants && product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {isOutOfStock ? (
            <Link
              href={`/shop/${product.slug}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
            >
              <Bell className="h-3.5 w-3.5" />
              Notify Me
            </Link>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1a6de3] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#155ec7]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {hasVariants ? "Select Size" : "Add to Cart"}
            </button>
          )}
          <Link
            href={`/shop/${product.slug}`}
            className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

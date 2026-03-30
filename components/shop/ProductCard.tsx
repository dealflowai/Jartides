"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice, calculateSavings } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);

  const savings = calculateSavings(product.price, product.original_price);
  const image = product.images?.[0] ?? null;
  const hoverImage = product.images?.[1] ?? null;

  function handleAddToCart() {
    addItem({
      productId: product.id,
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
      className="group relative flex flex-col rounded-xl border border-gray-200 bg-white"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 24px rgba(0, 0, 0, 0.1)" : "none",
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

      {/* Image with hover swap */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative h-[220px] w-full overflow-hidden rounded-t-xl bg-gray-100">
          {image ? (
            <>
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-contain p-4 transition-opacity duration-300"
                style={{ opacity: hovered && hoverImage ? 0 : 1 }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {hoverImage && (
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
          {product.size && <> &middot; {product.size}</>}
        </p>

        {/* Price */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#0b3d7a]">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1a6de3] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#155ec7]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </button>
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

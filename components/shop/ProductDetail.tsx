"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus } from "lucide-react";
import { cn, formatPrice, subscriptionPrice } from "@/lib/utils";
import { MAX_QUANTITY } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
}

type PurchaseType = "one-time" | "subscription";

const FEATURES = [
  "99%+ Purity — Third-Party Verified",
  "Certificate of Analysis Included",
  "Same-Day Processing",
  "3-8 Business Day Delivery",
  "Quality Guarantee",
  "For Research Use Only",
];

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, openCart } = useCart();
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  const sku = `JRT-${product.id.slice(0, 4).toUpperCase()}`;
  const images = product.images?.length ? product.images : [];
  const hasImages = images.length > 0;

  const displayPrice =
    purchaseType === "subscription"
      ? subscriptionPrice(product.price)
      : product.price;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      size: product.size,
      image: hasImages ? images[0] : null,
      purchaseType,
    quantity,
    });
    openCart();
  };

  const incrementQty = () =>
    setQuantity((q) => Math.min(q + 1, MAX_QUANTITY));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
      {/* LEFT — Gallery */}
      <div>
        {/* Main Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          {hasImages ? (
            <Image
              src={images[mainImage]}
              alt={product.name}
              fill
              className="object-contain p-4"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400 text-sm font-[family-name:var(--font-body)]">
              No image available
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={cn(
                  "relative h-16 w-16 overflow-hidden rounded-lg border-2 transition",
                  mainImage === i
                    ? "border-[#0b3d7a]"
                    : "border-transparent hover:border-gray-300"
                )}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — Product Info */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 font-[family-name:var(--font-heading)]">
          {product.name}
        </h1>

        <p className="mt-2 text-sm text-gray-500 font-[family-name:var(--font-body)]">
          SKU: {sku}
        </p>

        {/* Description */}
        <p className="mt-4 text-base leading-relaxed text-gray-700 font-[family-name:var(--font-body)]">
          {product.description}
        </p>

        {/* Research Description */}
        {product.research_description && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <p className="text-sm leading-relaxed text-gray-700 font-[family-name:var(--font-body)]">
              {product.research_description}
            </p>
          </div>
        )}

        {/* Price Row */}
        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            {formatPrice(displayPrice)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-lg text-gray-400 line-through font-[family-name:var(--font-body)]">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>

        {/* Purchase Type Toggle */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => setPurchaseType("one-time")}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
              purchaseType === "one-time"
                ? "border-[#0b3d7a] bg-[#0b3d7a]/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                purchaseType === "one-time"
                  ? "border-[#0b3d7a] bg-[#0b3d7a]"
                  : "border-gray-300"
              )}
            >
              {purchaseType === "one-time" && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
            <span className="font-medium text-gray-900 font-[family-name:var(--font-body)]">
              One-Time Purchase
            </span>
          </button>

          <button
            onClick={() => setPurchaseType("subscription")}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 px-4 py-3 text-left transition-all",
              purchaseType === "subscription"
                ? "border-[#0b3d7a] bg-[#0b3d7a]/5"
                : "border-gray-200 hover:border-gray-300"
            )}
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition",
                purchaseType === "subscription"
                  ? "border-[#0b3d7a] bg-[#0b3d7a]"
                  : "border-gray-300"
              )}
            >
              {purchaseType === "subscription" && (
                <span className="h-2 w-2 rounded-full bg-white" />
              )}
            </span>
            <span className="flex flex-col font-[family-name:var(--font-body)]">
              <span className="font-medium text-gray-900">
                Subscribe &amp; Save 15%
              </span>
              <span className="text-xs font-semibold text-green-600">
                Save 15%
              </span>
            </span>
          </button>
        </div>

        {/* Quantity Selector */}
        <div className="mt-6 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 font-[family-name:var(--font-body)]">
            Quantity
          </span>
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={decrementQty}
              disabled={quantity <= 1}
              className="flex h-10 w-10 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              min={1}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) setQuantity(Math.max(1, Math.min(val, MAX_QUANTITY)));
              }}
              className="h-10 w-12 border-x border-gray-200 bg-transparent text-center text-sm font-medium text-gray-900 outline-none font-[family-name:var(--font-body)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <button
              onClick={incrementQty}
              disabled={quantity >= MAX_QUANTITY}
              className="flex h-10 w-10 items-center justify-center text-gray-500 transition hover:text-gray-900 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart */}
        <Button
          variant="fill"
          size="lg"
          className="mt-6 w-full text-base"
          onClick={handleAddToCart}
        >
          Add to Cart
        </Button>

        {/* Features */}
        <ul className="mt-8 space-y-2.5">
          {FEATURES.map((feature) => (
            <li
              key={feature}
              className="flex items-center gap-2.5 text-sm text-gray-700 font-[family-name:var(--font-body)]"
            >
              <Check className="h-4.5 w-4.5 shrink-0 text-green-500" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

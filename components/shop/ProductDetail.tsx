"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Minus, Plus, Shield, Package, AlertTriangle, XCircle } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { MAX_QUANTITY } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import type { Product } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
}

const FEATURES = [
  "99%+ Purity, Third-Party Verified",
  "Certificate of Analysis Included",
  "Same-Day Processing",
  "3-8 Business Day Delivery",
  "Quality Guarantee",
  "For Research Use Only",
];

function getStockStatus(product: Product) {
  const qty = product.stock_quantity ?? 0;
  const threshold = product.low_stock_threshold ?? 10;

  if (qty <= 0) {
    return {
      label: "Out of Stock",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      icon: XCircle,
    };
  }
  if (qty <= threshold) {
    return {
      label: "Low Stock",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: AlertTriangle,
    };
  }
  return {
    label: "In Stock",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    icon: Package,
  };
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  const sku = `JRT-${product.id.slice(0, 4).toUpperCase()}`;
  const images = product.images?.length ? product.images : [];
  const hasImages = images.length > 0;
  const stockStatus = getStockStatus(product);
  const StockIcon = stockStatus.icon;
  const isOutOfStock = product.stock_quantity <= 0;

  const displayPrice = product.price;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      size: product.size,
      image: hasImages ? images[0] : null,
      purchaseType: "one-time",
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

          {/* Badge overlay */}
          {product.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-[#0b3d7a] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={cn(
                  "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition",
                  mainImage === i
                    ? "border-[#0b3d7a] ring-1 ring-[#0b3d7a]/20"
                    : "border-transparent hover:border-gray-300"
                )}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="80px"
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

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <p className="text-sm text-gray-500 font-[family-name:var(--font-body)]">
            SKU: {sku}
          </p>

          {/* Purity Badge */}
          {product.purity && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              <Shield className="h-3 w-3" />
              {product.purity} Purity
            </span>
          )}

          {/* Stock Status */}
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
              stockStatus.bgColor,
              stockStatus.borderColor,
              stockStatus.color
            )}
          >
            <StockIcon className="h-3 w-3" />
            {stockStatus.label}
          </span>
        </div>

        {/* Description */}
        <p className="mt-4 text-base leading-relaxed text-gray-700 font-[family-name:var(--font-body)]">
          {product.description}
        </p>

        {/* Research Description (rich text HTML) */}
        {product.research_description && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              Research Description
            </h3>
            <div
              className="prose prose-sm max-w-none text-gray-700 font-[family-name:var(--font-body)] prose-headings:text-gray-900 prose-a:text-[#1a6de3]"
              dangerouslySetInnerHTML={{ __html: product.research_description }}
            />
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

        {/* Purchase Type */}
        <div className="mt-6 flex flex-col gap-2">
          <div className="flex items-center gap-3 rounded-lg border-2 border-[#0b3d7a] bg-[#0b3d7a]/5 px-4 py-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#0b3d7a] bg-[#0b3d7a]">
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
            <span className="font-medium text-gray-900 font-[family-name:var(--font-body)]">
              One-Time Purchase
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 opacity-60 cursor-not-allowed">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-gray-300" />
            <span className="flex flex-col font-[family-name:var(--font-body)]">
              <span className="font-medium text-gray-500">
                Subscribe &amp; Save
              </span>
              <span className="text-xs font-semibold text-gray-400">
                Coming Soon
              </span>
            </span>
          </div>
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
          className={cn(
            "mt-6 w-full text-base",
            isOutOfStock && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
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

        {/* Related Products Placeholder */}
        <div className="mt-10 border-t border-gray-200 pt-8">
          <h3 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-heading)]">
            Related Products
          </h3>
          <p className="mt-2 text-sm text-gray-500 font-[family-name:var(--font-body)]">
            Related products coming soon.
          </p>
        </div>
      </div>
    </div>
  );
}

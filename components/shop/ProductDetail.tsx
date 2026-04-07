"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Check, Minus, Plus, Shield, Package, AlertTriangle, XCircle, FileText, ExternalLink } from "lucide-react";
import { getCoaUrl } from "@/lib/coa-url";
import DOMPurify from "isomorphic-dompurify";
import { cn, formatPrice } from "@/lib/utils";
import { MAX_QUANTITY } from "@/lib/constants";
import { useCart } from "@/hooks/useCart";
import Button from "@/components/ui/Button";
import ImageZoom from "@/components/shop/ImageZoom";
import ShareButtons from "@/components/shop/ShareButtons";
import BackInStockForm from "@/components/shop/BackInStockForm";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import type { Product, CoaDocument } from "@/lib/types";

interface ProductDetailProps {
  product: Product;
  coaDocuments?: CoaDocument[];
}

const FEATURES = [
  "99%+ Purity, Third-Party Verified",
  "Certificate of Analysis Included",
  "Same-Day Processing",
  "3-8 Business Day Delivery",
  "Quality Guarantee",
  "For Research Use Only",
];

function isBackorder(product: Product) {
  return product.badge?.toLowerCase() === "backorder";
}

function getStockStatus(product: Product) {
  const qty = product.stock_quantity ?? 0;
  const threshold = product.low_stock_threshold ?? 10;

  if (qty <= 0 || isBackorder(product)) {
    return {
      label: "Out of Stock — Back in 1–2 Weeks",
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

export default function ProductDetail({ product, coaDocuments = [] }: ProductDetailProps) {
  const { addItem, openCart } = useCart();
  const { addViewed } = useRecentlyViewed();
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    addViewed(product.id);
  }, [product.id, addViewed]);

  const variants = (product.variants?.filter((v) => v.active) ?? []).sort((a, b) => a.sort_order - b.sort_order);
  const hasVariants = variants.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    hasVariants ? variants[0].id : null
  );
  const selectedVariant = hasVariants
    ? variants.find((v) => v.id === selectedVariantId) ?? variants[0]
    : null;

  const sku = product.sku || selectedVariant?.sku || `JRT-${product.id.slice(0, 4).toUpperCase()}`;
  const variantImages = selectedVariant?.images?.length ? selectedVariant.images : null;
  const images = variantImages ?? (product.images?.length ? product.images : []);
  const hasImages = images.length > 0;

  const activeStock = selectedVariant?.stock_quantity ?? product.stock_quantity;
  const activeLowThreshold = selectedVariant?.low_stock_threshold ?? product.low_stock_threshold;
  const stockProduct = { ...product, stock_quantity: activeStock, low_stock_threshold: activeLowThreshold };
  const stockStatus = getStockStatus(stockProduct);
  const StockIcon = stockStatus.icon;
  const isOutOfStock = activeStock <= 0 || isBackorder(product);

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayOriginalPrice = selectedVariant?.original_price ?? product.original_price;
  const displaySize = selectedVariant?.size ?? product.size;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant?.id ?? null,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      size: displaySize,
      image: hasImages ? images[0] : null,
      purchaseType: "one-time",
      quantity,
    });
    openCart();
  };

  const incrementQty = () =>
    setQuantity((q) => Math.min(q + 1, MAX_QUANTITY));
  const decrementQty = () => setQuantity((q) => Math.max(q - 1, 1));

  // Mobile swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && mainImage < images.length - 1) {
        setMainImage((i) => i + 1);
      } else if (diff < 0 && mainImage > 0) {
        setMainImage((i) => i - 1);
      }
    }
  }, [mainImage, images.length]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14">
      {/* LEFT — Gallery */}
      <div>
        {/* Main Image with Zoom + Swipe */}
        {hasImages ? (
          <div className="relative" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            <ImageZoom src={images[mainImage]} alt={product.name} priority />
            {/* Image counter (mobile) */}
            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                {images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === mainImage ? "w-4 bg-[#0b3d7a]" : "w-1.5 bg-gray-300"}`}
                  />
                ))}
              </div>
            )}
            {/* Badge overlay */}
            {product.badge && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-[#0b3d7a] px-3 py-1 text-xs font-semibold text-white shadow-sm pointer-events-none">
                {product.badge}
              </span>
            )}
          </div>
        ) : (
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-white border border-gray-200">
            <div className="flex h-full items-center justify-center text-gray-400 text-sm font-[family-name:var(--font-body)]">
              No image available
            </div>
          </div>
        )}

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
        <div
          className="mt-4 prose prose-sm max-w-none text-gray-700 font-[family-name:var(--font-body)] prose-headings:text-gray-900 prose-a:text-[#1a6de3]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
        />

        {/* Research Description (rich text HTML) */}
        {product.research_description && (
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              Research Description
            </h3>
            <div
              className="prose prose-sm max-w-none text-gray-700 font-[family-name:var(--font-body)] prose-headings:text-gray-900 prose-a:text-[#1a6de3]"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.research_description) }}
            />
          </div>
        )}

        {/* Variant Selector */}
        {hasVariants && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-gray-700 font-[family-name:var(--font-body)]">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const isSelected = v.id === selectedVariantId;
                const outOfStock = v.stock_quantity <= 0;
                return (
                  <button
                    key={v.id}
                    onClick={() => !outOfStock && setSelectedVariantId(v.id)}
                    disabled={outOfStock}
                    className={cn(
                      "rounded-lg border-2 px-4 py-2.5 text-sm font-semibold transition-all",
                      isSelected
                        ? "border-[#0b3d7a] bg-[#0b3d7a]/5 text-[#0b3d7a]"
                        : outOfStock
                        ? "border-gray-200 bg-gray-50 text-gray-300 cursor-not-allowed line-through"
                        : "border-gray-200 text-gray-700 hover:border-[#1a6de3] hover:text-[#1a6de3]"
                    )}
                  >
                    <span>{v.size}</span>
                    <span className="ml-2 text-xs font-normal">
                      {formatPrice(v.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Row */}
        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            {formatPrice(displayPrice)}
          </span>
          {displayOriginalPrice && displayOriginalPrice > displayPrice && (
            <span className="text-lg text-gray-400 line-through font-[family-name:var(--font-body)]">
              {formatPrice(displayOriginalPrice)}
            </span>
          )}
        </div>

        {/* Purchase Type */}
        {!isOutOfStock && (
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
                Subscribe
              </span>
              <span className="text-xs font-semibold text-gray-400">
                Coming Soon
              </span>
            </span>
          </div>
        </div>
        )}

        {/* Quantity Selector */}
        {!isOutOfStock && (
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
              aria-label="Quantity"
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
        )}

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

        {/* Back in stock notification */}
        {isOutOfStock && (
          <BackInStockForm productId={product.id} productName={product.name} />
        )}

        {/* Share */}
        <div className="mt-4">
          <ShareButtons
            url={typeof window !== "undefined" ? window.location.href : `https://jartides.ca/shop/${product.slug}`}
            title={product.name}
          />
        </div>

        {/* Video Embed */}
        {product.video_url && (
          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 font-[family-name:var(--font-heading)]">
              Product Video
            </h3>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200">
              {product.video_url.includes("youtube.com") || product.video_url.includes("youtu.be") ? (
                <iframe
                  src={`https://www.youtube.com/embed/${product.video_url.includes("youtu.be") ? product.video_url.split("/").pop()?.split("?")[0] : new URL(product.video_url).searchParams.get("v")}`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`${product.name} video`}
                />
              ) : product.video_url.includes("tiktok.com") ? (
                <a
                  href={product.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full items-center justify-center bg-gray-50 text-sm text-[#1a6de3] hover:underline"
                >
                  Watch on TikTok
                </a>
              ) : (
                <video src={product.video_url} controls className="absolute inset-0 h-full w-full object-contain" />
              )}
            </div>
          </div>
        )}

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

        {/* Certificate of Analysis */}
        {coaDocuments.length > 0 && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2.5 border-b border-gray-100 px-5 py-4">
              <Shield className="h-5 w-5 text-[#0b3d7a]" />
              <h3 className="text-sm font-semibold text-gray-900 font-[family-name:var(--font-heading)]">
                Certificate of Analysis
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {coaDocuments.map((coa) => (
                <div key={coa.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1a6de3]" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 font-[family-name:var(--font-body)]">
                        Batch {coa.batch_number}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-semibold text-green-600">
                          {coa.purity_percentage}% Purity
                        </span>
                        {coa.test_date && (
                          <span className="text-xs text-gray-400">
                            Tested {new Date(coa.test_date).toLocaleDateString("en-CA", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {coa.pdf_url ? (
                    <a
                      href={getCoaUrl(coa.pdf_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a6de3] px-3 py-1.5 text-xs font-semibold text-[#1a6de3] transition-colors hover:bg-[#1a6de3] hover:text-white"
                    >
                      View PDF
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

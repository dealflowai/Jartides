import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Product } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "CAD"): string {
  const formatted = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency,
  }).format(amount);
  return `${formatted} ${currency}`;
}

export function generateOrderNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "JRT-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculateSavings(
  price: number,
  originalPrice: number | null
): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function subscriptionPrice(price: number): number {
  return Math.round(price * 0.85 * 100) / 100;
}

/**
 * A product is out of stock if it's flagged as backorder, or every variant
 * (or the base SKU when there are no variants) has zero stock.
 */
export function isProductOutOfStock(product: Pick<Product, "badge" | "stock_quantity" | "variants">): boolean {
  if (product.badge?.toLowerCase() === "backorder") return true;
  const variants = product.variants;
  if (variants && variants.length > 0) {
    return variants.every((v) => (v.stock_quantity ?? 0) <= 0);
  }
  return (product.stock_quantity ?? 0) <= 0;
}

/**
 * Stable sort that pushes out-of-stock products to the bottom while preserving
 * the existing order within each group. Returns a new array.
 */
export function sortInStockFirst<T extends Pick<Product, "badge" | "stock_quantity" | "variants">>(
  products: T[],
): T[] {
  return [...products].sort((a, b) => {
    const aOut = isProductOutOfStock(a) ? 1 : 0;
    const bOut = isProductOutOfStock(b) ? 1 : 0;
    return aOut - bOut;
  });
}

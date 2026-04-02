import { describe, it, expect } from "vitest";
import { TAX_RATE } from "@/lib/constants";

/**
 * Test the server-side pricing logic used in checkout.
 * This mirrors the exact calculation in app/api/checkout/route.ts
 * to ensure pricing is correct before real money is involved.
 */

interface MockProduct {
  id: string;
  price: number;
  stock_quantity: number;
  active: boolean;
}

interface MockVariant {
  id: string;
  price: number;
  stock_quantity: number;
}

interface MockCartItem {
  productId: string;
  variantId: string | null;
  quantity: number;
}

function calculateSubtotal(
  items: MockCartItem[],
  productMap: Map<string, MockProduct>,
  variantMap: Map<string, MockVariant>
): number {
  return items.reduce((sum, item) => {
    if (item.variantId) {
      const variant = variantMap.get(item.variantId)!;
      return sum + variant.price * item.quantity;
    }
    const product = productMap.get(item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
}

function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

function calculateTotal(subtotal: number, shippingCost: number, tax: number): number {
  return Math.round((subtotal + shippingCost + tax) * 100) / 100;
}

function validateStock(
  items: MockCartItem[],
  productMap: Map<string, MockProduct>,
  variantMap: Map<string, MockVariant>
): string | null {
  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) return `Product not found: ${item.productId}`;
    if (!product.active) return `Product inactive: ${item.productId}`;

    if (item.variantId) {
      const variant = variantMap.get(item.variantId);
      if (!variant) return `Variant not found: ${item.variantId}`;
      if (variant.stock_quantity < item.quantity)
        return `Insufficient stock for variant ${item.variantId}`;
    } else {
      if (product.stock_quantity < item.quantity)
        return `Insufficient stock for ${item.productId}`;
    }
  }
  return null;
}

const products: MockProduct[] = [
  { id: "p1", price: 49.99, stock_quantity: 10, active: true },
  { id: "p2", price: 79.99, stock_quantity: 5, active: true },
  { id: "p3", price: 29.99, stock_quantity: 0, active: true },
  { id: "p4", price: 99.99, stock_quantity: 10, active: false },
];
const productMap = new Map(products.map((p) => [p.id, p]));

const variants: MockVariant[] = [
  { id: "v1", price: 39.99, stock_quantity: 3 },
  { id: "v2", price: 89.99, stock_quantity: 0 },
];
const variantMap = new Map(variants.map((v) => [v.id, v]));

describe("Pricing calculations", () => {
  it("calculates subtotal for a single product", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: null, quantity: 2 }];
    expect(calculateSubtotal(items, productMap, variantMap)).toBe(99.98);
  });

  it("calculates subtotal using variant price when variant exists", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: "v1", quantity: 1 }];
    expect(calculateSubtotal(items, productMap, variantMap)).toBe(39.99);
  });

  it("calculates subtotal for multiple items", () => {
    const items: MockCartItem[] = [
      { productId: "p1", variantId: null, quantity: 1 },
      { productId: "p2", variantId: null, quantity: 2 },
    ];
    expect(calculateSubtotal(items, productMap, variantMap)).toBe(49.99 + 79.99 * 2);
  });

  it("applies 13% HST tax", () => {
    expect(TAX_RATE).toBe(0.13);
    expect(calculateTax(100)).toBe(13);
  });

  it("rounds tax to 2 decimal places", () => {
    expect(calculateTax(33.33)).toBe(4.33);
  });

  it("calculates correct total", () => {
    const subtotal = 100;
    const shipping = 15;
    const tax = calculateTax(subtotal);
    expect(calculateTotal(subtotal, shipping, tax)).toBe(128);
  });

  it("rounds total to 2 decimal places", () => {
    const result = calculateTotal(33.33, 15.55, 4.33);
    expect(result).toBe(53.21);
  });
});

describe("Stock validation", () => {
  it("returns null when stock is sufficient", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: null, quantity: 5 }];
    expect(validateStock(items, productMap, variantMap)).toBeNull();
  });

  it("detects insufficient product stock", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: null, quantity: 999 }];
    expect(validateStock(items, productMap, variantMap)).toContain("Insufficient stock");
  });

  it("detects zero stock", () => {
    const items: MockCartItem[] = [{ productId: "p3", variantId: null, quantity: 1 }];
    expect(validateStock(items, productMap, variantMap)).toContain("Insufficient stock");
  });

  it("detects inactive product", () => {
    const items: MockCartItem[] = [{ productId: "p4", variantId: null, quantity: 1 }];
    expect(validateStock(items, productMap, variantMap)).toContain("inactive");
  });

  it("detects missing product", () => {
    const items: MockCartItem[] = [{ productId: "missing", variantId: null, quantity: 1 }];
    expect(validateStock(items, productMap, variantMap)).toContain("not found");
  });

  it("validates variant stock separately", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: "v2", quantity: 1 }];
    expect(validateStock(items, productMap, variantMap)).toContain("Insufficient stock");
  });

  it("detects missing variant", () => {
    const items: MockCartItem[] = [{ productId: "p1", variantId: "missing", quantity: 1 }];
    expect(validateStock(items, productMap, variantMap)).toContain("not found");
  });
});

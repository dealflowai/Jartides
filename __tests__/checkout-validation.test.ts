import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror the checkout schemas from the API route so we can test validation
// without importing Next.js server code
const CartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable(),
  name: z.string(),
  slug: z.string(),
  price: z.number(),
  size: z.string(),
  image: z.string().nullable(),
  quantity: z.number().int().positive(),
  purchaseType: z.enum(["one-time", "subscription"]),
});

const ShippingSchema = z.object({
  fullName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().nullable(),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

const ShippingRateSchema = z.object({
  id: z.string(),
  carrier: z.string(),
  service: z.string(),
  rate: z.number().min(0).max(500),
  shipment_id: z.string(),
});

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
  shipping: ShippingSchema,
  email: z.string().email(),
  paymentMethod: z.enum(["stripe"]),
  researchDisclaimerAccepted: z.literal(true),
  ageVerified: z.literal(true),
  termsAccepted: z.literal(true),
  shippingRate: ShippingRateSchema,
  createAccount: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

const validItem = {
  productId: "550e8400-e29b-41d4-a716-446655440000",
  variantId: null,
  name: "BPC-157",
  slug: "bpc-157",
  price: 49.99,
  size: "5mg",
  image: null,
  quantity: 1,
  purchaseType: "one-time" as const,
};

const validShipping = {
  fullName: "John Doe",
  line1: "123 Main St",
  line2: null,
  city: "Windsor",
  province: "ON",
  postalCode: "N9A 1A1",
  country: "CA",
};

const validRate = {
  id: "rate_123",
  carrier: "Canada Post",
  service: "Regular",
  rate: 15,
  shipment_id: "ship_123",
};

const validCheckout = {
  items: [validItem],
  shipping: validShipping,
  email: "test@example.com",
  paymentMethod: "stripe" as const,
  researchDisclaimerAccepted: true as const,
  ageVerified: true as const,
  termsAccepted: true as const,
  shippingRate: validRate,
};

describe("CartItemSchema", () => {
  it("accepts a valid cart item", () => {
    expect(CartItemSchema.safeParse(validItem).success).toBe(true);
  });

  it("rejects non-UUID productId", () => {
    expect(CartItemSchema.safeParse({ ...validItem, productId: "abc" }).success).toBe(false);
  });

  it("rejects zero quantity", () => {
    expect(CartItemSchema.safeParse({ ...validItem, quantity: 0 }).success).toBe(false);
  });

  it("rejects negative quantity", () => {
    expect(CartItemSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false);
  });

  it("rejects decimal quantity", () => {
    expect(CartItemSchema.safeParse({ ...validItem, quantity: 1.5 }).success).toBe(false);
  });

  it("rejects invalid purchase type", () => {
    expect(CartItemSchema.safeParse({ ...validItem, purchaseType: "monthly" }).success).toBe(false);
  });
});

describe("ShippingSchema", () => {
  it("accepts valid shipping address", () => {
    expect(ShippingSchema.safeParse(validShipping).success).toBe(true);
  });

  it("rejects empty full name", () => {
    expect(ShippingSchema.safeParse({ ...validShipping, fullName: "" }).success).toBe(false);
  });

  it("rejects empty address line1", () => {
    expect(ShippingSchema.safeParse({ ...validShipping, line1: "" }).success).toBe(false);
  });

  it("allows null line2", () => {
    expect(ShippingSchema.safeParse({ ...validShipping, line2: null }).success).toBe(true);
  });
});

describe("ShippingRateSchema", () => {
  it("rejects rate over 500", () => {
    expect(ShippingRateSchema.safeParse({ ...validRate, rate: 501 }).success).toBe(false);
  });

  it("rejects negative rate", () => {
    expect(ShippingRateSchema.safeParse({ ...validRate, rate: -1 }).success).toBe(false);
  });
});

describe("CheckoutSchema", () => {
  it("accepts a valid checkout", () => {
    expect(CheckoutSchema.safeParse(validCheckout).success).toBe(true);
  });

  it("rejects empty cart", () => {
    const result = CheckoutSchema.safeParse({ ...validCheckout, items: [] });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    expect(CheckoutSchema.safeParse({ ...validCheckout, email: "not-email" }).success).toBe(false);
  });

  it("rejects unsupported payment method", () => {
    expect(CheckoutSchema.safeParse({ ...validCheckout, paymentMethod: "bitcoin" }).success).toBe(false);
  });

  it("requires research disclaimer accepted", () => {
    expect(
      CheckoutSchema.safeParse({ ...validCheckout, researchDisclaimerAccepted: false }).success
    ).toBe(false);
  });

  it("requires age verification", () => {
    expect(CheckoutSchema.safeParse({ ...validCheckout, ageVerified: false }).success).toBe(false);
  });

  it("requires terms accepted", () => {
    expect(CheckoutSchema.safeParse({ ...validCheckout, termsAccepted: false }).success).toBe(false);
  });

  it("rejects password shorter than 8 chars when creating account", () => {
    const result = CheckoutSchema.safeParse({
      ...validCheckout,
      createAccount: true,
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid password for account creation", () => {
    const result = CheckoutSchema.safeParse({
      ...validCheckout,
      createAccount: true,
      password: "validpass123",
    });
    expect(result.success).toBe(true);
  });
});

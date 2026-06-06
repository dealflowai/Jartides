import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOrderNumber } from "@/lib/utils";
import { rateLimit } from "@/lib/rate-limit";
import { verifyCsrf } from "@/lib/csrf";
import { logger } from "@/lib/logger";

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
  phone: z.string().nullable().optional(),
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
  paymentMethod: z.literal("etransfer"),
  researchDisclaimerAccepted: z.literal(true),
  ageVerified: z.literal(true),
  termsAccepted: z.literal(true),
  shippingRate: ShippingRateSchema,
  discountCode: z.string().trim().min(1).max(64).optional(),
  createAccount: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^A-Za-z0-9]/, "Password must contain a special character")
    .optional(),
});

import { TAX_RATE } from "@/lib/constants";

export async function POST(request: NextRequest) {
  const csrfError = verifyCsrf(request);
  if (csrfError) return csrfError;

  const rateLimited = await rateLimit(request, { limit: 5, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const log = logger.child({ route: "/api/checkout" });

  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, shipping, email, paymentMethod, researchDisclaimerAccepted, ageVerified, termsAccepted, shippingRate, discountCode, createAccount, password } = parsed.data;
    const supabase = createAdminClient();

    // Fetch actual prices from database — never trust client prices
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, active, badge")
      .in("id", productIds);

    if (productsError || !products) {
      log.error("Failed to verify products", { error: productsError?.message });
      return NextResponse.json(
        { error: "Failed to verify products" },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Fetch variants if any items have variantId
    const variantIds = items.map((i) => i.variantId).filter(Boolean) as string[];
    const variantMap = new Map<string, { price: number; stock_quantity: number; size: string }>();
    if (variantIds.length > 0) {
      const { data: variants } = await supabase
        .from("product_variants")
        .select("id, price, stock_quantity, size, active")
        .in("id", variantIds);

      for (const v of variants ?? []) {
        if (v.active) variantMap.set(v.id, v);
      }
    }

    // Validate all products exist, are active, and in stock
    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.name}` },
          { status: 400 }
        );
      }
      if (!product.active) {
        return NextResponse.json(
          { error: `Product is no longer available: ${product.name}` },
          { status: 400 }
        );
      }
      if (product.badge?.toLowerCase() === "backorder") {
        return NextResponse.json(
          { error: `${product.name} is currently on backorder and cannot be purchased yet.` },
          { status: 400 }
        );
      }

      // Use variant stock/price if applicable
      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Variant not found for ${product.name}` },
            { status: 400 }
          );
        }
        if (variant.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name} (${variant.size}). Only ${variant.stock_quantity} available.` },
            { status: 400 }
          );
        }
      } else {
        if (product.stock_quantity < item.quantity) {
          return NextResponse.json(
            { error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.` },
            { status: 400 }
          );
        }
      }
    }

    // Calculate totals from verified DB prices
    const subtotal = items.reduce((sum, item) => {
      if (item.variantId) {
        const variant = variantMap.get(item.variantId)!;
        return sum + variant.price * item.quantity;
      }
      const product = productMap.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    // Re-validate the discount code server-side and recompute the discount from
    // DB values — never trust the client for the amount. If a code was applied at
    // checkout but is no longer valid (expired, maxed out, min no longer met),
    // reject so we never silently charge full price for an order the customer
    // thought was discounted.
    let appliedCode: string | null = null;
    let discountAmount = 0;
    if (discountCode) {
      const normalizedCode = discountCode.toUpperCase().trim();
      const { data: dc } = await supabase
        .from("discount_codes")
        .select("code, type, value, min_order_amount, max_uses, used_count, active, expires_at")
        .eq("code", normalizedCode)
        .single();

      const codeUnusable =
        !dc ||
        !dc.active ||
        (dc.expires_at && new Date(dc.expires_at) < new Date()) ||
        (dc.max_uses !== null && dc.used_count >= dc.max_uses) ||
        subtotal < Number(dc.min_order_amount);

      if (codeUnusable) {
        return NextResponse.json(
          { error: "The discount code is no longer valid. Please remove it and try again." },
          { status: 400 }
        );
      }

      if (dc.type === "percentage") {
        discountAmount = Math.round(subtotal * (Number(dc.value) / 100) * 100) / 100;
      } else {
        discountAmount = Math.min(Number(dc.value), subtotal);
      }
      appliedCode = dc.code;
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingCost = shippingRate.rate;
    const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
    const total = Math.round((discountedSubtotal + shippingCost + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();

    // Create order in database first.
    // Status starts as `awaiting_payment` — payment is via manual Interac E-Transfer.
    // Admin manually flips to `processing` after verifying the E-Transfer payment.
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        guest_email: email,
        status: "awaiting_payment",
        subtotal,
        discount_code: appliedCode,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        tax,
        total,
        currency: "CAD",
        shipping_name: shipping.fullName,
        shipping_line1: shipping.line1,
        shipping_line2: shipping.line2,
        shipping_city: shipping.city,
        shipping_province: shipping.province,
        shipping_postal: shipping.postalCode,
        shipping_country: shipping.country,
        shipping_phone: shipping.phone || null,
        payment_method: paymentMethod,
        carrier: shippingRate.carrier,
        shippo_shipment_id: shippingRate.shipment_id,
        shippo_rate_id: shippingRate.id,
        research_disclaimer_accepted: researchDisclaimerAccepted,
        age_verified: ageVerified,
        terms_accepted: termsAccepted,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      log.error("Failed to create order", { error: orderError?.message, email });
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const variant = item.variantId ? variantMap.get(item.variantId) : null;
      return {
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId ?? null,
        product_name: product.name,
        variant_size: variant?.size ?? null,
        quantity: item.quantity,
        unit_price: variant?.price ?? product.price,
        purchase_type: item.purchaseType,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      log.error("Failed to create order items", { orderId: order.id, error: itemsError.message });
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    // Record the redemption so the admin "Uses" count reflects reality. The
    // order is already placed at this point, so a failure here shouldn't fail
    // the checkout — just log it.
    if (appliedCode) {
      const { error: usageError } = await supabase.rpc("increment_discount_usage", {
        p_code: appliedCode,
      });
      if (usageError) {
        log.warn("Failed to increment discount usage", {
          orderId: order.id,
          code: appliedCode,
          error: usageError.message,
        });
      }
    }

    // No payment session — customer pays manually via Interac E-Transfer.
    // The frontend redirects to /checkout/payment-instructions?order_id=...
    // Admin verifies the incoming payment and flips the status to processing.

    // Create account if opted in (uses signUp to trigger verification email)
    let accountCreated = false;
    if (createAccount && password) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

      // Use a separate Supabase client for signUp (not admin) so it triggers confirmation email
      const { createClient } = await import("@supabase/supabase-js");
      const signupClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: signupData, error: signupError } = await signupClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: shipping.fullName },
          emailRedirectTo: `${siteUrl}/api/auth/callback`,
        },
      });

      if (signupError) {
        log.warn("Account creation failed", { email, error: signupError.message });
      }

      if (signupData?.user) {
        accountCreated = true;
        // Link guest orders (including the one just placed) to the new account
        await supabase
          .from("orders")
          .update({ user_id: signupData.user.id })
          .eq("guest_email", email)
          .neq("status", "pending");
      }
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      accountCreated,
    });
  } catch (err) {
    log.error("Checkout error", { error: String(err) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

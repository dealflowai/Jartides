import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe";
import { generateOrderNumber } from "@/lib/utils";

const CartItemSchema = z.object({
  productId: z.string().uuid(),
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

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
  shipping: ShippingSchema,
  email: z.string().email(),
  paymentMethod: z.enum(["stripe", "paypal"]),
});

const SHIPPING_COST = 15;
const TAX_RATE = 0.13;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items, shipping, email, paymentMethod } = parsed.data;
    const supabase = createAdminClient();

    // Fetch actual prices from database — never trust client prices
    const productIds = items.map((item) => item.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, active")
      .in("id", productIds);

    if (productsError || !products) {
      return NextResponse.json(
        { error: "Failed to verify products" },
        { status: 500 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

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
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Only ${product.stock_quantity} available.`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate totals from verified DB prices
    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + product.price * item.quantity;
    }, 0);

    const shippingCost = SHIPPING_COST;
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = Math.round((subtotal + shippingCost + tax) * 100) / 100;

    const orderNumber = generateOrderNumber();

    let stripePaymentIntentId: string | null = null;
    let clientSecret: string | null = null;

    // Create Stripe PaymentIntent if paying by card
    if (paymentMethod === "stripe") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // cents
        currency: "cad",
        metadata: { orderNumber, email },
      });
      stripePaymentIntentId = paymentIntent.id;
      clientSecret = paymentIntent.client_secret;
    }

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        guest_email: email,
        status: "pending",
        subtotal,
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
        payment_method: paymentMethod,
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Create order items
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        purchase_type: item.purchaseType,
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      // Clean up order if items fail
      await supabase.from("orders").delete().eq("id", order.id);
      return NextResponse.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      ...(clientSecret && { clientSecret }),
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

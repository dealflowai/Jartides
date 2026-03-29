"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import Button from "@/components/ui/Button";
import {
  CreditCard,
  Truck,
  CheckCircle,
  ChevronRight,
  Loader2,
} from "lucide-react";

type PaymentMethod = "stripe" | "paypal";

interface ShippingForm {
  fullName: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

const SHIPPING_COST = 15;
const TAX_RATE = 0.13;

const steps = [
  { id: 1, label: "Shipping", icon: Truck },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Confirmation", icon: CheckCircle },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: "",
    email: "",
    line1: "",
    line2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "CA",
  });

  useEffect(() => {
    if (items.length === 0 && !clientSecret) {
      router.push("/shop");
    }
  }, [items, router, clientSecret]);

  const tax = subtotal * TAX_RATE;
  const total = subtotal + SHIPPING_COST + tax;

  function handleShippingChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setShipping((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function isShippingValid() {
    return (
      shipping.fullName.trim() !== "" &&
      shipping.email.trim() !== "" &&
      shipping.line1.trim() !== "" &&
      shipping.city.trim() !== "" &&
      shipping.province.trim() !== "" &&
      shipping.postalCode.trim() !== "" &&
      shipping.country.trim() !== ""
    );
  }

  function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (isShippingValid()) {
      setCurrentStep(2);
      setError(null);
    }
  }

  async function handlePlaceOrder() {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: {
            fullName: shipping.fullName,
            line1: shipping.line1,
            line2: shipping.line2 || null,
            city: shipping.city,
            province: shipping.province,
            postalCode: shipping.postalCode,
            country: shipping.country,
          },
          email: shipping.email,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      if (paymentMethod === "stripe" && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setCurrentStep(3);
        // Stripe Elements will be wired up here later
      } else {
        clearCart();
        router.push(`/checkout/success?order_id=${data.orderId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0 && !clientSecret) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fc] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Progress Indicator */}
        <nav className="mb-10">
          <ol className="flex items-center justify-center gap-2 sm:gap-4">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              return (
                <li key={step.id} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[#0b3d7a] text-white"
                          : isComplete
                            ? "bg-[#1a6de3] text-white"
                            : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </span>
                    <span
                      className={`hidden text-sm font-medium sm:block ${
                        isActive
                          ? "text-[#0b3d7a]"
                          : isComplete
                            ? "text-[#1a6de3]"
                            : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-300" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <form
                onSubmit={handleContinueToPayment}
                className="rounded-xl bg-white p-6 shadow-sm sm:p-8"
              >
                <h2 className="mb-6 text-xl font-bold text-[#0b3d7a]">
                  Shipping Information
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={shipping.fullName}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={shipping.email}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      name="line1"
                      required
                      value={shipping.line1}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="line2"
                      value={shipping.line2}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="Apt, Suite, Unit (optional)"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="Toronto"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Province / State *
                    </label>
                    <input
                      type="text"
                      name="province"
                      required
                      value={shipping.province}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="ON"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={shipping.postalCode}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                      placeholder="M5V 1A1"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Country *
                    </label>
                    <select
                      name="country"
                      required
                      value={shipping.country}
                      onChange={handleShippingChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm transition-colors focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
                    >
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button type="submit" variant="fill" size="lg">
                    Continue to Payment
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-bold text-[#0b3d7a]">
                  Payment Method
                </h2>

                {/* Payment Tabs */}
                <div className="mb-6 flex gap-2 rounded-lg bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("stripe")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                      paymentMethod === "stripe"
                        ? "bg-white text-[#0b3d7a] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    Credit / Debit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("paypal")}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                      paymentMethod === "paypal"
                        ? "bg-white text-[#0b3d7a] shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    PayPal
                  </button>
                </div>

                {/* Stripe Card Input Placeholder */}
                {paymentMethod === "stripe" && (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                    <CreditCard className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      Stripe Elements card input will appear here.
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Secure payment processing by Stripe
                    </p>
                  </div>
                )}

                {/* PayPal Placeholder */}
                {paymentMethod === "paypal" && (
                  <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                    <p className="text-sm font-medium text-gray-500">
                      PayPal integration coming soon
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      You will be redirected to PayPal to complete payment.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-sm font-medium text-[#1a6de3] hover:underline"
                  >
                    Back to Shipping
                  </button>
                  <Button
                    variant="fill"
                    size="lg"
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Place Order - ${formatPrice(total)}`
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation / Stripe Elements */}
            {currentStep === 3 && clientSecret && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <h2 className="mb-6 text-xl font-bold text-[#0b3d7a]">
                  Complete Payment
                </h2>
                <div className="rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                  <CreditCard className="mx-auto mb-3 h-10 w-10 text-[#1a6de3]" />
                  <p className="text-sm text-gray-600">
                    Stripe Payment Element will be mounted here with
                    clientSecret.
                  </p>
                  <p className="mt-2 text-xs font-mono text-gray-400 break-all">
                    {clientSecret.slice(0, 25)}...
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-[#0b3d7a]">
                Order Summary
              </h3>

              <ul className="mb-4 divide-y divide-gray-100">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.purchaseType}`}
                    className="flex gap-3 py-3"
                  >
                    {item.image && (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.size} &middot; Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(SHIPPING_COST)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (13% HST)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 text-base font-bold text-[#0b3d7a]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_COST, TAX_RATE } from "@/lib/constants";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import {
  CreditCard,
  Truck,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Shield,
  Lock,
  AlertTriangle,
} from "lucide-react";

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

const INITIAL_SHIPPING: ShippingForm = {
  fullName: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  province: "",
  postalCode: "",
  country: "CA",
};

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [compliance, setCompliance] = useState({
    researchDisclaimer: false,
    ageVerified: false,
    termsAccepted: false,
  });
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState<{
    discount: number;
    type: string;
    message: string;
  } | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  const discountAmount = discountData?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + SHIPPING_COST + tax) * 100) / 100;

  useEffect(() => {
    if (items.length === 0 && !clientSecret && !orderId) {
      router.push("/shop");
    }
  }, [items, router, clientSecret, orderId]);

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError(null);
    try {
      const res = await fetch("/api/discount/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid discount code");
      }
      setDiscountData({
        discount: data.discount,
        type: data.type,
        message: data.message,
      });
    } catch (err) {
      setDiscountError(
        err instanceof Error ? err.message : "Invalid discount code"
      );
      setDiscountData(null);
    } finally {
      setApplyingDiscount(false);
    }
  }

  function removeDiscount() {
    setDiscountCode("");
    setDiscountData(null);
    setDiscountError(null);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof ShippingForm]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validateShipping(): boolean {
    const errors: Partial<Record<keyof ShippingForm, string>> = {};

    if (!shipping.fullName.trim()) errors.fullName = "Full name is required";
    if (!shipping.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!shipping.line1.trim()) errors.line1 = "Address is required";
    if (!shipping.city.trim()) errors.city = "City is required";
    if (!shipping.province.trim()) errors.province = "Province/State is required";
    if (!shipping.postalCode.trim()) errors.postalCode = "Postal code is required";

    if (!compliance.researchDisclaimer || !compliance.ageVerified || !compliance.termsAccepted) {
      errors.fullName = errors.fullName || "";
      setError("Please acknowledge all required checkboxes before proceeding.");
      setFieldErrors(errors);
      return false;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleContinueToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!validateShipping()) return;

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
          discountCode: discountData ? discountCode.trim() : undefined,
          paymentMethod: "stripe",
          researchDisclaimerAccepted: compliance.researchDisclaimer,
          ageVerified: compliance.ageVerified,
          termsAccepted: compliance.termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0 && !clientSecret && !orderId) return null;

  return (
    <main className="min-h-screen bg-[#f8f9fc] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Progress */}
        <nav className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  currentStep >= 1
                    ? "bg-[#0b3d7a] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </span>
              <span className={`text-sm font-medium ${currentStep >= 1 ? "text-[#0b3d7a]" : "text-gray-400"}`}>
                Shipping
              </span>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                  currentStep >= 2
                    ? "bg-[#0b3d7a] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </span>
              <span className={`text-sm font-medium ${currentStep >= 2 ? "text-[#0b3d7a]" : "text-gray-400"}`}>
                Payment
              </span>
            </div>
          </div>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {currentStep === 1 && (
              <form onSubmit={handleContinueToPayment} className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-[#0b3d7a]" />
                  <h2 className="text-xl font-bold text-[#0b3d7a]">
                    Shipping Information
                  </h2>
                </div>

                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      autoComplete="name"
                      value={shipping.fullName}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.fullName ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="John Doe"
                    />
                    {fieldErrors.fullName && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={shipping.email}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.email ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="john@example.com"
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">Order confirmation and tracking will be sent here.</p>
                  </div>

                  {/* Address Line 1 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="line1"
                      autoComplete="address-line1"
                      value={shipping.line1}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.line1 ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="123 Main Street"
                    />
                    {fieldErrors.line1 && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.line1}</p>
                    )}
                  </div>

                  {/* Address Line 2 */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Apartment, Suite, Unit <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      name="line2"
                      autoComplete="address-line2"
                      value={shipping.line2}
                      onChange={handleChange}
                      className={inputCls}
                      placeholder="Apt 4B"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      autoComplete="address-level2"
                      value={shipping.city}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.city ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="Toronto"
                    />
                    {fieldErrors.city && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.city}</p>
                    )}
                  </div>

                  {/* Province */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Province / State
                    </label>
                    <input
                      type="text"
                      name="province"
                      autoComplete="address-level1"
                      value={shipping.province}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.province ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="Ontario"
                    />
                    {fieldErrors.province && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.province}</p>
                    )}
                  </div>

                  {/* Postal Code */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Postal / ZIP Code
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      autoComplete="postal-code"
                      value={shipping.postalCode}
                      onChange={handleChange}
                      className={`${inputCls} ${fieldErrors.postalCode ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                      placeholder="M5V 1A1"
                    />
                    {fieldErrors.postalCode && (
                      <p className="mt-1 text-xs text-red-500">{fieldErrors.postalCode}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <select
                      name="country"
                      autoComplete="country"
                      value={shipping.country}
                      onChange={handleChange}
                      className={inputCls}
                    >
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="DE">Germany</option>
                      <option value="FR">France</option>
                      <option value="NL">Netherlands</option>
                      <option value="SE">Sweden</option>
                      <option value="NO">Norway</option>
                      <option value="DK">Denmark</option>
                      <option value="IE">Ireland</option>
                      <option value="NZ">New Zealand</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>

                {/* Research Compliance */}
                <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-4">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-amber-800">Research Use Disclaimer</h3>
                      <p className="mt-1 text-xs text-amber-700 leading-relaxed">
                        All products sold by Jartides are intended strictly for laboratory and
                        research purposes only. These products are not intended for human consumption,
                        veterinary use, or any therapeutic application.
                      </p>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compliance.researchDisclaimer}
                      onChange={(e) => setCompliance((p) => ({ ...p, researchDisclaimer: e.target.checked }))}
                      className="mt-0.5 rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
                    />
                    <span className="text-sm text-gray-700">
                      I acknowledge that these products are for <strong>research use only</strong> and are not for human consumption.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compliance.ageVerified}
                      onChange={(e) => setCompliance((p) => ({ ...p, ageVerified: e.target.checked }))}
                      className="mt-0.5 rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
                    />
                    <span className="text-sm text-gray-700">
                      I confirm that I am <strong>21 years of age or older</strong>.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compliance.termsAccepted}
                      onChange={(e) => setCompliance((p) => ({ ...p, termsAccepted: e.target.checked }))}
                      className="mt-0.5 rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
                    />
                    <span className="text-sm text-gray-700">
                      I agree to the{" "}
                      <a href="/policies/terms" target="_blank" className="text-[#1a6de3] underline">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/policies/privacy" target="_blank" className="text-[#1a6de3] underline">Privacy Policy</a>.
                    </span>
                  </label>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting || !compliance.researchDisclaimer || !compliance.ageVerified || !compliance.termsAccepted}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0b3d7a] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#09326a] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating order...
                      </>
                    ) : (
                      <>
                        Continue to Payment
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && clientSecret && orderId && (
              <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-[#0b3d7a]" />
                  <h2 className="text-xl font-bold text-[#0b3d7a]">
                    Payment
                  </h2>
                </div>

                {/* Shipping summary */}
                <div className="mb-6 rounded-lg bg-gray-50 border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{shipping.fullName}</p>
                      <p className="text-xs text-gray-500">
                        {shipping.line1}
                        {shipping.line2 ? `, ${shipping.line2}` : ""}, {shipping.city}, {shipping.province} {shipping.postalCode}
                      </p>
                      <p className="text-xs text-gray-500">{shipping.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[#1a6de3] hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#0b3d7a",
                        borderRadius: "8px",
                        fontFamily: "inherit",
                      },
                      rules: {
                        ".Input": {
                          padding: "12px 16px",
                        },
                      },
                    },
                  }}
                >
                  <StripePaymentForm total={total} orderId={orderId} />
                </Elements>

                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#1a6de3]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Shipping
                </button>
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
                    key={`${item.productId}-${item.variantId ?? "base"}-${item.purchaseType}`}
                    className="flex gap-3 py-3"
                  >
                    {item.image && (
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-contain p-1"
                          sizes="56px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.size && <>{item.size} &middot; </>}Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Discount Code */}
              <div className="border-t border-gray-100 pt-4 mb-4">
                {!discountData ? (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      Discount Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          if (discountError) setDiscountError(null);
                        }}
                        placeholder="Enter code"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={applyDiscount}
                        disabled={applyingDiscount || !discountCode.trim()}
                        className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#09326a] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingDiscount ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {discountError && (
                      <p className="mt-1.5 text-xs text-red-500">{discountError}</p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-green-700">
                        {discountData.message}
                      </p>
                      <button
                        type="button"
                        onClick={removeDiscount}
                        className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountData && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountCode.trim().toUpperCase()})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
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

              {/* Trust badges */}
              <div className="mt-6 space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock className="h-3.5 w-3.5 text-green-500" />
                  SSL encrypted checkout
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield className="h-3.5 w-3.5 text-green-500" />
                  Secure payment via Stripe
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Truck className="h-3.5 w-3.5 text-[#1a6de3]" />
                  3-8 business day delivery
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

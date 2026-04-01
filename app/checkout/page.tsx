"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/constants";
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
  Package,
  Search,
  Check,
} from "lucide-react";
import { COUNTRIES, PRIORITY_COUNTRIES } from "@/lib/countries";

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

interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  rate: number;
  currency: string;
  delivery_days: string;
  shipment_id: string;
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
  const [accountCreated, setAccountCreated] = useState(false);
  const [shipping, setShipping] = useState<ShippingForm>(INITIAL_SHIPPING);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});
  const [compliance, setCompliance] = useState({
    researchDisclaimer: false,
    ageVerified: false,
    termsAccepted: false,
  });
  const [countrySearch, setCountrySearch] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountData, setDiscountData] = useState<{
    discount: number;
    type: string;
    message: string;
  } | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Shipping rates state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [ratesError, setRatesError] = useState<string | null>(null);
  const [ratesFetched, setRatesFetched] = useState(false);

  const shippingCost = selectedRate?.rate ?? 0;
  const discountAmount = discountData?.discount ?? 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(discountedSubtotal * TAX_RATE * 100) / 100;
  const total = Math.round((discountedSubtotal + shippingCost + tax) * 100) / 100;

  useEffect(() => {
    if (items.length === 0 && !clientSecret && !orderId) {
      router.push("/shop");
    }
  }, [items, router, clientSecret, orderId]);

  const fetchShippingRates = useCallback(async () => {
    if (!shipping.city || !shipping.country || !shipping.postalCode || !shipping.line1) return;

    setLoadingRates(true);
    setRatesError(null);

    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: {
            name: shipping.fullName,
            line1: shipping.line1,
            line2: shipping.line2 || "",
            city: shipping.city,
            province: shipping.province,
            postal: shipping.postalCode,
            country: shipping.country,
          },
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch shipping rates");
      }

      setShippingRates(data.rates || []);
      setRatesFetched(true);

      // Auto-select cheapest rate
      if (data.rates && data.rates.length > 0) {
        setSelectedRate(data.rates[0]);
      } else {
        setSelectedRate(null);
        if (data.debug && data.debug.length > 0) {
          setRatesError(data.debug.join(" | "));
        }
      }
    } catch (err) {
      setRatesError(err instanceof Error ? err.message : "Failed to fetch rates");
      setShippingRates([]);
      setSelectedRate(null);
    } finally {
      setLoadingRates(false);
    }
  }, [shipping.fullName, shipping.line1, shipping.line2, shipping.city, shipping.province, shipping.postalCode, shipping.country, items]);

  // Reset rates when address changes
  useEffect(() => {
    setRatesFetched(false);
    setSelectedRate(null);
    setShippingRates([]);
  }, [shipping.city, shipping.country, shipping.postalCode, shipping.province, shipping.line1]);

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

    if (createAccount) {
      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters.");
        return false;
      }
      if (!/[A-Z]/.test(password)) {
        setPasswordError("Password must include at least one uppercase letter.");
        return false;
      }
      if (!/[0-9]/.test(password)) {
        setPasswordError("Password must include at least one number.");
        return false;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setPasswordError("Password must include at least one special character.");
        return false;
      }
    }

    if (!compliance.researchDisclaimer || !compliance.ageVerified || !compliance.termsAccepted) {
      errors.fullName = errors.fullName || "";
      setError("Please acknowledge all required checkboxes before proceeding.");
      setFieldErrors(errors);
      return false;
    }

    if (!selectedRate) {
      setError("Please select a shipping method.");
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
          shippingRate: {
            id: selectedRate!.id,
            carrier: selectedRate!.carrier,
            service: selectedRate!.service,
            rate: selectedRate!.rate,
            shipment_id: selectedRate!.shipment_id,
          },
          createAccount: createAccount || undefined,
          password: createAccount ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setAccountCreated(data.accountCreated === true);
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0 && !clientSecret && !orderId) return null;

  const canFetchRates = shipping.line1.trim() && shipping.city.trim() && shipping.postalCode.trim() && shipping.country;

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
              <form onSubmit={handleContinueToPayment} className="space-y-6">
                <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
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

                    {/* Optional Account Creation */}
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createAccount}
                          onChange={(e) => {
                            setCreateAccount(e.target.checked);
                            if (!e.target.checked) {
                              setPassword("");
                              setPasswordError(null);
                            }
                          }}
                          className="rounded border-gray-300 text-[#0b3d7a] focus:ring-[#1a6de3]"
                        />
                        <span className="text-sm text-gray-700">
                          Create an account for faster checkout next time
                        </span>
                      </label>
                      {createAccount && (
                        <div className="mt-3 ml-6">
                          <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value);
                              setPasswordError(null);
                            }}
                            className={`${inputCls} ${passwordError ? "border-red-400 focus:border-red-400 focus:ring-red-200" : ""}`}
                            placeholder="Min. 8 chars, uppercase, number, symbol"
                          />
                          {passwordError && (
                            <p className="mt-1 text-xs text-red-500">{passwordError}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-400">
                            Track orders and save addresses for future purchases.
                          </p>
                        </div>
                      )}
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
                    <div className="relative">
                      <label className="mb-1.5 block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <button
                        type="button"
                        onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                        className={`${inputCls} text-left flex items-center justify-between`}
                      >
                        <span>
                          {COUNTRIES.find((c) => c.code === shipping.country)?.name || "Select country"}
                        </span>
                        <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${countryDropdownOpen ? "rotate-90" : ""}`} />
                      </button>
                      {countryDropdownOpen && (
                        <div className="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="flex items-center gap-2 border-b px-3 py-2">
                            <Search className="h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search countries..."
                              className="w-full text-sm outline-none placeholder:text-gray-400"
                              autoFocus
                            />
                          </div>
                          <ul className="max-h-52 overflow-y-auto py-1">
                            {(() => {
                              const search = countrySearch.toLowerCase();
                              const filtered = COUNTRIES.filter((c) =>
                                c.name.toLowerCase().includes(search) || c.code.toLowerCase().includes(search)
                              );
                              const priority = filtered.filter((c) => PRIORITY_COUNTRIES.includes(c.code));
                              const rest = filtered.filter((c) => !PRIORITY_COUNTRIES.includes(c.code));
                              const sorted = [...priority, ...rest];

                              if (sorted.length === 0) {
                                return <li className="px-3 py-2 text-sm text-gray-400">No countries found</li>;
                              }

                              return sorted.map((c, i) => (
                                <li key={c.code}>
                                  {i === priority.length && priority.length > 0 && !search && (
                                    <div className="border-t border-gray-100 my-1" />
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setShipping((prev) => ({ ...prev, country: c.code }));
                                      setCountryDropdownOpen(false);
                                      setCountrySearch("");
                                    }}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-[#f0f4ff] ${
                                      shipping.country === c.code ? "bg-[#f0f4ff] text-[#0b3d7a] font-medium" : "text-gray-700"
                                    }`}
                                  >
                                    {c.name}
                                    {shipping.country === c.code && <Check className="h-4 w-4 text-[#0b3d7a]" />}
                                  </button>
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Method Selection */}
                <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-[#0b3d7a]" />
                    <h2 className="text-lg font-bold text-[#0b3d7a]">
                      Shipping Method
                    </h2>
                  </div>

                  {!ratesFetched && !loadingRates && (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500 mb-3">
                        Enter your shipping address above to see available shipping options.
                      </p>
                      <button
                        type="button"
                        onClick={fetchShippingRates}
                        disabled={!canFetchRates || loadingRates}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#09326a] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Truck className="h-4 w-4" />
                        Get Shipping Rates
                      </button>
                    </div>
                  )}

                  {loadingRates && (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-[#0b3d7a]" />
                      <span className="text-sm text-gray-600">Fetching shipping rates...</span>
                    </div>
                  )}

                  {ratesError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 mb-3">
                      {ratesError}
                      <button
                        type="button"
                        onClick={fetchShippingRates}
                        className="ml-2 font-medium underline"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {ratesFetched && shippingRates.length === 0 && !loadingRates && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                      No shipping options available for this address. Please verify your address or try a different one.
                    </div>
                  )}

                  {shippingRates.length > 0 && (
                    <div className="space-y-2">
                      {shippingRates.map((rate) => (
                        <label
                          key={rate.id}
                          className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                            selectedRate?.id === rate.id
                              ? "border-[#0b3d7a] bg-[#f0f4ff] ring-1 ring-[#0b3d7a]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingRate"
                            value={rate.id}
                            checked={selectedRate?.id === rate.id}
                            onChange={() => setSelectedRate(rate)}
                            className="text-[#0b3d7a] focus:ring-[#1a6de3]"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {rate.carrier} &mdash; {rate.service}
                            </p>
                            <p className="text-xs text-gray-500">{rate.delivery_days}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-900 whitespace-nowrap">
                            {formatPrice(rate.rate)}
                          </span>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={fetchShippingRates}
                        className="text-xs text-[#1a6de3] hover:underline mt-1"
                      >
                        Refresh rates
                      </button>
                    </div>
                  )}
                </div>

                {/* Research Compliance */}
                <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 space-y-4">
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
                      disabled={isSubmitting || !compliance.researchDisclaimer || !compliance.ageVerified || !compliance.termsAccepted || !selectedRate}
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
                      {selectedRate && (
                        <p className="text-xs text-[#0b3d7a] font-medium mt-1">
                          {selectedRate.carrier} &mdash; {selectedRate.service} ({selectedRate.delivery_days})
                        </p>
                      )}
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
                  <StripePaymentForm total={total} orderId={orderId} accountCreated={accountCreated} />
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
                  <span>
                    {selectedRate
                      ? formatPrice(shippingCost)
                      : <span className="text-gray-400 italic">Select method</span>
                    }
                  </span>
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
                  {selectedRate ? selectedRate.delivery_days : "Multiple carrier options"}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

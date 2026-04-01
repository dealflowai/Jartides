"use client";

import { useState, type FormEvent } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, Lock } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  total: number;
  orderId: string;
  accountCreated?: boolean;
}

export default function StripePaymentForm({ total, orderId, accountCreated }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/checkout/success?order_id=${orderId}${accountCreated ? "&account_created=1" : ""}`,
      },
    });

    // Only reaches here if there's an immediate error (not a redirect)
    if (stripeError) {
      setError(
        stripeError.type === "card_error" ||
          stripeError.type === "validation_error"
          ? stripeError.message ?? "Payment failed."
          : "An unexpected error occurred. Please try again."
      );
    }

    setIsProcessing(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#0b3d7a] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#09326a] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pay {formatPrice(total)}
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Your payment is secured and encrypted by Stripe.
      </p>
    </form>
  );
}

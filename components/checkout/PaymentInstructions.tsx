"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const PAYPAL_USERNAME = "RayanElgarousha779";

interface Props {
  orderNumber: string;
  total: number;
  currency: string;
  email: string;
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
        copied
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
      }`}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </button>
  );
}

export default function PaymentInstructions({ orderNumber, total, currency, email }: Props) {
  const totalString = total.toFixed(2);
  const paypalMeUrl = `https://paypal.me/${PAYPAL_USERNAME}/${totalString}${currency.toUpperCase()}`;

  return (
    <div className="space-y-6">
      {/* Order summary card */}
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          Order placed
        </div>
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold text-[#0b3d7a]">#{orderNumber}</h2>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            Awaiting Payment
          </span>
        </div>

        <div className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Amount to send</p>
              <p className="text-2xl font-bold text-[#0b3d7a]">
                {formatPrice(total)} <span className="text-sm font-medium text-gray-500">{currency.toUpperCase()}</span>
              </p>
            </div>
            <CopyButton value={totalString} label="amount" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">PayPal username</p>
              <p className="truncate font-mono text-sm font-semibold text-gray-900">{PAYPAL_USERNAME}</p>
            </div>
            <CopyButton value={PAYPAL_USERNAME} label="PayPal username" />
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Required note (your email)</p>
              <p className="truncate font-mono text-sm font-semibold text-gray-900">{email}</p>
            </div>
            <CopyButton value={email} label="email" />
          </div>
        </div>

        <a
          href={paypalMeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0070ba] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#005ea6]"
        >
          Open PayPal to Pay
          <ExternalLink className="h-4 w-4" />
        </a>
        <p className="mt-2 text-center text-xs text-gray-500">
          Opens PayPal with the recipient and amount pre-filled. You&apos;ll still need to add the note and choose Friends &amp; Family.
        </p>
      </div>

      {/* Steps */}
      <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
        <h3 className="mb-1 text-lg font-bold text-[#0b3d7a]">How to complete your payment</h3>
        <p className="mb-6 text-sm text-gray-600">
          Follow each step exactly. Incorrect payments will be declined and you&apos;ll need to place a new order.
        </p>

        <ol className="space-y-5">
          <Step number={1} title="Copy your order total">
            Use the <strong>{formatPrice(total)} {currency.toUpperCase()}</strong> amount above. Do not round.
          </Step>

          <Step number={2} title="Open PayPal">
            Tap <strong>Send/Receive</strong> at the bottom of the PayPal app, or use the
            {" "}<a href={paypalMeUrl} target="_blank" rel="noopener noreferrer" className="text-[#1a6de3] underline">
              direct link
            </a>{" "}
            above.
          </Step>

          <Step number={3} title="Find our PayPal account">
            In the search bar (&ldquo;Name, username, email, profile&rdquo;), enter:{" "}
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{PAYPAL_USERNAME}</span>
          </Step>

          <Step number={4} title="Enter the exact amount" highlight>
            Send <strong>{formatPrice(total)} {currency.toUpperCase()}</strong>. We must receive the
            full amount <strong>after PayPal fees</strong> — if PayPal adds a fee, increase the amount
            sent so the amount we receive matches exactly. Short payments will be declined.
          </Step>

          <Step number={5} title="Choose payment type" highlight>
            When prompted, select <strong>&ldquo;For friends and family&rdquo;</strong> (not Goods and Services).
          </Step>

          <Step number={6} title="Add the required note" highlight>
            In the &ldquo;Add a note&rdquo; field, paste only your email:{" "}
            <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{email}</span>.
            Do not include anything else (no website name, item, etc.).
          </Step>

          <Step number={7} title="Review & send">
            Confirm the username, the exact amount, and that the note contains your email. Then tap{" "}
            <strong>Send Payment</strong>.
          </Step>

          <Step number={8} title="Confirmation">
            Once we verify your payment, you&apos;ll receive a confirmation email and your order will be
            processed and shipped. This usually happens within 24 hours.
          </Step>
        </ol>
      </div>

      {/* Warning footer */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Important</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5">
              <li>Payments that are incorrect, missing details, or unmatched will be declined.</li>
              <li>Orders are only shipped after successful payment verification.</li>
              <li>Keep this page bookmarked or check your account to find these instructions again.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
  highlight,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <li className="flex gap-4">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          highlight ? "bg-amber-500 text-white" : "bg-[#0b3d7a] text-white"
        }`}
      >
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900">
          {title}
          {highlight && (
            <span className="ml-2 align-middle text-[10px] font-bold uppercase tracking-wide text-amber-700">
              Required
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-gray-600">{children}</p>
      </div>
    </li>
  );
}

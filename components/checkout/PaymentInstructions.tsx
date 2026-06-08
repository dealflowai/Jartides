"use client";

import { useState } from "react";
import { Check, Copy, AlertTriangle, Mail, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { PAYMENT_DEFAULTS } from "@/lib/payment-config";

interface Props {
  orderNumber: string;
  total: number;
  currency: string;
  email: string;
  /** Admin-editable payment details (from site_settings). */
  paypalUsername?: string;
  etransferEmail?: string;
  confirmationPhone?: string;
  /** Per-method on/off toggles (from site_settings). Default on. */
  paypalEnabled?: boolean;
  etransferEnabled?: boolean;
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

export default function PaymentInstructions({
  orderNumber,
  total,
  currency,
  email,
  paypalUsername,
  etransferEmail,
  confirmationPhone,
  paypalEnabled = true,
  etransferEnabled = true,
}: Props) {
  const totalString = total.toFixed(2);

  const PAYPAL_USERNAME = paypalUsername || PAYMENT_DEFAULTS.paypalUsername;
  const ETRANSFER_EMAIL = etransferEmail || PAYMENT_DEFAULTS.etransferEmail;
  const CONFIRMATION_PHONE =
    confirmationPhone || PAYMENT_DEFAULTS.confirmationPhone;

  return (
    <div className="space-y-10">
      {/* ============================== */}
      {/* WORLDWIDE — PAYPAL */}
      {/* ============================== */}
      {paypalEnabled && (
      <section className="space-y-6">
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

          <div className="mb-4 rounded-lg border border-[#0b3d7a]/20 bg-[#0b3d7a]/5 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0b3d7a]">
              Worldwide — PayPal Payment Method
            </p>
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
          </div>

          {/* Critical PayPal payment-type warning */}
          <div className="mt-4 overflow-hidden rounded-lg border-2 border-red-500 bg-red-50 shadow-sm ring-4 ring-red-200/60">
            <div className="bg-red-600 px-4 py-1.5 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-white">
                Critical &mdash; Read Before Sending
              </p>
            </div>
            <div className="flex items-start gap-3 p-4">
              <AlertTriangle className="mt-0.5 h-7 w-7 shrink-0 text-red-600" />
              <div className="min-w-0">
                <p className="text-base font-bold leading-snug text-red-900 sm:text-lg">
                  SELECT &ldquo;For Friends and Family&rdquo;
                </p>
                <p className="mt-1 text-sm font-bold uppercase tracking-wide text-red-700 sm:text-base">
                  NOT &ldquo;For Goods and Services&rdquo;
                </p>
                <p className="mt-2 text-xs text-red-800">
                  Payments sent as &ldquo;Goods and Services&rdquo; will be refunded and your order
                  will not be processed.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-3">
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
        </div>

        {/* PayPal Steps */}
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
              Open the PayPal app and tap <strong>Send/Receive</strong> at the bottom.
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

        {/* PayPal Warning */}
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
      </section>
      )}

      {/* Divider — only shown when both methods are offered */}
      {paypalEnabled && etransferEnabled && (
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#f8f9fc] px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Or
          </span>
        </div>
      </div>
      )}

      {/* ============================== */}
      {/* CANADIAN BUYERS — E-TRANSFER */}
      {/* ============================== */}
      {etransferEnabled && (
      <section className="space-y-6">
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 rounded-lg border border-[#0b3d7a]/20 bg-[#0b3d7a]/5 p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#0b3d7a]">
              Canadian Customers — E-Transfer Payment Method
            </p>
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
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Send E-Transfer to</p>
                <p className="flex items-center gap-1.5 truncate font-mono text-sm font-semibold text-gray-900">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  {ETRANSFER_EMAIL}
                </p>
              </div>
              <CopyButton value={ETRANSFER_EMAIL} label="E-Transfer email" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Then text your order number to</p>
                <p className="flex items-center gap-1.5 truncate font-mono text-sm font-semibold text-gray-900">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-gray-500" />
                  {CONFIRMATION_PHONE}
                </p>
              </div>
              <CopyButton value={CONFIRMATION_PHONE} label="confirmation phone" />
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Your order number</p>
                <p className="truncate font-mono text-sm font-semibold text-gray-900">{orderNumber}</p>
              </div>
              <CopyButton value={orderNumber} label="order number" />
            </div>
          </div>
        </div>

        {/* E-Transfer Steps */}
        <div className="rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <h3 className="mb-1 text-lg font-bold text-[#0b3d7a]">How to complete your payment</h3>
          <p className="mb-6 text-sm text-gray-600">
            Follow each step carefully. Your order will be processed once we confirm your E-Transfer.
          </p>

          <ol className="space-y-5">
            <Step number={1} title="Open your online banking app">
              Sign in to your Canadian bank&apos;s app or website and choose <strong>Interac E-Transfer</strong>.
            </Step>

            <Step number={2} title="Send the E-Transfer" highlight>
              Send to:{" "}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{ETRANSFER_EMAIL}</span>
            </Step>

            <Step number={3} title="Send the exact amount" highlight>
              Send the <strong>full {formatPrice(total)} {currency.toUpperCase()}</strong> displayed at
              checkout to ensure your order can be processed without delays.
            </Step>

            <Step number={4} title="Text your order number" highlight>
              After completing your E-Transfer, text your order number{" "}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{orderNumber}</span>{" "}
              to{" "}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{CONFIRMATION_PHONE}</span>.
            </Step>

            <Step number={5} title="Confirmation">
              Once your payment has been confirmed, your order will be processed and prepared for shipment.
              You&apos;ll receive a confirmation email at{" "}
              <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">{email}</span>.
            </Step>
          </ol>

          <p className="mt-6 text-center text-sm font-medium text-[#0b3d7a]">
            Thank you for choosing Jartides.
          </p>
        </div>

        {/* E-Transfer Warning */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold">Important</p>
              <ul className="mt-1.5 list-disc space-y-1 pl-5">
                <li>You must send the full amount displayed at checkout — short payments will delay your order.</li>
                <li>Orders are only shipped after the E-Transfer is received and confirmed.</li>
                <li>Keep this page bookmarked or check your account to find these instructions again.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      )}

      {!paypalEnabled && !etransferEnabled && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
          Online payment instructions are temporarily unavailable. Please contact
          us to complete your order.
        </div>
      )}
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

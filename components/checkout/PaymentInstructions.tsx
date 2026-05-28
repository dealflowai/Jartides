"use client";

import { useState } from "react";
import { Check, Copy, AlertTriangle, Mail, Phone } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ETRANSFER_EMAIL = "rayanwaleed7788@gmail.com";
const CONFIRMATION_PHONE = "226-344-6897";

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

      {/* Steps */}
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

      {/* Warning footer */}
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

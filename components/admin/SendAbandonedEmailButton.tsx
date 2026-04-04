"use client";

import { useState } from "react";
import { Mail, Check, Loader2, X, Send, Eye } from "lucide-react";

interface Props {
  email: string;
  orderNumber: string;
  total: number;
}

export default function SendAbandonedEmailButton({ email, orderNumber, total }: Props) {
  const [status, setStatus] = useState<"idle" | "preview" | "sending" | "sent" | "error">("idle");
  const [sentAt, setSentAt] = useState<string | null>(null);

  const formattedTotal = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(total);

  async function handleSend() {
    setStatus("sending");

    try {
      const res = await fetch("/api/admin/abandoned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, orderNumber, total }),
      });

      if (!res.ok) throw new Error();
      const now = new Date();
      setSentAt(now.toLocaleString("en-CA", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }));

      // Save to shared sent history so /admin/email page shows it too
      try {
        const saved = JSON.parse(localStorage.getItem("jartides_sent_emails") || "[]");
        const entry = {
          to: email,
          subject: `You left something behind! Complete your Jartides order #${orderNumber}`,
          body: `We noticed you started an order (#${orderNumber}) for ${formattedTotal} CAD but didn't complete checkout. Your items are still waiting for you!\n\nIf you ran into any issues or have questions, email us at jartidesofficial@gmail.com - we're happy to help.`,
          sentAt: now.toISOString(),
        };
        localStorage.setItem("jartides_sent_emails", JSON.stringify([entry, ...saved].slice(0, 50)));
      } catch { /* ignore */ }

      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-green-100 px-3 py-1 text-xs font-medium text-green-700" title={`Sent ${sentAt}`}>
        <Check className="h-3 w-3" />
        Sent {sentAt}
      </span>
    );
  }

  return (
    <>
      <button
        onClick={() => setStatus("preview")}
        className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700 transition-colors"
      >
        <Mail className="h-3 w-3" />
        Send Email
      </button>

      {(status === "preview" || status === "sending" || status === "error") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-[#0b3d7a]" />
                Preview Email
              </h3>
              <button onClick={() => setStatus("idle")} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Email details */}
            <div className="px-5 pt-4 space-y-1.5 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gray-500 w-16">From:</span>
                <span className="text-gray-900">Jartides &lt;noreply@jartides.ca&gt;</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-500 w-16">To:</span>
                <span className="text-gray-900">{email}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-500 w-16">Subject:</span>
                <span className="text-gray-900 font-medium">
                  You left something behind! Complete your Jartides order #{orderNumber}
                </span>
              </div>
            </div>

            {/* Email preview */}
            <div className="p-5">
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-[#f5f5f5]">
                {/* Branded header */}
                <div className="bg-[#0b3d7a] px-5 py-4 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo.png" alt="Jartides" width={50} height={50} className="inline-block align-middle mr-2" />
                  <div className="inline-block align-middle text-left">
                    <p className="text-white text-base font-extrabold tracking-wide m-0">JARTIDES</p>
                    <p className="text-blue-200 text-[9px] font-bold tracking-[2px] uppercase m-0">Research Peptides</p>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-white px-5 py-6 space-y-3">
                  <h2 className="text-lg font-bold text-gray-900 m-0">You left something behind!</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We noticed you started an order <strong>(#{orderNumber})</strong> for <strong>{formattedTotal} CAD</strong> but didn&apos;t complete checkout. Your items are still waiting for you!
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    If you ran into any issues or have questions, email us at <span className="text-[#1a6de3]">jartidesofficial@gmail.com</span> - we&apos;re happy to help.
                  </p>
                  <div className="text-center pt-2">
                    <span className="inline-block bg-[#0b3d7a] text-white px-6 py-3 rounded-lg text-sm font-bold">
                      Return to Shop
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t px-5 py-3 text-center">
                  <p className="text-[11px] text-gray-400">
                    Questions? Email us at jartidesofficial@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Error */}
            {status === "error" && (
              <div className="mx-5 mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                Failed to send email. Please try again.
              </div>
            )}

            {/* Actions */}
            <div className="border-t px-5 py-4 flex gap-2">
              <button
                onClick={handleSend}
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50"
              >
                {status === "sending" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {status === "sending" ? "Sending..." : "Confirm & Send"}
              </button>
              <button
                onClick={() => setStatus("idle")}
                disabled={status === "sending"}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

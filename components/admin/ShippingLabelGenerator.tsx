"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Download, ExternalLink, Loader2, CheckCircle, Phone } from "lucide-react";

interface Props {
  orderId: string;
  hasLabel: boolean;
  existingLabelUrl: string | null;
  existingTrackingNumber: string | null;
  existingTrackingUrl: string | null;
  existingCarrier: string | null;
  rateId: string | null;
  shippingPhone: string | null;
  shippingCountry: string | null;
}

export default function ShippingLabelGenerator({
  orderId,
  hasLabel,
  existingLabelUrl,
  existingTrackingNumber,
  existingTrackingUrl,
  existingCarrier,
  rateId,
  shippingPhone,
  shippingCountry,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [phone, setPhone] = useState(shippingPhone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [result, setResult] = useState<{
    trackingNumber: string;
    labelUrl: string;
    trackingUrl: string | null;
    carrier: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isInternational = shippingCountry && shippingCountry.toUpperCase() !== "US";

  async function savePhone() {
    setSavingPhone(true);
    setPhoneSaved(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/phone`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(typeof data.error === "string" ? data.error : "Save failed");
      }
      setPhoneSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save phone");
    } finally {
      setSavingPhone(false);
    }
  }

  async function handleRegenerate() {
    if (!confirm("This will generate a new shipping label and replace the existing one. Continue?")) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, regenerate: true }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        throw new Error(errMsg || "Failed to regenerate label");
      }

      setResult({
        trackingNumber: data.trackingNumber,
        labelUrl: data.labelUrl,
        trackingUrl: data.trackingUrl,
        carrier: data.carrier,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to regenerate label");
    } finally {
      setGenerating(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);

    // Don't pass the stored rateId — carrier rates expire after ~24h, so the API
    // always creates a fresh shipment at label time.
    void rateId;

    try {
      const res = await fetch("/api/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
        throw new Error(errMsg || "Failed to generate label");
      }

      setResult({
        trackingNumber: data.trackingNumber,
        labelUrl: data.labelUrl,
        trackingUrl: data.trackingUrl,
        carrier: data.carrier,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate label");
    } finally {
      setGenerating(false);
    }
  }

  // Show existing label info
  if (hasLabel && !result) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Shipping Label Generated</h3>
        </div>
        <div className="space-y-2 text-sm">
          {existingCarrier && (
            <p className="text-green-700">Carrier: <strong>{existingCarrier}</strong></p>
          )}
          {existingTrackingNumber && (
            <p className="text-green-700">
              Tracking: <strong className="font-mono">{existingTrackingNumber}</strong>
            </p>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {existingLabelUrl && (
              <a
                href={existingLabelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#09326a]"
              >
                <Download className="h-4 w-4" />
                Download Label
              </a>
            )}
            {existingTrackingUrl && (
              <a
                href={existingTrackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Track Package
              </a>
            )}
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <Package className="h-4 w-4" />
                  Regenerate Label
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show result after generating
  if (result) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">Label Generated Successfully</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-green-700">Carrier: <strong>{result.carrier}</strong></p>
          <p className="text-green-700">
            Tracking: <strong className="font-mono">{result.trackingNumber}</strong>
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {result.labelUrl && (
              <a
                href={result.labelUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#09326a]"
              >
                <Download className="h-4 w-4" />
                Download Label
              </a>
            )}
            {result.trackingUrl && (
              <a
                href={result.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" />
                Track Package
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show generate button
  return (
    <div>
      {error && (
        <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Recipient phone editor — required by carriers for international shipments */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">
            Recipient phone
            {isInternational && (
              <span className="ml-1 text-xs font-normal text-amber-700">
                (required for {shippingCountry?.toUpperCase()})
              </span>
            )}
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneSaved(false);
            }}
            placeholder="+1 555 123 4567"
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20"
          />
          <button
            type="button"
            onClick={savePhone}
            disabled={savingPhone || phone.trim() === (shippingPhone || "").trim()}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {savingPhone ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : phoneSaved ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              "Save"
            )}
          </button>
        </div>
        {!phone.trim() && isInternational && (
          <p className="mt-2 text-xs text-amber-700">
            Carriers (FedEx etc.) require a phone for international labels.
          </p>
        )}
      </div>

      <button
        onClick={handleGenerate}
        disabled={generating || (!!isInternational && !phone.trim())}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#09326a] disabled:opacity-50"
      >
        {generating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating Label...
          </>
        ) : (
          <>
            <Package className="h-4 w-4" />
            Generate Shipping Label
          </>
        )}
      </button>
    </div>
  );
}

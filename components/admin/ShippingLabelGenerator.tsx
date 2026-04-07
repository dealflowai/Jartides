"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, Download, ExternalLink, Loader2, CheckCircle } from "lucide-react";

interface Props {
  orderId: string;
  hasLabel: boolean;
  existingLabelUrl: string | null;
  existingTrackingNumber: string | null;
  existingTrackingUrl: string | null;
  existingCarrier: string | null;
  rateId: string | null;
}

export default function ShippingLabelGenerator({
  orderId,
  hasLabel,
  existingLabelUrl,
  existingTrackingNumber,
  existingTrackingUrl,
  existingCarrier,
  rateId,
}: Props) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    trackingNumber: string;
    labelUrl: string;
    trackingUrl: string | null;
    carrier: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const res = await fetch("/api/shipping/label", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          ...(rateId ? { rateId } : {}),
        }),
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
      <button
        onClick={handleGenerate}
        disabled={generating}
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

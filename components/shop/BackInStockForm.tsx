"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

interface Props {
  productId: string;
  productName: string;
}

export default function BackInStockForm({ productId, productName }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/back-in-stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, product_id: productId, product_name: productName }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        <Check className="h-4 w-4" />
        We&apos;ll email you when this product is back in stock.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Bell className="h-4 w-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">Notify me when back in stock</span>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50"
        >
          {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Notify Me"}
        </button>
      </div>
      {status === "error" && <p className="mt-1 text-xs text-red-500">Something went wrong. Try again.</p>}
    </form>
  );
}

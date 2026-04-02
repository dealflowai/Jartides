"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export default function ExportOrdersButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders/export");
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        res.headers
          .get("Content-Disposition")
          ?.match(/filename="(.+)"/)?.[1] ?? "orders-export.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to export orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      {loading ? "Exporting..." : "Export CSV"}
    </button>
  );
}

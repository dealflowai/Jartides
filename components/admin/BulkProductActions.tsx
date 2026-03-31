"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface Props {
  selectedIds: string[];
  onClear: () => void;
}

export default function BulkProductActions({ selectedIds, onClear }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (selectedIds.length === 0) return null;

  async function bulkUpdate(active: boolean) {
    setLoading(true);
    try {
      for (const id of selectedIds) {
        await fetch("/api/admin/products/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds, active }),
        });
        break; // Only need to call once with all IDs
      }
      router.refresh();
      onClear();
    } catch {
      alert("Failed to update products");
    } finally {
      setLoading(false);
    }
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedIds.length} product(s)? This cannot be undone.`)) return;
    setLoading(true);
    try {
      await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });
      router.refresh();
      onClear();
    } catch {
      alert("Failed to delete products");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5">
      {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
      <span className="text-sm font-medium text-blue-700">
        {selectedIds.length} selected
      </span>
      <div className="h-4 w-px bg-blue-200" />
      <button
        onClick={() => bulkUpdate(true)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline disabled:opacity-50"
      >
        <ToggleRight className="h-4 w-4" />
        Activate
      </button>
      <button
        onClick={() => bulkUpdate(false)}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:underline disabled:opacity-50"
      >
        <ToggleLeft className="h-4 w-4" />
        Deactivate
      </button>
      <button
        onClick={bulkDelete}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
      <button
        onClick={onClear}
        className="ml-auto text-xs text-blue-500 hover:underline"
      >
        Clear
      </button>
    </div>
  );
}

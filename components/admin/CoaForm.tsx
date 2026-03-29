"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { Upload, Loader2 } from "lucide-react";
import type { CoaDocument, Product } from "@/lib/types";

interface Props {
  coa?: CoaDocument;
  products: Product[];
}

export default function CoaForm({ coa, products }: Props) {
  const router = useRouter();
  const isEdit = !!coa;

  const [form, setForm] = useState({
    product_id: coa?.product_id ?? "",
    purity_percentage: coa?.purity_percentage?.toString() ?? "",
    batch_number: coa?.batch_number ?? "",
    test_date: coa?.test_date?.slice(0, 10) ?? "",
  });
  const [pdfUrl, setPdfUrl] = useState(coa?.pdf_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();
      const path = `${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("coa-pdfs")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("coa-pdfs").getPublicUrl(path);

      setPdfUrl(publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      purity_percentage: parseFloat(form.purity_percentage) || 0,
      test_date: form.test_date || null,
      pdf_url: pdfUrl || null,
      ...(isEdit ? { id: coa.id } : {}),
    };

    try {
      const res = await fetch("/api/admin/coa", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save COA");
      }

      router.push("/admin/coa");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]";

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Product
        </label>
        <select
          className={inputCls}
          value={form.product_id}
          onChange={(e) => updateField("product_id", e.target.value)}
          required
        >
          <option value="">Select product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Purity Percentage
          </label>
          <input
            type="number"
            step="0.01"
            className={inputCls}
            value={form.purity_percentage}
            onChange={(e) => updateField("purity_percentage", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Batch Number
          </label>
          <input
            className={inputCls}
            value={form.batch_number}
            onChange={(e) => updateField("batch_number", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Test Date
        </label>
        <input
          type="date"
          className={inputCls}
          value={form.test_date}
          onChange={(e) => updateField("test_date", e.target.value)}
        />
      </div>

      {/* PDF Upload */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          PDF Document
        </label>
        {pdfUrl && (
          <p className="mb-2 text-sm text-gray-500">
            Current:{" "}
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a6de3] hover:underline"
            >
              View PDF
            </a>
          </p>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3]">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload PDF"}
          <input
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handlePdfUpload}
            disabled={uploading}
          />
        </label>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update COA" : "Create COA"}
        </Button>
        <Button variant="ghost" href="/admin/coa">
          Cancel
        </Button>
      </div>
    </form>
  );
}

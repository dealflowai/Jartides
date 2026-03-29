"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { X, Upload, Loader2 } from "lucide-react";
import type { Product, Category } from "@/lib/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const BADGES = ["", "Best Seller", "Popular", "Hot", "New", "Best Value"];

interface Props {
  product?: Product;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    research_description: product?.research_description ?? "",
    category_id: product?.category_id ?? "",
    price: product?.price?.toString() ?? "",
    original_price: product?.original_price?.toString() ?? "",
    badge: product?.badge ?? "",
    size: product?.size ?? "",
    purity: product?.purity ?? "",
    stock_quantity: product?.stock_quantity?.toString() ?? "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() ?? "5",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = useCallback(
    (field: string, value: string | boolean) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === "name" && (!isEdit || prev.slug === slugify(prev.name))) {
          next.slug = slugify(value as string);
        }
        return next;
      });
    },
    [isEdit]
  );

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const supabase = createClient();
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);

        newUrls.push(publicUrl);
      }

      setImages((prev) => [...prev, ...newUrls]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price
        ? parseFloat(form.original_price)
        : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      badge: form.badge || null,
      research_description: form.research_description || null,
      purity: form.purity || null,
      images,
      ...(isEdit ? { id: product.id } : {}),
    };

    try {
      const res = await fetch("/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save product");
      }

      router.push("/admin/products");
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
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Slug
          </label>
          <input
            className={inputCls}
            value={form.slug}
            onChange={(e) => updateField("slug", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          className={inputCls}
          rows={4}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          required
        />
      </div>

      {/* Research Description */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Research Description
        </label>
        <textarea
          className={inputCls}
          rows={3}
          value={form.research_description}
          onChange={(e) => updateField("research_description", e.target.value)}
        />
      </div>

      {/* Category, Badge */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            className={inputCls}
            value={form.category_id}
            onChange={(e) => updateField("category_id", e.target.value)}
            required
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Badge
          </label>
          <select
            className={inputCls}
            value={form.badge}
            onChange={(e) => updateField("badge", e.target.value)}
          >
            {BADGES.map((b) => (
              <option key={b} value={b}>
                {b || "None"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Price, Original Price, Size, Purity */}
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            step="0.01"
            className={inputCls}
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Original Price
          </label>
          <input
            type="number"
            step="0.01"
            className={inputCls}
            value={form.original_price}
            onChange={(e) => updateField("original_price", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Size
          </label>
          <input
            className={inputCls}
            value={form.size}
            onChange={(e) => updateField("size", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Purity
          </label>
          <input
            className={inputCls}
            value={form.purity}
            onChange={(e) => updateField("purity", e.target.value)}
          />
        </div>
      </div>

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.stock_quantity}
            onChange={(e) => updateField("stock_quantity", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Low Stock Threshold
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.low_stock_threshold}
            onChange={(e) => updateField("low_stock_threshold", e.target.value)}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => updateField("featured", e.target.checked)}
            className="rounded border-gray-300"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => updateField("active", e.target.checked)}
            className="rounded border-gray-300"
          />
          Active
        </label>
      </div>

      {/* Images */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Images
        </label>
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="group relative">
              <Image
                src={url}
                alt=""
                width={80}
                height={80}
                className="rounded-lg border object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3]">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload Images"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </Button>
        <Button variant="ghost" href="/admin/products">
          Cancel
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });
import {
  X,
  Upload,
  Loader2,
  ChevronDown,
  ChevronRight,
  Eye,
  ImageIcon,
  FileText,
  ShoppingCart,
  Star,
  Settings,
  Tag,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Plus, Trash2 } from "lucide-react";
import type { Product, Category, ProductVariant, CoaDocument, ProductTag } from "@/lib/types";
import { Shield, ExternalLink, Search, Video, Package, Globe, Copy, Link2 } from "lucide-react";

interface VariantForm {
  id?: string;
  size: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  low_stock_threshold: string;
  images: string[];
  active: boolean;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(amount);
}

function calculateSavings(
  price: number,
  originalPrice: number | null
): number | null {
  if (!originalPrice || originalPrice <= price) return null;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

const BADGES = ["", "Best Seller", "Popular", "Hot", "New", "Best Value"];

interface CoaForm {
  id?: string;
  batch_number: string;
  purity_percentage: string;
  test_date: string;
  pdf_url: string;
  _saving?: boolean;
  _deleting?: boolean;
}

interface Props {
  product?: Product;
  categories: Category[];
  coaDocuments?: CoaDocument[];
  allProducts?: Product[];
  existingTags?: ProductTag[];
  relatedProductIds?: string[];
}

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                               */
/* ------------------------------------------------------------------ */
function Section({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
      >
        <Icon className="h-4 w-4 text-[#1a6de3]" />
        <span className="flex-1">{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {open && <div className="border-t border-gray-100 px-5 py-4">{children}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product Preview Card                                              */
/* ------------------------------------------------------------------ */
function PreviewCard({
  form,
  images,
  categories,
}: {
  form: Record<string, string | boolean>;
  images: string[];
  categories: Category[];
}) {
  const name = (form.name as string) || "Product Name";
  const price = parseFloat(form.price as string) || 0;
  const originalPrice = (form.original_price as string)
    ? parseFloat(form.original_price as string)
    : null;
  const badge = form.badge as string;
  const size = form.size as string;
  const categoryName =
    categories.find((c) => c.id === form.category_id)?.name ?? "";
  const image = images[0] ?? null;
  const savings = calculateSavings(price, originalPrice);

  return (
    <div className="rounded-xl border border-gray-200 bg-white w-[260px] shrink-0 overflow-hidden">
      {/* Badge */}
      <div className="relative aspect-[5/4] w-full bg-white">
        {badge && (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-[#1a6de3] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        )}
        {savings && (
          <span className="absolute top-3 right-3 z-10 rounded-md bg-green-500 px-2 py-1 text-[10px] font-bold text-white">
            -{savings}%
          </span>
        )}
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain p-1"
            sizes="260px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            <ShoppingCart className="h-10 w-10" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
          {name}
        </h3>
        <p className="mt-1 text-xs text-gray-400">
          {categoryName}
          {size && <> &middot; {size}</>}
        </p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-base font-bold text-[#0b3d7a]">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1a6de3] px-3 py-2 text-xs font-semibold text-white">
            <ShoppingCart className="h-3.5 w-3.5" />
            Add to Cart
          </span>
          <span className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600">
            View
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Form                                                         */
/* ------------------------------------------------------------------ */
export default function ProductForm({ product, categories, coaDocuments = [], allProducts = [], existingTags = [], relatedProductIds = [] }: Props) {
  const router = useRouter();
  const isEdit = !!product;

  const [form, setForm] = useState({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    research_description: product?.research_description ?? "",
    meta_title: product?.meta_title ?? "",
    meta_description: product?.meta_description ?? "",
    video_url: product?.video_url ?? "",
    category_id: product?.category_id ?? "",
    price: product?.price?.toString() ?? "",
    original_price: product?.original_price?.toString() ?? "",
    badge: product?.badge ?? "",
    size: product?.size ?? "",
    purity: product?.purity ?? "",
    stock_quantity: product?.stock_quantity?.toString() ?? "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() ?? "5",
    weight_grams: product?.weight_grams?.toString() ?? "",
    length_cm: product?.length_cm?.toString() ?? "",
    width_cm: product?.width_cm?.toString() ?? "",
    height_cm: product?.height_cm?.toString() ?? "",
    sort_order: product?.sort_order?.toString() ?? "0",
    featured: product?.featured ?? false,
    active: product?.active ?? true,
  });
  const [tags, setTags] = useState<string[]>(product?.tags?.map((t) => t.name) ?? existingTags.map((t) => t.name));
  const [tagInput, setTagInput] = useState("");
  const [relatedIds, setRelatedIds] = useState<string[]>(relatedProductIds);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [hasVariants, setHasVariants] = useState(
    (product?.variants?.length ?? 0) > 0
  );
  const [variants, setVariants] = useState<VariantForm[]>(
    product?.variants?.map((v: ProductVariant) => ({
      id: v.id,
      size: v.size,
      price: v.price.toString(),
      original_price: v.original_price?.toString() ?? "",
      stock_quantity: v.stock_quantity.toString(),
      low_stock_threshold: v.low_stock_threshold.toString(),
      images: v.images ?? [],
      active: v.active,
    })) ?? []
  );

  const [coas, setCoas] = useState<CoaForm[]>(
    coaDocuments.map((c) => ({
      id: c.id,
      batch_number: c.batch_number,
      purity_percentage: c.purity_percentage.toString(),
      test_date: c.test_date ?? "",
      pdf_url: c.pdf_url ?? "",
    }))
  );

  function addCoa() {
    setCoas((prev) => [
      ...prev,
      { batch_number: "", purity_percentage: "99", test_date: "", pdf_url: "" },
    ]);
  }

  function updateCoa(index: number, field: keyof CoaForm, value: string) {
    setCoas((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }

  async function saveCoa(index: number) {
    const coa = coas[index];
    if (!coa.batch_number || !product?.id) return;

    setCoas((prev) =>
      prev.map((c, i) => (i === index ? { ...c, _saving: true } : c))
    );

    try {
      const body = {
        ...(coa.id ? { id: coa.id } : {}),
        product_id: product.id,
        batch_number: coa.batch_number,
        purity_percentage: parseFloat(coa.purity_percentage) || 0,
        test_date: coa.test_date || null,
        pdf_url: coa.pdf_url || null,
      };

      const res = await fetch("/api/admin/coa", {
        method: coa.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save COA");
      }

      const saved = await res.json();
      setCoas((prev) =>
        prev.map((c, i) =>
          i === index ? { ...c, id: saved.id, _saving: false } : c
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save COA");
      setCoas((prev) =>
        prev.map((c, i) => (i === index ? { ...c, _saving: false } : c))
      );
    }
  }

  async function deleteCoa(index: number) {
    const coa = coas[index];
    if (!coa.id) {
      setCoas((prev) => prev.filter((_, i) => i !== index));
      return;
    }

    if (!confirm("Delete this COA document?")) return;

    setCoas((prev) =>
      prev.map((c, i) => (i === index ? { ...c, _deleting: true } : c))
    );

    try {
      const res = await fetch(`/api/admin/coa?id=${coa.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete COA");
      setCoas((prev) => prev.filter((_, i) => i !== index));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete COA");
      setCoas((prev) =>
        prev.map((c, i) => (i === index ? { ...c, _deleting: false } : c))
      );
    }
  }

  async function handleCoaPdfUpload(index: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "coa-documents");

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      const { url } = await res.json();
      updateCoa(index, "pdf_url", url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function addVariant() {
    setVariants((prev) => [
      ...prev,
      {
        size: "",
        price: "",
        original_price: "",
        stock_quantity: "100",
        low_stock_threshold: "10",
        images: [],
        active: true,
      },
    ]);
  }

  function updateVariant(index: number, field: keyof VariantForm, value: string | boolean) {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleVariantImageUpload(variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "product-images");

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      const { url } = await res.json();
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex ? { ...v, images: [...v.images, url] } : v
        )
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeVariantImage(variantIndex: number, imageUrl: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === variantIndex ? { ...v, images: v.images.filter((u) => u !== imageUrl) } : v
      )
    );
  }

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
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "product-images");

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error ?? "Upload failed");
        }

        const { url } = await res.json();
        newUrls.push(url);
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

  function moveImage(index: number, direction: "up" | "down") {
    setImages((prev) => {
      const next = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      ...form,
      sku: form.sku || null,
      price: parseFloat(form.price) || 0,
      original_price: form.original_price
        ? parseFloat(form.original_price)
        : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      badge: form.badge || null,
      research_description: form.research_description || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      video_url: form.video_url || null,
      purity: form.purity || null,
      weight_grams: form.weight_grams ? parseFloat(form.weight_grams) : null,
      length_cm: form.length_cm ? parseFloat(form.length_cm) : null,
      width_cm: form.width_cm ? parseFloat(form.width_cm) : null,
      height_cm: form.height_cm ? parseFloat(form.height_cm) : null,
      sort_order: parseInt(form.sort_order) || 0,
      images,
      tags,
      related_product_ids: relatedIds,
      ...(isEdit ? { id: product.id } : {}),
      variants: hasVariants
        ? variants.map((v, i) => ({
            ...(v.id ? { id: v.id } : {}),
            size: v.size,
            price: parseFloat(v.price) || 0,
            original_price: v.original_price ? parseFloat(v.original_price) : null,
            stock_quantity: parseInt(v.stock_quantity) || 0,
            low_stock_threshold: parseInt(v.low_stock_threshold) || 10,
            sort_order: i,
            images: v.images,
            active: v.active,
          }))
        : [],
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

  const IMAGE_LABELS = ["Product Image", "COA Certificate"];

  return (
    <div className="flex gap-8 items-start">
      {/* Main Form */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-3xl space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Preview toggle */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 text-sm text-[#1a6de3] hover:underline"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>

        {/* ---- Basic Info ---- */}
        <Section title="Basic Info" icon={Tag} defaultOpen={true}>
          <div className="space-y-4">
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  SKU
                </label>
                <input
                  className={inputCls}
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                  placeholder="e.g. JRT-BPC-5MG"
                />
              </div>
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
          </div>
        </Section>

        {/* ---- Pricing & Stock ---- */}
        <Section title="Pricing & Stock" icon={DollarSign} defaultOpen={true}>
          <div className="space-y-4">
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
                  onChange={(e) =>
                    updateField("low_stock_threshold", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Size Variants ---- */}
        <Section title="Size Variants" icon={Tag} defaultOpen={hasVariants}>
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={hasVariants}
                onChange={(e) => {
                  setHasVariants(e.target.checked);
                  if (e.target.checked && variants.length === 0) addVariant();
                }}
                className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
              />
              This product has multiple sizes
            </label>

            {hasVariants && (
              <>
                <p className="text-xs text-gray-500">
                  When variants are enabled, the product-level price/size/stock above become defaults. Each variant has its own price, stock, and size.
                </p>

                <div className="space-y-3">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          Variant {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs">
                            <input
                              type="checkbox"
                              checked={v.active}
                              onChange={(e) => updateVariant(idx, "active", e.target.checked)}
                              className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                            />
                            Active
                          </label>
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remove variant"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-3">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Size
                          </label>
                          <input
                            className={inputCls}
                            value={v.size}
                            onChange={(e) => updateVariant(idx, "size", e.target.value)}
                            placeholder="e.g. 5mg"
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={inputCls}
                            value={v.price}
                            onChange={(e) => updateVariant(idx, "price", e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Original Price
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            className={inputCls}
                            value={v.original_price}
                            onChange={(e) => updateVariant(idx, "original_price", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Stock
                          </label>
                          <input
                            type="number"
                            className={inputCls}
                            value={v.stock_quantity}
                            onChange={(e) => updateVariant(idx, "stock_quantity", e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs font-medium text-gray-600">
                            Low Stock
                          </label>
                          <input
                            type="number"
                            className={inputCls}
                            value={v.low_stock_threshold}
                            onChange={(e) => updateVariant(idx, "low_stock_threshold", e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Variant Images */}
                      <div className="mt-3">
                        <label className="mb-1.5 block text-xs font-medium text-gray-600">
                          Variant Images <span className="text-gray-400 font-normal">(optional — uses product images if empty)</span>
                        </label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {v.images.map((url) => (
                            <div key={url} className="relative group">
                              <Image
                                src={url}
                                alt={`Variant ${idx + 1}`}
                                width={56}
                                height={56}
                                className="h-14 w-14 rounded-lg border border-gray-200 object-contain p-0.5"
                              />
                              <button
                                type="button"
                                onClick={() => removeVariantImage(idx, url)}
                                className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ))}
                          <label className="inline-flex h-14 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors">
                            {uploading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleVariantImageUpload(idx, e)}
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Variant
                </button>
              </>
            )}
          </div>
        </Section>

        {/* ---- Description ---- */}
        <Section title="Description" icon={FileText} defaultOpen={true}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Product Description
            </label>
            <RichTextEditor
              value={form.description}
              onChange={(html) => updateField("description", html)}
              placeholder="Enter product description..."
              minHeight="140px"
            />
          </div>
        </Section>

        {/* ---- Research Description ---- */}
        <Section title="Research Description" icon={FileText} defaultOpen={false}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Research Description
            </label>
            <RichTextEditor
              value={form.research_description}
              onChange={(html) => updateField("research_description", html)}
              placeholder="Enter research description (optional)..."
              minHeight="120px"
            />
          </div>
        </Section>

        {/* ---- Images ---- */}
        <Section title="Images" icon={ImageIcon} defaultOpen={true}>
          <div className="space-y-4">
            {/* Image grid with labels */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                  <div key={url} className="group relative">
                    <div className="relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                      <Image
                        src={url}
                        alt={IMAGE_LABELS[idx] ?? `Image ${idx + 1}`}
                        width={160}
                        height={160}
                        className="w-full h-[120px] object-contain p-2"
                      />
                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1.5 right-1.5 rounded-full bg-white/80 backdrop-blur-sm p-1 text-gray-400 shadow-sm border border-gray-200 hover:bg-gray-800 hover:text-white hover:border-gray-800 transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Label */}
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">
                        {IMAGE_LABELS[idx] ?? `Image ${idx + 1}`}
                      </span>
                      <div className="flex gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "up")}
                          disabled={idx === 0}
                          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move left"
                        >
                          <ArrowUp className="h-3.5 w-3.5 rotate-[-90deg]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(idx, "down")}
                          disabled={idx === images.length - 1}
                          className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move right"
                        >
                          <ArrowDown className="h-3.5 w-3.5 rotate-[-90deg]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Guidance text */}
            <p className="text-xs text-gray-500">
              First image = Product Image (shown on card). Second image = COA
              Certificate (shown on hover). Use arrows to reorder.
            </p>

            {/* Upload button */}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors">
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
        </Section>

        {/* ---- SEO ---- */}
        <Section title="SEO & Meta" icon={Globe} defaultOpen={false}>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta Title <span className="text-gray-400 font-normal">({(form.meta_title || form.name).length}/60)</span>
              </label>
              <input
                className={inputCls}
                value={form.meta_title}
                onChange={(e) => updateField("meta_title", e.target.value)}
                placeholder={form.name || "Defaults to product name"}
                maxLength={60}
              />
              <p className="mt-1 text-xs text-gray-400">Leave blank to use the product name.</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Meta Description <span className="text-gray-400 font-normal">({(form.meta_description).length}/160)</span>
              </label>
              <textarea
                className={inputCls}
                value={form.meta_description}
                onChange={(e) => updateField("meta_description", e.target.value)}
                placeholder="Custom search engine description (defaults to product description)"
                maxLength={160}
                rows={2}
              />
            </div>
          </div>
        </Section>

        {/* ---- Video ---- */}
        <Section title="Product Video" icon={Video} defaultOpen={false}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Video URL
            </label>
            <input
              className={inputCls}
              value={form.video_url}
              onChange={(e) => updateField("video_url", e.target.value)}
              placeholder="https://youtube.com/watch?v=... or https://tiktok.com/..."
            />
            <p className="mt-1 text-xs text-gray-400">YouTube or TikTok URL. Will be embedded on the product page.</p>
          </div>
        </Section>

        {/* ---- Shipping / Weight ---- */}
        <Section title="Shipping & Dimensions" icon={Package} defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Weight (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={form.weight_grams}
                  onChange={(e) => updateField("weight_grams", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Length (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={form.length_cm}
                  onChange={(e) => updateField("length_cm", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Width (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={form.width_cm}
                  onChange={(e) => updateField("width_cm", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={inputCls}
                  value={form.height_cm}
                  onChange={(e) => updateField("height_cm", e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">Used for calculating shipping rates via Shippo.</p>
          </div>
        </Section>

        {/* ---- Tags ---- */}
        <Section title="Tags" icon={Tag} defaultOpen={false}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                    className="ml-0.5 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    const val = tagInput.trim();
                    if (val && !tags.includes(val)) {
                      setTags((prev) => [...prev, val]);
                    }
                    setTagInput("");
                  }
                }}
                placeholder="Type a tag and press Enter"
              />
              <button
                type="button"
                onClick={() => {
                  const val = tagInput.trim();
                  if (val && !tags.includes(val)) {
                    setTags((prev) => [...prev, val]);
                  }
                  setTagInput("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-400">Tags help with filtering and search. Press Enter or comma to add.</p>
          </div>
        </Section>

        {/* ---- Related Products ---- */}
        {isEdit && (
          <Section title="Related Products" icon={Link2} defaultOpen={false}>
            <div className="space-y-3">
              {/* Selected related products */}
              {relatedIds.length > 0 && (
                <div className="space-y-1.5">
                  {relatedIds.map((rid) => {
                    const rp = allProducts.find((p) => p.id === rid);
                    if (!rp) return null;
                    return (
                      <div
                        key={rid}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        <span className="text-sm text-gray-700">{rp.name}</span>
                        <button
                          type="button"
                          onClick={() => setRelatedIds((prev) => prev.filter((id) => id !== rid))}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Search to add */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  value={relatedSearch}
                  onChange={(e) => setRelatedSearch(e.target.value)}
                  placeholder="Search products to link..."
                />
              </div>
              {relatedSearch && (
                <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-100">
                  {allProducts
                    .filter(
                      (p) =>
                        p.id !== product?.id &&
                        !relatedIds.includes(p.id) &&
                        p.name.toLowerCase().includes(relatedSearch.toLowerCase())
                    )
                    .slice(0, 8)
                    .map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setRelatedIds((prev) => [...prev, p.id]);
                          setRelatedSearch("");
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Plus className="h-3.5 w-3.5 text-[#1a6de3]" />
                        {p.name}
                      </button>
                    ))}
                  {allProducts.filter(
                    (p) =>
                      p.id !== product?.id &&
                      !relatedIds.includes(p.id) &&
                      p.name.toLowerCase().includes(relatedSearch.toLowerCase())
                  ).length === 0 && (
                    <p className="px-3 py-2 text-xs text-gray-400">No matching products</p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-400">These products will appear in the &quot;Related Products&quot; section instead of auto-generated ones.</p>
            </div>
          </Section>
        )}

        {/* ---- Certificates of Analysis ---- */}
        {isEdit && (
          <Section title="Certificates of Analysis" icon={Shield} defaultOpen={coas.length > 0}>
            <div className="space-y-4">
              {coas.length === 0 && (
                <p className="text-sm text-gray-500">No COA documents linked to this product yet.</p>
              )}

              {coas.map((coa, idx) => (
                <div
                  key={coa.id ?? `new-${idx}`}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5">
                      <Shield className="h-3.5 w-3.5" />
                      {coa.id ? `COA — ${coa.batch_number || "Draft"}` : "New COA"}
                    </span>
                    <div className="flex items-center gap-2">
                      {coa.id && (
                        <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                          Saved
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => deleteCoa(idx)}
                        disabled={coa._deleting}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete COA"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Batch Number
                      </label>
                      <input
                        className={inputCls}
                        value={coa.batch_number}
                        onChange={(e) => updateCoa(idx, "batch_number", e.target.value)}
                        placeholder="e.g. BPC-2024-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Purity %
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        className={inputCls}
                        value={coa.purity_percentage}
                        onChange={(e) => updateCoa(idx, "purity_percentage", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Test Date
                      </label>
                      <input
                        type="date"
                        className={inputCls}
                        value={coa.test_date}
                        onChange={(e) => updateCoa(idx, "test_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        PDF
                      </label>
                      {coa.pdf_url ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={coa.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#1a6de3] hover:underline truncate max-w-[120px]"
                          >
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            View PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => updateCoa(idx, "pdf_url", "")}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors">
                          {uploading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Upload className="h-3 w-3" />
                          )}
                          Upload
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => handleCoaPdfUpload(idx, e)}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => saveCoa(idx)}
                      disabled={coa._saving || !coa.batch_number}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {coa._saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : null}
                      {coa.id ? "Update COA" : "Save COA"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addCoa}
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3] transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add COA Document
              </button>
            </div>
          </Section>
        )}

        {/* ---- Settings ---- */}
        <Section title="Settings" icon={Settings} defaultOpen={true}>
          <div className="space-y-4">
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => updateField("featured", e.target.checked)}
                  className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                />
                <Star className="h-4 w-4 text-amber-400" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => updateField("active", e.target.checked)}
                  className="rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                />
                Active
              </label>
            </div>
            <div className="w-32">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Sort Order
              </label>
              <input
                type="number"
                className={inputCls}
                value={form.sort_order}
                onChange={(e) => updateField("sort_order", e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">Lower = shows first in shop</p>
            </div>
          </div>
        </Section>

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

      {/* Preview Panel */}
      {showPreview && (
        <div className="sticky top-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Card Preview
          </p>
          <PreviewCard form={form} images={images} categories={categories} />
        </div>
      )}
    </div>
  );
}

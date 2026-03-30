"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import {
  X,
  Upload,
  Loader2,
  ChevronDown,
  ChevronRight,
  Bold,
  Italic,
  Heading,
  List,
  Link as LinkIcon,
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
import type { Product, Category } from "@/lib/types";

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

interface Props {
  product?: Product;
  categories: Category[];
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
/*  Rich Text Toolbar                                                 */
/* ------------------------------------------------------------------ */
function RichTextEditor({
  value,
  onChange,
  placeholder,
  minHeight = "120px",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false);

  // Sync external value into the editor only when it differs and the change
  // did not originate from the editor itself.
  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  function exec(command: string, val?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, val);
    flush();
  }

  function flush() {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  }

  function handleLink() {
    const url = prompt("Enter URL:");
    if (url) exec("createLink", url);
  }

  const btnCls =
    "p-1.5 rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors";

  return (
    <div className="rounded-lg border border-gray-300 focus-within:border-[#1a6de3] focus-within:ring-1 focus-within:ring-[#1a6de3] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <button type="button" className={btnCls} onClick={() => exec("bold")} title="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btnCls} onClick={() => exec("italic")} title="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button
          type="button"
          className={btnCls}
          onClick={() => exec("formatBlock", "H3")}
          title="Heading"
        >
          <Heading className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={btnCls}
          onClick={() => exec("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>
        <div className="mx-1 h-4 w-px bg-gray-300" />
        <button type="button" className={btnCls} onClick={handleLink} title="Insert Link">
          <LinkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="prose prose-sm max-w-none px-3 py-2 text-sm focus:outline-none"
        style={{ minHeight }}
        onInput={flush}
        onBlur={flush}
        data-placeholder={placeholder}
      />
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
      <div className="relative h-[180px] w-full bg-gray-100">
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
            className="object-contain p-4"
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
  const [showPreview, setShowPreview] = useState(false);

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
                        className="absolute top-1.5 right-1.5 rounded-full bg-red-500 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
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

        {/* ---- Settings ---- */}
        <Section title="Settings" icon={Settings} defaultOpen={true}>
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

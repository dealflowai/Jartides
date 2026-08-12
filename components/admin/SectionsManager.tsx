"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import {
  CheckCircle2,
  XCircle,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GripVertical,
  Upload,
  Type,
  Image as ImageIcon,
  Sparkles,
  Columns,
  HelpCircle,
  Minus,
  Megaphone,
  LayoutDashboard,
  ShieldCheck,
  Package,
  BookOpen,
  Newspaper,
  Lock,
  Search,
  Star,
} from "lucide-react";
import {
  PAGE_KEYS,
  PAGE_META,
  SECTION_META,
  CUSTOM_SECTION_TYPES,
  MAX_PICKED_PRODUCTS,
  makeSection,
  type PageKey,
  type PageSection,
  type SectionType,
  type FieldDef,
  type FaqEntry,
  type PickerProduct,
} from "@/lib/sections/schema";
import { formatPrice } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Constants / small helpers                                          */
/* ------------------------------------------------------------------ */
const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

const SECTION_ICONS: Record<SectionType, React.ComponentType<{ className?: string }>> = {
  hero: LayoutDashboard,
  trust_strip: ShieldCheck,
  featured_products: Package,
  how_it_works: BookOpen,
  blog_strip: Newspaper,
  cta_banner: Megaphone,
  rich_text: Type,
  image_banner: ImageIcon,
  callout: Sparkles,
  image_text: Columns,
  faq: HelpCircle,
  spacer: Minus,
};

function clone(layouts: Record<PageKey, PageSection[]>): Record<PageKey, PageSection[]> {
  return JSON.parse(JSON.stringify(layouts));
}

type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

/* ------------------------------------------------------------------ */
/*  Toasts                                                             */
/* ------------------------------------------------------------------ */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[70] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg ${
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toggle switch                                                      */
/* ------------------------------------------------------------------ */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-[#1a6de3]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Image field (URL + upload + preview)                               */
/* ------------------------------------------------------------------ */
function ImageField({
  value,
  onChange,
  notify,
}: {
  value: string;
  onChange: (url: string) => void;
  notify: (type: ToastType, message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "product-images");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      onChange(data.url as string);
      notify("success", "Image uploaded");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-gray-200 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-gray-300">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <input
            className={INPUT_CLS}
            placeholder="Paste an image URL or upload below"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? "Uploading…" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-xs font-medium text-gray-400 hover:text-red-500"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ items editor                                                   */
/* ------------------------------------------------------------------ */
function FaqItemsEditor({
  items,
  onChange,
}: {
  items: FaqEntry[];
  onChange: (items: FaqEntry[]) => void;
}) {
  function update(i: number, key: keyof FaqEntry, val: string) {
    onChange(items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)));
  }
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500">
              Question {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-gray-400 hover:text-red-500"
              aria-label="Remove question"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <input
            className={`${INPUT_CLS} mb-2`}
            placeholder="Question"
            value={item.question}
            onChange={(e) => update(i, "question", e.target.value)}
          />
          <textarea
            className={INPUT_CLS}
            rows={2}
            placeholder="Answer"
            value={item.answer}
            onChange={(e) => update(i, "answer", e.target.value)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { question: "", answer: "" }])}
        className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:border-[#1a6de3] hover:text-[#1a6de3]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add question
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Product picker                                                     */
/* ------------------------------------------------------------------ */
function ProductThumb({ product }: { product: PickerProduct | undefined }) {
  if (product?.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.image}
        alt=""
        className="h-10 w-10 shrink-0 rounded-md border border-gray-200 object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-gray-300">
      <Package className="h-4 w-4" />
    </div>
  );
}

/**
 * Ordered, hand-picked list of products. The saved value is an array of
 * product ids — the order of that array is the order they appear on the site.
 */
function ProductPicker({
  value,
  products,
  onChange,
}: {
  value: string[];
  products: PickerProduct[];
  onChange: (ids: string[]) => void;
}) {
  const [search, setSearch] = useState("");

  const byId = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );
  const selectedIds = useMemo(() => new Set(value), [value]);
  const atLimit = value.length >= MAX_PICKED_PRODUCTS;

  const query = search.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!query) return [];
    return products
      .filter(
        (p) =>
          !selectedIds.has(p.id) &&
          (p.name.toLowerCase().includes(query) ||
            p.slug.toLowerCase().includes(query))
      )
      .slice(0, 8);
  }, [products, query, selectedIds]);

  const flagged = useMemo(
    () => products.filter((p) => p.featured && p.active),
    [products]
  );

  function add(id: string) {
    if (atLimit || selectedIds.has(id)) return;
    onChange([...value, id]);
    setSearch("");
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {/* Picked products, in display order */}
      {value.length > 0 ? (
        <ul className="space-y-1.5">
          {value.map((id, index) => {
            const product = byId.get(id);
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2"
              >
                <span className="w-5 shrink-0 text-center text-xs font-semibold text-gray-400">
                  {index + 1}
                </span>
                <ProductThumb product={product} />
                <div className="min-w-0 flex-1">
                  {product ? (
                    <>
                      <p className="truncate text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="flex items-center gap-1.5 text-xs text-gray-500">
                        {formatPrice(product.price)}
                        {!product.active && (
                          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Hidden — won&apos;t show
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="truncate text-sm font-medium text-gray-500 italic">
                        Product no longer exists
                      </p>
                      <p className="text-xs text-gray-400">
                        It will be skipped on the homepage.
                      </p>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={`Move ${product?.name ?? "product"} up`}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={`Move ${product?.name ?? "product"} down`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(id)}
                    className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${product?.name ?? "product"}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-500">
          <p className="font-semibold text-gray-600">
            Nothing picked — running on autopilot
          </p>
          <p className="mt-0.5">
            The homepage is showing whichever products are ticked{" "}
            <span className="font-medium">Featured</span> on their own product
            page{flagged.length > 0 ? ` (${flagged.length} right now)` : ""}.
            Search below to take control and choose them yourself.
          </p>
          {flagged.length > 0 && (
            <button
              type="button"
              onClick={() =>
                onChange(flagged.slice(0, MAX_PICKED_PRODUCTS).map((p) => p.id))
              }
              className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-[#1a6de3] hover:text-[#1a6de3]"
            >
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Start from the {flagged.length} currently featured
            </button>
          )}
        </div>
      )}

      {/* Search to add */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          className={`${INPUT_CLS} pl-9`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            atLimit
              ? `Limit reached (${MAX_PICKED_PRODUCTS} products)`
              : "Search products to add…"
          }
          disabled={atLimit}
        />
      </div>

      {query && !atLimit && (
        <div className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
          {matches.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => add(p.id)}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-blue-50"
            >
              <ProductThumb product={p} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">
                  {p.name}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  {formatPrice(p.price)}
                  {p.featured && <Star className="h-3 w-3 text-amber-400" />}
                  {!p.active && (
                    <span className="text-amber-600">Hidden</span>
                  )}
                </p>
              </div>
              <Plus className="h-4 w-4 shrink-0 text-[#1a6de3]" />
            </button>
          ))}
          {matches.length === 0 && (
            <p className="px-3 py-2 text-xs text-gray-400">
              No matching products
            </p>
          )}
        </div>
      )}

      {value.length > 0 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {value.length} product{value.length === 1 ? "" : "s"} — shown in this
            order
          </span>
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-medium text-gray-400 hover:text-red-500"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic field renderer                                             */
/* ------------------------------------------------------------------ */
function SectionField({
  field,
  value,
  onChange,
  notify,
  products,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
  notify: (type: ToastType, message: string) => void;
  products: PickerProduct[];
}) {
  const strVal = typeof value === "string" ? value : "";

  return (
    <div>
      {field.type !== "boolean" && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {field.label}
        </label>
      )}

      {field.type === "text" || field.type === "url" ? (
        <input
          className={INPUT_CLS}
          placeholder={field.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "textarea" ? (
        <textarea
          className={INPUT_CLS}
          rows={4}
          placeholder={field.placeholder}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          className={INPUT_CLS}
          value={strVal || field.options?.[0]?.value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "image" ? (
        <ImageField value={strVal} onChange={onChange} notify={notify} />
      ) : field.type === "boolean" ? (
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
          />
          <span className="text-sm font-medium text-gray-700">{field.label}</span>
        </label>
      ) : field.type === "number" ? (
        <input
          type="number"
          className={`${INPUT_CLS} max-w-[120px]`}
          min={field.min}
          max={field.max}
          value={
            typeof value === "number"
              ? value
              : field.defaultValue ?? field.min ?? 0
          }
          onChange={(e) => {
            const parsed = parseInt(e.target.value, 10);
            onChange(
              Number.isFinite(parsed)
                ? parsed
                : field.defaultValue ?? field.min ?? 0
            );
          }}
        />
      ) : field.type === "products" ? (
        <ProductPicker
          value={Array.isArray(value) ? (value as string[]) : []}
          products={products}
          onChange={onChange}
        />
      ) : field.type === "faqItems" ? (
        <FaqItemsEditor
          items={Array.isArray(value) ? (value as FaqEntry[]) : []}
          onChange={onChange}
        />
      ) : null}

      {field.hint && <p className="mt-1 text-xs text-gray-400">{field.hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section card                                                       */
/* ------------------------------------------------------------------ */
/**
 * One-line summary shown under a section's title. Built-ins fall back to their
 * static description; the Featured grid reports what it will actually render,
 * which is the whole point of the picker.
 */
function summarise(section: PageSection, products: PickerProduct[]): string {
  const meta = SECTION_META[section.type];
  if (section.type !== "featured_products") return meta.description;

  const picked = Array.isArray(section.props.productIds)
    ? (section.props.productIds as string[])
    : [];

  if (picked.length > 0) {
    const live = new Set(
      products.filter((p) => p.active).map((p) => p.id)
    );
    const showing = picked.filter((id) => live.has(id)).length;
    const skipped = picked.length - showing;
    return `${showing} hand-picked product${showing === 1 ? "" : "s"}${
      skipped > 0 ? ` (${skipped} unavailable, skipped)` : ""
    }`;
  }

  const limit =
    typeof section.props.limit === "number" ? section.props.limit : 6;
  const flagged = products.filter((p) => p.featured && p.active).length;
  return `Automatic — up to ${limit} products ticked “Featured” (${flagged} available)`;
}

function SectionCard({
  section,
  index,
  total,
  expanded,
  onToggleExpand,
  onToggleEnabled,
  onMove,
  onDelete,
  onUpdateProp,
  notify,
  products,
}: {
  section: PageSection;
  index: number;
  total: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleEnabled: () => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onUpdateProp: (key: string, value: unknown) => void;
  notify: (type: ToastType, message: string) => void;
  products: PickerProduct[];
}) {
  const meta = SECTION_META[section.type];
  const Icon = SECTION_ICONS[section.type];
  const isBuiltin = meta.group === "builtin";
  const hasFields = meta.fields.length > 0;

  return (
    <div
      className={`rounded-xl border bg-white shadow-sm transition-colors ${
        section.enabled ? "border-gray-200" : "border-gray-200 bg-gray-50/60"
      }`}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Reorder controls */}
        <div className="flex flex-col items-center text-gray-300">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={index === 0}
            className="rounded p-0.5 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move up"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <GripVertical className="h-3.5 w-3.5" />
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={index === total - 1}
            className="rounded p-0.5 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Move down"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        {/* Icon */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            section.enabled ? "bg-blue-50 text-[#1a6de3]" : "bg-gray-100 text-gray-400"
          }`}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* Label */}
        <button
          type="button"
          onClick={hasFields ? onToggleExpand : undefined}
          className={`flex min-w-0 flex-1 items-center gap-2 text-left ${
            hasFields ? "cursor-pointer" : "cursor-default"
          }`}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-gray-900">
                {meta.label}
              </span>
              {isBuiltin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                  <Lock className="h-2.5 w-2.5" /> Built-in
                </span>
              )}
            </div>
            <p className="truncate text-xs text-gray-500">
              {summarise(section, products)}
            </p>
          </div>
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-3">
          {hasFields && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label={expanded ? "Collapse" : "Edit"}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`}
              />
            </button>
          )}
          <Toggle
            checked={section.enabled}
            onChange={onToggleEnabled}
            label={`${section.enabled ? "Hide" : "Show"} ${meta.label}`}
          />
          {meta.deletable && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
              aria-label="Delete section"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      {expanded && hasFields && (
        <div className="space-y-4 border-t border-gray-100 bg-gray-50/40 p-4">
          {meta.fields.map((field) => (
            <SectionField
              key={field.key}
              field={field}
              value={section.props[field.key]}
              onChange={(v) => onUpdateProp(field.key, v)}
              notify={notify}
              products={products}
            />
          ))}
        </div>
      )}

      {/* Built-in note */}
      {expanded && isBuiltin && (
        <div className="border-t border-gray-100 bg-gray-50/40 p-4 text-xs text-gray-500">
          This is a built-in section. You can show, hide and reorder it here. Its
          heading and body text are edited inline on the page itself, or under{" "}
          <a href="/admin/settings" className="font-medium text-[#1a6de3] hover:underline">
            Settings
          </a>
          .
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add-section menu                                                   */
/* ------------------------------------------------------------------ */
function AddSectionMenu({ onAdd }: { onAdd: (type: SectionType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 transition-colors hover:border-[#1a6de3] hover:text-[#1a6de3]"
      >
        <Plus className="h-4 w-4" />
        Add a section
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full z-50 mb-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
            <p className="px-3 pb-1.5 pt-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Choose a block
            </p>
            {CUSTOM_SECTION_TYPES.map((type) => {
              const meta = SECTION_META[type];
              const Icon = SECTION_ICONS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onAdd(type);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-blue-50"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1a6de3]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      {meta.label}
                    </div>
                    <div className="text-xs text-gray-500">{meta.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main manager                                                       */
/* ------------------------------------------------------------------ */
export default function SectionsManager({
  initialLayouts,
  products = [],
}: {
  initialLayouts: Record<PageKey, PageSection[]>;
  /** Catalogue for the Featured Products picker. */
  products?: PickerProduct[];
}) {
  const [layouts, setLayouts] = useState<Record<PageKey, PageSection[]>>(
    () => clone(initialLayouts)
  );
  const savedRef = useRef<Record<PageKey, PageSection[]>>(clone(initialLayouts));
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const sections = layouts[activePage];

  /* ---------- Toasts ---------- */
  const notify = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);
  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------- Dirty tracking ---------- */
  const isPageDirty = useCallback(
    (page: PageKey) =>
      JSON.stringify(layouts[page]) !== JSON.stringify(savedRef.current[page]),
    [layouts]
  );
  const dirty = useMemo(() => isPageDirty(activePage), [isPageDirty, activePage]);

  /* ---------- Mutations (active page) ---------- */
  const setActiveSections = useCallback(
    (updater: (prev: PageSection[]) => PageSection[]) => {
      setLayouts((prev) => ({ ...prev, [activePage]: updater(prev[activePage]) }));
    },
    [activePage]
  );

  const toggleEnabled = useCallback(
    (id: string) =>
      setActiveSections((prev) =>
        prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
      ),
    [setActiveSections]
  );

  const move = useCallback(
    (id: string, dir: -1 | 1) =>
      setActiveSections((prev) => {
        const i = prev.findIndex((s) => s.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= prev.length) return prev;
        const next = [...prev];
        [next[i], next[j]] = [next[j], next[i]];
        return next;
      }),
    [setActiveSections]
  );

  const remove = useCallback(
    (id: string) => {
      setActiveSections((prev) => prev.filter((s) => s.id !== id));
      setExpandedId((cur) => (cur === id ? null : cur));
    },
    [setActiveSections]
  );

  const add = useCallback(
    (type: SectionType) => {
      const section = makeSection(type);
      setActiveSections((prev) => [...prev, section]);
      setExpandedId(section.id);
    },
    [setActiveSections]
  );

  const updateProp = useCallback(
    (id: string, key: string, value: unknown) =>
      setActiveSections((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, props: { ...s.props, [key]: value } } : s
        )
      ),
    [setActiveSections]
  );

  /* ---------- Save / discard ---------- */
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: activePage, sections }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || `Save failed (${res.status})`);

      // Adopt the server-sanitised version as the new saved + working state.
      const savedSections = (data?.sections as PageSection[]) ?? sections;
      savedRef.current = {
        ...savedRef.current,
        [activePage]: JSON.parse(JSON.stringify(savedSections)),
      };
      setLayouts((prev) => ({ ...prev, [activePage]: savedSections }));
      notify("success", `${PAGE_META[activePage].label} sections saved`);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setLayouts((prev) => ({
      ...prev,
      [activePage]: JSON.parse(JSON.stringify(savedRef.current[activePage])),
    }));
    setExpandedId(null);
  }

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-3xl pb-28">
      <ToastContainer toasts={toasts} onDismiss={dismiss} />

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Sections</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add, remove, reorder and edit the sections that make up your pages.
          </p>
        </div>
        <a
          href={PAGE_META[activePage].path}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          View page
        </a>
      </div>

      {/* Page tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {PAGE_KEYS.map((page) => {
          const active = page === activePage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => {
                setActivePage(page);
                setExpandedId(null);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-[#0b3d7a] text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {PAGE_META[page].label}
              {isPageDirty(page) && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    active ? "bg-amber-300" : "bg-amber-400"
                  }`}
                  title="Unsaved changes"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Page note */}
      <div className="mb-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 text-xs text-[#0b3d7a]">
        {PAGE_META[activePage].note}
      </div>

      {/* Section list */}
      <div className="space-y-3">
        {sections.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-400">
            No sections yet. Add one below to get started.
          </div>
        )}

        {sections.map((section, index) => (
          <SectionCard
            key={section.id}
            section={section}
            index={index}
            total={sections.length}
            expanded={expandedId === section.id}
            onToggleExpand={() =>
              setExpandedId((cur) => (cur === section.id ? null : section.id))
            }
            onToggleEnabled={() => toggleEnabled(section.id)}
            onMove={(dir) => move(section.id, dir)}
            onDelete={() => remove(section.id)}
            onUpdateProp={(key, value) => updateProp(section.id, key, value)}
            notify={notify}
            products={products}
          />
        ))}
      </div>

      {/* Add section */}
      <div className="mt-4">
        <AddSectionMenu onAdd={add} />
      </div>

      {/* Floating save bar */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ${
          dirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 bg-white/95 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <p className="text-sm text-gray-600">
              Unsaved changes on{" "}
              <span className="font-semibold">{PAGE_META[activePage].label}</span>
            </p>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="sm" onClick={handleDiscard}>
                Discard
              </Button>
              <Button type="button" size="sm" disabled={saving} onClick={handleSave}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

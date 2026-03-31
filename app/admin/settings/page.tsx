"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";
import {
  Settings,
  Megaphone,
  LayoutDashboard,
  Share2,
  Mail,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface SettingsState {
  hero_heading: string;
  hero_subheading: string;
  ticker_items: string;
  featured_product_count: string;
  instagram_url: string;
  tiktok_url: string;
  contact_email: string;
  business_address: string;
  site_title: string;
  meta_description: string;
}

type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

const DEFAULTS: SettingsState = {
  hero_heading: "",
  hero_subheading: "",
  ticker_items: "",
  featured_product_count: "4",
  instagram_url: "",
  tiktok_url: "",
  contact_email: "",
  business_address: "",
  site_title: "",
  meta_description: "",
};

/* ------------------------------------------------------------------ */
/*  Toast notification                                                 */
/* ------------------------------------------------------------------ */
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg animate-in slide-in-from-top-2 ${
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
/*  Section card wrapper                                               */
/* ------------------------------------------------------------------ */
function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  danger,
}: {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${
        danger ? "border-red-200" : "border-gray-200"
      }`}
    >
      <div className="mb-5 flex items-start gap-3">
        {Icon && (
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              danger ? "bg-red-100 text-red-600" : "bg-blue-50 text-[#1a6de3]"
            }`}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h2
            className={`text-lg font-semibold ${
              danger ? "text-red-600" : "text-gray-900"
            }`}
          >
            {title}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable field components                                          */
/* ------------------------------------------------------------------ */
const INPUT_CLS =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] transition-colors";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsState>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  // Keep a snapshot of the last-saved state to detect unsaved changes
  const savedSnapshot = useRef<SettingsState>(DEFAULTS);

  /* ---------- Toast helpers ---------- */
  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ---------- Load ---------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || `Failed to load settings (${res.status})`);
        }
        const data = await res.json();

        const map: Record<string, string> = {};
        for (const item of data) {
          map[item.key] =
            typeof item.value === "string"
              ? item.value
              : Array.isArray(item.value)
                ? (item.value as string[]).join("\n")
                : String(item.value ?? "");
        }

        const loaded: SettingsState = {
          hero_heading: map.hero_heading ?? "",
          hero_subheading: map.hero_subheading ?? "",
          ticker_items: map.ticker_items ?? "",
          featured_product_count: map.featured_product_count ?? "4",
          instagram_url: map.instagram_url ?? "",
          tiktok_url: map.tiktok_url ?? "",
          contact_email: map.contact_email ?? "",
          business_address: map.business_address ?? "",
          site_title: map.site_title ?? "",
          meta_description: map.meta_description ?? "",
        };

        setForm(loaded);
        savedSnapshot.current = loaded;
      } catch (err) {
        setLoadError(
          err instanceof Error ? err.message : "Failed to load settings"
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* ---------- Helpers ---------- */
  function updateField(field: keyof SettingsState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const changed = (Object.keys(next) as (keyof SettingsState)[]).some(
        (k) => next[k] !== savedSnapshot.current[k]
      );
      setDirty(changed);
      return next;
    });
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);

    const settings: Record<string, unknown> = {
      hero_heading: form.hero_heading,
      hero_subheading: form.hero_subheading,
      ticker_items: form.ticker_items
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      featured_product_count: parseInt(form.featured_product_count) || 4,
      instagram_url: form.instagram_url,
      tiktok_url: form.tiktok_url,
      contact_email: form.contact_email,
      business_address: form.business_address,
      site_title: form.site_title,
      meta_description: form.meta_description,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Save failed (${res.status})`);
      }

      savedSnapshot.current = { ...form };
      setDirty(false);
      addToast("success", "Settings saved successfully");
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to save settings"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleRevalidate() {
    setRevalidating(true);
    try {
      const res = await fetch("/api/revalidate", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Revalidation failed (${res.status})`);
      }
      addToast("success", "Cache cleared — pages will rebuild on next visit");
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to clear cache"
      );
    } finally {
      setRevalidating(false);
    }
  }

  /* ---------- Loading skeleton ---------- */
  if (loading) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="mb-8 text-sm text-gray-500">
          Manage your storefront content and configuration.
        </p>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Load error ---------- */
  if (loadError) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Site Settings</h1>
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <XCircle className="mx-auto mb-3 h-8 w-8 text-red-400" />
          <p className="text-sm font-medium text-red-800">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-3xl pb-28">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your storefront content and configuration.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* ---- Hero Section ---- */}
        <SectionCard
          title="Hero Section"
          description="The main banner visitors see when they land on your site."
          icon={LayoutDashboard}
        >
          <div className="space-y-4">
            <Field label="Hero Heading" hint="Large headline text on the homepage hero.">
              <input
                className={INPUT_CLS}
                placeholder="e.g. Welcome to Our Store"
                value={form.hero_heading}
                onChange={(e) => updateField("hero_heading", e.target.value)}
              />
            </Field>
            <Field label="Hero Subheading" hint="Supporting text below the headline.">
              <input
                className={INPUT_CLS}
                placeholder="e.g. Shop the latest arrivals"
                value={form.hero_subheading}
                onChange={(e) => updateField("hero_subheading", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ---- Announcement Bar / Ticker ---- */}
        <SectionCard
          title="Announcement Bar / Ticker"
          description="Scrolling messages displayed at the top of the page."
          icon={Megaphone}
        >
          <Field
            label="Ticker Items"
            hint="Enter one message per line. They will scroll across the announcement bar."
          >
            <textarea
              className={INPUT_CLS}
              rows={4}
              placeholder={"We ship worldwide\nSame-day processing\n99%+ purity guaranteed"}
              value={form.ticker_items}
              onChange={(e) => updateField("ticker_items", e.target.value)}
            />
          </Field>
        </SectionCard>

        {/* ---- Homepage ---- */}
        <SectionCard
          title="Homepage"
          description="Control what appears on the homepage."
          icon={Settings}
        >
          <Field
            label="Featured Product Count"
            hint="Number of products shown in the featured section (1–24)."
          >
            <input
              type="number"
              min={1}
              max={24}
              className={INPUT_CLS + " max-w-[120px]"}
              value={form.featured_product_count}
              onChange={(e) =>
                updateField("featured_product_count", e.target.value)
              }
            />
          </Field>
        </SectionCard>

        {/* ---- Social Media ---- */}
        <SectionCard
          title="Social Media"
          description="Links to your social media profiles."
          icon={Share2}
        >
          <div className="space-y-4">
            <Field label="Instagram URL">
              <input
                className={INPUT_CLS}
                type="url"
                placeholder="https://instagram.com/yourhandle"
                value={form.instagram_url}
                onChange={(e) => updateField("instagram_url", e.target.value)}
              />
            </Field>
            <Field label="TikTok URL">
              <input
                className={INPUT_CLS}
                type="url"
                placeholder="https://tiktok.com/@yourhandle"
                value={form.tiktok_url}
                onChange={(e) => updateField("tiktok_url", e.target.value)}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ---- Contact Info ---- */}
        <SectionCard
          title="Contact Info"
          description="Shown in the footer, contact page, and email communications."
          icon={Mail}
        >
          <div className="space-y-4">
            <Field label="Contact Email">
              <input
                className={INPUT_CLS}
                type="email"
                placeholder="hello@yourdomain.com"
                value={form.contact_email}
                onChange={(e) => updateField("contact_email", e.target.value)}
              />
            </Field>
            <Field label="Business Address">
              <input
                className={INPUT_CLS}
                placeholder="123 Main St, City, State 12345"
                value={form.business_address}
                onChange={(e) =>
                  updateField("business_address", e.target.value)
                }
              />
            </Field>
          </div>
        </SectionCard>

        {/* ---- SEO ---- */}
        <SectionCard
          title="SEO"
          description="Search engine optimization defaults for your site."
          icon={Search}
        >
          <div className="space-y-4">
            <Field
              label="Site Title"
              hint="Appears in browser tabs and search results."
            >
              <input
                className={INPUT_CLS}
                placeholder="Your Store Name"
                value={form.site_title}
                onChange={(e) => updateField("site_title", e.target.value)}
              />
            </Field>
            <Field
              label="Meta Description"
              hint="A short summary (under 160 characters) for search engines."
            >
              <textarea
                className={INPUT_CLS}
                rows={2}
                maxLength={160}
                placeholder="A brief description of your store for search results..."
                value={form.meta_description}
                onChange={(e) =>
                  updateField("meta_description", e.target.value)
                }
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {form.meta_description.length}/160
              </p>
            </Field>
          </div>
        </SectionCard>

        {/* ---- Danger Zone ---- */}
        <SectionCard
          title="Danger Zone"
          description="Actions that affect the live site immediately."
          icon={AlertTriangle}
          danger
        >
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-red-800">
                Clear all caches / Revalidate
              </p>
              <p className="text-xs text-red-600">
                Forces every page to rebuild on its next visit. Use after bulk
                changes.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRevalidate}
              disabled={revalidating}
              className="ml-4 shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-600 hover:text-white disabled:opacity-50"
            >
              {revalidating ? "Clearing..." : "Clear Cache"}
            </button>
          </div>
        </SectionCard>

        {/* Hidden native submit so Enter key still works */}
        <button type="submit" className="hidden" />
      </form>

      {/* ---- Floating Save Bar ---- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ${
          dirty
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <p className="text-sm text-gray-600">You have unsaved changes</p>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setForm(savedSnapshot.current);
                  setDirty(false);
                }}
              >
                Discard
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={saving}
                onClick={() => handleSave()}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

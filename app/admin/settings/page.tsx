"use client";

import { useState, useEffect, useRef } from "react";
import Button from "@/components/ui/Button";

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
/*  Section card wrapper                                               */
/* ------------------------------------------------------------------ */
function SectionCard({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm ${
        danger ? "border-red-200" : "border-gray-200"
      }`}
    >
      <div className="mb-5">
        <h2
          className={`text-lg font-semibold ${
            danger ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-gray-500">{description}</p>
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
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [revalidating, setRevalidating] = useState(false);

  // Keep a snapshot of the last-saved state to detect unsaved changes
  const savedSnapshot = useRef<SettingsState>(DEFAULTS);

  /* ---------- Load ---------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
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
      // Check if form differs from saved snapshot
      const changed = (Object.keys(next) as (keyof SettingsState)[]).some(
        (k) => next[k] !== savedSnapshot.current[k]
      );
      setDirty(changed);
      setSaved(false);
      return next;
    });
  }

  async function handleSave(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    setSaved(false);

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
      if (!res.ok) throw new Error();
      savedSnapshot.current = { ...form };
      setDirty(false);
      setSaved(true);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevalidate() {
    setRevalidating(true);
    try {
      const res = await fetch("/api/revalidate", { method: "POST" });
      if (!res.ok) throw new Error();
      alert("Cache cleared successfully. Pages will rebuild on next visit.");
    } catch {
      alert("Failed to clear cache. The /api/revalidate endpoint may not exist yet.");
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-3xl pb-28">
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
        >
          <Field
            label="Featured Product Count"
            hint="Number of products shown in the featured section."
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
              <p className="mt-1 text-xs text-gray-400 text-right">
                {form.meta_description.length}/160
              </p>
            </Field>
          </div>
        </SectionCard>

        {/* ---- Danger Zone ---- */}
        <SectionCard
          title="Danger Zone"
          description="Actions that affect the live site immediately."
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
        <div className="border-t border-gray-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3">
            <p className="text-sm text-gray-600">
              You have unsaved changes.
            </p>
            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm font-medium text-green-600">
                  Saved!
                </span>
              )}
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

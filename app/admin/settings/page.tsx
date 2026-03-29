"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";

interface SettingsState {
  hero_heading: string;
  hero_subheading: string;
  ticker_items: string;
  featured_product_count: string;
  instagram_url: string;
  tiktok_url: string;
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsState>({
    hero_heading: "",
    hero_subheading: "",
    ticker_items: "",
    featured_product_count: "4",
    instagram_url: "",
    tiktok_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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

        setForm({
          hero_heading: map.hero_heading ?? "",
          hero_subheading: map.hero_subheading ?? "",
          ticker_items: map.ticker_items ?? "",
          featured_product_count: map.featured_product_count ?? "4",
          instagram_url: map.instagram_url ?? "",
          tiktok_url: map.tiktok_url ?? "",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function updateField(field: keyof SettingsState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
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
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
    } catch {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]";

  if (loading) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          Site Settings
        </h1>
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Site Settings</h1>

      <form onSubmit={handleSave} className="max-w-xl space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Hero Heading
          </label>
          <input
            className={inputCls}
            value={form.hero_heading}
            onChange={(e) => updateField("hero_heading", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Hero Subheading
          </label>
          <input
            className={inputCls}
            value={form.hero_subheading}
            onChange={(e) => updateField("hero_subheading", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ticker Items (one per line)
          </label>
          <textarea
            className={inputCls}
            rows={4}
            value={form.ticker_items}
            onChange={(e) => updateField("ticker_items", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Featured Product Count
          </label>
          <input
            type="number"
            className={inputCls}
            value={form.featured_product_count}
            onChange={(e) =>
              updateField("featured_product_count", e.target.value)
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Instagram URL
          </label>
          <input
            className={inputCls}
            value={form.instagram_url}
            onChange={(e) => updateField("instagram_url", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            TikTok URL
          </label>
          <input
            className={inputCls}
            value={form.tiktok_url}
            onChange={(e) => updateField("tiktok_url", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </Button>
          {saved && (
            <span className="text-sm text-green-600">Settings saved.</span>
          )}
        </div>
      </form>
    </div>
  );
}

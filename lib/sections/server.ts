import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  type PageKey,
  type PageSection,
  PAGE_KEYS,
  defaultLayout,
  normalizeLayout,
  settingsKeyForPage,
} from "./schema";

/**
 * Load the saved section layout for a page from `site_settings`.
 * Falls back to the built-in default layout if nothing is saved or on error,
 * so the public site always renders something sensible.
 */
export async function getPageSections(page: PageKey): Promise<PageSection[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", settingsKeyForPage(page))
      .maybeSingle();

    if (data?.value == null) {
      return defaultLayout(page);
    }

    // Values are stored as jsonb; some legacy rows may be JSON strings.
    const value =
      typeof data.value === "string" ? safeParse(data.value) : data.value;

    return normalizeLayout(page, value);
  } catch {
    return defaultLayout(page);
  }
}

/** Load every managed page's layout in one round-trip (for the admin manager). */
export async function getAllPageSections(): Promise<Record<PageKey, PageSection[]>> {
  const result = Object.fromEntries(
    PAGE_KEYS.map((page) => [page, defaultLayout(page)])
  ) as Record<PageKey, PageSection[]>;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .like("key", "page_sections_%");

    const byKey = new Map<string, unknown>();
    for (const row of data ?? []) {
      byKey.set(row.key, row.value);
    }

    for (const page of Object.keys(result) as PageKey[]) {
      const stored = byKey.get(settingsKeyForPage(page));
      const value =
        typeof stored === "string" ? safeParse(stored) : stored ?? null;
      result[page] = normalizeLayout(page, value);
    }
  } catch {
    // Fall through with defaults already normalised below.
  }

  // Make sure even the defaults are normalised (home gets all built-ins).
  for (const page of Object.keys(result) as PageKey[]) {
    result[page] = normalizeLayout(page, result[page]);
  }
  return result;
}

function safeParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

import "server-only";
import { createClient } from "@/lib/supabase/server";
import { sortInStockFirst } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { DEFAULT_FEATURED_LIMIT, MAX_PICKED_PRODUCTS } from "@/lib/sections/schema";

const PRODUCT_SELECT = "*, category:categories(*), variants:product_variants(*)";

export interface FeaturedConfig {
  /** Hand-picked product ids, in the order the admin arranged them. */
  productIds: string[];
  /** Cap for the automatic fallback. */
  limit: number;
}

/** Read the Featured Products section's props into a usable config. */
export function readFeaturedConfig(props: Record<string, unknown>): FeaturedConfig {
  const raw = Array.isArray(props.productIds) ? props.productIds : [];
  const productIds = raw
    .filter((id): id is string => typeof id === "string" && id.length > 0)
    .slice(0, MAX_PICKED_PRODUCTS);

  const parsedLimit = Number(props.limit);
  const limit =
    Number.isFinite(parsedLimit) && parsedLimit >= 1
      ? Math.min(Math.round(parsedLimit), MAX_PICKED_PRODUCTS)
      : DEFAULT_FEATURED_LIMIT;

  return { productIds, limit };
}

/**
 * Resolve the products for the homepage's Featured Products grid.
 *
 * Hand-picked products win: they render in exactly the order the admin chose,
 * with no in-stock reshuffling, because that order is a deliberate decision.
 * With nothing picked, fall back to whatever is ticked "Featured" on the
 * product itself — that keeps stores that never open the picker working.
 */
export async function getFeaturedProducts(
  props: Record<string, unknown>
): Promise<Product[]> {
  const { productIds, limit } = readFeaturedConfig(props);

  try {
    const supabase = await createClient();

    if (productIds.length > 0) {
      const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("active", true)
        .in("id", productIds);

      const byId = new Map((data ?? []).map((p) => [p.id, p as Product]));
      // Skip ids that no longer resolve (deleted or since deactivated) rather
      // than leaving a hole in the grid.
      return productIds
        .map((id) => byId.get(id))
        .filter((p): p is Product => p !== undefined);
    }

    const { data } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);

    return data ? sortInStockFirst(data as Product[]) : [];
  } catch {
    // Supabase may not be connected yet — render nothing rather than crash.
    return [];
  }
}

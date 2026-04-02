import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/fda`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/coa`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/subscribe`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Fetch active products from Supabase (gracefully skip if unavailable)
  let products: { slug: string; updated_at: string; images: string[] | null }[] | null = null;
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("products")
      .select("slug, updated_at, images")
      .eq("active", true);
    products = data;
  } catch {
    // DB unavailable (e.g. CI build) — return static pages only
  }

  const productPages: MetadataRoute.Sitemap = (products ?? []).map(
    (product) => ({
      url: `${BASE_URL}/shop/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: (product.images as string[] | null)?.filter(Boolean) ?? [],
    })
  );

  return [...staticPages, ...productPages];
}

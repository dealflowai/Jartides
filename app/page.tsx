import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { sortInStockFirst } from "@/lib/utils";
import type { Product } from "@/lib/types";
import PageSections from "@/components/sections/PageSections";

export const metadata: Metadata = {
  title: "Jartides | Premium Research Peptides",
  description:
    "Shop 99%+ purity research peptides with third-party COAs. Same-day processing, 3-8 business day delivery. Worldwide shipping.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Jartides | Premium Research Peptides",
    description:
      "Shop 99%+ purity research peptides with third-party COAs. Same-day processing, 3-8 business day delivery. Worldwide shipping.",
  },
};

export default async function HomePage() {
  let products: Product[] = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), variants:product_variants(*)")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) products = sortInStockFirst(data as Product[]);
  } catch {
    // Supabase may not be connected yet — fall back to empty array
  }

  return <PageSections page="home" products={products} />;
}

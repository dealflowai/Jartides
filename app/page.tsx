import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowPeptidesWork from "@/components/home/HowPeptidesWork";
import CTABanner from "@/components/home/CTABanner";

export const metadata: Metadata = {
  title: "Jartides | Premium Canadian Research Peptides",
  description:
    "Shop 99%+ purity research peptides with third-party COAs. Same-day processing, 3-8 business day delivery. Worldwide shipping.",
  openGraph: {
    title: "Jartides | Premium Canadian Research Peptides",
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
      .select("*, category:categories(*)")
      .eq("active", true)
      .eq("featured", true)
      .order("created_at", { ascending: false })
      .limit(6);

    if (data) products = data as Product[];
  } catch {
    // Supabase may not be connected yet — fall back to empty array
  }

  return (
    <>
      <Hero />
      <TrustStrip />
      <FeaturedProducts products={products} />
      <HowPeptidesWork />
      <CTABanner />
    </>
  );
}

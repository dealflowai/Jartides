import type { Product } from "@/lib/types";
import type { PageKey } from "@/lib/sections/schema";
import { getPageSections } from "@/lib/sections/server";
import CustomSection from "./CustomSection";
import Hero from "@/components/home/Hero";
import TrustStrip from "@/components/home/TrustStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HowPeptidesWork from "@/components/home/HowPeptidesWork";
import BlogStrip from "@/components/home/BlogStrip";
import CTABanner from "@/components/home/CTABanner";

/**
 * Renders a page's admin-managed sections, in saved order, skipping any that
 * are switched off. Built-in homepage sections map to their existing
 * components; everything else is a custom admin-authored block.
 */
export default async function PageSections({
  page,
  products = [],
}: {
  page: PageKey;
  /** Required for the built-in "featured_products" section on the homepage. */
  products?: Product[];
}) {
  const sections = await getPageSections(page);

  return (
    <>
      {sections
        .filter((s) => s.enabled)
        .map((section) => {
          switch (section.type) {
            case "hero":
              return <Hero key={section.id} />;
            case "trust_strip":
              return <TrustStrip key={section.id} />;
            case "featured_products":
              return <FeaturedProducts key={section.id} products={products} />;
            case "how_it_works":
              return <HowPeptidesWork key={section.id} />;
            case "blog_strip":
              return <BlogStrip key={section.id} />;
            case "cta_banner":
              return <CTABanner key={section.id} />;
            default:
              return <CustomSection key={section.id} section={section} />;
          }
        })}
    </>
  );
}

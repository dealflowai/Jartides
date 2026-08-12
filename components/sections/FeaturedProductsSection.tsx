import type { PageSection } from "@/lib/sections/schema";
import { getFeaturedProducts } from "@/lib/products/featured";
import FeaturedProducts from "@/components/home/FeaturedProducts";

/**
 * Server wrapper for the Featured Products grid. It loads its own products so
 * the admin's hand-picked list lives with the section, not with the page.
 */
export default async function FeaturedProductsSection({
  section,
}: {
  section: PageSection;
}) {
  const products = await getFeaturedProducts(section.props);
  return <FeaturedProducts products={products} />;
}

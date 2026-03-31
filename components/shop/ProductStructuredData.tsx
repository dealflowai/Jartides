import type { Product } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.vercel.app";

interface Props {
  product: Product;
}

export default function ProductStructuredData({ product }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.slug,
    image: product.images.length > 0 ? product.images[0] : undefined,
    url: `${BASE_URL}/shop/${product.slug}`,
    brand: {
      "@type": "Brand",
      name: "Jartides",
    },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "CAD",
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${BASE_URL}/shop/${product.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

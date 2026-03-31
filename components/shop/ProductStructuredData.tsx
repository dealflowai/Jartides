import type { Product } from "@/lib/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

interface Props {
  product: Product;
}

export default function ProductStructuredData({ product }: Props) {
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.meta_description || product.description?.replace(/<[^>]*>/g, "").slice(0, 200),
    sku: product.sku || product.slug,
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
    ...(product.review_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avg_rating,
        reviewCount: product.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${BASE_URL}/shop`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${BASE_URL}/shop?category=${product.category.slug}`,
            },
            {
              "@type": "ListItem",
              position: 4,
              name: product.name,
              item: `${BASE_URL}/shop/${product.slug}`,
            },
          ]
        : [
            {
              "@type": "ListItem",
              position: 3,
              name: product.name,
              item: `${BASE_URL}/shop/${product.slug}`,
            },
          ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </>
  );
}

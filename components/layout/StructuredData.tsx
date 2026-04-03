const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Jartides",
    url: BASE_URL,
    description:
      "Premium research peptides with 99%+ purity. Third-party tested with COAs. Same-day processing, worldwide shipping.",
    contactPoint: {
      "@type": "ContactPoint",
      email: "jartidesofficial@gmail.com",
      contactType: "customer service",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Windsor",
      addressRegion: "Ontario",
      addressCountry: "CA",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Jartides",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
    </>
  );
}

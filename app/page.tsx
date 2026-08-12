import type { Metadata } from "next";
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
  // Each section loads its own data — see components/sections/PageSections.
  return <PageSections page="home" />;
}

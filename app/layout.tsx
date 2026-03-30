import type { Metadata } from "next";
import { Poppins, Bebas_Neue } from "next/font/google";
import "./globals.css";
import CartProvider from "@/components/cart/CartProvider";
import AgeGate from "@/components/layout/AgeGate";
import SiteShell from "@/components/layout/SiteShell";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import StructuredData from "@/components/layout/StructuredData";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.vercel.app";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "research peptides",
    "Canadian peptides",
    "BPC-157",
    "peptide supplier",
    "lab research",
  ],
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: BASE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${bebasNeue.variable}`}>
      <body className="font-[family-name:var(--font-body)] text-[#1a1a2e] bg-white leading-relaxed overflow-x-hidden">
        <StructuredData />
        <CartProvider>
          <AgeGate />
          <SiteShell>{children}</SiteShell>
        </CartProvider>
      </body>
    </html>
  );
}

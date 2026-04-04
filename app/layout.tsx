import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import CartProvider from "@/components/cart/CartProvider";
import WishlistProvider from "@/components/wishlist/WishlistProvider";
import AgeGate from "@/components/layout/AgeGate";
import SiteShell from "@/components/layout/SiteShell";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import StructuredData from "@/components/layout/StructuredData";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import SentryInit from "@/components/analytics/SentryInit";
import CookieConsent from "@/components/layout/CookieConsent";
import WebVitals from "@/components/analytics/WebVitals";
import SiteTracker from "@/components/analytics/SiteTracker";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jartides.ca";

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "research peptides",
    "peptides online",
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
  metadataBase: new URL(BASE_URL),
  icons: {
    icon: "/favicon.ico",
    apple: "/icon.png",
  },
  other: {
    "theme-color": "#0b3d7a",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-body)] text-[#1a1a2e] bg-white leading-relaxed overflow-x-hidden">
        <GoogleAnalytics />
        <SentryInit />
        <WebVitals />
        <SiteTracker />
        <StructuredData />
        <CartProvider>
          <WishlistProvider>
            <AgeGate />
            <SiteShell>{children}</SiteShell>
            <CookieConsent />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

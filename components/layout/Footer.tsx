"use client";

import Link from "next/link";
import {
  CONTACT_EMAIL,
  BUSINESS_ADDRESS,
  SOCIAL_LINKS,
  PAYMENT_METHODS,
  SITE_DESCRIPTION,
} from "@/lib/constants";
import EditableText from "@/components/admin/EditableText";

const shopLinks = [
  { label: "All Products", href: "/shop" },
  { label: "Peptides", href: "/shop?cat=peptides" },
  { label: "Blends", href: "/shop?cat=blends" },
  { label: "Nasal Sprays", href: "/shop?cat=sprays" },
  { label: "Supplies", href: "/shop?cat=supplies" },
];

const companyLinks = [
  { label: "Certificates of Analysis", href: "/coa" },
  { label: "FAQ", href: "/faq" },
  { label: "FDA Disclaimer", href: "/fda" },
];

const supportLinks = [
  { label: "Contact Us", href: "/contact" },
  { label: "Track Order", href: "/track" },
  { label: "My Account", href: "/account" },
];

const policyLinks = [
  { label: "Privacy Policy", href: "/policies/privacy" },
  { label: "Terms of Service", href: "/policies/terms" },
  { label: "Refund Policy", href: "/policies/refund" },
  { label: "Shipping Policy", href: "/policies/shipping" },
];

function PaymentIcon({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center rounded bg-white/10 px-2 py-1 text-xs font-medium text-white/70">
      {name}
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#061a38] text-white/80">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <span className="text-2xl font-bold tracking-wider text-white">
                JARTIDES
              </span>
              <p className="mt-0.5 text-xs font-semibold tracking-[0.2em] text-[#1a6de3] uppercase">
                Research Peptides
              </p>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-white/60">
              <EditableText settingKey="footer_description">
                {SITE_DESCRIPTION}
              </EditableText>
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-[#1a6de3] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.6a8.22 8.22 0 0 0 4.76 1.51V6.69h-1z" />
                </svg>
              </a>
            </div>

            {/* Contact */}
            <div className="mt-6 space-y-1.5 text-sm text-white/50">
              <p>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="transition-colors hover:text-white"
                >
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>{BUSINESS_ADDRESS}</p>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
            {/* Shop */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Shop
              </h3>
              <ul className="space-y-2.5">
                {shopLinks.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Company
              </h3>
              <ul className="space-y-2.5">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Support
              </h3>
              <ul className="space-y-2.5">
                {supportLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Policies */}
            <div>
              <h3 className="mb-4 text-sm font-semibold tracking-wider text-white uppercase">
                Policies
              </h3>
              <ul className="space-y-2.5">
                {policyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Legal disclaimers */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-3 text-xs leading-relaxed text-white/40">
            <p>
              <strong className="text-white/50">Research Use Only:</strong>{" "}
              These products are intended for laboratory research use only. They
              are not intended for human or animal consumption, and are not to be
              used for diagnostic, therapeutic, or any clinical purposes.
            </p>
            <p>
              <strong className="text-white/50">Not for Human Consumption:</strong>{" "}
              By purchasing from Jartides, you agree that the products will be
              used exclusively for in-vitro research conducted by qualified
              professionals. Any misuse is the sole responsibility of the buyer.
            </p>
            <p>
              <strong className="text-white/50">Age Restriction:</strong>{" "}
              You must be 21 years of age or older to purchase products from this
              website. By placing an order, you confirm that you meet this age
              requirement.
            </p>
            <p>
              <strong className="text-white/50">Health Canada Notice:</strong>{" "}
              These products have not been evaluated or approved by Health Canada
              or any other regulatory agency. They are not intended to diagnose,
              treat, cure, or prevent any disease or medical condition.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
          <p className="text-xs text-white/40">
            &copy; 2026 Jartides. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <PaymentIcon key={method} name={method} />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

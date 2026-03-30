import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${SITE_NAME} privacy policy — how we collect, use, and protect your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHeader
        title="PRIVACY POLICY"
        description="How we collect, use, and protect your information."
        breadcrumbs={[{ label: "Privacy Policy" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 font-[family-name:var(--font-body)]">
          <p className="text-sm text-gray-500">Last updated: March 30, 2026</p>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Information We Collect
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              When you place an order or create an account, we collect your name, email address,
              shipping address, and payment information. We also collect basic browsing data
              (pages visited, device type) to improve your experience.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. How We Use Your Information
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to customer support inquiries</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Information Sharing
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We only share
              your data with trusted service providers necessary to fulfill your orders (payment
              processors, shipping carriers) and as required by law.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Data Security
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We implement industry-standard security measures including SSL encryption, secure
              payment processing, and restricted access to personal data. While no method of
              transmission over the internet is 100% secure, we take every reasonable precaution
              to protect your information.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Cookies
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We use cookies to maintain your shopping cart, remember your preferences, and
              understand how you interact with our site. You can disable cookies in your browser
              settings, though some features may not function properly.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Your Rights
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You have the right to access, update, or delete your personal information at any time.
              You may also request a copy of all data we hold about you. To exercise these rights,
              contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Changes to This Policy
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We may update this privacy policy from time to time. Changes will be posted on this
              page with a revised date. Continued use of our website after any changes constitutes
              acceptance of the updated policy.
            </p>
          </div>

          <div className="rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-[#0b3d7a]">Questions?</strong> Contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

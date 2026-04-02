import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { SITE_NAME } from "@/lib/constants";

const CONTACT_EMAIL = "jartidesofficial@gmail.com";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: `${SITE_NAME} cookie policy — what cookies we use, why, and how you can control them.`,
};

export default function CookiePolicyPage() {
  return (
    <>
      <PageHeader
        title="COOKIE POLICY"
        description="What cookies we use, why, and how you can control them."
        breadcrumbs={[{ label: "Cookie Policy" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 font-[family-name:var(--font-body)]">
          <p className="text-sm text-gray-500">
            Effective Date: April 2, 2026 &nbsp;|&nbsp; Last Updated: April 2,
            2026
          </p>

          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. What Are Cookies
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Cookies are small text files stored on your device when you visit a
              website. They help the site remember your preferences, understand
              how you use the site, and improve your overall experience. Some
              cookies are essential for the site to function, while others are
              optional.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Cookies We Use
            </h2>

            <h3 className="mt-4 text-base font-semibold text-gray-900">
              2.1 Essential Cookies
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              These cookies are required for the website to function and cannot
              be disabled. They include cookies that manage your shopping cart,
              authentication session, age verification status, and cookie consent
              preferences.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                      Cookie / Storage Key
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                      Purpose
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700 border-b">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs">
                      jartides_cookie_consent
                    </td>
                    <td className="px-4 py-2">
                      Stores your cookie consent preferences
                    </td>
                    <td className="px-4 py-2">Persistent</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs">
                      jartides_age_verified
                    </td>
                    <td className="px-4 py-2">
                      Records that you confirmed you are 21+
                    </td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs">
                      jartides_cart
                    </td>
                    <td className="px-4 py-2">Shopping cart contents</td>
                    <td className="px-4 py-2">Persistent</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-4 py-2 font-mono text-xs">
                      sb-*-auth-token
                    </td>
                    <td className="px-4 py-2">
                      Authentication session (Supabase)
                    </td>
                    <td className="px-4 py-2">Session</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-6 text-base font-semibold text-gray-900">
              2.2 Analytics Cookies
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              If we enable analytics in the future, we will update this policy
              and request your consent before placing any analytics cookies. No
              analytics cookies are currently in use.
            </p>

            <h3 className="mt-6 text-base font-semibold text-gray-900">
              2.3 Third-Party Cookies
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              When you make a payment through Stripe, Stripe may set its own
              cookies to process your transaction securely and detect fraud.
              These cookies are governed by{" "}
              <a
                href="https://stripe.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1a6de3] hover:underline"
              >
                Stripe&apos;s Privacy Policy
              </a>
              .
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Sentry, our error-monitoring service, may set cookies to track
              errors and site performance. This data is used solely for debugging
              and improving site reliability.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. How to Control Cookies
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              When you first visit our site, a cookie consent banner gives you
              the option to accept all cookies or reject non-essential cookies.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              You can change your preferences at any time by clicking the
              &ldquo;Manage Cookie Preferences&rdquo; link in the site footer,
              which will re-open the consent banner.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              You can also control cookies through your browser settings. Most
              browsers allow you to block or delete cookies. Note that blocking
              essential cookies may prevent parts of the site from functioning
              correctly.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Local Storage
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              In addition to cookies, we use browser local storage to persist
              your shopping cart, wishlist, recently viewed products, and consent
              preferences. Local storage functions similarly to cookies but is
              not automatically sent to our servers with each request. It is read
              only by client-side code on your device.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Updates to This Policy
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We may update this Cookie Policy from time to time. If we make
              significant changes, we will re-prompt you for consent by
              incrementing our consent version. The &ldquo;Last Updated&rdquo;
              date at the top of this page reflects the most recent revision.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Governing Law
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              This Cookie Policy is governed by the laws of the Province of
              Ontario, Canada, including the Personal Information Protection and
              Electronic Documents Act (PIPEDA). For full details on how we
              collect, use, and protect your personal information, please see
              our{" "}
              <a href="/policies/privacy" className="text-[#1a6de3] hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Contact Us
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you have any questions about our use of cookies, please contact
              us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[#1a6de3] hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

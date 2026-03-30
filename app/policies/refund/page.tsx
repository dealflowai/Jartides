import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: `${SITE_NAME} refund policy — what to do if your product arrives damaged or quality is not correct.`,
};

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader
        title="REFUND POLICY"
        description="Our commitment to making things right."
        breadcrumbs={[{ label: "Refund Policy" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 font-[family-name:var(--font-body)]">
          <p className="text-sm text-gray-500">Last updated: March 30, 2026</p>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Eligibility for Refund
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If your product arrives damaged or the quality is not correct, you are eligible for a
              full refund or replacement. You must contact us within 30 days of receiving your order.
              Products must be in their original sealed packaging.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. How to Request a Refund
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                Email us at{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {CONTACT_EMAIL}
                </a>{" "}
                with your order number
              </li>
              <li>Include a description of the issue and photos if applicable</li>
              <li>Our team will review your request within 1-2 business days</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Refund Process
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Once your refund is approved, we will process it to your original payment method within
              5-10 business days. You will receive an email confirmation when the refund has been
              issued.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Replacements
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you prefer a replacement instead of a refund, we will ship a new product at no
              additional cost once the issue has been verified.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Non-Refundable Situations
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Products that have been opened or tampered with</li>
              <li>Requests made more than 30 days after delivery</li>
              <li>Issues caused by improper storage or handling by the buyer</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-[#0b3d7a]">Need help?</strong> Email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              and we&apos;ll take care of it.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

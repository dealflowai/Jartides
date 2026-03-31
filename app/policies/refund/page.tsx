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
          <p className="text-sm text-gray-500">
            Effective Date: March 30, 2026 &nbsp;|&nbsp; Last Updated: March 30, 2026
          </p>

          {/* 1. Scope */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Scope
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              This Refund Policy applies to all orders placed through jartides.com. By placing an order,
              you agree to the terms of this policy. This policy forms part of and should be read
              together with our{" "}
              <a href="/policies/terms" className="text-[#1a6de3] hover:underline">
                Terms of Service
              </a>
              .
            </p>
          </div>

          {/* 2. Eligibility for Refund or Replacement */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Eligibility for Refund or Replacement
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You are eligible for a full refund or a replacement product if your order is affected by
              any of the following issues:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Damaged in Transit:</strong> The product arrived physically damaged, broken, or
                compromised during shipping (e.g., cracked vials, leaking containers, crushed packaging
                affecting product integrity).
              </li>
              <li>
                <strong>Wrong Product Shipped:</strong> You received a product that is different from
                what you ordered.
              </li>
              <li>
                <strong>Missing Items:</strong> One or more items from your confirmed order did not
                arrive in the shipment.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Claims must be submitted within 30 calendar days of the delivery date. Claims submitted
              after 30 days will not be accepted.
            </p>
          </div>

          {/* 3. How to Submit a Claim */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. How to Submit a Claim
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              To request a refund or replacement, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              with the following information:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Your order number</li>
              <li>A description of the issue</li>
              <li>
                Photographs clearly showing the damage, incorrect product, or evidence of missing items
                (e.g., photo of the package contents and packing slip)
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Our team will review your claim and respond within 2 business days of receipt. We may
              request additional information or photographs if needed to verify the claim.
            </p>
          </div>

          {/* 4. Verification Process */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Verification Process
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              No return of products is required. Upon receiving your claim and supporting photographs,
              we will review the evidence and determine whether the claim meets the eligibility criteria
              in Section 2. Our determination is based on the photographic evidence provided and our
              internal order records.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              If the claim is approved, you will be notified by email and offered the choice of a
              refund or replacement (see Section 5).
            </p>
          </div>

          {/* 5. Refund or Replacement */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Refund or Replacement
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If your claim is approved, you may choose one of the following:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Full Refund:</strong> We will process a refund to your original payment method
                within 5-10 business days of approval. You will receive an email confirmation when the
                refund has been issued. Depending on your financial institution, it may take additional
                time for the refund to appear in your account.
              </li>
              <li>
                <strong>Replacement:</strong> We will ship a replacement product at no additional cost.
                Replacement orders are processed with the same priority as new orders and are subject to
                the estimated delivery times in our{" "}
                <a href="/policies/shipping" className="text-[#1a6de3] hover:underline">
                  Shipping Policy
                </a>
                .
              </li>
            </ul>
          </div>

          {/* 6. Non-Refundable Situations */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Non-Refundable Situations
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              The following situations are not eligible for a refund or replacement:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                Products seized, held, detained, or destroyed by customs or border authorities in the
                destination country. International buyers assume all risk associated with customs
                clearance (see our{" "}
                <a href="/policies/shipping" className="text-[#1a6de3] hover:underline">
                  Shipping Policy
                </a>{" "}
                for details).
              </li>
              <li>
                Change of mind, buyer&apos;s remorse, or incorrect ordering by the buyer.
              </li>
              <li>
                Issues caused by improper storage, handling, or use of the product after delivery.
              </li>
              <li>Claims submitted more than 30 calendar days after the delivery date.</li>
              <li>Products purchased from unauthorized resellers or third-party sources.</li>
              <li>
                Delays in delivery caused by carrier issues, customs processing, or events beyond our
                control (see our{" "}
                <a href="/policies/shipping" className="text-[#1a6de3] hover:underline">
                  Shipping Policy
                </a>
                ).
              </li>
            </ul>
          </div>

          {/* 7. Fraudulent Claims */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Fraudulent Claims
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We take refund fraud seriously. If we determine that a claim is fraudulent, falsified, or
              made in bad faith, we reserve the right to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Deny the claim.</li>
              <li>Suspend or permanently terminate your account.</li>
              <li>
                Refuse all future orders from the associated account, email address, or shipping
                address.
              </li>
              <li>Report the matter to appropriate authorities and/or pursue legal action.</li>
            </ul>
          </div>

          {/* 8. European Union Consumer Rights */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8. European Union Consumer Rights
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you are a consumer in the European Union, you may have a right of withdrawal under the
              Consumer Rights Directive (2011/83/EU), allowing you to cancel an online purchase within
              14 days of receipt without providing a reason.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              However, pursuant to Article 16(e) of the Directive, the right of withdrawal does not
              apply to sealed goods which are not suitable for return due to health protection or
              hygiene reasons and which have been unsealed after delivery. Given the nature of our
              products (research chemicals requiring controlled handling and storage conditions),
              products with intact seals may be eligible for the 14-day right of withdrawal. Products
              with broken seals are excluded.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              To exercise your right of withdrawal (where applicable), contact us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>{" "}
              within 14 days of delivery. Return shipping costs for EU right-of-withdrawal claims are
              the responsibility of the buyer. Products must be returned in their original sealed
              condition.
            </p>
          </div>

          {/* 9. Currency */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              9. Currency
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All refunds are issued in the original currency of the transaction. We are not responsible
              for any differences in the refund amount caused by exchange rate fluctuations between the
              date of purchase and the date of refund.
            </p>
          </div>

          {/* 10. Contact */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              10. Contact
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              For refund inquiries or to submit a claim:
            </p>
            <div className="mt-2 text-sm leading-relaxed">
              <p>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>Subject Line: Refund Request - [Your Order Number]</p>
            </div>
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

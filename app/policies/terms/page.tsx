import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `${SITE_NAME} terms of service — rules and conditions for purchasing research peptides.`,
};

export default function TermsPage() {
  return (
    <>
      <PageHeader
        title="TERMS OF SERVICE"
        description="Rules and conditions for using our website and purchasing our products."
        breadcrumbs={[{ label: "Terms of Service" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 font-[family-name:var(--font-body)]">
          <p className="text-sm text-gray-500">Last updated: March 30, 2026</p>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              By accessing and using jartides.com, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use our website or purchase our products.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Age Requirement
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You must be at least 21 years of age to purchase products from {SITE_NAME}. By placing
              an order, you confirm that you meet this age requirement.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Research Use Only
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All products sold by {SITE_NAME} are intended strictly for in-vitro laboratory research
              purposes only. They are not intended for human consumption, veterinary use, therapeutic
              use, or any form of self-administration. By purchasing, you confirm that products will
              be used exclusively for legitimate research conducted by qualified professionals.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Product Accuracy
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We make every effort to ensure product descriptions, images, and pricing are accurate.
              However, we reserve the right to correct any errors and to update information without
              prior notice. We do not guarantee that product descriptions or other content are
              error-free.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Orders & Payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to refuse or cancel any order for any reason. Payment must be
              received in full before orders are processed. All prices are listed in CAD unless
              otherwise stated.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Intellectual Property
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All content on this website, including text, images, logos, and design, is the property
              of {SITE_NAME} and is protected by applicable intellectual property laws. You may not
              reproduce, distribute, or use any content without our written permission.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Limitation of Liability
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              {SITE_NAME} shall not be liable for any indirect, incidental, or consequential damages
              arising from the use or misuse of our products. The buyer assumes all responsibility
              for the proper handling, storage, and use of all products purchased.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8. Governing Law
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the
              Province of Ontario, Canada.
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

import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: `${SITE_NAME} shipping policy — same-day processing, 3-8 business day delivery, worldwide shipping.`,
};

export default function ShippingPolicyPage() {
  return (
    <>
      <PageHeader
        title="SHIPPING POLICY"
        description="Fast, discreet shipping worldwide."
        breadcrumbs={[{ label: "Shipping Policy" }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8 text-gray-700 font-[family-name:var(--font-body)]">
          <p className="text-sm text-gray-500">Last updated: March 30, 2026</p>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Processing Time
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All orders are processed same-day when placed before 2:00 PM EST on business days.
              Orders placed after this time or on weekends/holidays will be processed the next
              business day.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Delivery Times
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li><strong>Canada:</strong> 3-8 business days</li>
              <li><strong>United States:</strong> 3-8 business days</li>
              <li><strong>International:</strong> 5-15 business days (varies by destination)</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Delivery times are estimates and may vary due to carrier delays, customs processing,
              or other factors beyond our control.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Worldwide Shipping
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We ship to all countries worldwide. International buyers are responsible for
              understanding and complying with their local regulations regarding the importation
              of research peptides. Any customs duties or import taxes are the responsibility of
              the buyer.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Discreet Packaging
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All orders ship in plain, unmarked packaging. Your privacy is important to us.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Order Tracking
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Once your order ships, you will receive a confirmation email with a tracking number.
              You can use this to monitor your delivery status in real time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Lost or Delayed Packages
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If your package has not arrived within the estimated delivery window, please contact
              us. We will work with the carrier to locate your package and ensure it reaches you.
              If a package is confirmed lost, we will ship a replacement at no additional cost.
            </p>
          </div>

          <div className="rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-[#0b3d7a]">Questions about shipping?</strong> Contact us at{" "}
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

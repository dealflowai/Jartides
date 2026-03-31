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
          <p className="text-sm text-gray-500">
            Effective Date: March 30, 2026 &nbsp;|&nbsp; Last Updated: March 30, 2026
          </p>

          {/* 1. Acceptance of Terms */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Acceptance of Terms
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              By accessing, browsing, or using the {SITE_NAME} website (jartides.com) or placing an
              order through our platform, you acknowledge that you have read, understood, and agree to
              be bound by these Terms of Service, our Privacy Policy, Refund Policy, and Shipping Policy
              (collectively, the &ldquo;Agreements&rdquo;). If you do not agree to these terms, you must not use
              our website or purchase our products.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. Material changes will
              be posted on this page with a revised effective date. Your continued use of the website
              after such changes constitutes your acceptance of the updated terms. We encourage you to
              review these terms periodically.
            </p>
          </div>

          {/* 2. Eligibility and Age Requirement */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Eligibility and Age Requirement
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You must be at least 21 years of age to create an account, place an order, or purchase any
              products from {SITE_NAME}. By using our website or placing an order, you represent and
              warrant that you are at least 21 years old and have the legal capacity to enter into a
              binding agreement.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to request proof of age or identity at any time and to refuse or
              cancel any order if we reasonably believe the purchaser does not meet the age requirement.
            </p>
          </div>

          {/* 3. Research Use Only */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Research Use Only
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All products sold by {SITE_NAME} are intended strictly for in-vitro laboratory research,
              scientific experimentation, and educational purposes only. By placing an order, you
              represent and warrant that:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                You are a qualified researcher, laboratory professional, or are purchasing on behalf of
                a legitimate research institution or organization.
              </li>
              <li>
                Products will be used exclusively for lawful research purposes in compliance with all
                applicable laws and regulations in your jurisdiction.
              </li>
              <li>
                Products will not be used for human consumption, veterinary use, therapeutic use,
                self-administration, food, drug, cosmetic, or agricultural applications.
              </li>
              <li>
                Products will not be resold, redistributed, or provided to any individual or entity for
                purposes other than legitimate research.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Any violation of this section constitutes a material breach of these Terms and may result
              in immediate termination of your account, cancellation of pending orders, and referral to
              appropriate authorities.
            </p>
          </div>

          {/* 4. Prohibited Uses */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Prohibited Uses
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              In addition to the restrictions in Section 3, you agree not to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                Use our products for any unlawful purpose or in violation of any applicable local,
                provincial, national, or international law or regulation.
              </li>
              <li>
                Purchase products with the intent to resell, redistribute, or re-export in violation of
                applicable trade laws.
              </li>
              <li>
                Misrepresent your identity, institutional affiliation, or intended use of products.
              </li>
              <li>
                Attempt to circumvent any age verification, eligibility check, or security measure on
                our website.
              </li>
              <li>Use our website to transmit malware, viruses, or other harmful code.</li>
              <li>
                Scrape, crawl, or use automated means to access our website or collect data without our
                written permission.
              </li>
              <li>Interfere with or disrupt the operation of our website or servers.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to refuse service, cancel orders, and terminate accounts at our sole
              discretion if we reasonably believe any of these prohibitions have been violated.
            </p>
          </div>

          {/* 5. Account Registration */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Account Registration
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              To place orders, you may be required to create an account. You are responsible for
              maintaining the confidentiality of your account credentials and for all activities that
              occur under your account. You agree to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Provide accurate, current, and complete information during registration.</li>
              <li>Update your information promptly if it changes.</li>
              <li>Notify us immediately of any unauthorized use of your account.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to suspend or terminate your account at any time if we believe
              information provided is inaccurate, or if your account has been used in violation of these
              Terms.
            </p>
          </div>

          {/* 6. Orders and Payment */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Orders and Payment
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All orders are subject to acceptance by {SITE_NAME}. We reserve the right to refuse or
              cancel any order at our sole discretion for any reason, including but not limited to:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Suspected fraudulent or unauthorized transactions.</li>
              <li>Orders that appear intended for non-research use.</li>
              <li>
                Orders shipping to jurisdictions where the products may be restricted or prohibited.
              </li>
              <li>Pricing or product description errors on our website.</li>
              <li>Failure to pass age or eligibility verification.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Payment must be received in full before orders are processed and shipped. All prices
              listed on our website are in CAD unless otherwise stated. Prices are subject to change
              without prior notice, but changes will not affect orders that have already been confirmed.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Applicable taxes will be calculated and added at checkout based on your shipping
              destination and applicable tax laws.
            </p>
          </div>

          {/* 7. Product Information and Accuracy */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Product Information and Accuracy
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We make reasonable efforts to ensure that product descriptions, specifications, images,
              and pricing on our website are accurate. However, we do not warrant that product
              descriptions or other website content are error-free, complete, or current.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              All products are provided for research purposes and are accompanied by relevant
              specifications such as purity, molecular weight, and sequence where applicable.
              Certificates of Analysis (COAs) are available upon request.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to correct any errors in product information and to update content
              without prior notice. If a product you have ordered is materially different from its
              description, you may be eligible for a refund or replacement under our Refund Policy.
            </p>
          </div>

          {/* 8. Shipping and Delivery */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8. Shipping and Delivery
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Shipping terms, estimated delivery times, carrier information, and related policies are
              set out in our Shipping Policy, which forms part of these Terms of Service. By placing an
              order, you agree to the terms of our Shipping Policy. Key provisions include:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                International buyers are solely responsible for compliance with all import regulations,
                customs requirements, and local laws governing the importation of research chemicals in
                their jurisdiction.
              </li>
              <li>
                Customs duties, import taxes, brokerage fees, and any other charges imposed by the
                destination country are the sole responsibility of the buyer.
              </li>
              <li>Risk of loss passes to the buyer upon delivery to the shipping carrier.</li>
              <li>
                {SITE_NAME} is not liable for delays caused by customs processing, carrier issues, or
                events beyond our reasonable control.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              For full details, refer to our{" "}
              <a href="/policies/shipping" className="text-[#1a6de3] hover:underline">
                Shipping Policy
              </a>
              .
            </p>
          </div>

          {/* 9. Refunds and Returns */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              9. Refunds and Returns
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Our refund and return terms are set out in our Refund Policy, which forms part of these
              Terms of Service. Key provisions include:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                Refunds or replacements are available only for orders that arrive damaged in transit,
                contain the wrong product, or have missing items.
              </li>
              <li>
                Claims must be submitted within 30 days of delivery with photographic evidence.
              </li>
              <li>
                No refunds are issued for packages seized, held, or destroyed by customs authorities.
              </li>
              <li>
                No refunds are issued for buyer&apos;s remorse, change of mind, or incorrect ordering.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              For full details, refer to our{" "}
              <a href="/policies/refund" className="text-[#1a6de3] hover:underline">
                Refund Policy
              </a>
              .
            </p>
          </div>

          {/* 10. Export Compliance and Sanctions */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              10. Export Compliance and Sanctions
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              {SITE_NAME} complies with all applicable Canadian export control laws and regulations,
              including the Export and Import Permits Act (EIPA), the Controlled Goods Program, and
              Canadian sanctions regulations administered by Global Affairs Canada.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We do not ship to countries, regions, entities, or individuals subject to Canadian
              sanctions or embargoes. By placing an order, you represent and warrant that:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                You are not located in, and will not ship or transfer products to, any country or
                region subject to Canadian, U.S., EU, or UN sanctions or embargoes.
              </li>
              <li>
                You are not named on any restricted party list, including the Canadian Consolidated
                Autonomous Sanctions List or the U.S. Specially Designated Nationals (SDN) list.
              </li>
              <li>
                You will not use, re-export, or transfer products in violation of any applicable export
                control or sanctions laws.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to cancel any order that we reasonably believe would violate export
              control or sanctions requirements.
            </p>
          </div>

          {/* 11. Intellectual Property */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              11. Intellectual Property
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All content on the {SITE_NAME} website, including but not limited to text, images,
              graphics, logos, trademarks, product descriptions, page layouts, and software, is the
              property of {SITE_NAME} or its licensors and is protected by applicable Canadian and
              international intellectual property laws.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works from, publicly display,
              or commercially exploit any content from our website without our prior written permission.
              Limited personal, non-commercial use (such as printing a product page for reference) is
              permitted.
            </p>
          </div>

          {/* 12. Disclaimer of Warranties */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              12. Disclaimer of Warranties
            </h2>
            <p className="mt-2 text-sm leading-relaxed uppercase font-semibold">
              To the maximum extent permitted by applicable law, all products and services are provided
              &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, whether express, implied, or
              statutory, including but not limited to implied warranties of merchantability, fitness for
              a particular purpose, and non-infringement.
            </p>
            <p className="mt-2 text-sm leading-relaxed">Without limiting the foregoing:</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                We do not warrant that products will achieve any specific research outcome or result.
              </li>
              <li>
                We do not warrant that our website will be uninterrupted, error-free, or free of
                viruses or other harmful components.
              </li>
              <li>
                We do not warrant that products are authorized for import in every jurisdiction
                worldwide.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              Some jurisdictions do not allow the exclusion of implied warranties. In such
              jurisdictions, the above exclusions apply to the fullest extent permitted by applicable
              law.
            </p>
          </div>

          {/* 13. Limitation of Liability */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13. Limitation of Liability
            </h2>
            <p className="mt-2 text-sm leading-relaxed uppercase font-semibold">
              To the maximum extent permitted by applicable law, {SITE_NAME}, its owners, officers,
              directors, employees, and agents shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to loss of profits, loss of
              data, loss of business opportunity, personal injury, or property damage arising out of or
              in connection with:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>The use or misuse of any products purchased from {SITE_NAME}.</li>
              <li>The inability to use our website or services.</li>
              <li>
                Any errors, inaccuracies, or omissions in product descriptions or website content.
              </li>
              <li>Unauthorized access to or alteration of your data or transmissions.</li>
              <li>Any conduct of third parties on or related to our website.</li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed uppercase font-semibold">
              In no event shall our total aggregate liability to you for all claims arising out of or
              relating to these terms or your use of our products or services exceed the total amount
              you paid to {SITE_NAME} for the specific product(s) giving rise to the claim.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              The buyer assumes all responsibility for the proper handling, storage, use, and disposal
              of all products purchased from {SITE_NAME}. You acknowledge that research chemicals carry
              inherent risks and that you possess the training, equipment, and facilities necessary for
              their safe use.
            </p>
          </div>

          {/* 14. Indemnification */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              14. Indemnification
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              You agree to indemnify, defend, and hold harmless {SITE_NAME}, its owners, officers,
              employees, agents, and affiliates from and against any and all claims, damages, losses,
              liabilities, costs, and expenses (including reasonable legal fees) arising out of or in
              connection with:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Your use or misuse of any products purchased from {SITE_NAME}.</li>
              <li>
                Your violation of these Terms of Service or any applicable law or regulation.
              </li>
              <li>
                Your violation of any third-party rights, including intellectual property rights.
              </li>
              <li>
                Any claim by a third party related to your use, handling, storage, or disposal of
                products.
              </li>
              <li>
                Your importation of products in violation of applicable laws or regulations in your
                jurisdiction.
              </li>
            </ul>
          </div>

          {/* 15. Dispute Resolution */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              15. Dispute Resolution
            </h2>

            <h3 className="mt-4 text-base font-semibold text-gray-900">15.1 Informal Resolution</h3>
            <p className="mt-2 text-sm leading-relaxed">
              You agree to first attempt to resolve the dispute informally by contacting us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {CONTACT_EMAIL}
              </a>
              . We will make good-faith efforts to resolve the matter within 30 days.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900">15.2 Binding Arbitration</h3>
            <p className="mt-2 text-sm leading-relaxed">
              If the dispute cannot be resolved informally within 30 days, either party may submit the
              dispute to binding arbitration administered in accordance with the Arbitration Act, 1991
              (Ontario). The arbitration shall take place in Windsor, Ontario, Canada. The language of
              arbitration shall be English. The arbitrator&apos;s decision shall be final and binding.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900">15.3 Exceptions</h3>
            <p className="mt-2 text-sm leading-relaxed">
              Either party may bring a claim in the Ontario Superior Court of Justice or the Small
              Claims Court of Ontario (if the claim is within its monetary jurisdiction) for injunctive
              or equitable relief, or for claims related to intellectual property infringement.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900">15.4 Class Action Waiver</h3>
            <p className="mt-2 text-sm leading-relaxed">
              To the maximum extent permitted by applicable law, you agree that any dispute resolution
              proceedings will be conducted on an individual basis only, and not as part of a class,
              consolidated, or representative action.
            </p>

            <h3 className="mt-4 text-base font-semibold text-gray-900">15.5 EU Consumer Rights</h3>
            <p className="mt-2 text-sm leading-relaxed">
              If you are a consumer in the European Union, nothing in this section restricts your right
              to bring proceedings before the courts of your member state of residence, nor does it
              affect your rights under mandatory consumer protection laws. EU consumers may also access
              the European Commission&apos;s Online Dispute Resolution platform.
            </p>
          </div>

          {/* 16. Force Majeure */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              16. Force Majeure
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              {SITE_NAME} shall not be liable for any failure or delay in performance resulting from
              causes beyond our reasonable control, including but not limited to natural disasters,
              pandemics, government actions or restrictions, sanctions, embargoes, customs delays,
              carrier disruptions, wars, acts of terrorism, labour disputes, supply chain interruptions,
              or internet or telecommunications failures.
            </p>
          </div>

          {/* 17. Severability */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              17. Severability
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If any provision of these Terms is found to be invalid, illegal, or unenforceable by a
              court of competent jurisdiction, the remaining provisions shall continue in full force and
              effect. The invalid provision shall be modified to the minimum extent necessary to make it
              valid and enforceable while preserving its original intent.
            </p>
          </div>

          {/* 18. Entire Agreement */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              18. Entire Agreement
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              These Terms of Service, together with our Privacy Policy, Refund Policy, and Shipping
              Policy, constitute the entire agreement between you and {SITE_NAME} regarding your use of
              our website and purchase of our products. These terms supersede all prior agreements,
              representations, and understandings.
            </p>
          </div>

          {/* 19. Governing Law and Jurisdiction */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              19. Governing Law and Jurisdiction
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of
              the Province of Ontario and the federal laws of Canada applicable therein, without regard
              to conflict of law principles.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Subject to the arbitration provisions in Section 15, any legal proceedings arising under
              these Terms shall be brought exclusively in the courts located in Windsor, Ontario,
              Canada.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              If you are a consumer in the European Union, this clause does not affect your right to
              rely on mandatory consumer protection provisions of the law of your country of residence.
            </p>
          </div>

          {/* 20. Contact Information */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              20. Contact Information
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              For questions or concerns regarding these Terms of Service, please contact:
            </p>
            <div className="mt-2 text-sm leading-relaxed">
              <p className="font-semibold">{SITE_NAME}</p>
              <p>Windsor, Ontario, Canada</p>
              <p>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
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

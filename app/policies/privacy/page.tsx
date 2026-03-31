import type { Metadata } from "next";
import PageHeader from "@/components/ui/PageHeader";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `${SITE_NAME} privacy policy — how we collect, use, and protect your personal information.`,
};

const PRIVACY_EMAIL = CONTACT_EMAIL;

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
          <p className="text-sm text-gray-500">
            Effective Date: March 30, 2026 &nbsp;|&nbsp; Last Updated: March 30, 2026
          </p>

          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              1. Introduction and Scope
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              This Privacy Policy describes how Jartides (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) collects, uses, discloses, retains, and protects personal
              information. We are a Canadian company and our primary data protection obligations
              arise under the Personal Information Protection and Electronic Documents Act (PIPEDA)
              and applicable provincial legislation, including Quebec&apos;s Law 25.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Because we ship products worldwide and serve customers in multiple jurisdictions, this
              policy also addresses obligations under the European Union General Data Protection
              Regulation (EU GDPR), the United Kingdom General Data Protection Regulation (UK GDPR),
              the California Consumer Privacy Act as amended by the California Privacy Rights Act
              (CCPA/CPRA), and other applicable international data protection laws.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Our products are sold exclusively for legitimate scientific research, laboratory, and
              educational purposes. They are not intended for human consumption, veterinary use, or
              any unlawful purpose. By accessing our website or placing an order, you acknowledge
              that you have read and understood this Privacy Policy.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              This policy applies to all personal information collected through our website, email
              communications, telephone inquiries, and any other interactions with our business,
              regardless of where you are located.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              2. Data Controller and Privacy Officer
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              For the purposes of GDPR and UK GDPR, the data controller responsible for your
              personal information is:
            </p>
            <div className="mt-2 text-sm leading-relaxed pl-5">
              <p><strong>Jartides</strong></p>
              <p>Email:{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {PRIVACY_EMAIL}
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              In accordance with PIPEDA Principle 1 (Accountability), we have designated a Privacy
              Officer responsible for our compliance with this policy and all applicable privacy
              legislation:
            </p>
            <div className="mt-2 text-sm leading-relaxed pl-5">
              <p><strong>Privacy Officer</strong></p>
              <p>Email:{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {PRIVACY_EMAIL}
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Our Privacy Officer is accountable for the personal information under our control and
              will respond to all inquiries within 30 calendar days of receipt.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              If you are located in the EU/EEA and we are required to appoint a representative under
              Article 27 of the GDPR, details of our EU representative will be made available upon
              request.
            </p>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3. Personal Information We Collect
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We collect only the personal information necessary for the purposes identified in this
              policy. The categories of information we collect include:
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3.1 Information You Provide Directly
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                Full name, email address, telephone number, and shipping/billing address when you
                create an account or place an order
              </li>
              <li>
                Payment information (credit card number, expiry date, security code) processed
                securely through our third-party payment processor; we do not store full payment card
                details on our servers
              </li>
              <li>Business or institutional name and affiliation, where applicable</li>
              <li>Intended research use description, where requested at checkout</li>
              <li>
                Communications you send to us, including customer support inquiries and feedback
              </li>
              <li>
                Government-issued identification, where required for age or eligibility verification
                in certain jurisdictions
              </li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3.2 Information Collected Automatically
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>IP address, browser type, operating system, and device identifiers</li>
              <li>Pages visited, time spent on pages, referring URLs, and clickstream data</li>
              <li>Approximate geolocation derived from IP address (country/region level only)</li>
              <li>Cookies and similar tracking technologies (see Section 10)</li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              3.3 Information from Third Parties
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>Payment verification and fraud prevention data from our payment processor</li>
              <li>Shipping and delivery status information from our shipping carriers</li>
              <li>Address validation data from postal/address verification services</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              4. Legal Basis for Processing (GDPR/UK GDPR)
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you are located in the European Economic Area (EEA), the United Kingdom, or
              Switzerland, we process your personal data based on the following legal grounds under
              Article 6(1) of the GDPR:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Performance of a Contract (Art. 6(1)(b)):</strong> Processing necessary to
                fulfill your order, manage your account, provide customer support, and deliver
                products you have purchased.
              </li>
              <li>
                <strong>Legitimate Interests (Art. 6(1)(f)):</strong> Processing necessary for our
                legitimate business interests, including fraud prevention, website security,
                analytics to improve our services, and enforcement of our terms. We balance these
                interests against your rights and freedoms. You may object to processing based on
                legitimate interests at any time.
              </li>
              <li>
                <strong>Legal Obligation (Art. 6(1)(c)):</strong> Processing necessary to comply
                with applicable laws, regulations, tax obligations, and regulatory requirements,
                including those governing the sale of research chemicals.
              </li>
              <li>
                <strong>Consent (Art. 6(1)(a)):</strong> Where we rely on your consent (e.g., for
                non-essential cookies or marketing communications), you may withdraw consent at any
                time without affecting the lawfulness of processing performed prior to withdrawal.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We do not process special categories of personal data (Article 9) in connection with
              our services.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              5. Purposes for Collecting Personal Information
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We collect and use personal information for the following purposes:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Order Fulfillment:</strong> Processing, verifying, shipping, and delivering
                your orders, including age and eligibility verification and customs documentation for
                international shipments.
              </li>
              <li>
                <strong>Account Management:</strong> Creating and maintaining your customer account,
                order history, and preferences.
              </li>
              <li>
                <strong>Communication:</strong> Sending order confirmations, shipping notifications,
                customs/duty information, and responding to your inquiries.
              </li>
              <li>
                <strong>Compliance and Safety:</strong> Verifying that orders comply with applicable
                regulations governing research chemicals in both the shipping origin and destination
                jurisdictions; preventing fraud, unauthorized transactions, and illegal activity;
                screening orders against restricted party lists where legally required.
              </li>
              <li>
                <strong>Website Improvement:</strong> Analyzing browsing patterns and site usage to
                improve functionality, performance, and user experience.
              </li>
              <li>
                <strong>Legal Obligations:</strong> Complying with applicable Canadian,
                international, and destination-country laws, regulations, export controls, and court
                orders.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We do not use personal information for automated decision-making or profiling that
              produces legal or similarly significant effects, as defined under Article 22 of the
              GDPR.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6. Consent (PIPEDA)
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              For processing governed by Canadian law, we obtain your meaningful consent before or at
              the time of collecting personal information, as required by PIPEDA Principle 3
              (Consent):
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Express consent</strong> is obtained for collection of payment information,
                identity verification documents, and any sensitive personal information.
              </li>
              <li>
                <strong>Implied consent</strong> may be relied upon for non-sensitive information
                collected during routine commercial transactions (e.g., shipping address for order
                fulfillment) or website browsing data collected through strictly necessary cookies.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              You may withdraw your consent at any time, subject to legal or contractual
              restrictions, by contacting our Privacy Officer. Withdrawal of consent may affect our
              ability to provide certain products or services to you.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              6.1 Quebec Residents (Law 25)
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              If you are a resident of Quebec, we obtain your express consent before collecting,
              using, or disclosing your personal information for purposes beyond what is necessary to
              fulfill our contractual obligations. You have the right to data portability and to
              request deactivation of automated decision-making functions. Our cookie consent
              mechanism provides granular controls as required by Law 25.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              7. Disclosure and Sharing of Personal Information
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We do not sell, rent, lease, or trade your personal information to any third party. For
              the purposes of the CCPA/CPRA, we do not &ldquo;sell&rdquo; or &ldquo;share&rdquo;
              (as those terms are defined under California law) your personal information.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We may disclose your personal information only in the following limited circumstances:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Payment Processors:</strong> Your payment information is transmitted
                directly to our PCI DSS-compliant payment processor for transaction processing. We
                do not store full credit card numbers on our servers.
              </li>
              <li>
                <strong>Shipping and Logistics Carriers:</strong> Your name, shipping address,
                telephone number, and email (for delivery notifications) are shared with carriers
                (e.g., Canada Post, FedEx, UPS, DHL, local postal services) solely to deliver your
                order. For international shipments, customs declaration information (order contents,
                declared value) is provided as required by law.
              </li>
              <li>
                <strong>Customs and Regulatory Authorities:</strong> For international orders, we
                may be required to provide order details and limited customer information to customs
                authorities in the origin and/or destination country as part of export/import
                compliance.
              </li>
              <li>
                <strong>Legal Requirements:</strong> We may disclose personal information if required
                by law, regulation, court order, or governmental authority in any jurisdiction, or
                where we believe disclosure is necessary to protect our rights, your safety, or the
                safety of others.
              </li>
              <li>
                <strong>Fraud Prevention:</strong> We may share limited information with fraud
                prevention and identity verification services to protect against unauthorized or
                fraudulent transactions.
              </li>
              <li>
                <strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale
                of all or a portion of our assets, personal information may be transferred as part of
                the transaction. We will notify you before your information becomes subject to a
                different privacy policy.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              All third-party service providers are contractually required to protect personal
              information to standards consistent with this policy and applicable law. They are
              permitted to use your information only for the specific services they provide to us.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8. International Data Transfers
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We are based in Canada and our primary data storage is in Canada. However, because we
              serve customers worldwide and use service providers in multiple countries, your
              personal information may be transferred to and processed in countries other than your
              own, including Canada, the United States, and other jurisdictions.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8.1 Transfers from the EEA, UK, and Switzerland
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              Canada has been granted an adequacy decision by the European Commission, meaning
              transfers of personal data from the EEA to Canadian organizations subject to PIPEDA
              are generally permitted without additional safeguards. For any sub-processors located
              in jurisdictions without an adequacy decision, we implement appropriate transfer
              mechanisms, including Standard Contractual Clauses (SCCs) approved by the European
              Commission or the UK International Data Transfer Agreement/Addendum, as applicable.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              8.2 General International Transfers
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              When personal information is transferred to a foreign jurisdiction, it becomes subject
              to the laws of that jurisdiction and may be accessible to law enforcement and
              government authorities under those laws. We take reasonable steps to ensure that any
              personal information transferred internationally is protected by contractual or other
              means consistent with applicable data protection requirements.
            </p>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              9. Data Retention
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We retain personal information only as long as necessary to fulfill the purposes for
              which it was collected, or as required by law:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Order and transaction records:</strong> 7 years from the date of
                transaction, as required by the Canada Revenue Agency for tax record-keeping, and to
                comply with applicable statute of limitations periods.
              </li>
              <li>
                <strong>Customer account information:</strong> Retained for the duration of your
                active account, plus 2 years following account closure or last activity, unless a
                longer period is required by law.
              </li>
              <li>
                <strong>Customer support communications:</strong> 3 years from the date of
                resolution.
              </li>
              <li>
                <strong>Customs and export compliance records:</strong> Retained for the period
                required by applicable export control and customs regulations (typically 5 to 7
                years).
              </li>
              <li>
                <strong>Website analytics data:</strong> Aggregated and anonymized data may be
                retained indefinitely. Identifiable browsing data is retained for no more than 26
                months.
              </li>
              <li>
                <strong>Consent records:</strong> Retained for 5 years from the date consent was
                given or withdrawn, to demonstrate compliance.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              When personal information is no longer required, it is securely destroyed, erased, or
              anonymized using methods appropriate to the sensitivity of the information.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              10. Cookies and Tracking Technologies
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We use cookies and similar technologies to operate our website. The types of cookies we
              use include:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Strictly Necessary Cookies:</strong> Required for core website functionality,
                including shopping cart, session authentication, and security features. These are
                deployed without consent as they are essential for the service you have requested.
              </li>
              <li>
                <strong>Performance/Analytics Cookies:</strong> Help us understand how visitors
                interact with our website by collecting usage data. For EEA/UK visitors, these are
                only placed after you provide consent through our cookie banner.
              </li>
              <li>
                <strong>Functional Cookies:</strong> Remember your preferences and settings
                (language, currency, region) to provide an enhanced experience.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We do not use advertising, retargeting, or cross-site tracking cookies.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              You can manage cookie preferences through our consent banner (displayed to all
              visitors), or by adjusting your browser settings. EEA and UK visitors will see a
              GDPR-compliant consent mechanism that requires affirmative opt-in for non-essential
              cookies. Disabling certain cookies may affect website functionality.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              10.1 Do Not Track / Global Privacy Control
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              We honor the Global Privacy Control (GPC) signal as a valid opt-out request under the
              CCPA/CPRA for California residents. Our website does not otherwise respond to Do Not
              Track (DNT) browser signals, as there is no universal standard for this feature.
            </p>
          </div>

          {/* Section 11 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              11. Data Security Safeguards
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We protect personal information with security safeguards appropriate to the sensitivity
              of the information:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Technical Safeguards:</strong> TLS/SSL encryption for all data in transit;
                encrypted storage of sensitive data at rest; regular security patching, vulnerability
                scanning, and penetration testing; multi-factor authentication for administrative
                access.
              </li>
              <li>
                <strong>Administrative Safeguards:</strong> Access to personal information restricted
                to authorized personnel on a need-to-know basis; confidentiality obligations for all
                personnel; regular privacy and security training; incident response procedures.
              </li>
              <li>
                <strong>Physical Safeguards:</strong> Where applicable, physical access controls
                protect systems and media containing personal information.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              While we implement reasonable safeguards, no method of transmission or storage is
              completely secure. In the event of a personal data breach:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                We will notify the Office of the Privacy Commissioner of Canada and affected
                individuals as required by PIPEDA&apos;s breach notification provisions.
              </li>
              <li>
                For breaches affecting EU/EEA residents, we will notify the relevant supervisory
                authority within 72 hours and affected individuals without undue delay where the
                breach is likely to result in a high risk to their rights and freedoms, as required
                by Articles 33 and 34 of the GDPR.
              </li>
              <li>
                For breaches affecting UK residents, we will notify the Information
                Commissioner&apos;s Office (ICO) within 72 hours where applicable.
              </li>
              <li>
                We will notify the Commission d&apos;acc&egrave;s &agrave; l&apos;information du
                Qu&eacute;bec where applicable under Law 25.
              </li>
              <li>
                For California residents, we will provide notice as required by the California data
                breach notification statute (Cal. Civ. Code &sect; 1798.82).
              </li>
            </ul>
          </div>

          {/* Section 12 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              12. Age Restrictions
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Our products are intended for qualified researchers and professionals. You must be at
              least 18 years of age (or the age of majority in your jurisdiction of residence,
              whichever is greater) to use our website, create an account, or place an order.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We do not knowingly collect personal information from individuals under 18. If we
              become aware that we have inadvertently collected information from a minor, we will
              promptly delete it and terminate the associated account. If you believe a minor has
              provided us with personal information, please contact our Privacy Officer immediately.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We do not knowingly collect personal information from individuals under 16 in the EEA,
              or under 13 in the United States.
            </p>
          </div>

          {/* Section 13 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13. Your Rights
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Your rights vary depending on your jurisdiction. Below is a summary of rights by
              region:
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.1 All Customers (PIPEDA)
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Access:</strong> Request access to the personal information we hold about
                you.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of inaccurate or incomplete
                information.
              </li>
              <li>
                <strong>Withdraw Consent:</strong> Withdraw your consent to the collection, use, or
                disclosure of your personal information, subject to legal or contractual
                restrictions.
              </li>
              <li>
                <strong>Complain:</strong> File a complaint with our Privacy Officer or the Office of
                the Privacy Commissioner of Canada.
              </li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.2 Quebec Residents (Law 25)
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              All rights listed in Section 13.1, plus:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Data Portability:</strong> Request your personal information in a structured,
                commonly used technological format.
              </li>
              <li>
                <strong>Deactivation of Automated Processing:</strong> Request that automated
                decision-making functions be deactivated.
              </li>
              <li>
                <strong>Right to be Forgotten:</strong> Request de-indexing of your personal
                information from search results linked to your name.
              </li>
            </ul>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.3 European Economic Area, UK, and Swiss Residents (GDPR / UK GDPR)
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Access (Art. 15):</strong> Obtain confirmation of whether we process your
                personal data and request a copy.
              </li>
              <li>
                <strong>Rectification (Art. 16):</strong> Request correction of inaccurate personal
                data.
              </li>
              <li>
                <strong>Erasure (Art. 17):</strong> Request deletion of your personal data where
                there is no compelling reason for continued processing.
              </li>
              <li>
                <strong>Restriction (Art. 18):</strong> Request restriction of processing in certain
                circumstances.
              </li>
              <li>
                <strong>Data Portability (Art. 20):</strong> Receive your personal data in a
                structured, commonly used, machine-readable format and transmit it to another
                controller.
              </li>
              <li>
                <strong>Object (Art. 21):</strong> Object to processing based on legitimate interests
                or for direct marketing purposes.
              </li>
              <li>
                <strong>Withdraw Consent (Art. 7(3)):</strong> Withdraw consent at any time where
                processing is based on consent.
              </li>
              <li>
                <strong>Lodge a Complaint:</strong> File a complaint with your local data protection
                supervisory authority.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We do not engage in automated individual decision-making, including profiling, as
              described in Article 22 of the GDPR.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.4 California Residents (CCPA/CPRA)
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              If you are a California resident, you have the following rights under the CCPA as
              amended by the CPRA:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Right to Know:</strong> Request disclosure of the categories and specific
                pieces of personal information we have collected about you, the categories of
                sources, the business purposes for collection, and the categories of third parties
                with whom we share your information.
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of your personal information,
                subject to certain exceptions.
              </li>
              <li>
                <strong>Right to Correct:</strong> Request correction of inaccurate personal
                information.
              </li>
              <li>
                <strong>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share your
                personal information as defined by the CCPA/CPRA. No opt-out is necessary.
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                for exercising any of your CCPA/CPRA rights.
              </li>
              <li>
                <strong>Right to Limit Use of Sensitive Personal Information:</strong> We use
                sensitive personal information (such as payment data) only for the purposes of
                providing the services you have requested.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              To exercise your CCPA/CPRA rights, you (or your authorized agent) may submit a
              verifiable consumer request by contacting us at{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {PRIVACY_EMAIL}
              </a>
              . We will verify your identity before processing your request and respond within 45
              calendar days, with the possibility of a 45-day extension if reasonably necessary.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.5 Other Jurisdictions
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              If you are located in a jurisdiction with data protection laws not specifically
              addressed above (including but not limited to Australia, Brazil, Japan, South Korea,
              and other countries with privacy legislation), we will honor applicable rights under
              your local law to the extent they apply to our processing of your personal information.
              Contact our Privacy Officer for details.
            </p>

            <h3 className="mt-4 text-base font-semibold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              13.6 How to Exercise Your Rights
            </h3>
            <p className="mt-2 text-sm leading-relaxed">
              To exercise any of the rights described above, submit a written request to our Privacy
              Officer at{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {PRIVACY_EMAIL}
              </a>{" "}
              or by mail to the address listed in Section 2. We will verify your identity before
              processing your request. Response times are as follows:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                <strong>Canada (PIPEDA):</strong> 30 calendar days
              </li>
              <li>
                <strong>EU/UK (GDPR):</strong> 1 month, extendable by 2 additional months for
                complex requests
              </li>
              <li>
                <strong>California (CCPA/CPRA):</strong> 45 calendar days, extendable by an
                additional 45 days
              </li>
              <li>
                <strong>Quebec (Law 25):</strong> 30 calendar days
              </li>
            </ul>
          </div>

          {/* Section 14 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              14. Third-Party Links
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              Our website may contain links to third-party websites or services not operated by us.
              We are not responsible for the privacy practices of external sites and encourage you to
              review their privacy policies before providing any personal information.
            </p>
          </div>

          {/* Section 15 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              15. Product Use Disclaimer and Export Compliance
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              All products sold through our website are intended strictly for in-vitro research,
              laboratory experimentation, and educational purposes. They are not intended for human
              or animal consumption, therapeutic use, or any application in food, drug, cosmetic, or
              agricultural products.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Purchasers are solely responsible for ensuring compliance with all applicable laws and
              regulations in their jurisdiction, including but not limited to import restrictions,
              controlled substance regulations, and end-use requirements.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              We reserve the right to refuse or cancel any order where we reasonably believe products
              may be used for purposes other than legitimate research, or where fulfillment would
              violate applicable export controls, sanctions, or trade regulations.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              International orders may be subject to customs duties, import taxes, and additional
              fees imposed by the destination country. These charges are the sole responsibility of
              the purchaser.
            </p>
          </div>

          {/* Section 16 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              16. Changes to This Privacy Policy
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              We may update this Privacy Policy to reflect changes in our practices, legal
              requirements, or business operations. When we make material changes:
            </p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed list-disc pl-5">
              <li>
                We will post the updated policy on this page with a revised effective date.
              </li>
              <li>
                We will notify registered account holders by email at least 30 days before material
                changes take effect.
              </li>
              <li>
                Where required by GDPR, UK GDPR, CCPA/CPRA, or other applicable law, we will obtain
                fresh consent for any new use of previously collected personal information.
              </li>
            </ul>
            <p className="mt-2 text-sm leading-relaxed">
              We encourage you to review this policy periodically. Your continued use of our website
              after the effective date of changes constitutes your acknowledgment of the updated
              policy.
            </p>
          </div>

          {/* Section 17 */}
          <div>
            <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
              17. Contact Us and Supervisory Authorities
            </h2>
            <p className="mt-2 text-sm leading-relaxed">
              If you have questions, concerns, or complaints about this Privacy Policy or our
              handling of your personal information:
            </p>
            <div className="mt-2 text-sm leading-relaxed pl-5">
              <p><strong>Privacy Officer</strong></p>
              <p>Email:{" "}
                <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                  {PRIVACY_EMAIL}
                </a>
              </p>
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              If you are not satisfied with our response, you may file a complaint with the relevant
              authority:
            </p>
            <div className="mt-2 text-sm leading-relaxed space-y-3 pl-5">
              <div>
                <p><strong>Canada:</strong> Office of the Privacy Commissioner of Canada</p>
                <p>30 Victoria Street, Gatineau, Quebec K1A 1H3 | Toll-free: 1-800-282-1376 | www.priv.gc.ca</p>
              </div>
              <div>
                <p><strong>Quebec:</strong> Commission d&apos;acc&egrave;s &agrave; l&apos;information du Qu&eacute;bec</p>
                <p>www.cai.gouv.qc.ca</p>
              </div>
              <div>
                <p><strong>European Union:</strong> Your local data protection supervisory authority.</p>
              </div>
              <div>
                <p><strong>United Kingdom:</strong> Information Commissioner&apos;s Office (ICO)</p>
                <p>Wycliffe House, Water Lane, Wilmslow, Cheshire SK9 5AF | www.ico.org.uk</p>
              </div>
              <div>
                <p><strong>California:</strong> Office of the Attorney General, California Department of Justice</p>
                <p>www.oag.ca.gov/privacy</p>
              </div>
            </div>
          </div>

          {/* Contact box */}
          <div className="rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-6">
            <p className="text-sm leading-relaxed">
              <strong className="text-[#0b3d7a]">Questions?</strong> Contact our Privacy Officer at{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-[#1a6de3] hover:underline">
                {PRIVACY_EMAIL}
              </a>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

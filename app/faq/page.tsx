"use client";

import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import FaqAccordion from "@/components/faq/FaqAccordion";
import EditableText from "@/components/admin/EditableText";
import { MessageCircle } from "lucide-react";

const faqSections = [
  {
    title: "General Questions",
    items: [
      {
        question: "What are research peptides?",
        answer:
          "Peptides are short chains of amino acids used in laboratory research. They play a key role in scientific studies related to cellular function, receptor binding, and molecular biology. Our peptides are synthesized to the highest purity standards for in-vitro research use only.",
      },
      {
        question: "Are your peptides legal in Canada?",
        answer:
          "Yes, research peptides are legal for in-vitro research purposes in Canada. They are not intended for human consumption, veterinary use, or any clinical applications. Purchasers are responsible for ensuring compliance with all applicable local regulations.",
      },
      {
        question: "Who can purchase from Jartides?",
        answer:
          "You must be 21 years of age or older and confirm that your purchase is intended for in-vitro research purposes only. By placing an order, you agree to our terms of service and acknowledge that our products are not for human consumption.",
      },
      {
        question: "How do you verify purity?",
        answer:
          "All products undergo HPLC (High-Performance Liquid Chromatography) and Mass Spectrometry testing by independent third-party laboratories. Certificates of Analysis (COAs) are available for every batch and can be viewed on our COA page.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Yes, we ship worldwide. Buyers are responsible for understanding and complying with their local regulations regarding the importation of research peptides. International shipping times and customs processing may vary by destination.",
      },
    ],
  },
  {
    title: "Orders & Shipping",
    items: [
      {
        question: "Is packaging discreet?",
        answer:
          "Yes, all orders ship in plain, unmarked packaging. Your privacy is important to us. No external branding or product descriptions are visible on the outside.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept Visa, Mastercard, American Express, and PayPal.",
      },
      {
        question: "What is your return/refund policy?",
        answer:
          "If your product arrives damaged or the quality is not correct, contact us within 30 days for a replacement or full refund. Products must be in sealed packaging.",
      },
      {
        question: "How do I track my order?",
        answer:
          "You'll receive a confirmation email with a tracking number once your order has shipped. You can use this tracking number to monitor your delivery status in real time.",
      },
    ],
  },
  {
    title: "Subscriptions",
    items: [
      {
        question: "When will Subscribe & Save be available?",
        answer:
          "Our subscription service is coming soon! We're working hard to bring you the best monthly delivery experience with savings up to 20%. Stay tuned for updates.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHeader
        title="FREQUENTLY ASKED QUESTIONS"
        description="Everything you need to know about our research peptides."
        breadcrumbs={[{ label: "FAQ" }]}
        titleKey="faq_title"
        descriptionKey="faq_description"
      />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <FaqAccordion sections={faqSections} useDynamic />

        {/* CTA */}
        <div className="mt-16 rounded-xl border border-[#dde2ea] bg-[#0b3d7a]/5 p-8 text-center">
          <MessageCircle className="mx-auto mb-3 h-8 w-8 text-[#0b3d7a]" />
          <h3 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            <EditableText settingKey="faq_cta_heading">Still have questions?</EditableText>
          </h3>
          <p className="mt-2 text-sm text-gray-600 font-[family-name:var(--font-body)]">
            <EditableText settingKey="faq_cta_description">Our team is happy to help. Reach out and we&apos;ll get back to you
            as soon as possible.</EditableText>
          </p>
          <div className="mt-5">
            <Button href="/contact" variant="fill">
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

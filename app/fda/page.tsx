"use client";

import PageHeader from "@/components/ui/PageHeader";
import EditableText from "@/components/admin/EditableText";
import { Shield, AlertTriangle, FlaskConical, UserCheck, ClipboardCheck, Ban } from "lucide-react";

const sections = [
  {
    icon: FlaskConical,
    key: "fda_section_1",
    title: "Research Use Only",
    content:
      "All products sold by Jartides are intended strictly for in-vitro laboratory research purposes. They are not intended for human consumption, veterinary use, therapeutic application, or any clinical purpose. These products must only be handled by qualified researchers and professionals in controlled laboratory environments.",
  },
  {
    icon: AlertTriangle,
    key: "fda_section_2",
    title: "FDA Notice",
    content:
      "These products have not been evaluated by the United States Food and Drug Administration (FDA). They are not intended to diagnose, treat, cure, or prevent any disease or medical condition. No claims are made regarding the safety or efficacy of these products for any purpose other than in-vitro research.",
  },
  {
    icon: Shield,
    key: "fda_section_3",
    title: "Health Canada Notice",
    content:
      "These products are not approved by Health Canada for human use, and have not been reviewed or authorized under the Food and Drugs Act. They are not classified as Natural Health Products (NHPs), pharmaceuticals, or controlled substances when sold and used strictly for research purposes. Purchasers in Canada are responsible for ensuring compliance with all applicable federal and provincial regulations.",
  },
  {
    icon: Ban,
    key: "fda_section_4",
    title: "Not for Human Consumption",
    content:
      "Under no circumstances should any product purchased from Jartides be ingested, injected, inhaled, or applied to the body. These products are chemical reagents for laboratory research only. Any misuse of these products is the sole responsibility of the purchaser.",
  },
  {
    icon: UserCheck,
    key: "fda_section_5",
    title: "Purchaser Responsibility",
    content:
      "By purchasing from Jartides, you confirm that you are at least 21 years of age and that all products are being acquired exclusively for legitimate in-vitro research purposes. You accept full responsibility for the lawful handling, storage, and use of all products. You further agree not to resell these products for human or animal consumption.",
  },
  {
    icon: ClipboardCheck,
    key: "fda_section_6",
    title: "Quality & Testing",
    content:
      "All Jartides products are third-party tested for purity and identity using HPLC (High-Performance Liquid Chromatography) and Mass Spectrometry analysis. Certificates of Analysis (COAs) are available for every product batch and can be viewed on our COA page. Our commitment to quality ensures that researchers receive the highest-grade peptides for their studies.",
  },
];

export default function FdaPage() {
  return (
    <>
      <PageHeader
        title="FDA & HEALTH CANADA DISCLAIMER"
        description="Important regulatory information"
        breadcrumbs={[{ label: "FDA & Health Canada Disclaimer" }]}
        titleKey="fda_title"
        descriptionKey="fda_description"
      />

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="space-y-0 divide-y divide-[#dde2ea] rounded-xl border border-[#dde2ea] bg-white">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.key} className="p-6 md:p-8">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0b3d7a]/10">
                    <Icon className="h-5 w-5 text-[#0b3d7a]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
                    <EditableText settingKey={`${section.key}_title`}>
                      {section.title}
                    </EditableText>
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-gray-700 font-[family-name:var(--font-body)]">
                  <EditableText settingKey={`${section.key}_content`}>
                    {section.content}
                  </EditableText>
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-gray-400 font-[family-name:var(--font-body)]">
          Last updated: March 2026. This disclaimer applies to all products
          sold on jartides.com.
        </p>
      </section>
    </>
  );
}

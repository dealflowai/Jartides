"use client";

import { useState, useEffect } from "react";
import { Plus, Minus } from "lucide-react";
import EditableText from "@/components/admin/EditableText";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSection {
  title: string;
  items: FaqItem[];
}

interface FaqAccordionProps {
  sections: FaqSection[];
  /** When true, tries to load FAQ data from site_settings and falls back to `sections` prop */
  useDynamic?: boolean;
}

export default function FaqAccordion({
  sections: defaultSections,
  useDynamic = false,
}: FaqAccordionProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const [sections, setSections] = useState<FaqSection[]>(defaultSections);

  useEffect(() => {
    if (!useDynamic) return;

    async function loadDynamic() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) return;
        const data = await res.json();
        const faqSetting = data.find(
          (item: { key: string; value: unknown }) => item.key === "faq_data"
        );
        if (faqSetting?.value) {
          const parsed =
            typeof faqSetting.value === "string"
              ? JSON.parse(faqSetting.value)
              : faqSetting.value;
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSections(parsed);
          }
        }
      } catch {
        // Keep defaults on error
      }
    }

    loadDynamic();
  }, [useDynamic]);

  function toggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  // Map section index to a slug for setting keys
  const sectionSlugs = ["general", "orders", "subscriptions"];

  return (
    <div className="space-y-10">
      {sections.map((section, si) => {
        const slug = sectionSlugs[si] || `section_${si + 1}`;
        return (
        <div key={si}>
          <h2 className="mb-4 text-xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            <EditableText settingKey={`faq_${slug}_heading`}>{section.title}</EditableText>
          </h2>

          <div className="divide-y divide-[#dde2ea] rounded-xl border border-[#dde2ea] bg-white">
            {section.items.map((item, qi) => {
              const key = `${si}-${qi}`;
              const isOpen = openKey === key;

              return (
                <div key={key}>
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50 font-[family-name:var(--font-body)]"
                    aria-expanded={isOpen}
                  >
                    <span>
                      <EditableText settingKey={`faq_${slug}_${qi + 1}_q`}>{item.question}</EditableText>
                    </span>
                    {isOpen ? (
                      <Minus className="h-4 w-4 shrink-0 text-[#1a6de3]" />
                    ) : (
                      <Plus className="h-4 w-4 shrink-0 text-[#1a6de3]" />
                    )}
                  </button>

                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: isOpen ? "500px" : "0px",
                      opacity: isOpen ? 1 : 0,
                    }}
                  >
                    <p className="px-5 pb-4 text-sm leading-relaxed text-gray-600 font-[family-name:var(--font-body)]">
                      <EditableText settingKey={`faq_${slug}_${qi + 1}_a`}>{item.answer}</EditableText>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })}
    </div>
  );
}

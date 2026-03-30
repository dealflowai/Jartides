"use client";

import { Info } from "lucide-react";
import EditableText from "@/components/admin/EditableText";

export default function CoaExplanation() {
  return (
    <div className="mt-16 rounded-xl border border-[#dde2ea] bg-white p-8">
      <div className="mb-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-[#0b3d7a]" />
        <h2 className="text-xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
          <EditableText settingKey="coa_explanation_heading">
            Understanding Our COAs
          </EditableText>
        </h2>
      </div>

      <div className="space-y-4 text-sm text-gray-700 font-[family-name:var(--font-body)]">
        <p>
          <EditableText settingKey="coa_explanation_intro">
            A Certificate of Analysis (COA) is a document issued by an
            independent third-party laboratory that confirms the identity,
            purity, and quality of a specific product batch. Each COA
            typically includes:
          </EditableText>
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <EditableText settingKey="coa_explanation_hplc">
              <strong>HPLC Analysis</strong> - High-Performance Liquid
              Chromatography measures the purity percentage of the peptide.
            </EditableText>
          </li>
          <li>
            <EditableText settingKey="coa_explanation_ms">
              <strong>Mass Spectrometry (MS)</strong> - Confirms the
              molecular identity of the peptide by measuring its molecular
              weight.
            </EditableText>
          </li>
          <li>
            <EditableText settingKey="coa_explanation_batch">
              <strong>Batch Number</strong> - A unique identifier
              linking the COA to a specific production batch.
            </EditableText>
          </li>
          <li>
            <EditableText settingKey="coa_explanation_appearance">
              <strong>Appearance &amp; Solubility</strong> - Physical
              characteristics of the product as observed during testing.
            </EditableText>
          </li>
        </ul>
        <p>
          <EditableText settingKey="coa_explanation_closing">
            We are committed to transparency and quality. If you have any
            questions about our testing or would like a COA for a specific
            product, please{" "}
            <a
              href="/contact"
              className="font-semibold text-[#1a6de3] underline hover:text-[#0b3d7a]"
            >
              contact us
            </a>
            .
          </EditableText>
        </p>
      </div>
    </div>
  );
}

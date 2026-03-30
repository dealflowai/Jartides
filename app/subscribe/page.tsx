"use client";

import PageHeader from "@/components/ui/PageHeader";
import { Clock } from "lucide-react";

export default function SubscribePage() {
  return (
    <>
      <PageHeader
        title="SUBSCRIBE & SAVE"
        description="Monthly research peptide deliveries at a discounted rate."
        breadcrumbs={[{ label: "Subscribe & Save" }]}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-[#dde2ea] bg-white p-10 shadow-sm text-center">
          <Clock className="mx-auto mb-4 h-10 w-10 text-[#1a6de3]" />
          <h2 className="text-2xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            Coming Soon
          </h2>
          <p className="mt-3 text-sm text-gray-500 font-[family-name:var(--font-body)]">
            We&apos;re building a subscription plan so you can get your research peptides delivered monthly at a discounted rate. Stay tuned!
          </p>
        </div>
      </section>
    </>
  );
}

"use client";

import PageHeader from "@/components/ui/PageHeader";
import EditableText from "@/components/admin/EditableText";
import { Clock, Check } from "lucide-react";

const features = [
  "Up to 20% savings on all peptides",
  "Flexible monthly delivery",
  "Change or swap products anytime",
  "Pause or cancel with no fees",
  "Priority processing",
];

export default function SubscribePage() {
  return (
    <>
      <PageHeader
        title="SUBSCRIBE & SAVE"
        description="Get your research peptides delivered monthly at a discounted rate. Cancel anytime."
        breadcrumbs={[{ label: "Subscribe & Save" }]}
      />

      <section className="mx-auto max-w-7xl px-6 py-16">
        {/* Plan Card */}
        <div className="mx-auto max-w-lg rounded-2xl border border-[#dde2ea] bg-white p-8 shadow-sm">
          {/* Coming Soon Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0b3d7a]/10 px-4 py-1.5 text-sm font-semibold text-[#0b3d7a] font-[family-name:var(--font-body)]">
              <Clock className="h-4 w-4" />
              <EditableText settingKey="subscribe_badge">Coming Soon</EditableText>
            </span>
          </div>

          {/* Title */}
          <h2 className="text-center text-2xl font-bold text-[#0b3d7a] font-[family-name:var(--font-heading)]">
            <EditableText settingKey="subscribe_heading">Monthly Research Plan</EditableText>
          </h2>

          {/* Description */}
          <p className="mt-3 text-center text-sm text-gray-600 font-[family-name:var(--font-body)]">
            <EditableText settingKey="subscribe_description">SUBSCRIBE &amp; SAVE UP TO 20% &mdash; Get your research peptides
            delivered monthly at a discounted rate. Cancel anytime.</EditableText>
          </p>

          {/* Divider */}
          <hr className="my-6 border-[#dde2ea]" />

          {/* Features */}
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li
                key={feature}
                className="flex items-start gap-3 text-sm text-gray-700 font-[family-name:var(--font-body)]"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#1a6de3]" />
                <EditableText settingKey={`subscribe_feature_${index + 1}`}>{feature}</EditableText>
              </li>
            ))}
          </ul>

          {/* Disabled Button */}
          <button
            disabled
            className="mt-8 w-full cursor-not-allowed rounded-lg bg-gray-300 px-7 py-3 text-sm font-semibold text-gray-500 font-[family-name:var(--font-body)]"
          >
            <EditableText settingKey="subscribe_button_text">Coming Soon</EditableText>
          </button>
        </div>

        {/* Note */}
        <p className="mt-8 text-center text-sm text-gray-500 font-[family-name:var(--font-body)]">
          <EditableText settingKey="subscribe_note">We&apos;re working on bringing you the best subscription experience.
          Stay tuned!</EditableText>
        </p>
      </section>
    </>
  );
}

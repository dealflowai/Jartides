"use client";

import { Microscope, FlaskConical, AlertTriangle } from "lucide-react";
import { useState } from "react";
import EditableText from "@/components/admin/EditableText";

const steps = [
  {
    number: 1,
    icon: Microscope,
    title: "What Are Peptides?",
    body: "Peptides are short chains of amino acids, typically consisting of 2-50 amino acids linked by peptide bonds. They are smaller than proteins and play crucial roles in biological processes. Research peptides are synthesized in laboratories for scientific study and investigation.",
  },
  {
    number: 2,
    icon: FlaskConical,
    title: "Research Applications",
    body: "Research peptides are used in laboratory settings to study biological processes including tissue regeneration, metabolic function, cellular signaling, and immune response modulation. They are essential tools in biomedical research and drug development.",
  },
  {
    number: 3,
    icon: AlertTriangle,
    title: "Important Disclaimer",
    body: "Research peptides are strictly intended for in-vitro laboratory research and scientific investigation only. They are not intended for human consumption, therapeutic use, or any form of self-administration. All products require proper handling by qualified researchers.",
  },
];

function StepCard({ step, index }: { step: (typeof steps)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center text-center cursor-default rounded-xl p-6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 24px rgba(0, 0, 0, 0.08)" : "none",
        backgroundColor: hovered ? "#ffffff" : "transparent",
      }}
    >
      <div className="relative mb-5">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            transition: "background-color 0.3s ease, transform 0.3s ease",
            backgroundColor: hovered ? "#1a6de3" : "#0b3d7a",
            transform: hovered ? "scale(1.1)" : "scale(1)",
          }}
        >
          <step.icon className="h-7 w-7 text-white" strokeWidth={1.75} />
        </div>
        <span className="absolute -top-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a6de3] text-xs font-bold text-white">
          {step.number}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        <EditableText settingKey={`how_step_${index + 1}_title`}>{step.title}</EditableText>
      </h3>
      <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
        <EditableText settingKey={`how_step_${index + 1}_body`}>{step.body}</EditableText>
      </p>
    </div>
  );
}

export default function HowPeptidesWork() {
  return (
    <section className="bg-[#f7f9fc] py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-gray-900">
            <EditableText settingKey="how_heading">HOW PEPTIDES WORK</EditableText>
          </h2>
          <p className="mt-2 text-gray-500">
            <EditableText settingKey="how_subheading">Understanding research peptides</EditableText>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

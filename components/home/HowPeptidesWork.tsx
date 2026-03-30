"use client";

import { Microscope, FlaskConical, Dna, AlertTriangle } from "lucide-react";
import { useState } from "react";
import EditableText from "@/components/admin/EditableText";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const steps = [
  {
    number: 1,
    icon: Dna,
    title: "What Are Peptides?",
    body: "Peptides are short chains of amino acids linked together by peptide bonds. They occur naturally in every living organism and can interact with specific cellular receptors, making them valuable tools for studying how cells communicate, grow, and repair.",
  },
  {
    number: 2,
    icon: Microscope,
    title: "How They Work in Research",
    body: "Researchers apply peptides to cell cultures (in-vitro) to study receptor binding, signal transduction, metabolic pathways, and tissue regeneration. Their high specificity allows scientists to isolate and observe individual biological mechanisms under controlled conditions.",
  },
  {
    number: 3,
    icon: FlaskConical,
    title: "Research Applications",
    body: "Research peptides are used across molecular biology, pharmacology, immunology, and endocrinology. Common areas of study include cellular repair, growth factor signaling, immune modulation, and metabolic function.",
  },
  {
    number: 4,
    icon: AlertTriangle,
    title: "Important Disclaimer",
    body: "All products are strictly for in-vitro laboratory research. They are not intended for human consumption, self-administration, or therapeutic use. By purchasing, you confirm you are 21+ and that products will be handled by qualified researchers.",
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
  const animRef = useScrollAnimation();

  return (
    <section className="bg-[#f7f9fc] py-16 md:py-20">
      <div ref={animRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-gray-900">
            <EditableText settingKey="how_heading">HOW PEPTIDES WORK</EditableText>
          </h2>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
            <EditableText settingKey="how_subheading">Understanding research peptides and their applications.</EditableText>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

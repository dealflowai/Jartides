"use client";

import { Shield, Truck, FlaskConical, Award } from "lucide-react";
import { useState } from "react";
import EditableText from "@/components/admin/EditableText";

const items = [
  {
    icon: Shield,
    title: "Third-Party Tested",
    description: "HPLC & MS verified with COAs",
  },
  {
    icon: Truck,
    title: "Same-Day Processing",
    description: "3-8 business day delivery",
  },
  {
    icon: FlaskConical,
    title: "99%+ Purity",
    description: "Industry-leading standards",
  },
  {
    icon: Award,
    title: "Quality Guarantee",
    description: "If quality is not correct, we make it right",
  },
];

function TrustItem({ item, index }: { item: (typeof items)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col items-center text-center gap-3 cursor-default rounded-xl p-4"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 24px rgba(0, 0, 0, 0.08)" : "none",
        backgroundColor: hovered ? "#ffffff" : "transparent",
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{
          transition: "background-color 0.3s ease, transform 0.3s ease",
          backgroundColor: hovered ? "#0b3d7a" : "#e8effa",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <item.icon
          className="h-6 w-6"
          strokeWidth={1.75}
          style={{
            transition: "color 0.3s ease",
            color: hovered ? "#ffffff" : "#0b3d7a",
          }}
        />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">
          <EditableText settingKey={`trust_${index + 1}_title`}>{item.title}</EditableText>
        </h3>
        <p className="mt-1 text-xs text-gray-500 leading-relaxed">
          <EditableText settingKey={`trust_${index + 1}_desc`}>{item.description}</EditableText>
        </p>
      </div>
    </div>
  );
}

export default function TrustStrip() {
  return (
    <section className="bg-[#f7f9fc] py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => (
            <TrustItem key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

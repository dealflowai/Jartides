"use client";

import { Truck, FlaskConical, Shield, FileCheck, Globe } from "lucide-react";

const items = [
  { icon: Globe, text: "WE SHIP WORLDWIDE" },
  { icon: Truck, text: "SAME-DAY PROCESSING • 3-8 BUSINESS DAY DELIVERY" },
  { icon: FlaskConical, text: "99%+ PURITY GUARANTEED" },
  { icon: Shield, text: "THIRD-PARTY TESTED" },
  { icon: FileCheck, text: "COAs AVAILABLE FOR ALL PRODUCTS" },
];

export default function Ticker() {
  return (
    <div data-ticker className="bg-gradient-to-r from-[#061a38] via-[#0b3d7a] to-[#061a38] overflow-hidden relative">
      {/* Subtle edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#061a38] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#061a38] to-transparent z-10 pointer-events-none" />

      <div className="ticker-track flex items-center gap-10 py-2.5 whitespace-nowrap">
        {/* Render items twice for seamless loop */}
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2.5 text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
              <item.icon className="h-3 w-3 text-blue-300 flex-shrink-0" strokeWidth={2.5} />
            </span>
            {item.text}
            <span className="text-blue-400/60 ml-8">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

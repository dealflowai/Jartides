"use client";

import { Truck, FlaskConical, Shield, FileCheck, Globe } from "lucide-react";

const items = [
  { icon: Globe, text: "WE SHIP WORLDWIDE" },
  { icon: Truck, text: "SAME-DAY PROCESSING" },
  { icon: FlaskConical, text: "99%+ PURITY GUARANTEED" },
  { icon: Shield, text: "THIRD-PARTY TESTED" },
  { icon: FileCheck, text: "COAs AVAILABLE FOR ALL PRODUCTS" },
  { icon: Globe, text: "WE SHIP WORLDWIDE" },
  { icon: Truck, text: "SAME-DAY PROCESSING" },
  { icon: FlaskConical, text: "99%+ PURITY GUARANTEED" },
  { icon: Shield, text: "THIRD-PARTY TESTED" },
  { icon: FileCheck, text: "COAs AVAILABLE FOR ALL PRODUCTS" },
];

export default function Ticker() {
  return (
    <div data-ticker className="bg-[#0b3d7a] overflow-hidden">
      <div
        className="ticker-track flex items-center gap-8 py-2.5 whitespace-nowrap"
      >
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.15em] text-white/90 uppercase">
            <item.icon className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" strokeWidth={2} />
            {item.text}
            <span className="text-blue-400 ml-6">•</span>
          </span>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          width: max-content;
          animation: ticker-scroll 30s linear infinite;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

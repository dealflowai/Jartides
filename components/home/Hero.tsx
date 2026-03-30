"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import EditableText from "@/components/admin/EditableText";

export default function Hero() {
  return (
    <section className="relative overflow-hidden flex items-center mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl min-h-[320px] md:min-h-[420px]">
      {/* Hero background image */}
      <Image
        src="/images/hero-banner.jpg"
        alt=""
        fill
        priority
        className="object-cover rounded-2xl"
        sizes="100vw"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-[#071e3d]/30 z-[1] rounded-2xl" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl text-white leading-[1] mb-3 tracking-wide">
            <EditableText settingKey="hero_heading">
              JARTIDES
            </EditableText>
          </h1>
          <p className="font-[family-name:var(--font-heading)] text-base sm:text-lg md:text-xl text-white/90 mb-10 leading-relaxed tracking-wider">
            <EditableText settingKey="hero_subheading">
              Uncompromising Purity. Precision Peptides for Research. Lab-Tested Excellence.
            </EditableText>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="blue" size="sm" href="/shop" className="px-8 py-3.5 text-sm">
              Shop Peptides
            </Button>
            <Button variant="white" size="sm" href="/subscribe" className="px-8 py-3.5 text-sm">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

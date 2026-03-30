"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import EditableText from "@/components/admin/EditableText";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden mx-4 sm:mx-6 lg:mx-8 my-4 rounded-2xl">
      <Image
        src="/images/galaxy-bg.jpg"
        alt=""
        fill
        className="object-cover rounded-2xl"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-[#071e3d]/30 z-[1] rounded-2xl" />

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-[72px] text-center">
        <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl text-white mb-4">
          <EditableText settingKey="cta_heading">
            READY TO START YOUR RESEARCH?
          </EditableText>
        </h2>
        <p className="text-blue-200 text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
          <EditableText settingKey="cta_description">
            Browse our premium collection of 99%+ purity research peptides
          </EditableText>
        </p>
        <Button variant="blue" size="lg" href="/shop">
          Shop Now
        </Button>
      </div>
    </section>
  );
}

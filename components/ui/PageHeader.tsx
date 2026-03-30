"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import EditableText from "@/components/admin/EditableText";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  titleKey?: string;
  descriptionKey?: string;
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  titleKey,
  descriptionKey,
}: PageHeaderProps) {
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

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-9 md:py-14">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-1 text-sm text-white/70 font-[family-name:var(--font-body)]"
          >
            <Link
              href="/"
              className="hover:text-white transition-colors"
            >
              Home
            </Link>
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide uppercase text-white font-[family-name:var(--font-heading)]">
          {titleKey ? (
            <EditableText settingKey={titleKey}>{title}</EditableText>
          ) : (
            title
          )}
        </h1>

        {/* Description */}
        {description && (
          <p className="mt-3 max-w-2xl text-base text-white/80 font-[family-name:var(--font-body)]">
            {descriptionKey ? (
              <EditableText settingKey={descriptionKey}>{description}</EditableText>
            ) : (
              description
            )}
          </p>
        )}
      </div>
    </section>
  );
}

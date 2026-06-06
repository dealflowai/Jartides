"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Button from "@/components/ui/Button";
import type { PageSection, FaqEntry } from "@/lib/sections/schema";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function str(props: Record<string, unknown>, key: string): string {
  const v = props[key];
  return typeof v === "string" ? v : "";
}

/** Background palette shared by text-style sections. */
function bgPalette(background: string) {
  switch (background) {
    case "dark":
      return { section: "bg-[#0b3d7a]", heading: "text-white", body: "text-blue-100" };
    case "light":
      return { section: "bg-[#f7f9fc]", heading: "text-gray-900", body: "text-gray-600" };
    default:
      return { section: "bg-white", heading: "text-gray-900", body: "text-gray-600" };
  }
}

/* ------------------------------------------------------------------ */
/*  Text Block                                                         */
/* ------------------------------------------------------------------ */
function RichTextSection({ props }: { props: Record<string, unknown> }) {
  const heading = str(props, "heading");
  const body = str(props, "body");
  const align = str(props, "align") === "left" ? "left" : "center";
  const bg = bgPalette(str(props, "background"));

  if (!heading && !body) return null;

  return (
    <section className={`${bg.section} py-14 md:py-20`}>
      <div
        className={`mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 ${
          align === "center" ? "text-center" : "text-left"
        }`}
      >
        {heading && (
          <h2 className={`font-[family-name:var(--font-heading)] text-3xl md:text-4xl ${bg.heading}`}>
            {heading}
          </h2>
        )}
        {body && (
          <p className={`mt-4 whitespace-pre-line text-base md:text-lg leading-relaxed ${bg.body}`}>
            {body}
          </p>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Image Banner                                                       */
/* ------------------------------------------------------------------ */
function ImageBannerSection({ props }: { props: Record<string, unknown> }) {
  const image = str(props, "image");
  const heading = str(props, "heading");
  const subheading = str(props, "subheading");
  const buttonLabel = str(props, "buttonLabel");
  const buttonHref = str(props, "buttonHref");
  const height = str(props, "height");

  const minHeight =
    height === "small" ? "260px" : height === "large" ? "520px" : "380px";

  return (
    <section
      className="relative mx-4 my-4 flex items-center overflow-hidden rounded-2xl sm:mx-6 lg:mx-8"
      style={{ minHeight }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-[#061a38] to-[#0b3d7a]" />
      )}
      <div className="absolute inset-0 rounded-2xl bg-[#071e3d]/40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-12 text-center sm:px-6 lg:px-8">
        {heading && (
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-extrabold text-white md:text-5xl">
            {heading}
          </h2>
        )}
        {subheading && (
          <p className="mx-auto mt-3 max-w-2xl text-base text-white/90 md:text-lg">
            {subheading}
          </p>
        )}
        {buttonLabel && buttonHref && (
          <div className="mt-7">
            <Button variant="blue" href={buttonHref}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Callout / CTA band                                                 */
/* ------------------------------------------------------------------ */
function CalloutSection({ props }: { props: Record<string, unknown> }) {
  const heading = str(props, "heading");
  const text = str(props, "text");
  const buttonLabel = str(props, "buttonLabel");
  const buttonHref = str(props, "buttonHref");
  const background = str(props, "background");

  const isLight = background === "light";
  const band =
    background === "navy"
      ? "bg-gradient-to-r from-[#061a38] via-[#0b3d7a] to-[#061a38]"
      : isLight
        ? "bg-[#f7f9fc] border border-[#dde2ea]"
        : "bg-[#1a6de3]";

  if (!heading && !text) return null;

  return (
    <section className={`mx-4 my-4 overflow-hidden rounded-2xl sm:mx-6 lg:mx-8 ${band}`}>
      <div className="mx-auto max-w-3xl px-6 py-14 text-center">
        {heading && (
          <h2
            className={`font-[family-name:var(--font-heading)] text-3xl md:text-4xl ${
              isLight ? "text-[#0b3d7a]" : "text-white"
            }`}
          >
            {heading}
          </h2>
        )}
        {text && (
          <p
            className={`mx-auto mt-3 max-w-xl whitespace-pre-line text-base leading-relaxed md:text-lg ${
              isLight ? "text-gray-600" : "text-white/90"
            }`}
          >
            {text}
          </p>
        )}
        {buttonLabel && buttonHref && (
          <div className="mt-7">
            <Button variant={isLight ? "blue" : "white"} href={buttonHref}>
              {buttonLabel}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Image + Text                                                       */
/* ------------------------------------------------------------------ */
function ImageTextSection({ props }: { props: Record<string, unknown> }) {
  const image = str(props, "image");
  const heading = str(props, "heading");
  const body = str(props, "body");
  const buttonLabel = str(props, "buttonLabel");
  const buttonHref = str(props, "buttonHref");
  const imageRight = str(props, "imageSide") === "right";

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        {/* Image */}
        <div className={imageRight ? "md:order-2" : "md:order-1"}>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-[#f0f4fa]">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                No image set
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className={imageRight ? "md:order-1" : "md:order-2"}>
          {heading && (
            <h2 className="font-[family-name:var(--font-heading)] text-3xl text-gray-900 md:text-4xl">
              {heading}
            </h2>
          )}
          {body && (
            <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-gray-600">
              {body}
            </p>
          )}
          {buttonLabel && buttonHref && (
            <div className="mt-6">
              <Button variant="blue" href={buttonHref}>
                {buttonLabel}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
function FaqSection({ props }: { props: Record<string, unknown> }) {
  const heading = str(props, "heading");
  const rawItems = Array.isArray(props.items) ? (props.items as FaqEntry[]) : [];
  const items = rawItems.filter((i) => i && (i.question || i.answer));
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0 && !heading) return null;

  return (
    <section className="bg-[#f7f9fc] py-14 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {heading && (
          <h2 className="mb-8 text-center font-[family-name:var(--font-heading)] text-3xl text-[#0b3d7a] md:text-4xl">
            {heading}
          </h2>
        )}
        <div className="divide-y divide-[#dde2ea] rounded-xl border border-[#dde2ea] bg-white">
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
                  aria-expanded={isOpen}
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <Minus className="h-4 w-4 shrink-0 text-[#1a6de3]" />
                  ) : (
                    <Plus className="h-4 w-4 shrink-0 text-[#1a6de3]" />
                  )}
                </button>
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? "600px" : "0px", opacity: isOpen ? 1 : 0 }}
                >
                  <p className="whitespace-pre-line px-5 pb-4 text-sm leading-relaxed text-gray-600">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Spacer / Divider                                                   */
/* ------------------------------------------------------------------ */
function SpacerSection({ props }: { props: Record<string, unknown> }) {
  const size = str(props, "size");
  const divider = props.divider === true;
  const height = size === "small" ? 32 : size === "large" ? 112 : 64;

  return (
    <div style={{ height }} className="flex items-center justify-center">
      {divider && (
        <hr className="mx-auto w-full max-w-7xl border-t border-[#dde2ea] px-4 sm:px-6 lg:px-8" />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Switch                                                             */
/* ------------------------------------------------------------------ */
export default function CustomSection({ section }: { section: PageSection }) {
  const props = section.props ?? {};
  switch (section.type) {
    case "rich_text":
      return <RichTextSection props={props} />;
    case "image_banner":
      return <ImageBannerSection props={props} />;
    case "callout":
      return <CalloutSection props={props} />;
    case "image_text":
      return <ImageTextSection props={props} />;
    case "faq":
      return <FaqSection props={props} />;
    case "spacer":
      return <SpacerSection props={props} />;
    default:
      return null;
  }
}

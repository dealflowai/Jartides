"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/constants";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/coa", label: "COAs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 h-16">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Jartides" width={128} height={128} className="h-28 w-28 flex-shrink-0 object-contain -my-6 -mr-4 -ml-4" unoptimized />
            <div className="flex flex-col leading-none">
              <span className="font-[family-name:var(--font-heading)] text-[1.35rem] font-extrabold tracking-tight text-[#0b3d7a]">
                JARTIDES
              </span>
              <span className="text-[0.65rem] font-bold tracking-[0.15em] text-[#1a6de3] uppercase -mt-0.5">
                Research Peptides
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 -mr-2 rounded-full text-gray-500 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-6 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {NAV_LINKS.map((link, i) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <li
                  key={link.href}
                  className={`transition-all duration-300 ease-out ${
                    isOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${100 + i * 60}ms` : "0ms",
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={onClose}
                    className={`flex items-center rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-blue-50 text-[#1a6de3]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#0b3d7a]"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer area with social links */}
        <div
          className={`border-t border-gray-100 px-6 py-6 transition-all duration-300 ease-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: isOpen ? "400ms" : "0ms" }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <a
              href={SOCIAL_LINKS.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[#0b3d7a] hover:text-white transition-colors"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.6a8.22 8.22 0 0 0 4.76 1.51V6.69h-1z" />
              </svg>
            </a>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Premium Research Peptides
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/subscribe", label: "Subscribe & Save" },
  { href: "/coa", label: "COAs" },
  { href: "/faq", label: "FAQ" },
  { href: "/fda", label: "FDA" },
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
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 h-16">
          <div className="flex items-center">
            <Image src="/images/logo.png" alt="Jartides" width={128} height={128} className="h-28 w-28 flex-shrink-0 object-contain -my-6 -mr-4 -ml-4" unoptimized />
            <div className="flex flex-col leading-none">
              <span className="font-[family-name:var(--font-heading)] text-[1.35rem] tracking-wide text-[#0b3d7a]">
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
        <nav className="px-6 py-6">
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

        {/* Footer area */}
        <div
          className={`absolute bottom-0 left-0 right-0 border-t border-gray-100 px-6 py-6 transition-all duration-300 ease-out ${
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          style={{ transitionDelay: isOpen ? "400ms" : "0ms" }}
        >
          <p className="text-xs text-gray-400 text-center">
            Premium Canadian Research Peptides
          </p>
        </div>
      </div>
    </div>
  );
}

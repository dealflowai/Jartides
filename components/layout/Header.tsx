"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingCart, Menu, X, User, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import MobileNav from "./MobileNav";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/subscribe", label: "Subscribe" },
  { href: "/coa", label: "COAs" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[] | null;
  category: { name: string } | null;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Focus search input when overlay opens; reset when closed
  const prevSearchOpen = useRef(searchOpen);
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (prevSearchOpen.current && !searchOpen) {
      setSearchQuery("");
      setResults([]);
      setHasSearched(false);
    }
    prevSearchOpen.current = searchOpen;
  }, [searchOpen]);

  // Close search on route change
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setSearchOpen(false);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // Close search on Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSearchOpen(false);
    }
    if (searchOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // Lock body scroll when mobile nav is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Live search with debounce
  const searchProducts = useCallback(async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
      setHasSearched(true);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchProducts(value.trim());
    }, 300);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  function handleResultClick(slug: string) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(`/shop/${slug}`);
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 group flex items-center -ml-8">
              <Image src="/images/logo.png" alt="Jartides" width={128} height={128} className="h-28 w-28 flex-shrink-0 object-contain -my-6 -mr-4" unoptimized />
              <div className="flex flex-col leading-none">
                <span className="font-[family-name:var(--font-heading)] text-[1.35rem] sm:text-[1.6rem] font-extrabold tracking-tight text-[#0b3d7a]">
                  JARTIDES
                </span>
                <span className="text-[0.65rem] sm:text-[0.7rem] font-bold tracking-[0.15em] text-[#1a6de3] uppercase -mt-0.5">
                  Research Peptides
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 justify-center items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
                      isActive
                        ? "text-[#1a6de3] bg-blue-50"
                        : "text-gray-700 hover:text-[#1a6de3] hover:bg-blue-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search Toggle */}
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label={searchOpen ? "Close search" : "Open search"}
                className="relative p-2 rounded-full text-gray-600 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
              >
                {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
              </button>

              {/* Account */}
              <Link
                href="/account"
                aria-label="Account"
                className="relative p-2 rounded-full text-gray-600 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
              >
                <User className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                aria-label="Open cart"
                className="relative p-2 rounded-full text-gray-600 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1a6de3] text-[10px] font-bold text-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 rounded-full text-gray-600 hover:text-[#0b3d7a] hover:bg-gray-100 transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <div
          ref={searchContainerRef}
          className={`overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-100 ${
            searchOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 border-t-transparent"
          }`}
        >
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for peptides..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-12 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#1a6de3] focus:ring-2 focus:ring-[#1a6de3]/20 focus:bg-white outline-none transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
              )}
            </form>

            {/* Results */}
            {hasSearched && (
              <div className="mt-3">
                {results.length > 0 ? (
                  <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
                    {results.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleResultClick(product.slug)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                        >
                          {product.images?.[0] ? (
                            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                              <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-contain p-0.5"
                                sizes="40px"
                              />
                            </div>
                          ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 border border-gray-200">
                              <Search className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.category?.name}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-[#0b3d7a] whitespace-nowrap">
                            {formatPrice(product.price)}
                          </span>
                        </button>
                      </li>
                    ))}
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
                          setSearchOpen(false);
                        }}
                        className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-[#1a6de3] transition-colors hover:bg-blue-50"
                      >
                        View all results
                        <Search className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
                    <p className="text-sm text-gray-500">
                      No products found for &quot;{searchQuery}&quot;
                    </p>
                    <Link
                      href="/shop"
                      onClick={() => setSearchOpen(false)}
                      className="mt-2 inline-block text-sm font-medium text-[#1a6de3] hover:underline"
                    >
                      Browse all products
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Search hint when empty */}
            {!hasSearched && searchQuery.length === 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-400">Popular:</span>
                {["BPC-157", "Ipamorelin", "CJC-1295", "TB-500"].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setSearchQuery(term);
                      searchProducts(term);
                    }}
                    className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-[#1a6de3] hover:text-[#1a6de3]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Backdrop when search is open */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        />
      )}

      {/* Mobile Navigation */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

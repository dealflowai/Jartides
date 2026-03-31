"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { WishlistContext, type WishlistContextType } from "@/hooks/useWishlist";

const STORAGE_KEY = "jartides_wishlist";

function readFromStorage(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export default function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWishlistIds(readFromStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistIds));
      } catch {
        // storage full or unavailable
      }
    }
  }, [wishlistIds, mounted]);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const value: WishlistContextType = useMemo(
    () => ({ wishlistIds, toggleWishlist, isWishlisted }),
    [wishlistIds, toggleWishlist, isWishlisted]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { CartContext, type CartContextType } from "@/hooks/useCart";
import type { CartItem } from "@/lib/types";

const CART_KEY = "jartides_cart";

function cartKey(item: { productId: string; variantId: string | null; purchaseType: string }) {
  return `${item.productId}:${item.variantId ?? "base"}:${item.purchaseType}`;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CartItem[];
        // Migrate old cart items that lack variantId
        const migrated = parsed.map((i) => ({
          ...i,
          variantId: i.variantId ?? null,
        }));
        setItems(migrated);
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  const addItem = useCallback(
    (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
      const key = cartKey(newItem);
      setItems((prev) => {
        const existing = prev.find((i) => cartKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i) === key
              ? { ...i, quantity: Math.min(i.quantity + (newItem.quantity || 1), 20) }
              : i
          );
        }
        return [...prev, { ...newItem, variantId: newItem.variantId ?? null, quantity: newItem.quantity || 1 }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null, purchaseType: string) => {
      const key = cartKey({ productId, variantId, purchaseType });
      setItems((prev) => prev.filter((i) => cartKey(i) !== key));
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, variantId: string | null, purchaseType: string, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId, variantId, purchaseType);
        return;
      }
      const key = cartKey({ productId, variantId, purchaseType });
      setItems((prev) =>
        prev.map((i) =>
          cartKey(i) === key ? { ...i, quantity: Math.min(quantity, 20) } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100,
    [items]
  );

  const value: CartContextType = useMemo(
    () => ({
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
    }),
    [items, addItem, removeItem, updateQuantity, clearCart, itemCount, subtotal, isOpen, openCart, closeCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

"use client";

import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { CartContext, type CartContextType } from "@/hooks/useCart";
import type { CartItem } from "@/lib/types";

const CART_KEY = "jartides_cart";

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
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
      setItems((prev) => {
        const existing = prev.find(
          (i) =>
            i.productId === newItem.productId &&
            i.purchaseType === newItem.purchaseType
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === newItem.productId &&
            i.purchaseType === newItem.purchaseType
              ? { ...i, quantity: Math.min(i.quantity + (newItem.quantity || 1), 20) }
              : i
          );
        }
        return [...prev, { ...newItem, quantity: newItem.quantity || 1 }];
      });
      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, purchaseType: string) => {
      setItems((prev) =>
        prev.filter(
          (i) => !(i.productId === productId && i.purchaseType === purchaseType)
        )
      );
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, purchaseType: string, quantity: number) => {
      if (quantity < 1) {
        removeItem(productId, purchaseType);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && i.purchaseType === purchaseType
            ? { ...i, quantity: Math.min(quantity, 20) }
            : i
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
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
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

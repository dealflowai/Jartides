"use client";

import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

export default function ClearCart() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    try { sessionStorage.removeItem("jartides_checkout"); } catch { /* ignore */ }
  }, [clearCart]);

  return null;
}

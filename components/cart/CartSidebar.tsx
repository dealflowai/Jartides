"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    subtotal,
    itemCount,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div data-cart-sidebar className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Sidebar panel */}
      <aside className="fixed top-0 right-0 h-full w-full sm:w-[370px] bg-white flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 font-[family-name:var(--font-heading)] tracking-wide uppercase">
            Your Cart ({itemCount})
          </h2>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="w-14 h-14 text-gray-300" />
            <p className="text-gray-500 font-[family-name:var(--font-body)]">
              Your cart is empty
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="inline-block rounded-lg bg-[#0b3d7a] px-7 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-all duration-250 font-[family-name:var(--font-body)]"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 px-6">
            {items.map((item) => {
              const key = `${item.productId}-${item.purchaseType}`;
              return (
                <li key={key} className="flex gap-4 py-5">
                  {/* Image */}
                  <div className="relative w-18 h-18 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <p className="text-sm font-semibold text-gray-900 truncate font-[family-name:var(--font-body)]">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{item.size}</span>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                          item.purchaseType === "subscription"
                            ? "bg-[#1a6de3]/10 text-[#1a6de3]"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.purchaseType === "subscription"
                          ? "Subscribe"
                          : "One-time"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      {/* Quantity controls */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.purchaseType,
                              item.quantity - 1
                            )
                          }
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-7 text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.purchaseType,
                              item.quantity + 1
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price + remove */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.purchaseType)
                          }
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 font-[family-name:var(--font-body)]">
                Subtotal
              </span>
              <span className="text-lg font-semibold text-gray-900">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center rounded-lg bg-[#0b3d7a] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#09326a] transition-all duration-250 font-[family-name:var(--font-body)]"
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

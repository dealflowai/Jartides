"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Minus, Plus, Trash2, ShoppingBag, Heart, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

type Tab = "cart" | "wishlist";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    addItem,
    subtotal,
    itemCount,
  } = useCart();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const [tab, setTab] = useState<Tab>("cart");
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Fetch wishlist products when tab switches to wishlist
  useEffect(() => {
    if (tab !== "wishlist" || wishlistIds.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWishlist(true);
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, category:categories(*)")
      .in("id", wishlistIds)
      .eq("active", true)
      .then(({ data }) => {
        const map = new Map((data ?? []).map((p) => [p.id, p as Product]));
        setWishlistProducts(
          wishlistIds.map((id) => map.get(id)).filter((p): p is Product => !!p)
        );
        setLoadingWishlist(false);
      });
  }, [tab, wishlistIds]);

  // Reset to cart tab when sidebar opens
  useEffect(() => {
    if (isOpen) setTab("cart");
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div data-cart-sidebar className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={closeCart}
      />

      <aside className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white flex flex-col shadow-2xl z-10">
        {/* Header with tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-6 pt-4 pb-0">
            <div className="flex gap-0">
              <button
                onClick={() => setTab("cart")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === "cart"
                    ? "border-[#0b3d7a] text-[#0b3d7a]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </button>
              <button
                onClick={() => setTab("wishlist")}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === "wishlist"
                    ? "border-red-500 text-red-500"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                <Heart className="h-4 w-4" />
                Wishlist {wishlistIds.length > 0 && `(${wishlistIds.length})`}
              </button>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Tab */}
        {tab === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <ShoppingBag className="w-14 h-14 text-gray-300" />
                <p className="text-gray-500 font-[family-name:var(--font-body)]">
                  Your cart is empty
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block rounded-lg bg-[#0b3d7a] px-7 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-all font-[family-name:var(--font-body)]"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 px-6">
                {items.map((item) => {
                  const key = `${item.productId}-${item.variantId ?? "base"}-${item.purchaseType}`;
                  return (
                    <li key={key} className="flex gap-4 py-5">
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

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <p className="text-sm font-semibold text-gray-900 truncate font-[family-name:var(--font-body)]">
                          {item.name}
                        </p>
                        <span className="text-xs text-gray-500">{item.size}</span>

                        <div className="flex items-center justify-between mt-auto pt-1">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
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
                                  item.variantId,
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

                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.productId, item.variantId, item.purchaseType)
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
                  className="block w-full text-center rounded-lg bg-[#0b3d7a] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#09326a] transition-all font-[family-name:var(--font-body)]"
                >
                  Proceed to Checkout
                </Link>
                <p className="text-[10px] text-center text-gray-400 leading-tight">
                  All products are for laboratory and research purposes only. Not for human consumption.
                </p>
              </div>
            )}
          </>
        )}

        {/* Wishlist Tab */}
        {tab === "wishlist" && (
          <>
            {wishlistIds.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
                <Heart className="w-14 h-14 text-gray-300" />
                <p className="text-gray-500 font-[family-name:var(--font-body)]">
                  Your wishlist is empty
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="inline-block rounded-lg bg-[#0b3d7a] px-7 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-all font-[family-name:var(--font-body)]"
                >
                  Browse Products
                </Link>
              </div>
            ) : loadingWishlist ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Loading...
              </div>
            ) : (
              <ul className="flex-1 overflow-y-auto divide-y divide-gray-100 px-6">
                {wishlistProducts.map((product) => {
                  const image = product.images?.[0] ?? null;
                  return (
                    <li key={product.id} className="flex gap-4 py-4">
                      <Link
                        href={`/shop/${product.slug}`}
                        onClick={closeCart}
                        className="relative w-16 h-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden"
                      >
                        {image ? (
                          <Image
                            src={image}
                            alt={product.name}
                            fill
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${product.slug}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-gray-900 truncate block hover:text-[#1a6de3] transition-colors"
                        >
                          {product.name}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {product.size} &middot; {formatPrice(product.price)}
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => {
                              addItem({
                                productId: product.id,
                                variantId: null,
                                name: product.name,
                                slug: product.slug,
                                price: product.price,
                                size: product.size,
                                image,
                                purchaseType: "one-time",
                              });
                              setTab("cart");
                            }}
                            className="text-xs font-semibold text-[#1a6de3] hover:underline"
                          >
                            Add to Cart
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="text-xs font-semibold text-red-500 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </aside>
    </div>
  );
}

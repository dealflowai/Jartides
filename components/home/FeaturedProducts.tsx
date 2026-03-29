"use client";

import type { Product } from "@/lib/types";
import ProductCard from "@/components/shop/ProductCard";
import Button from "@/components/ui/Button";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl md:text-4xl text-gray-900">
            FEATURED PRODUCTS
          </h2>
          <p className="mt-2 text-gray-500">Handpicked for researchers</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button variant="ghost" size="md" href="/shop">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
}

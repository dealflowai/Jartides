import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllPageSections } from "@/lib/sections/server";
import type { PickerProduct } from "@/lib/sections/schema";
import SectionsManager from "@/components/admin/SectionsManager";

export const metadata: Metadata = {
  title: "Page Sections",
};

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  images: string[] | null;
  price: number | null;
  featured: boolean | null;
  active: boolean | null;
}

/** Products for the Featured Products picker — trimmed to what it renders. */
async function getPickerProducts(): Promise<PickerProduct[]> {
  try {
    const db = createAdminClient();
    const { data } = await db
      .from("products")
      .select("id, name, slug, images, price, featured, active")
      .order("name");

    return ((data ?? []) as ProductRow[]).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images?.[0] ?? null,
      price: p.price ?? 0,
      featured: p.featured === true,
      active: p.active !== false,
    }));
  } catch {
    return [];
  }
}

export default async function AdminSectionsPage() {
  await requireAdminPage();

  const [initialLayouts, products] = await Promise.all([
    getAllPageSections(),
    getPickerProducts(),
  ]);

  return <SectionsManager initialLayouts={initialLayouts} products={products} />;
}

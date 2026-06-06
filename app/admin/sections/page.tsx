import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { getAllPageSections } from "@/lib/sections/server";
import SectionsManager from "@/components/admin/SectionsManager";

export const metadata: Metadata = {
  title: "Page Sections",
};

export default async function AdminSectionsPage() {
  await requireAdminPage();
  const initialLayouts = await getAllPageSections();
  return <SectionsManager initialLayouts={initialLayouts} />;
}

"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Ticker from "./Ticker";
import CartSidebar from "@/components/cart/CartSidebar";
import { EditProvider } from "@/components/admin/EditContext";
import InlineEditBar from "@/components/admin/InlineEditBar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <EditProvider>
      <Header />
      <Ticker />
      <main>{children}</main>
      <Footer />
      <CartSidebar />
      <InlineEditBar />
    </EditProvider>
  );
}

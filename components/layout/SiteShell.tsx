"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Ticker from "./Ticker";
import LoadingBar from "./LoadingBar";
import CartSidebar from "@/components/cart/CartSidebar";
import { EditProvider } from "@/components/admin/EditContext";
import InlineEditBar from "@/components/admin/InlineEditBar";
import BackToTop from "./BackToTop";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <EditProvider>
      <LoadingBar />
      <Header />
      <Ticker />
      <main>{children}</main>
      <Footer />
      <CartSidebar />
      <BackToTop />
      <InlineEditBar />
    </EditProvider>
  );
}

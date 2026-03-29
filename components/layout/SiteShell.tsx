"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import Ticker from "./Ticker";
import CartSidebar from "@/components/cart/CartSidebar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <Ticker />
      <main>{children}</main>
      <Footer />
      <CartSidebar />
    </>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Your saved Jartides products.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}

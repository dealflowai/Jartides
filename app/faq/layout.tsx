import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Jartides",
  description:
    "Everything you need to know about our research peptides.",
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

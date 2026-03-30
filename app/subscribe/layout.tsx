import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscribe | Jartides",
  description:
    "Get your research peptides delivered monthly at a discounted rate. Cancel anytime.",
};

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

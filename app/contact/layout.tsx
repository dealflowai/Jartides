import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jartides",
  description: "We're here to help with any questions about our research peptides.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

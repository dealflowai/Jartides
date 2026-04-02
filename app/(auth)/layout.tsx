import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Account",
  description: "Log in or create your Jartides account.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f7f9fc] px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#0b3d7a] hover:text-[#1a6de3] mb-6 transition-colors font-[family-name:var(--font-body)]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">{children}</div>
      </div>
    </div>
  );
}

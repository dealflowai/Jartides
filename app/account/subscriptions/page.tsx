import Link from "next/link";
import { Bell } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-[#0b3d7a] mb-6">
        Subscriptions
      </h1>

      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Bell className="w-10 h-10 text-[#1a6de3] mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Coming Soon
        </h2>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
          Our subscription service is being built. You&apos;ll be able to manage
          your monthly peptide deliveries here.
        </p>
        <Link
          href="/subscribe"
          className="text-[#1a6de3] text-sm font-medium hover:underline"
        >
          Learn more about subscriptions
        </Link>
      </div>
    </div>
  );
}

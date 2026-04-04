"use client";

import { useState } from "react";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

interface Props {
  children: React.ReactNode;
}

export default function DashboardTabs({ children }: Props) {
  const [tab, setTab] = useState<"overview" | "analytics">("overview");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        <button
          onClick={() => setTab("overview")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "overview"
              ? "border-[#0b3d7a] text-[#0b3d7a]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Overview
        </button>
        <button
          onClick={() => setTab("analytics")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
            tab === "analytics"
              ? "border-[#0b3d7a] text-[#0b3d7a]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          Analytics
        </button>
      </div>

      {/* Tab content */}
      {tab === "overview" ? children : <AnalyticsCharts />}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Inbox, Send, Clock } from "lucide-react";
import InboxView from "@/components/admin/InboxView";
import ComposeView from "@/components/admin/ComposeView";
import SentView from "@/components/admin/SentView";

type Tab = "inbox" | "compose" | "sent";

export default function AdminEmailPage() {
  const [tab, setTab] = useState<Tab>("inbox");
  const [composeDefaults, setComposeDefaults] = useState<{ to?: string; subject?: string } | null>(null);

  function handleComposeTo(to: string, subject: string) {
    setComposeDefaults({ to, subject: `Re: ${subject}` });
    setTab("compose");
  }

  const tabs: { id: Tab; label: string; icon: typeof Inbox }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "compose", label: "Compose", icon: Send },
    { id: "sent", label: "Sent", icon: Clock },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage messages, compose emails, and view sent history.
        </p>
      </div>

      {/* Subtabs */}
      <div className="mb-6 flex gap-1 border-b border-gray-200">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id !== "compose") setComposeDefaults(null); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[#0b3d7a] text-[#0b3d7a]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "inbox" && <InboxView onComposeTo={handleComposeTo} />}
      {tab === "compose" && <ComposeView defaults={composeDefaults} onClearDefaults={() => setComposeDefaults(null)} />}
      {tab === "sent" && <SentView onComposeTo={handleComposeTo} />}
    </div>
  );
}

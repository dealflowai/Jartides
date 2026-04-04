"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Inbox,
  Mail,
  Send,
  Loader2,
  Check,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Circle,
} from "lucide-react";

interface Message {
  id: string;
  thread_id: string;
  direction: "inbound" | "outbound";
  sender_name: string;
  sender_email: string;
  subject: string;
  category: string | null;
  body: string;
  is_read: boolean;
  created_at: string;
}

interface Thread {
  threadId: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  category: string | null;
  lastMessage: string;
  lastDate: string;
  unread: boolean;
  messages: Message[];
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400";

interface InboxViewProps {
  onComposeTo?: (to: string, subject: string) => void;
}

export default function InboxView({ onComposeTo }: InboxViewProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inbox");
      const data: Message[] = await res.json();

      // Group by thread
      const threadMap = new Map<string, Message[]>();
      for (const msg of data) {
        const existing = threadMap.get(msg.thread_id) ?? [];
        existing.push(msg);
        threadMap.set(msg.thread_id, existing);
      }

      const grouped: Thread[] = Array.from(threadMap.entries()).map(
        ([threadId, messages]) => {
          messages.sort(
            (a, b) =>
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime()
          );
          const first = messages[0];
          const last = messages[messages.length - 1];
          return {
            threadId,
            subject: first.subject,
            senderName: first.sender_name,
            senderEmail: first.sender_email,
            category: first.category,
            lastMessage: last.body,
            lastDate: last.created_at,
            unread: messages.some(
              (m) => m.direction === "inbound" && !m.is_read
            ),
            messages,
          };
        }
      );

      grouped.sort(
        (a, b) =>
          new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
      );
      setThreads(grouped);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  async function openThread(thread: Thread) {
    setSelectedThread(thread);
    setReplyBody("");
    setSent(false);

    if (thread.unread) {
      await fetch("/api/admin/inbox", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: thread.threadId }),
      });
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === thread.threadId ? { ...t, unread: false } : t
        )
      );
    }
  }

  async function handleReply() {
    if (!selectedThread || !replyBody.trim()) return;
    setSending(true);

    try {
      const res = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThread.threadId,
          to: selectedThread.senderEmail,
          subject: selectedThread.subject,
          body: replyBody,
          senderName: selectedThread.senderName,
        }),
      });

      if (!res.ok) throw new Error();
      setSent(true);
      setReplyBody("");
      fetchMessages();
      // Update the selected thread with the new reply
      setTimeout(() => {
        setSent(false);
      }, 3000);
    } catch {
      alert("Failed to send reply. Please try again.");
    } finally {
      setSending(false);
    }
  }

  async function deleteThread(threadId: string) {
    if (!confirm("Delete this entire conversation?")) return;

    await fetch("/api/admin/inbox", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId }),
    });

    setThreads((prev) => prev.filter((t) => t.threadId !== threadId));
    if (selectedThread?.threadId === threadId) {
      setSelectedThread(null);
    }
  }

  const unreadCount = threads.filter((t) => t.unread).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0b3d7a]" />
        <span className="ml-2 text-gray-500">Loading inbox...</span>
      </div>
    );
  }

  return (
    <div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
        {/* Thread list */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-1 overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto divide-y">
            {threads.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <Inbox className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No messages yet</p>
              </div>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => openThread(thread)}
                  className={`w-full text-left px-4 py-3 transition-colors ${
                    selectedThread?.threadId === thread.threadId
                      ? "bg-[#f0f4ff]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {thread.unread && (
                      <Circle className="h-2 w-2 fill-blue-500 text-blue-500 mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-sm truncate ${
                            thread.unread
                              ? "font-bold text-gray-900"
                              : "font-medium text-gray-700"
                          }`}
                        >
                          {thread.senderName}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {new Date(thread.lastDate).toLocaleDateString(
                            "en-CA",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {thread.subject}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {thread.lastMessage.slice(0, 80)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread detail */}
        <div className="rounded-xl border border-gray-200 bg-white lg:col-span-2 flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">
                  Select a message to view
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="border-b px-5 py-4 flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setSelectedThread(null)}
                    className="lg:hidden inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <h2 className="font-semibold text-gray-900">
                    {selectedThread.subject}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedThread.senderName} &lt;{selectedThread.senderEmail}&gt;
                    {selectedThread.category && (
                      <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                        {selectedThread.category}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => deleteThread(selectedThread.threadId)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 max-h-[350px]">
                {selectedThread.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-4 ${
                      msg.direction === "inbound"
                        ? "bg-gray-50 border border-gray-100"
                        : "bg-blue-50 border border-blue-100 ml-8"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-medium text-gray-700">
                        {msg.direction === "inbound"
                          ? msg.sender_name
                          : "You (Jartides)"}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(msg.created_at).toLocaleString("en-CA", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply */}
              <div className="border-t px-5 py-4">
                {sent && (
                  <div className="mb-3 rounded-lg bg-green-50 border border-green-200 p-2 text-sm text-green-700 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Reply sent to {selectedThread.senderEmail}
                  </div>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={2}
                    className={`${inputCls} resize-none flex-1`}
                    placeholder={`Reply to ${selectedThread.senderName}...`}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !replyBody.trim()}
                    className="self-end inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-4 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50"
                  >
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

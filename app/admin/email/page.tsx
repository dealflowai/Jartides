"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Check, Mail, Clock } from "lucide-react";

interface SentEmail {
  to: string;
  subject: string;
  sentAt: string;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400";

export default function AdminEmailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);

  // Load sent history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jartides_sent_emails");
      if (saved) setSentHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function saveSentEmail(email: SentEmail) {
    const updated = [email, ...sentHistory].slice(0, 20);
    setSentHistory(updated);
    localStorage.setItem("jartides_sent_emails", JSON.stringify(updated));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) return;

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }

      saveSentEmail({ to, subject, sentAt: new Date().toISOString() });
      setStatus("sent");
      setTo("");
      setSubject("");
      setBody("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send email");
      setStatus("error");
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send branded emails from <strong>noreply@jartides.ca</strong> — replies go to your Gmail.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <form onSubmit={handleSend} className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">To</label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={inputCls}
                placeholder="customer@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className={inputCls}
                placeholder="e.g. Your order update from Jartides"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className={`${inputCls} resize-y`}
                placeholder="Write your message here. Line breaks are preserved in the email."
                required
              />
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            {status === "sent" && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700 flex items-center gap-2">
                <Check className="h-4 w-4" />
                Email sent successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !to || !subject || !body}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "sending" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {status === "sending" ? "Sending..." : "Send Email"}
            </button>
          </div>
        </form>

        {/* Sent History */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Recently Sent
            </h2>
          </div>
          <div className="divide-y max-h-[500px] overflow-y-auto">
            {sentHistory.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Mail className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No emails sent yet</p>
              </div>
            ) : (
              sentHistory.map((email, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setTo(email.to);
                    setSubject(`Re: ${email.subject}`);
                  }}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">{email.to}</p>
                  <p className="text-xs text-gray-500 truncate">{email.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(email.sentAt).toLocaleString("en-CA", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

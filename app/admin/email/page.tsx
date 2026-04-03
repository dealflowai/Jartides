"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Check, Mail, Clock, Eye, X, ArrowLeft } from "lucide-react";

interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400";

export default function AdminEmailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [step, setStep] = useState<"compose" | "preview">("compose");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
  const [viewingEmail, setViewingEmail] = useState<SentEmail | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jartides_sent_emails");
      if (saved) setSentHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  function saveSentEmail(email: SentEmail) {
    const updated = [email, ...sentHistory].slice(0, 50);
    setSentHistory(updated);
    localStorage.setItem("jartides_sent_emails", JSON.stringify(updated));
  }

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!to || !subject || !body) return;
    setStep("preview");
  }

  async function handleSend() {
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

      saveSentEmail({ to, subject, body, sentAt: new Date().toISOString() });
      setStatus("sent");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send email");
      setStatus("error");
    }
  }

  function resetForm() {
    setTo("");
    setSubject("");
    setBody("");
    setStep("compose");
    setStatus("idle");
    setErrorMsg("");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
        <p className="text-sm text-gray-500 mt-1">
          Send branded emails from <strong>noreply@jartides.ca</strong> - customers can reply to <strong>jartidesofficial@gmail.com</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Compose or Preview */}
        <div className="lg:col-span-2">
          {step === "compose" && (
            <form onSubmit={handlePreview} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={!to || !subject || !body}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye className="h-4 w-4" />
                  Preview Email
                </button>
              </div>
            </form>
          )}

          {step === "preview" && status !== "sent" && (
            <div className="space-y-4">
              {/* Preview header */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-[#0b3d7a]" />
                  Email Preview
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500 w-16">From:</span>
                    <span className="text-gray-900">Jartides &lt;noreply@jartides.ca&gt;</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500 w-16">To:</span>
                    <span className="text-gray-900">{to}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-medium text-gray-500 w-16">Subject:</span>
                    <span className="text-gray-900 font-medium">{subject}</span>
                  </div>
                </div>
              </div>

              {/* Email body preview */}
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-[#f5f5f5]">
                <div style={{ maxWidth: 600, margin: "0 auto" }} className="bg-white rounded-lg overflow-hidden my-6 mx-auto shadow-sm">
                  {/* Header */}
                  <div className="bg-[#0b3d7a] px-6 py-5 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/images/logo.png" alt="Jartides" width={60} height={60} className="inline-block align-middle mr-2" />
                    <div className="inline-block align-middle text-left">
                      <p className="text-white text-lg font-extrabold tracking-wide m-0">JARTIDES</p>
                      <p className="text-blue-200 text-[10px] font-bold tracking-[2px] uppercase m-0">Research Peptides</p>
                    </div>
                  </div>
                  {/* Body */}
                  <div className="px-6 py-8">
                    <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap">{body}</p>
                  </div>
                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t text-center">
                    <p className="text-xs text-gray-400">
                      Questions? Email us at jartidesofficial@gmail.com
                    </p>
                    <p className="text-xs text-gray-300 mt-1">&copy; Jartides. All rights reserved.</p>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50"
                >
                  {status === "sending" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {status === "sending" ? "Sending..." : "Confirm & Send"}
                </button>
                <button
                  onClick={() => setStep("compose")}
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          )}

          {step === "preview" && status === "sent" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-green-800 mb-1">Email Sent!</h2>
              <p className="text-sm text-green-700 mb-1">
                Successfully sent to <strong>{to}</strong>
              </p>
              <p className="text-xs text-green-600 mb-4">
                Subject: {subject}
              </p>
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors"
              >
                <Mail className="h-4 w-4" />
                Send Another Email
              </button>
            </div>
          )}
        </div>

        {/* Right: Sent History */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              Sent Emails ({sentHistory.length})
            </h2>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
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
                  onClick={() => setViewingEmail(email)}
                  className="w-full text-left px-5 py-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{email.to}</p>
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                  </div>
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

      {/* View Sent Email Modal */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Sent Email</h3>
              <button onClick={() => setViewingEmail(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="text-sm space-y-1.5">
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-16">To:</span>
                  <span className="text-gray-900">{viewingEmail.to}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-16">Subject:</span>
                  <span className="text-gray-900 font-medium">{viewingEmail.subject}</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-16">Sent:</span>
                  <span className="text-gray-700">
                    {new Date(viewingEmail.sentAt).toLocaleString("en-CA", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewingEmail.body}</p>
              </div>
            </div>
            <div className="border-t px-5 py-3 flex gap-2">
              <button
                onClick={() => {
                  setTo(viewingEmail.to);
                  setSubject(`Re: ${viewingEmail.subject}`);
                  setBody("");
                  setStep("compose");
                  setStatus("idle");
                  setViewingEmail(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#09326a] transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Reply
              </button>
              <button
                onClick={() => setViewingEmail(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

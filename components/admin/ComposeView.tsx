"use client";

import { useState, useEffect } from "react";
import { Send, Loader2, Check, Mail, Eye, ArrowLeft } from "lucide-react";

interface Props {
  defaults?: { to?: string; subject?: string } | null;
  onClearDefaults?: () => void;
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-4 py-3 text-sm transition-all focus:border-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3]/20 placeholder:text-gray-400";

export default function ComposeView({ defaults, onClearDefaults }: Props) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [step, setStep] = useState<"compose" | "preview">("compose");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (defaults) {
      if (defaults.to) setTo(defaults.to);
      if (defaults.subject) setSubject(defaults.subject);
      setStep("compose");
      setStatus("idle");
      onClearDefaults?.();
    }
  }, [defaults, onClearDefaults]);

  function saveSentEmail(email: { to: string; subject: string; body: string; sentAt: string }) {
    try {
      const saved = JSON.parse(localStorage.getItem("jartides_sent_emails") || "[]");
      localStorage.setItem("jartides_sent_emails", JSON.stringify([email, ...saved].slice(0, 50)));
    } catch { /* ignore */ }
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
      {step === "compose" && (
        <form onSubmit={handlePreview} className="space-y-4 max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">To</label>
              <input type="email" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} placeholder="customer@example.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Subject</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className={inputCls} placeholder="e.g. Your order update from Jartides" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Message</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className={`${inputCls} resize-y`} placeholder="Write your message here. Line breaks are preserved in the email." required />
            </div>
            <button type="submit" disabled={!to || !subject || !body} className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <Eye className="h-4 w-4" />
              Preview Email
            </button>
          </div>
        </form>
      )}

      {step === "preview" && status !== "sent" && (
        <div className="space-y-4 max-w-2xl">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4 text-[#0b3d7a]" />
              Email Preview
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2"><span className="font-medium text-gray-500 w-16">From:</span><span className="text-gray-900">Jartides &lt;noreply@jartides.ca&gt;</span></div>
              <div className="flex gap-2"><span className="font-medium text-gray-500 w-16">To:</span><span className="text-gray-900">{to}</span></div>
              <div className="flex gap-2"><span className="font-medium text-gray-500 w-16">Subject:</span><span className="text-gray-900 font-medium">{subject}</span></div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-[#f5f5f5]">
            <div style={{ maxWidth: 600, margin: "0 auto" }} className="bg-white rounded-lg overflow-hidden my-6 mx-auto shadow-sm">
              <div className="bg-[#0b3d7a] px-6 py-3.5 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.png" alt="" width={36} height={36} className="rounded-full" />
                <div>
                  <p className="text-white text-lg font-extrabold tracking-[1.5px] m-0">JARTIDES</p>
                  <p className="text-[#7fb3f0] text-[8px] font-bold tracking-[2.5px] uppercase m-0">Research Peptides</p>
                </div>
              </div>
              <div className="px-6 py-8">
                <p className="text-[15px] leading-relaxed text-gray-700 whitespace-pre-wrap">{body}</p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t text-center">
                <p className="text-xs text-gray-400">Questions? Email us at jartidesofficial@gmail.com</p>
              </div>
            </div>
          </div>
          {errorMsg && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{errorMsg}</div>}
          <div className="flex items-center gap-3">
            <button onClick={handleSend} disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors disabled:opacity-50">
              {status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {status === "sending" ? "Sending..." : "Confirm & Send"}
            </button>
            <button onClick={() => setStep("compose")} disabled={status === "sending"} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>
      )}

      {step === "preview" && status === "sent" && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center max-w-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-green-800 mb-1">Email Sent!</h2>
          <p className="text-sm text-green-700 mb-1">Successfully sent to <strong>{to}</strong></p>
          <p className="text-xs text-green-600 mb-4">Subject: {subject}</p>
          <button onClick={resetForm} className="inline-flex items-center gap-2 rounded-lg bg-[#0b3d7a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#09326a] transition-colors">
            <Mail className="h-4 w-4" />
            Send Another Email
          </button>
        </div>
      )}
    </div>
  );
}

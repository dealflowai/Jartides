"use client";

import { useState, useEffect } from "react";
import { Mail, Check, X, Clock } from "lucide-react";

interface SentEmail {
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

interface Props {
  onComposeTo?: (to: string, subject: string) => void;
}

export default function SentView({ onComposeTo }: Props) {
  const [sentHistory, setSentHistory] = useState<SentEmail[]>([]);
  const [viewingEmail, setViewingEmail] = useState<SentEmail | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("jartides_sent_emails");
      if (saved) setSentHistory(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  return (
    <div>
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Sent Emails ({sentHistory.length})
          </h2>
        </div>
        <div className="divide-y max-h-[600px] overflow-y-auto">
          {sentHistory.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Mail className="h-10 w-10 text-gray-200 mx-auto mb-3" />
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
                  <div className="flex items-center gap-2 shrink-0">
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-400">
                      {new Date(email.sentAt).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 truncate">{email.subject}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{email.body.slice(0, 80)}</p>
              </button>
            ))
          )}
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
                <div className="flex gap-2"><span className="font-medium text-gray-500 w-16">To:</span><span className="text-gray-900">{viewingEmail.to}</span></div>
                <div className="flex gap-2"><span className="font-medium text-gray-500 w-16">Subject:</span><span className="text-gray-900 font-medium">{viewingEmail.subject}</span></div>
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500 w-16">Sent:</span>
                  <span className="text-gray-700">
                    {new Date(viewingEmail.sentAt).toLocaleString("en-CA", {
                      month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
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
                  onComposeTo?.(viewingEmail.to, viewingEmail.subject);
                  setViewingEmail(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#09326a] transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Reply
              </button>
              <button onClick={() => setViewingEmail(null)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

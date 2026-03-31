"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, MessageSquare } from "lucide-react";

interface Note {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
}

export default function OrderNotes({ orderId }: { orderId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/orders/notes?order_id=${orderId}`)
      .then((r) => r.json())
      .then((data) => setNotes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [orderId]);

  async function handleAdd() {
    if (!body.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, body: body.trim() }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotes((prev) => [note, ...prev]);
        setBody("");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        <MessageSquare className="h-4 w-4 text-gray-400" />
        <h2 className="font-semibold text-gray-900 text-sm">Internal Notes</h2>
        <span className="text-xs text-gray-400">({notes.length})</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Add note */}
        <div className="flex gap-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add an internal note..."
            rows={2}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3] resize-none"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !body.trim()}
            className="self-end rounded-lg bg-[#0b3d7a] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>

        {/* Notes list */}
        {loading ? (
          <p className="text-xs text-gray-400">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-gray-400">No notes yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg bg-yellow-50 border border-yellow-100 px-3 py-2">
                <p className="text-sm text-gray-700">{note.body}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {note.author_name} &middot; {new Date(note.created_at).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

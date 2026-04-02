"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteCoaButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this COA? This cannot be undone.")) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/coa?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete COA");
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-500 hover:text-red-700 disabled:opacity-50"
      title="Delete COA"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

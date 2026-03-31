"use client";

import { useState, useEffect } from "react";
import { Star, Check, X, Trash2, Loader2 } from "lucide-react";

interface Review {
  id: string;
  author_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  verified_purchase: boolean;
  approved: boolean;
  created_at: string;
  product: { name: string } | null;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string, approved: boolean) {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, approved }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, approved } : r))
        );
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      }
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = reviews.filter((r) => {
    if (filter === "pending") return !r.approved;
    if (filter === "approved") return r.approved;
    return true;
  });

  const pendingCount = reviews.filter((r) => !r.approved).length;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 py-12">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading reviews...
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          {pendingCount > 0 && (
            <p className="mt-1 text-sm text-amber-600">{pendingCount} pending approval</p>
          )}
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-[#0b3d7a] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f === "all" ? `All (${reviews.length})` : f === "pending" ? `Pending (${pendingCount})` : `Approved (${reviews.length - pendingCount})`}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 py-8 text-center">No reviews found.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border bg-white p-5 ${
                review.approved ? "border-gray-200" : "border-amber-200 bg-amber-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{review.author_name}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
                        />
                      ))}
                    </div>
                    {review.verified_purchase && (
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      review.approved ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {review.approved ? "Approved" : "Pending"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">
                    {review.product?.name ?? "Unknown product"} &middot;{" "}
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                  {review.title && <p className="text-sm font-medium text-gray-800">{review.title}</p>}
                  {review.body && <p className="text-sm text-gray-600 mt-1">{review.body}</p>}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {actionLoading === review.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      {!review.approved && (
                        <button
                          onClick={() => handleApprove(review.id, true)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      {review.approved && (
                        <button
                          onClick={() => handleApprove(review.id, false)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors"
                          title="Unapprove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

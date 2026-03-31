"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle, User } from "lucide-react";
import type { ProductReview } from "@/lib/types";

function StarRating({ rating, size = 16, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={
              star <= (hover || rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }
          />
        </button>
      ))}
    </div>
  );
}

function RatingSummary({ avgRating, reviewCount }: { avgRating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-4xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
      <div>
        <StarRating rating={Math.round(avgRating)} size={18} />
        <p className="mt-0.5 text-sm text-gray-500">{reviewCount} review{reviewCount !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

export default function ProductReviews({
  productId,
  avgRating,
  reviewCount,
}: {
  productId: string;
  avgRating: number;
  reviewCount: number;
}) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, title: "", body: "", author_name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    fetch(`/api/reviews?product_id=${productId}`)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, product_id: productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = typeof data.error === "string" ? data.error : "Failed to submit review";
        setSubmitMessage(msg);
        return;
      }

      setSubmitMessage("Review submitted! It will appear after admin approval.");
      setShowForm(false);
      setFormData({ rating: 5, title: "", body: "", author_name: "" });
    } catch {
      setSubmitMessage("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 border-t border-gray-200 pt-10">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
            Customer Reviews
          </h2>
          {reviewCount > 0 && (
            <div className="mt-2">
              <RatingSummary avgRating={avgRating} reviewCount={reviewCount} />
            </div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors"
        >
          Write a Review
        </button>
      </div>

      {submitMessage && (
        <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${submitMessage.includes("submitted") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {submitMessage}
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              value={formData.author_name}
              onChange={(e) => setFormData((f) => ({ ...f, author_name: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
              placeholder="John D."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <StarRating rating={formData.rating} size={24} interactive onChange={(r) => setFormData((f) => ({ ...f, rating: r }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
              placeholder="Great product!"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review (optional)</label>
            <textarea
              value={formData.body}
              onChange={(e) => setFormData((f) => ({ ...f, body: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
              placeholder="Share your experience..."
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[#0b3d7a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                    <User className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{review.author_name}</span>
                      {review.verified_purchase && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <StarRating rating={review.rating} size={14} />
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {review.title && (
                <h4 className="mt-3 text-sm font-semibold text-gray-900">{review.title}</h4>
              )}
              {review.body && (
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{review.body}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

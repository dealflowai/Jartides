"use client";

import { useState } from "react";
import { Send } from "lucide-react";

const categories = [
  "Order Inquiry",
  "Product Question",
  "Returns & Refunds",
  "Wholesale / Bulk Orders",
  "COA Request",
  "Other",
];

export default function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    category: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        category: "",
        message: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <h3 className="text-lg font-bold text-green-800 font-[family-name:var(--font-heading)]">
          Message Sent!
        </h3>
        <p className="mt-2 text-sm text-green-700 font-[family-name:var(--font-body)]">
          Thank you for reaching out. We&apos;ll get back to you within 1-2
          business days.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm font-semibold text-[#1a6de3] underline hover:text-[#0b3d7a] font-[family-name:var(--font-body)]"
        >
          Send another message
        </button>
      </div>
    );
  }

  const inputClasses =
    "w-full rounded-lg border border-[#dde2ea] bg-white px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3]/30 font-[family-name:var(--font-body)]";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="firstName"
            className="mb-1.5 block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)]"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            value={form.firstName}
            onChange={handleChange}
            className={inputClasses}
            placeholder="John"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="mb-1.5 block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)]"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            value={form.lastName}
            onChange={handleChange}
            className={inputClasses}
            placeholder="Doe"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={form.email}
          onChange={handleChange}
          className={inputClasses}
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)]"
        >
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          value={form.category}
          onChange={handleChange}
          className={inputClasses}
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-semibold text-gray-700 font-[family-name:var(--font-body)]"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className={inputClasses + " resize-none"}
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3d7a] px-7 py-3 text-sm font-semibold text-white transition-all duration-250 hover:bg-[#09326a] disabled:cursor-not-allowed disabled:opacity-60 font-[family-name:var(--font-body)]"
      >
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/auth/callback?type=recovery`,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#1a6de3]/10">
          <svg className="h-8 w-8 text-[#1a6de3]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-[#0b3d7a] mb-3">
          Check Your Email
        </h1>
        <p className="text-gray-600 text-sm leading-relaxed mb-6">
          We&apos;ve sent a password reset link to{" "}
          <span className="font-semibold text-[#0b3d7a]">{email}</span>.
          <br />
          Click the link in the email to reset your password.
        </p>
        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-xs text-gray-500 leading-relaxed">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            onClick={() => setSent(false)}
            className="text-[#1a6de3] hover:underline font-medium"
          >
            try again
          </button>
          .
        </div>
        <Link
          href="/login"
          className="inline-block mt-5 text-sm text-[#1a6de3] hover:underline font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-[#0b3d7a] mb-2">
        Forgot Password
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1a6de3] focus:ring-1 focus:ring-[#1a6de3] outline-none transition-colors"
            placeholder="you@example.com"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full disabled:opacity-50">
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remember your password?{" "}
        <Link href="/login" className="text-[#1a6de3] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}

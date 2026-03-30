"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          An unexpected error occurred. Please try again or return to the
          homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="fill" size="lg" onClick={() => reset()}>
            Try Again
          </Button>
          <Button href="/" variant="ghost" size="lg">
            Back to Home
          </Button>
        </div>
      </div>
    </section>
  );
}

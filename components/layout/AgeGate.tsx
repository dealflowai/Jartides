"use client";

import { useState, useEffect } from "react";
import EditableText from "@/components/admin/EditableText";

const STORAGE_KEY = "jartides_age_verified";

export default function AgeGate() {
  const [status, setStatus] = useState<"loading" | "gate" | "denied" | "verified">("loading");

  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === "true") {
      setStatus("verified");
    } else {
      setStatus("gate");
    }
  }, []);

  function handleConfirm() {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setStatus("verified");
  }

  function handleDeny() {
    setStatus("denied");
  }

  // Don't render anything while checking or after verified
  if (status === "loading" || status === "verified") return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl sm:p-10">
        {status === "denied" ? (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-600"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="15" x2="9" y1="9" y2="15" />
                <line x1="9" x2="15" y1="9" y2="15" />
              </svg>
            </div>
            <h2 className="mb-3 text-xl font-bold text-gray-900">
              Access Denied
            </h2>
            <p className="text-sm leading-relaxed text-gray-600">
              You must be 21 years of age or older to access this website. Please
              return when you meet the age requirement.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-3xl font-bold tracking-wider text-[#0b3d7a]">
              <EditableText settingKey="agegate_heading">JARTIDES</EditableText>
            </h1>
            <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-[#1a6de3] uppercase">
              Research Peptides
            </p>

            <div className="mb-8">
              <p className="text-sm leading-relaxed text-gray-600">
                <EditableText settingKey="agegate_description">This website contains products intended for laboratory research
                use only. You must be 21 years of age or older to enter.</EditableText>
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-lg bg-[#0b3d7a] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a6de3] focus:outline-none focus:ring-2 focus:ring-[#1a6de3] focus:ring-offset-2"
              >
                I Am 21+
              </button>
              <button
                onClick={handleDeny}
                className="flex-1 rounded-lg bg-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                I Am Under 21
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

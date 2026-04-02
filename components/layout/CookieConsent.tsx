"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const CONSENT_KEY = "jartides_cookie_consent";
const CONSENT_VERSION = "1"; // bump when policy changes to re-prompt

export type CookiePreferences = {
  necessary: true; // always on
  analytics: boolean;
  marketing: boolean;
  version: string;
  timestamp: string;
};

const DEFAULT_PREFS: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  version: CONSENT_VERSION,
  timestamp: "",
};

/** Read stored consent. Returns null if no consent or version mismatch. */
export function getConsent(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookiePreferences;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Check if analytics is consented. Convenience for other components. */
export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics ?? false;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({ ...DEFAULT_PREFS });

  useEffect(() => {
    const consent = getConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
    // Consent exists — apply it
    applyConsent(consent);
  }, []);

  const saveAndApply = useCallback((preferences: CookiePreferences) => {
    const final: CookiePreferences = {
      ...preferences,
      necessary: true,
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(final));
    applyConsent(final);
    setVisible(false);
  }, []);

  function acceptAll() {
    saveAndApply({ ...prefs, analytics: true, marketing: true });
  }

  function acceptSelected() {
    saveAndApply(prefs);
  }

  function declineAll() {
    saveAndApply({ ...DEFAULT_PREFS });
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-fade-up">
      <div className="w-full border-t border-gray-200 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Collapsed: single row layout */}
          {!showDetails ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                We use cookies for essential site functionality and, with your consent, for analytics to improve your experience.{" "}
                <Link href="/policies/cookies" className="text-[#1a6de3] hover:underline">
                  Cookie Policy
                </Link>
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={acceptAll}
                  className="rounded-lg bg-[#0b3d7a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={declineAll}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-sm text-[#1a6de3] hover:underline px-2"
                >
                  Customize
                </button>
              </div>
            </div>
          ) : (
            /* Expanded: show category toggles */
            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                Manage your cookie preferences below.{" "}
                <Link href="/policies/privacy" className="text-[#1a6de3] hover:underline">
                  Privacy Policy
                </Link>
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <input type="checkbox" checked disabled className="mt-0.5 rounded border-gray-300 text-[#1a6de3]" />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Essential</span>
                    <p className="text-xs text-gray-400 mt-0.5">Required for the site to function.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.analytics}
                    onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                    className="mt-0.5 rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Analytics</span>
                    <p className="text-xs text-gray-400 mt-0.5">Understand how visitors use the site.</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={prefs.marketing}
                    onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                    className="mt-0.5 rounded border-gray-300 text-[#1a6de3] focus:ring-[#1a6de3]"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">Marketing</span>
                    <p className="text-xs text-gray-400 mt-0.5">Personalized ads and remarketing.</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={acceptSelected}
                  className="rounded-lg bg-[#0b3d7a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1a6de3] transition-colors"
                >
                  Save Preferences
                </button>
                <button
                  onClick={declineAll}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Reject All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Apply consent by enabling/disabling tracking scripts. */
function applyConsent(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;

  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;

  if (prefs.analytics && gaId) {
    win[`ga-disable-${gaId}`] = false;
    if (typeof win.gtag === "function") {
      win.gtag("consent", "update", { analytics_storage: "granted" });
    }
  } else if (gaId) {
    win[`ga-disable-${gaId}`] = true;
    if (typeof win.gtag === "function") {
      win.gtag("consent", "update", { analytics_storage: "denied" });
    }
    // Clear existing GA cookies
    document.cookie.split(";").forEach((c) => {
      const name = c.trim().split("=")[0];
      if (name.startsWith("_ga") || name.startsWith("_gid")) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      }
    });
  }

  if (typeof win.gtag === "function") {
    if (prefs.marketing) {
      win.gtag("consent", "update", {
        ad_storage: "granted",
        ad_user_data: "granted",
        ad_personalization: "granted",
      });
    } else {
      win.gtag("consent", "update", {
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
    }
  }
}

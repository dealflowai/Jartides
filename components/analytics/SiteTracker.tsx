"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Lightweight visitor tracking beacon.
 * Sends a heartbeat to /api/track every 30s while the page is visible.
 * Respects cookie consent — only tracks if analytics consent is given.
 */
export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has consented to analytics
    function hasAnalyticsConsent(): boolean {
      try {
        const raw = localStorage.getItem("jartides_cookie_consent");
        if (!raw) return false;
        const consent = JSON.parse(raw);
        return consent.analytics === true;
      } catch {
        return false;
      }
    }

    function sendBeacon() {
      if (!hasAnalyticsConsent()) return;
      if (document.hidden) return;

      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pathname,
          referrer: document.referrer || "",
        }),
        keepalive: true,
      }).catch(() => {
        // silently ignore errors
      });
    }

    // Send immediately on page load / route change
    sendBeacon();

    // Then heartbeat every 30s
    const interval = setInterval(sendBeacon, 30_000);

    return () => clearInterval(interval);
  }, [pathname]);

  return null;
}

"use client";

import { useReportWebVitals } from "next/web-vitals";

export default function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Google Analytics if available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      gtag("event", metric.name, {
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value
        ),
        event_label: metric.id,
        non_interaction: true,
      });
    }

    // Collect anonymous field data for the admin SEO dashboard. No PII -
    // just the metric name, value, and pathname. Uses sendBeacon so it
    // survives page unload.
    try {
      const CORE = ["LCP", "CLS", "INP", "FCP", "TTFB"];
      if (CORE.includes(metric.name) && typeof navigator !== "undefined" && navigator.sendBeacon) {
        const body = JSON.stringify({
          name: metric.name,
          value: metric.value,
          path: window.location.pathname,
        });
        navigator.sendBeacon("/api/track/vitals", new Blob([body], { type: "application/json" }));
      }
    } catch {
      // ignore - metrics are best-effort
    }

    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`);
    }
  });

  return null;
}

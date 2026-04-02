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

    // Log in development for debugging
    if (process.env.NODE_ENV === "development") {
      console.log(`[Web Vital] ${metric.name}: ${metric.value.toFixed(2)}`);
    }
  });

  return null;
}

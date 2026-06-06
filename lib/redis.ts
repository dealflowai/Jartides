import { Redis } from "@upstash/redis";

/**
 * Returns an Upstash Redis client, or null if not configured.
 * Mirrors the inline helpers in the analytics/track routes so all
 * Redis-backed features degrade gracefully when Upstash isn't set up.
 */
export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.startsWith("your_")) return null;
  return new Redis({ url, token });
}

const SEARCH_ENGINES = [
  "google.", "bing.", "yahoo.", "duckduckgo.", "ecosia.", "baidu.",
  "yandex.", "brave.", "startpage.", "search.",
];
const SOCIAL = [
  "instagram.", "tiktok.", "facebook.", "fb.com", "fb.me", "t.co",
  "twitter.", "x.com", "reddit.", "youtube.", "youtu.be", "pinterest.",
  "linkedin.", "snapchat.", "threads.", "discord.", "telegram.", "whatsapp.",
];

/**
 * Classify a visit into a traffic channel using its referrer.
 * `selfHost` is the site's own hostname so internal navigations are excluded.
 * Returns null for internal traffic (don't count it as a source).
 */
export function trafficChannel(referrer: string, selfHost: string): string | null {
  if (!referrer) return "Direct";
  let host = "";
  try {
    host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Other";
  }
  if (selfHost && host === selfHost.replace(/^www\./, "").toLowerCase()) return null; // internal
  if (SEARCH_ENGINES.some((s) => host.includes(s))) return "Organic Search";
  if (SOCIAL.some((s) => host.includes(s))) return "Social";
  return "Referral";
}

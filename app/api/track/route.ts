import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.startsWith("your_")) return null;
  return new Redis({ url, token });
}

/**
 * Lightweight visitor tracking beacon.
 * Stores active sessions in Redis with a 60s TTL.
 * Called by the SiteTracker component every 30s.
 */
export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await request.json();
    const page: string = body.page ?? "/";
    const referrer: string = body.referrer ?? "";

    // Use IP + User-Agent as a rough session identifier
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const ua = request.headers.get("user-agent") ?? "unknown";
    const sessionId = `${ip}:${ua.slice(0, 50)}`;

    // Get geo data from Vercel headers (available on Vercel deployments)
    const country = request.headers.get("x-vercel-ip-country") ?? "";
    const region = request.headers.get("x-vercel-ip-country-region") ?? "";
    const city = request.headers.get("x-vercel-ip-city") ?? "";

    const now = Date.now();
    const sessionData = JSON.stringify({
      page,
      referrer,
      country,
      region,
      city,
      ip: ip.slice(0, 6) + "***", // partially mask IP
      ua: parseDevice(ua),
      ts: now,
    });

    // Store session with 60s TTL — if no heartbeat within 60s, considered offline
    await redis.set(`visitor:${sessionId}`, sessionData, { ex: 60 });

    // Increment page view counter for today
    const today = new Date().toISOString().slice(0, 10);
    await redis.hincrby(`pageviews:${today}`, page, 1);
    // Set expiry on the daily pageview hash (keep 90 days)
    await redis.expire(`pageviews:${today}`, 60 * 60 * 24 * 90);

    // Increment total daily visitor count (using a set for unique visitors)
    await redis.sadd(`visitors:${today}`, sessionId);
    await redis.expire(`visitors:${today}`, 60 * 60 * 24 * 90);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

function parseDevice(ua: string): string {
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android")) return "Mobile";
  if (lower.includes("tablet") || lower.includes("ipad")) return "Tablet";
  return "Desktop";
}

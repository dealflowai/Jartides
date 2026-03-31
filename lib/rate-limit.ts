import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Cache limiter instances per unique config
const limiters = new Map<string, Ratelimit>();

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.startsWith("your_")) return null;
  return new Redis({ url, token });
}

function getLimiter(limit: number, windowSec: number): Ratelimit | null {
  const redis = getRedis();
  if (!redis) return null;

  const key = `${limit}:${windowSec}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      analytics: true,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

/**
 * Redis-backed rate limiter via Upstash.
 * Returns null if allowed, or a 429 response if rate-limited.
 * Gracefully skips rate limiting if Upstash is not configured.
 */
export async function rateLimit(
  request: NextRequest,
  { limit = 10, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {}
): Promise<NextResponse | null> {
  const windowSec = Math.ceil(windowMs / 1000);
  const limiter = getLimiter(limit, windowSec);

  // Skip rate limiting if Redis is not configured
  if (!limiter) return null;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const identifier = `${ip}:${request.nextUrl.pathname}`;

  const { success, reset } = await limiter.limit(identifier);

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(retryAfter, 1)),
        },
      }
    );
  }

  return null;
}

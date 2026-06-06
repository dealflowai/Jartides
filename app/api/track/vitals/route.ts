import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

// Google's Core Web Vitals thresholds. [goodMax, poorMin] - between is
// "needs improvement". CLS is unitless; the rest are milliseconds.
const THRESHOLDS: Record<string, [number, number]> = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};

function rate(name: string, value: number): "good" | "ni" | "poor" {
  const t = THRESHOLDS[name];
  if (!t) return "ni";
  if (value <= t[0]) return "good";
  if (value > t[1]) return "poor";
  return "ni";
}

/**
 * Anonymous Core Web Vitals collector. Stores per-day rolling aggregates in
 * Redis: count, sum (for averages), and good/needs-improvement/poor buckets
 * per metric. Read back by the SEO dashboard against Google's thresholds.
 */
export async function POST(request: NextRequest) {
  const redis = getRedis();
  if (!redis) return NextResponse.json({ ok: true });

  try {
    const body = await request.json();
    const name: string = body.name;
    const value = Number(body.value);
    if (!THRESHOLDS[name] || !Number.isFinite(value)) {
      return NextResponse.json({ ok: true });
    }

    const today = new Date().toISOString().slice(0, 10);
    const key = `webvitals:${today}`;
    const bucket = rate(name, value);

    await redis.hincrby(key, `${name}_count`, 1);
    await redis.hincrbyfloat(key, `${name}_sum`, value);
    await redis.hincrby(key, `${name}_${bucket}`, 1);
    await redis.expire(key, 60 * 60 * 24 * 90);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token || url.startsWith("your_")) return null;
  return new Redis({ url, token });
}

interface VisitorSession {
  page: string;
  referrer: string;
  country: string;
  region: string;
  city: string;
  ip: string;
  ua: string;
  ts: number;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({
      configured: false,
      liveVisitors: 0,
      activePages: [],
      regions: [],
      devices: [],
      todayPageViews: 0,
      todayUniqueVisitors: 0,
      pageViewsByDay: [],
      topPages: [],
      visitors: [],
    });
  }

  // Get all active visitor sessions
  const keys = await redis.keys("visitor:*");
  const sessions: VisitorSession[] = [];

  if (keys.length > 0) {
    const values = await redis.mget<(string | null)[]>(...keys);
    for (const val of values) {
      if (val) {
        try {
          const parsed = typeof val === "string" ? JSON.parse(val) : val;
          sessions.push(parsed as VisitorSession);
        } catch {
          // skip invalid
        }
      }
    }
  }

  // Active pages
  const pageCounts = new Map<string, number>();
  const countryCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();

  for (const s of sessions) {
    pageCounts.set(s.page, (pageCounts.get(s.page) ?? 0) + 1);
    if (s.country) countryCounts.set(s.country, (countryCounts.get(s.country) ?? 0) + 1);
    if (s.city) cityCounts.set(s.city, (cityCounts.get(s.city) ?? 0) + 1);
    deviceCounts.set(s.ua, (deviceCounts.get(s.ua) ?? 0) + 1);
  }

  const activePages = Array.from(pageCounts.entries())
    .map(([page, count]) => ({ page, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const regions = Array.from(countryCounts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const cities = Array.from(cityCounts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const devices = Array.from(deviceCounts.entries())
    .map(([device, count]) => ({ device, count }))
    .sort((a, b) => b.count - a.count);

  // Today's stats
  const today = new Date().toISOString().slice(0, 10);
  const todayViews = await redis.hgetall(`pageviews:${today}`);
  const todayPageViews = todayViews
    ? Object.values(todayViews).reduce((sum: number, v) => sum + Number(v), 0)
    : 0;
  const todayUniqueVisitors = await redis.scard(`visitors:${today}`);

  // Top pages today
  const topPages = todayViews
    ? Object.entries(todayViews)
        .map(([page, views]) => ({ page, views: Number(views) }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20)
    : [];

  // Page views for the last 14 days
  const pageViewsByDay: { date: string; views: number; unique: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayViews = await redis.hgetall(`pageviews:${dateStr}`);
    const totalViews: number = dayViews
      ? Object.values(dayViews).reduce((sum: number, v) => sum + Number(v), 0)
      : 0;
    const uniqueCount = await redis.scard(`visitors:${dateStr}`);
    pageViewsByDay.push({ date: dateStr, views: totalViews, unique: Number(uniqueCount ?? 0) });
  }

  // List of individual visitors (for the live table)
  const visitors = sessions
    .sort((a, b) => b.ts - a.ts)
    .slice(0, 50)
    .map((s) => ({
      page: s.page,
      country: s.country,
      city: s.city,
      device: s.ua,
      lastSeen: s.ts,
    }));

  return NextResponse.json({
    configured: true,
    liveVisitors: sessions.length,
    activePages,
    regions,
    cities,
    devices,
    todayPageViews,
    todayUniqueVisitors,
    pageViewsByDay,
    topPages,
    visitors,
  });
}

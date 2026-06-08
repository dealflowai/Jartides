import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { gscConfigured, gscSiteUrl, querySearchAnalytics, type GscRow } from "@/lib/gsc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function pctChange(now: number, prev: number): number {
  if (prev === 0) return now > 0 ? 100 : 0;
  return Math.round(((now - prev) / prev) * 1000) / 10;
}

const agg = (rows: GscRow[]) => rows[0] ?? { clicks: 0, impressions: 0, ctr: 0, position: 0 };

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!gscConfigured()) {
    return NextResponse.json({ configured: false });
  }

  // GSC data lags ~2-3 days; use a 28-day window ending 3 days ago, compared
  // against the previous 28 days.
  const endDate = daysAgo(3);
  const startDate = daysAgo(30);
  const prevEnd = daysAgo(31);
  const prevStart = daysAgo(58);

  try {
    const [totals, prevTotals, series, queries, pages] = await Promise.all([
      querySearchAnalytics({ startDate, endDate, dimensions: [] }),
      querySearchAnalytics({ startDate: prevStart, endDate: prevEnd, dimensions: [] }),
      querySearchAnalytics({ startDate, endDate, dimensions: ["date"], rowLimit: 1000 }),
      querySearchAnalytics({ startDate, endDate, dimensions: ["query"], rowLimit: 25 }),
      querySearchAnalytics({ startDate, endDate, dimensions: ["page"], rowLimit: 25 }),
    ]);

    const t = agg(totals);
    const p = agg(prevTotals);

    return NextResponse.json({
      configured: true,
      property: gscSiteUrl(),
      range: { startDate, endDate },
      kpis: {
        clicks: Math.round(t.clicks),
        impressions: Math.round(t.impressions),
        ctr: Math.round(t.ctr * 1000) / 10, // percent
        position: Math.round(t.position * 10) / 10,
        clicksChange: pctChange(t.clicks, p.clicks),
        impressionsChange: pctChange(t.impressions, p.impressions),
        ctrChange: Math.round((t.ctr - p.ctr) * 1000) / 10, // percentage-point delta
        positionChange: Math.round((t.position - p.position) * 10) / 10, // negative = improved
      },
      series: series.map((r) => ({
        date: r.keys?.[0] ?? "",
        clicks: Math.round(r.clicks),
        impressions: Math.round(r.impressions),
        position: Math.round(r.position * 10) / 10,
      })),
      queries: queries.map((r) => ({
        query: r.keys?.[0] ?? "",
        clicks: Math.round(r.clicks),
        impressions: Math.round(r.impressions),
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10,
      })),
      pages: pages.map((r) => ({
        page: r.keys?.[0] ?? "",
        clicks: Math.round(r.clicks),
        impressions: Math.round(r.impressions),
        ctr: Math.round(r.ctr * 1000) / 10,
        position: Math.round(r.position * 10) / 10,
      })),
    });
  } catch (e) {
    return NextResponse.json({ configured: true, error: (e as Error).message });
  }
}

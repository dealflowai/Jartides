"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Loader2,
  RefreshCw,
  Gauge,
  ListChecks,
  AlertTriangle,
  Rocket,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Search,
  ArrowRight,
  Lightbulb,
  TrendingDown,
  ChevronDown,
  Activity,
  Eye,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types (mirror /api/admin/seo) ─────────────────────────────────────────

type Severity = "critical" | "warning" | "info";
type CheckStatus = "pass" | "warn" | "fail";

interface SeoIssue {
  id: string;
  severity: Severity;
  label: string;
  detail: string;
  fix: string;
}

interface ProductAudit {
  id: string;
  name: string;
  slug: string;
  url: string;
  adminUrl: string;
  score: number;
  grade: string;
  views: number;
  impact: number;
  effectiveTitle: string;
  titleLength: number;
  effectiveDescription: string;
  descriptionLength: number;
  wordCount: number;
  imageCount: number;
  coaCount: number;
  reviewCount: number;
  hasMetaTitle: boolean;
  hasMetaDescription: boolean;
  inStock: boolean;
  issues: SeoIssue[];
}

interface SiteCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

interface IssueGroup {
  id: string;
  severity: Severity;
  label: string;
  description: string;
  fix: string;
  products: { id: string; name: string; slug: string }[];
}

interface VitalStat {
  name: string;
  avg: number;
  goodPct: number;
  rating: "good" | "ni" | "poor";
  samples: number;
}

interface SeoData {
  overallScore: number;
  grade: string;
  siteHealth: number;
  redisConfigured: boolean;
  trafficSources: { channel: string; count: number }[];
  trafficSeries: { date: string; organic: number; social: number; direct: number; referral: number }[];
  webVitals: VitalStat[];
  scoreTrend: { date: string; score: number }[];
  productCount: number;
  kpis: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
    avgProductScore: number;
    avgWordCount: number;
    productsWithoutMetaTitle: number;
    productsWithoutMetaDescription: number;
    thinContentCount: number;
    productsWithoutImages: number;
    productsWithoutCoa: number;
    productsWithoutReviews: number;
    duplicateTitleCount: number;
    duplicateDescriptionCount: number;
  };
  siteChecks: SiteCheck[];
  issueGroups: IssueGroup[];
  products: ProductAudit[];
  contentDistribution: { bucket: string; count: number }[];
}

type TabId = "health" | "gsc" | "traffic" | "products" | "issues" | "growth";

// Google Core Web Vitals display config
const VITAL_META: Record<string, { label: string; unit: "ms" | "s" | "" ; help: string }> = {
  LCP: { label: "Largest Contentful Paint", unit: "ms", help: "Loading - good ≤ 2.5s" },
  INP: { label: "Interaction to Next Paint", unit: "ms", help: "Responsiveness - good ≤ 200ms" },
  CLS: { label: "Cumulative Layout Shift", unit: "", help: "Visual stability - good ≤ 0.1" },
  FCP: { label: "First Contentful Paint", unit: "ms", help: "First paint - good ≤ 1.8s" },
  TTFB: { label: "Time to First Byte", unit: "ms", help: "Server speed - good ≤ 0.8s" },
};

const VITAL_RATING_STYLE: Record<"good" | "ni" | "poor", { color: string; bg: string; label: string }> = {
  good: { color: "#22c55e", bg: "bg-green-50", label: "Good" },
  ni: { color: "#f59e0b", bg: "bg-amber-50", label: "Needs work" },
  poor: { color: "#ef4444", bg: "bg-red-50", label: "Poor" },
};

const CHANNEL_COLOR: Record<string, string> = {
  "Organic Search": "#22c55e",
  Social: "#8b5cf6",
  Direct: "#0b3d7a",
  Referral: "#f59e0b",
  Other: "#9ca3af",
};

function formatVital(name: string, value: number): string {
  const unit = VITAL_META[name]?.unit ?? "";
  if (name === "CLS") return value.toFixed(3);
  if (value >= 1000) return `${(value / 1000).toFixed(2)}s`;
  return `${Math.round(value)}${unit}`;
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function scoreColor(score: number): string {
  if (score >= 90) return "#22c55e";
  if (score >= 80) return "#84cc16";
  if (score >= 70) return "#f59e0b";
  if (score >= 60) return "#f97316";
  return "#ef4444";
}

const SEVERITY_STYLE: Record<Severity, { dot: string; text: string; bg: string; border: string; label: string }> = {
  critical: { dot: "bg-red-500", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Critical" },
  warning: { dot: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Warning" },
  info: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Info" },
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f0f0f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">/ 100</span>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, tone = "default" }: {
  label: string; value: string | number; sub?: string; tone?: "default" | "critical" | "warning" | "info" | "good";
}) {
  const toneClass = {
    default: "text-gray-900",
    critical: "text-red-600",
    warning: "text-amber-600",
    info: "text-blue-600",
    good: "text-green-600",
  }[tone];
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className={cn("text-2xl font-bold", toneClass)}>{value}</p>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function Card({ title, subtitle, children, className = "" }: {
  title?: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-gray-200 bg-white", className)}>
      {title && (
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function GradePill({ grade, score }: { grade: string; score: number }) {
  const color = scoreColor(score);
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {grade}
    </span>
  );
}

// ─── Health Tab ──────────────────────────────────────────────────────────────

function HealthTab({ data }: { data: SeoData }) {
  const CHECK_ICON: Record<CheckStatus, typeof CheckCircle2> = {
    pass: CheckCircle2,
    warn: AlertCircle,
    fail: XCircle,
  };
  const CHECK_COLOR: Record<CheckStatus, string> = {
    pass: "text-green-500",
    warn: "text-amber-500",
    fail: "text-red-500",
  };

  return (
    <div className="space-y-6">
      {/* Score + summary */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center justify-center py-2">
            <ScoreRing score={data.overallScore} />
            <p className="mt-4 text-lg font-bold text-gray-900">Grade {data.grade}</p>
            <p className="text-sm text-gray-500">Overall SEO health</p>
            <div className="mt-4 flex w-full justify-around border-t border-gray-100 pt-4 text-center">
              <div>
                <p className="text-xl font-bold text-gray-900">{data.kpis.avgProductScore}</p>
                <p className="text-xs text-gray-400">Avg product</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{data.siteHealth}</p>
                <p className="text-xs text-gray-400">Site config</p>
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{data.productCount}</p>
                <p className="text-xs text-gray-400">Pages audited</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 gap-4 sm:grid-cols-3 content-start">
          <StatCard label="Critical issues" value={data.kpis.criticalCount} tone="critical" sub="Fix these first" />
          <StatCard label="Warnings" value={data.kpis.warningCount} tone="warning" sub="Address soon" />
          <StatCard label="Suggestions" value={data.kpis.infoCount} tone="info" sub="Nice to have" />
          <StatCard label="Thin-content pages" value={data.kpis.thinContentCount} tone={data.kpis.thinContentCount ? "critical" : "good"} sub="Deindex risk" />
          <StatCard label="Avg words / page" value={data.kpis.avgWordCount} tone={data.kpis.avgWordCount >= 150 ? "good" : "warning"} sub="Aim for 150+" />
          <StatCard label="Pages without reviews" value={data.kpis.productsWithoutReviews} tone="info" sub="No star results" />
        </div>
      </div>

      {/* Site checks */}
      <Card title="Site-wide checks" subtitle="Configuration & infrastructure that affects every page">
        <div className="divide-y divide-gray-100">
          {data.siteChecks.map((c) => {
            const Icon = CHECK_ICON[c.status];
            return (
              <div key={c.id} className="flex items-start gap-3 py-3">
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", CHECK_COLOR[c.status])} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{c.label}</p>
                  <p className="text-xs text-gray-500">{c.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Content depth */}
      <Card title="Content depth distribution" subtitle="Word count per product page - thin pages get deindexed in this niche">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.contentDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bucket" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" name="Products" radius={[4, 4, 0, 0]}>
                {data.contentDistribution.map((entry, i) => (
                  <Cell key={i} fill={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : i === 2 ? "#84cc16" : "#22c55e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Red = thin (under 50 words, high deindex risk) · Amber = shallow · Green = healthy depth.
        </p>
      </Card>
    </div>
  );
}

// ─── Traffic & Speed Tab (real field data) ───────────────────────────────────

function RedisNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
      <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
      <h3 className="mt-3 text-lg font-semibold text-amber-800">Live data not configured</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-amber-700">
        Traffic sources, real Core Web Vitals, and SEO score history are collected through Upstash Redis.
        Add <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">UPSTASH_REDIS_REST_URL</code> and{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">UPSTASH_REDIS_REST_TOKEN</code> to enable them.
      </p>
    </div>
  );
}

function TrafficTab({ data }: { data: SeoData }) {
  if (!data.redisConfigured) return <RedisNotice />;

  const totalSourced = data.trafficSources.reduce((s, c) => s + c.count, 0);
  const organic = data.trafficSources.find((s) => s.channel === "Organic Search")?.count ?? 0;
  const social = data.trafficSources.find((s) => s.channel === "Social")?.count ?? 0;
  const hasVitals = data.webVitals.length > 0;
  const hasTrend = data.scoreTrend.length > 1;

  return (
    <div className="space-y-6">
      {/* Traffic sources */}
      <Card title="Traffic sources" subtitle="Where your visitors come from - last 14 days (collected going forward)">
        {totalSourced === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No traffic recorded yet. Sources are tracked from now on - check back in a day or two.
          </p>
        ) : (
          <>
            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.trafficSources.map((s) => {
                const pct = totalSourced > 0 ? Math.round((s.count / totalSourced) * 100) : 0;
                return (
                  <div key={s.channel} className="rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CHANNEL_COLOR[s.channel] ?? "#9ca3af" }} />
                      <span className="text-xs font-medium text-gray-600">{s.channel}</span>
                    </div>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{s.count.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{pct}% of visits</p>
                  </div>
                );
              })}
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trafficSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={36} />
                  <Tooltip />
                  <Area type="monotone" dataKey="organic" name="Organic Search" stackId="1" stroke={CHANNEL_COLOR["Organic Search"]} fill={CHANNEL_COLOR["Organic Search"]} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="social" name="Social" stackId="1" stroke={CHANNEL_COLOR.Social} fill={CHANNEL_COLOR.Social} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="direct" name="Direct" stackId="1" stroke={CHANNEL_COLOR.Direct} fill={CHANNEL_COLOR.Direct} fillOpacity={0.25} />
                  <Area type="monotone" dataKey="referral" name="Referral" stackId="1" stroke={CHANNEL_COLOR.Referral} fill={CHANNEL_COLOR.Referral} fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <p className="text-sm text-blue-800">
                {organic >= social
                  ? "Organic search is currently your biggest channel - protect it by fixing the critical on-page issues, and watch this trend after Google updates."
                  : "Social is currently driving more than organic search - if your month-1 spike was social, that explains a fast fade. Build organic + content to diversify."}
              </p>
            </div>
          </>
        )}
      </Card>

      {/* Core Web Vitals */}
      <Card title="Core Web Vitals" subtitle="Real measurements from your actual visitors, vs Google's thresholds">
        {!hasVitals ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No Web Vitals collected yet - they stream in as real visitors browse. Check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.webVitals.map((v) => {
              const style = VITAL_RATING_STYLE[v.rating];
              return (
                <div key={v.name} className={cn("rounded-xl border border-gray-200 p-4", style.bg)}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900">{v.name}</span>
                    <span className="rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: style.color }}>
                      {style.label}
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-bold" style={{ color: style.color }}>{formatVital(v.name, v.avg)}</p>
                  <p className="text-xs text-gray-500">{VITAL_META[v.name]?.label}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{v.goodPct}% good</span>
                    <span>{v.samples.toLocaleString()} samples</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* SEO score trend */}
      <Card title="SEO score history" subtitle="Your overall score over time - watch it climb as you fix issues">
        {!hasTrend ? (
          <p className="py-8 text-center text-sm text-gray-400">
            Building history - a point is saved each time you open this dashboard. Come back tomorrow to see the trend.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={36} />
                <Tooltip />
                <Line type="monotone" dataKey="score" name="SEO score" stroke="#0b3d7a" strokeWidth={2} dot={{ r: 3, fill: "#0b3d7a" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Products Tab ────────────────────────────────────────────────────────────

function ProductsTab({ data }: { data: SeoData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");
  const [sort, setSort] = useState<"impact" | "score" | "views">("impact");
  const hasTraffic = data.products.some((p) => p.views > 0);

  const filtered = useMemo(() => {
    const list = data.products.filter((p) => {
      if (query && !p.name.toLowerCase().includes(query.toLowerCase())) return false;
      if (filter === "critical" && !p.issues.some((i) => i.severity === "critical")) return false;
      if (filter === "warning" && !p.issues.some((i) => i.severity === "warning")) return false;
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "score") return a.score - b.score;
      if (sort === "views") return b.views - a.views;
      return b.impact - a.impact; // biggest impact first
    });
  }, [data.products, query, filter, sort]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-64 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:border-[#1a6de3] focus:outline-none focus:ring-1 focus:ring-[#1a6de3]"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
            {([["all", "All"], ["critical", "Has critical"], ["warning", "Has warnings"]] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === id ? "bg-white text-[#0b3d7a] shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-xs font-medium text-gray-600 focus:border-[#1a6de3] focus:outline-none"
          >
            <option value="impact">Sort: Biggest impact</option>
            <option value="score">Sort: Worst score</option>
            <option value="views">Sort: Most traffic</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-3 font-medium">Score</th>
                <th className="px-3 py-3 font-medium">Product</th>
                {hasTraffic && <th className="px-3 py-3 text-center font-medium">Views 14d</th>}
                <th className="px-3 py-3 text-center font-medium">Title</th>
                <th className="px-3 py-3 text-center font-medium">Desc</th>
                <th className="px-3 py-3 text-center font-medium">Words</th>
                <th className="px-3 py-3 text-center font-medium">Img</th>
                <th className="px-3 py-3 text-center font-medium">COA</th>
                <th className="px-3 py-3 text-center font-medium">Issues</th>
                <th className="px-3 py-3 text-right font-medium">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((p) => {
                const crit = p.issues.filter((i) => i.severity === "critical").length;
                const warn = p.issues.filter((i) => i.severity === "warning").length;
                return (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="px-3 py-2.5">
                      <GradePill grade={p.grade} score={p.score} />
                    </td>
                    <td className="px-3 py-2.5">
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-[#1a6de3] hover:underline inline-flex items-center gap-1">
                        {p.name}
                        <ExternalLink className="h-3 w-3 text-gray-300" />
                      </a>
                    </td>
                    {hasTraffic && (
                      <td className="px-3 py-2.5 text-center">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
                          <Eye className="h-3 w-3 text-gray-400" />
                          {p.views.toLocaleString()}
                        </span>
                      </td>
                    )}
                    <td className={cn("px-3 py-2.5 text-center text-xs", p.titleLength < 30 || p.titleLength > 60 ? "text-amber-600 font-semibold" : "text-gray-500")}>{p.titleLength}</td>
                    <td className={cn("px-3 py-2.5 text-center text-xs", p.descriptionLength < 120 || p.descriptionLength > 160 ? "text-amber-600 font-semibold" : "text-gray-500")}>{p.descriptionLength}</td>
                    <td className={cn("px-3 py-2.5 text-center text-xs font-semibold", p.wordCount < 50 ? "text-red-600" : p.wordCount < 150 ? "text-amber-600" : "text-green-600")}>{p.wordCount}</td>
                    <td className={cn("px-3 py-2.5 text-center text-xs", p.imageCount === 0 ? "text-red-600 font-semibold" : "text-gray-500")}>{p.imageCount}</td>
                    <td className={cn("px-3 py-2.5 text-center text-xs", p.coaCount === 0 ? "text-amber-600 font-semibold" : "text-gray-500")}>{p.coaCount}</td>
                    <td className="px-3 py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 text-xs">
                        {crit > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-red-50 px-1.5 py-0.5 font-semibold text-red-600">{crit}</span>}
                        {warn > 0 && <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-600">{warn}</span>}
                        {crit === 0 && warn === 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Link href={p.adminUrl} className="inline-flex items-center gap-1 text-xs font-medium text-[#1a6de3] hover:underline">
                        Edit <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={hasTraffic ? 10 : 9} className="py-12 text-center text-sm text-gray-400">No products match.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── Issues Tab ──────────────────────────────────────────────────────────────

function IssuesTab({ data }: { data: SeoData }) {
  const [open, setOpen] = useState<string | null>(data.issueGroups[0]?.id ?? null);

  if (data.issueGroups.length === 0) {
    return (
      <Card>
        <div className="flex flex-col items-center py-16 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
          <p className="mt-3 text-lg font-semibold text-gray-900">No issues found</p>
          <p className="text-sm text-gray-500">Every active product page passes the audit. 🎉</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {data.issueGroups.map((g) => {
        const style = SEVERITY_STYLE[g.severity];
        const isOpen = open === g.id;
        return (
          <div key={g.id} className={cn("overflow-hidden rounded-xl border bg-white", style.border)}>
            <button
              onClick={() => setOpen(isOpen ? null : g.id)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
            >
              <div className="flex items-center gap-3">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", style.bg, style.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                  {style.label}
                </span>
                <span className="font-semibold text-gray-900">{g.label}</span>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                  {g.products.length} page{g.products.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 text-gray-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="border-t border-gray-100 px-5 py-4">
                <p className="text-sm text-gray-600">{g.description}</p>
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <p className="text-sm text-blue-800"><span className="font-semibold">How to fix:</span> {g.fix}</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.products.map((p) => (
                    <a
                      key={p.id}
                      href={`/admin/products/${p.id}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3]"
                    >
                      {p.name}
                      <ArrowRight className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Search Console Tab (live Google data) ───────────────────────────────────

interface GscData {
  configured: boolean;
  error?: string;
  property?: string;
  range?: { startDate: string; endDate: string };
  kpis?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    clicksChange: number;
    impressionsChange: number;
    ctrChange: number;
    positionChange: number;
  };
  series?: { date: string; clicks: number; impressions: number; position: number }[];
  queries?: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  pages?: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

function Delta({ value, invert = false, suffix = "%" }: { value: number; invert?: boolean; suffix?: string }) {
  if (!value) return <span className="text-xs text-gray-400">no change</span>;
  // invert=true means lower is better (e.g. average position)
  const good = invert ? value < 0 : value > 0;
  const Icon = value > 0 ? TrendingUp : TrendingDown;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", good ? "text-green-600" : "text-red-600")}>
      <Icon className="h-3 w-3" />
      {value > 0 ? "+" : ""}{value}{suffix}
    </span>
  );
}

function GscKpi({ label, value, delta }: { label: string; value: string; delta: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      <div className="mt-1">{delta}</div>
    </div>
  );
}

function GscTab() {
  const [data, setData] = useState<GscData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo/gsc")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ configured: true, error: "Failed to reach Search Console." }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0b3d7a]" />
        <span className="ml-2 text-gray-500">Loading Search Console data…</span>
      </div>
    );
  }

  if (!data || !data.configured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-500" />
          <div>
            <h3 className="text-lg font-semibold text-amber-800">Connect Google Search Console</h3>
            <p className="mt-1 text-sm text-amber-700">
              Add a Google service account and these environment variables to show live rankings, clicks, impressions, and your top queries here:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              <li><code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">GSC_CLIENT_EMAIL</code></li>
              <li><code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">GSC_PRIVATE_KEY</code></li>
              <li><code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">GSC_SITE_URL</code> (e.g. <code className="font-mono text-xs">sc-domain:jartides.ca</code>)</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold text-red-800">Search Console error</p>
            <p className="mt-1 text-sm text-red-700">{data.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const k = data.kpis!;
  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-400">
        Property <span className="font-mono">{data.property}</span> · {data.range?.startDate} to {data.range?.endDate} (vs previous 28 days)
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GscKpi label="Clicks" value={k.clicks.toLocaleString()} delta={<Delta value={k.clicksChange} />} />
        <GscKpi label="Impressions" value={k.impressions.toLocaleString()} delta={<Delta value={k.impressionsChange} />} />
        <GscKpi label="Avg CTR" value={`${k.ctr}%`} delta={<Delta value={k.ctrChange} suffix="pt" />} />
        <GscKpi label="Avg Position" value={`${k.position}`} delta={<Delta value={k.positionChange} invert suffix="" />} />
      </div>

      <Card title="Clicks & impressions" subtitle="Daily — last 28 days">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.series}>
              <defs>
                <linearGradient id="gscClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0b3d7a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0b3d7a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="clicks" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={40} />
              <YAxis yAxisId="impr" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={48} />
              <Tooltip />
              <Area yAxisId="clicks" type="monotone" dataKey="clicks" name="Clicks" stroke="#0b3d7a" strokeWidth={2} fill="url(#gscClicks)" />
              <Line yAxisId="impr" type="monotone" dataKey="impressions" name="Impressions" stroke="#1a6de3" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Top queries" subtitle="What people search to find you">
          <GscRowsTable rows={data.queries ?? []} labelKey="query" labelHead="Query" />
        </Card>
        <Card title="Top pages" subtitle="Your best-performing pages in search">
          <GscRowsTable rows={data.pages ?? []} labelKey="page" labelHead="Page" />
        </Card>
      </div>
    </div>
  );
}

function GscRowsTable({
  rows,
  labelKey,
  labelHead,
}: {
  rows: { clicks: number; impressions: number; ctr: number; position: number; [k: string]: string | number }[];
  labelKey: string;
  labelHead: string;
}) {
  if (rows.length === 0) return <p className="py-8 text-center text-sm text-gray-400">No data yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
          <tr>
            <th className="px-3 py-2.5 font-medium">{labelHead}</th>
            <th className="px-3 py-2.5 text-right font-medium">Clicks</th>
            <th className="px-3 py-2.5 text-right font-medium">Impr</th>
            <th className="px-3 py-2.5 text-right font-medium">CTR</th>
            <th className="px-3 py-2.5 text-right font-medium">Pos</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-gray-50/50">
              <td className="max-w-[220px] truncate px-3 py-2 text-gray-800" title={String(r[labelKey])}>{r[labelKey]}</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-900">{r.clicks.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-gray-600">{r.impressions.toLocaleString()}</td>
              <td className="px-3 py-2 text-right text-gray-600">{r.ctr}%</td>
              <td className="px-3 py-2 text-right text-gray-600">{r.position}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Growth Tab (generated from real data) ────────────────────────────────────

interface Rec {
  key: string;
  severity: Severity;
  title: string;
  detail: string;
  products: { id: string; name: string; slug: string }[];
}

function buildRecs(data: SeoData): Rec[] {
  const recs: Rec[] = [];
  const group = (id: string) => data.issueGroups.find((g) => g.id === id);
  const s = (n: number) => (n === 1 ? "" : "s");

  const addGroup = (id: string, title: (n: number) => string) => {
    const g = group(id);
    if (!g || g.products.length === 0) return;
    recs.push({ key: id, severity: g.severity, title: title(g.products.length), detail: g.fix, products: g.products });
  };

  addGroup("thin_content", (n) => `Expand ${n} thin-content page${s(n)}`);
  addGroup("no_image", (n) => `Add an image to ${n} product${s(n)}`);
  addGroup("desc_missing", (n) => `Write a description for ${n} page${s(n)}`);
  addGroup("dup_title", (n) => `Fix ${n} duplicate title${s(n)}`);
  addGroup("dup_desc", (n) => `Fix ${n} duplicate meta description${s(n)}`);
  addGroup("no_coa", (n) => `Attach a COA to ${n} product${s(n)}`);
  addGroup("meta_desc_auto", (n) => `Write a meta description for ${n} page${s(n)}`);
  addGroup("title_short", (n) => `Lengthen ${n} short title${s(n)}`);
  addGroup("title_long", (n) => `Shorten ${n} long title${s(n)}`);
  addGroup("no_reviews", (n) => `Collect reviews on ${n} product${s(n)}`);

  // Real Core Web Vitals problems (field data)
  for (const v of data.webVitals) {
    if (v.rating !== "good") {
      recs.push({
        key: `vital_${v.name}`,
        severity: v.rating === "poor" ? "warning" : "info",
        title: `Improve ${v.name} (now ${formatVital(v.name, v.avg)})`,
        detail: `Only ${v.goodPct}% of real visits hit Google's "good" range for ${VITAL_META[v.name]?.label ?? v.name}.`,
        products: [],
      });
    }
  }

  // Failing site-config checks
  for (const c of data.siteChecks) {
    if (c.status === "fail") {
      recs.push({ key: `check_${c.id}`, severity: "warning", title: c.label, detail: c.detail, products: [] });
    }
  }

  const rank: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };
  return recs.sort((a, b) => rank[a.severity] - rank[b.severity] || b.products.length - a.products.length);
}

function GrowthTab({ data }: { data: SeoData }) {
  const recs = useMemo(() => buildRecs(data), [data]);
  const topImpact = useMemo(
    () => data.products.filter((p) => p.issues.length > 0).slice().sort((a, b) => b.impact - a.impact).slice(0, 5),
    [data.products]
  );

  const k = data.kpis;
  const totalSourced = data.trafficSources.reduce((sum, c) => sum + c.count, 0);
  const organic = data.trafficSources.find((c) => c.channel === "Organic Search")?.count ?? 0;
  const organicPct = totalSourced > 0 ? Math.round((organic / totalSourced) * 100) : 0;
  const worstVital = data.webVitals.filter((v) => v.rating !== "good").sort((a, b) => a.goodPct - b.goodPct)[0];
  const trendDelta = data.scoreTrend.length > 1 ? data.scoreTrend[data.scoreTrend.length - 1].score - data.scoreTrend[0].score : 0;
  const hasTraffic = totalSourced > 0;
  const hasInsights = data.scoreTrend.length > 1 || hasTraffic || data.webVitals.length > 0;

  const summary =
    k.criticalCount > 0
      ? `${k.criticalCount} critical issue${k.criticalCount > 1 ? "s are" : " is"} holding your pages back. Clear the action plan below first.`
      : k.warningCount > 0
        ? `No critical issues. Resolve ${k.warningCount} warning${k.warningCount > 1 ? "s" : ""} to push your score higher.`
        : `On-page SEO is clean. Put your energy into content depth and earning links.`;

  return (
    <div className="space-y-6">
      {/* Situation summary (computed) */}
      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <GradePill grade={data.grade} score={data.overallScore} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Grade {data.grade} · {data.overallScore}/100 across {data.productCount} pages</p>
              <p className="text-sm text-gray-600">{summary}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Data-driven insight cards */}
      {hasInsights && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {data.scoreTrend.length > 1 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                {trendDelta >= 0 ? <TrendingUp className="h-4 w-4 text-green-500" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                <span className="text-xs font-medium uppercase tracking-wide">Score trend</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                {trendDelta === 0
                  ? "Flat since tracking began."
                  : `${trendDelta > 0 ? "Up" : "Down"} ${Math.abs(trendDelta)} pts over ${data.scoreTrend.length} days.`}
              </p>
            </div>
          )}
          {hasTraffic && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Activity className="h-4 w-4 text-[#1a6de3]" />
                <span className="text-xs font-medium uppercase tracking-wide">Organic share</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                Organic search is <strong>{organicPct}%</strong> of visits ({organic.toLocaleString()} of {totalSourced.toLocaleString()}, 14d).
              </p>
            </div>
          )}
          {data.webVitals.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Gauge className="h-4 w-4 text-[#1a6de3]" />
                <span className="text-xs font-medium uppercase tracking-wide">Speed</span>
              </div>
              <p className="mt-1 text-sm text-gray-700">
                {worstVital
                  ? <>{worstVital.name} needs work ({formatVital(worstVital.name, worstVital.avg)}), {worstVital.goodPct}% good.</>
                  : "All Core Web Vitals are in the good range."}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fix-first list, ranked by real traffic impact */}
      {topImpact.length > 0 && (
        <Card title="Fix these first" subtitle={hasTraffic ? "Lowest-scoring pages weighted by real traffic" : "Lowest-scoring pages (add traffic data to weight by visits)"}>
          <div className="divide-y divide-gray-100">
            {topImpact.map((p) => {
              const crit = p.issues.filter((i) => i.severity === "critical").length;
              const warn = p.issues.filter((i) => i.severity === "warning").length;
              return (
                <div key={p.id} className="flex items-center gap-3 py-2.5">
                  <GradePill grade={p.grade} score={p.score} />
                  <div className="min-w-0 flex-1">
                    <a href={p.url} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-[#1a6de3] hover:underline">{p.name}</a>
                    <p className="text-xs text-gray-400">
                      {crit > 0 && `${crit} critical `}{warn > 0 && `${warn} warning${warn > 1 ? "s" : ""} `}
                      {hasTraffic && <span className="inline-flex items-center gap-0.5"><Eye className="h-3 w-3" /> {p.views.toLocaleString()} views</span>}
                    </p>
                  </div>
                  <Link href={p.adminUrl} className="inline-flex items-center gap-1 text-xs font-medium text-[#1a6de3] hover:underline">
                    Edit <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Generated action plan */}
      <Card title="Your action plan" subtitle="Generated from this audit, your traffic, and real Core Web Vitals">
        {recs.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="mt-2 font-semibold text-gray-900">Nothing urgent on-page.</p>
            <p className="text-sm text-gray-500">Shift focus to content depth, reviews, and earning backlinks.</p>
          </div>
        ) : (
          <ol className="space-y-3">
            {recs.map((r, i) => {
              const style = SEVERITY_STYLE[r.severity];
              return (
                <li key={r.key} className={cn("rounded-lg border p-3", style.border)}>
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">{i + 1}</span>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold", style.bg, style.text)}>
                      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
                      {style.label}
                    </span>
                    <span className="font-semibold text-gray-900">{r.title}</span>
                  </div>
                  <p className="mt-1.5 pl-7 text-sm text-gray-600">{r.detail}</p>
                  {r.products.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
                      {r.products.slice(0, 8).map((p) => (
                        <a key={p.id} href={`/admin/products/${p.id}`} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-2 py-0.5 text-xs text-gray-600 hover:border-[#1a6de3] hover:text-[#1a6de3]">
                          {p.name}<ArrowRight className="h-3 w-3" />
                        </a>
                      ))}
                      {r.products.length > 8 && <span className="self-center text-xs text-gray-400">+{r.products.length - 8} more</span>}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>

      {/* The one thing the on-site audit can't measure */}
      <Card className="border-dashed">
        <div className="flex gap-3">
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#1a6de3]" />
          <p className="text-sm text-gray-600">
            <strong>Beyond this audit:</strong> backlinks and topical authority can&rsquo;t be measured on-page, but they decide rankings in this niche. Build an education hub for informational searches and earn links from communities. Track the payoff in the <strong>Search Console</strong> tab.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof Gauge }[] = [
  { id: "health", label: "Health", icon: Gauge },
  { id: "gsc", label: "Search Console", icon: TrendingUp },
  { id: "traffic", label: "Traffic & Speed", icon: Activity },
  { id: "products", label: "Product Audit", icon: ListChecks },
  { id: "issues", label: "Issues", icon: AlertTriangle },
  { id: "growth", label: "Growth Guide", icon: Rocket },
];

export default function SeoAnalyzer() {
  const [data, setData] = useState<SeoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<TabId>("health");

  const fetchData = useCallback(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#0b3d7a]" />
        <span className="ml-3 text-gray-500">Auditing your site…</span>
      </div>
    );
  }

  if (!data) {
    return <p className="py-16 text-center text-gray-500">Failed to run SEO audit.</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            const badge = t.id === "issues" ? data.kpis.criticalCount + data.kpis.warningCount : 0;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                  active ? "bg-white text-[#0b3d7a] shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {badge > 0 && (
                  <span className="rounded-full bg-red-100 px-1.5 text-xs font-semibold text-red-600">{badge}</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => { setRefreshing(true); fetchData(); }}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} />
          {refreshing ? "Re-auditing…" : "Re-run audit"}
        </button>
      </div>

      {tab === "health" && <HealthTab data={data} />}
      {tab === "gsc" && <GscTab />}
      {tab === "traffic" && <TrafficTab data={data} />}
      {tab === "products" && <ProductsTab data={data} />}
      {tab === "issues" && <IssuesTab data={data} />}
      {tab === "growth" && <GrowthTab data={data} />}
    </div>
  );
}

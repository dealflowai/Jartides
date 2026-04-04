"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Radio,
  Eye,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  BarChart3,
  ShoppingCart,
  UserPlus,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    totalCustomers: number;
    activeProducts: number;
    last30Revenue: number;
    last30Orders: number;
    revenueChange: number;
    conversionRate: number;
    repeatCustomerRate: number;
    uniqueBuyers: number;
    repeatBuyers: number;
  };
  revenueTimeSeries: { date: string; revenue: number; orders: number }[];
  orderStatusBreakdown: { status: string; count: number }[];
  topProductsByRevenue: { name: string; fullName: string; revenue: number; qty: number }[];
  paymentBreakdown: { method: string; count: number }[];
  customerAcquisition: { month: string; count: number }[];
  aovTimeSeries: { week: string; aov: number; orders: number }[];
  topRegions: { region: string; orders: number; revenue: number }[];
  revenueByCountry: { country: string; orders: number; revenue: number }[];
  abandonedStats: {
    pending: number;
    cancelled: number;
    total: number;
    completed: number;
    revenueLost: number;
    recoveryRate: number;
  };
}

interface RealtimeData {
  configured: boolean;
  liveVisitors: number;
  activePages: { page: string; count: number }[];
  regions: { country: string; count: number }[];
  cities: { city: string; count: number }[];
  devices: { device: string; count: number }[];
  todayPageViews: number;
  todayUniqueVisitors: number;
  pageViewsByDay: { date: string; views: number; unique: number }[];
  topPages: { page: string; views: number }[];
  visitors: { page: string; country: string; city: string; device: string; lastSeen: number }[];
}

type TabId = "overview" | "realtime" | "sales" | "products" | "customers";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#6b7280",
};

const CHART_COLORS = [
  "#0b3d7a", "#1a6de3", "#3b82f6", "#60a5fa", "#93c5fd",
  "#6366f1", "#8b5cf6", "#a78bfa", "#22c55e", "#f59e0b",
];

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  Desktop: Monitor,
  Mobile: Smartphone,
  Tablet: Tablet,
};

const COUNTRY_FLAGS: Record<string, string> = {
  CA: "🇨🇦", US: "🇺🇸", GB: "🇬🇧", AU: "🇦🇺", DE: "🇩🇪",
  FR: "🇫🇷", JP: "🇯🇵", IN: "🇮🇳", BR: "🇧🇷", MX: "🇲🇽",
  AE: "🇦🇪", SA: "🇸🇦", QA: "🇶🇦", KW: "🇰🇼", BH: "🇧🇭",
  OM: "🇴🇲", JO: "🇯🇴", LB: "🇱🇧", IQ: "🇮🇶", EG: "🇪🇬",
  IL: "🇮🇱", TR: "🇹🇷", KR: "🇰🇷", NL: "🇳🇱", SE: "🇸🇪",
  NO: "🇳🇴", DK: "🇩🇰", IE: "🇮🇪", NZ: "🇳🇿", CH: "🇨🇭",
  IT: "🇮🇹", ES: "🇪🇸",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency", currency: "CAD",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n);
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function formatMonthShort(monthStr: string) {
  const [year, month] = monthStr.split("-");
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 10) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

// ─── Shared UI Components ────────────────────────────────────────────────────

function KPICard({
  label, value, sub, icon: Icon, color, change,
}: {
  label: string; value: string; sub: string;
  icon: typeof DollarSign; color: string; change?: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
            {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">{sub}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, children, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${className}`}>
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, formatter }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <p key={i} className="text-sm font-semibold" style={{ color: entry.color }}>
          {entry.name}: {formatter ? formatter(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Tab Definitions ─────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "realtime", label: "Real-Time", icon: Radio },
  { id: "sales", label: "Sales", icon: DollarSign },
  { id: "products", label: "Products", icon: Package },
  { id: "customers", label: "Customers", icon: Users },
];

// ─── Overview Tab ────────────────────────────────────────────────────────────

function DateRangePicker({ range, setRange, customFrom, customTo, setCustomFrom, setCustomTo }: {
  range: number; setRange: (r: number) => void;
  customFrom: string; customTo: string;
  setCustomFrom: (v: string) => void; setCustomTo: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {[7, 14, 30, 60, 90].map((r) => (
        <button key={r} onClick={() => setRange(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${range === r ? "bg-[#0b3d7a] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          {r}d
        </button>
      ))}
      <span className="text-xs text-gray-400 ml-1">or</span>
      <input type="date" value={customFrom} onChange={(e) => { setCustomFrom(e.target.value); setRange(0); }} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600" />
      <span className="text-xs text-gray-400">to</span>
      <input type="date" value={customTo} onChange={(e) => { setCustomTo(e.target.value); setRange(0); }} className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600" />
    </div>
  );
}

function OverviewTab({ data }: { data: AnalyticsData }) {
  const [range, setRange] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const { kpis } = data;

  const cutoffStr = range > 0
    ? (() => { const d = new Date(); d.setDate(d.getDate() - range); return d.toISOString().slice(0, 10); })()
    : customFrom || "1970-01-01";
  const endStr = range > 0 ? new Date().toISOString().slice(0, 10) : (customTo || "9999-12-31");
  const filtered = data.revenueTimeSeries.filter((d) => d.date >= cutoffStr && d.date <= endStr);
  const rangeLabel = range > 0 ? `Last ${range} days` : `${customFrom} to ${customTo}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Revenue (30d)" value={formatCurrency(kpis.last30Revenue)} sub="Last 30 days" icon={DollarSign} color="text-emerald-600 bg-emerald-50" change={kpis.revenueChange} />
        <KPICard label="Conversion Rate" value={`${kpis.conversionRate}%`} sub="Checkouts completed" icon={ShoppingCart} color="text-blue-600 bg-blue-50" />
        <KPICard label="Repeat Customers" value={`${kpis.repeatCustomerRate}%`} sub={`${kpis.repeatBuyers} of ${kpis.uniqueBuyers} buyers`} icon={UserPlus} color="text-violet-600 bg-violet-50" />
        <KPICard label="Avg Order Value" value={formatCurrency(kpis.avgOrderValue)} sub="All time" icon={CreditCard} color="text-amber-600 bg-amber-50" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Revenue" value={formatCurrency(kpis.totalRevenue)} sub="All time" icon={TrendingUp} color="text-green-600 bg-green-50" />
        <KPICard label="Total Orders" value={kpis.totalOrders.toLocaleString()} sub="Completed orders" icon={ShoppingBag} color="text-[#0b3d7a] bg-[#1a6de3]/10" />
        <KPICard label="Total Customers" value={kpis.totalCustomers.toLocaleString()} sub="Registered accounts" icon={Users} color="text-indigo-600 bg-indigo-50" />
        <KPICard label="Active Products" value={kpis.activeProducts.toLocaleString()} sub="In catalog" icon={Package} color="text-amber-600 bg-amber-50" />
      </div>

      <ChartCard title="Revenue Over Time" subtitle={`Daily revenue - ${rangeLabel}`}>
        <div className="mb-4">
          <DateRangePicker range={range} setRange={setRange} customFrom={customFrom} customTo={customTo} setCustomFrom={setCustomFrom} setCustomTo={setCustomTo} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0b3d7a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0b3d7a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={60} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0b3d7a" strokeWidth={2} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Orders Over Time" subtitle={`Daily orders - ${rangeLabel}`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filtered}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#1a6de3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── Real-Time Tab ───────────────────────────────────────────────────────────

function RealtimeTab() {
  const [rt, setRt] = useState<RealtimeData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRealtime = useCallback(() => {
    fetch("/api/admin/analytics/realtime")
      .then((r) => r.json())
      .then(setRt)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRealtime();
    const interval = setInterval(fetchRealtime, 10_000);
    return () => clearInterval(interval);
  }, [fetchRealtime]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#0b3d7a]" />
        <span className="ml-2 text-gray-500">Loading real-time data...</span>
      </div>
    );
  }

  if (!rt) {
    return <p className="py-16 text-center text-gray-500">Failed to load real-time data.</p>;
  }

  if (!rt.configured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-amber-500" />
        <h3 className="mt-3 text-lg font-semibold text-amber-800">Upstash Redis Not Configured</h3>
        <p className="mt-2 text-sm text-amber-700">
          Real-time visitor tracking requires Upstash Redis. Add your <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">UPSTASH_REDIS_REST_URL</code> and <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">UPSTASH_REDIS_REST_TOKEN</code> to your environment variables to enable this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="rounded-lg bg-green-50 p-2.5 text-green-600">
                <Radio className="h-5 w-5" />
              </div>
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500 animate-pulse" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{rt.liveVisitors}</p>
              <p className="text-sm text-gray-500">Live Visitors</p>
              <p className="text-xs text-gray-400">Right now on site</p>
            </div>
          </div>
        </div>
        <KPICard label="Page Views Today" value={rt.todayPageViews.toLocaleString()} sub="Total page loads" icon={Eye} color="text-blue-600 bg-blue-50" />
        <KPICard label="Unique Visitors Today" value={rt.todayUniqueVisitors.toLocaleString()} sub="Distinct sessions" icon={Users} color="text-violet-600 bg-violet-50" />
        <KPICard
          label="Pages / Visitor"
          value={rt.todayUniqueVisitors > 0 ? (rt.todayPageViews / rt.todayUniqueVisitors).toFixed(1) : "0"}
          sub="Today's average"
          icon={BarChart3}
          color="text-amber-600 bg-amber-50"
        />
      </div>

      {/* Page Views Over Last 14 Days */}
      <ChartCard title="Page Views & Unique Visitors" subtitle="Last 14 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rt.pageViewsByDay}>
              <defs>
                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a6de3" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a6de3" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="uniqueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="views" name="Page Views" stroke="#1a6de3" strokeWidth={2} fill="url(#viewsGrad)" />
              <Area type="monotone" dataKey="unique" name="Unique Visitors" stroke="#8b5cf6" strokeWidth={2} fill="url(#uniqueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Active Pages */}
        <ChartCard title="Active Pages" subtitle="Where visitors are right now" className="lg:col-span-2">
          {rt.activePages.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No active visitors</p>
          ) : (
            <div className="divide-y">
              {rt.activePages.map((p) => (
                <div key={p.page} className="flex items-center justify-between py-2.5">
                  <span className="truncate text-sm text-gray-700 font-mono">{p.page}</span>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.max(20, Math.min(120, p.count * 30))}px` }} />
                    <span className="text-sm font-semibold text-gray-900 w-6 text-right">{p.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Devices */}
        <ChartCard title="Devices" subtitle="Current visitors by device">
          {rt.devices.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No data</p>
          ) : (
            <div className="space-y-4">
              {rt.devices.map((d) => {
                const DevIcon = DEVICE_ICONS[d.device] ?? Monitor;
                const pct = rt.liveVisitors > 0 ? Math.round((d.count / rt.liveVisitors) * 100) : 0;
                return (
                  <div key={d.device} className="flex items-center gap-3">
                    <DevIcon className="h-5 w-5 text-gray-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{d.device}</span>
                        <span className="text-sm text-gray-500">{d.count} ({pct}%)</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-gray-100">
                        <div className="h-2 rounded-full bg-[#1a6de3]" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Visitor Regions */}
        <ChartCard title="Visitor Countries" subtitle="Where your live visitors are from">
          {rt.regions.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No regional data yet</p>
          ) : (
            <div className="divide-y">
              {rt.regions.map((r) => (
                <div key={r.country} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{COUNTRY_FLAGS[r.country] ?? "🌍"}</span>
                    <span className="text-sm font-medium text-gray-700">{r.country}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{r.count} visitor{r.count !== 1 ? "s" : ""}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Visitor Cities */}
        <ChartCard title="Visitor Cities" subtitle="Top cities right now">
          {rt.cities.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No city data yet</p>
          ) : (
            <div className="divide-y">
              {rt.cities.map((c) => (
                <div key={c.city} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">{c.city || "Unknown"}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Pages Today */}
      <ChartCard title="Top Pages Today" subtitle="Most viewed pages">
        {rt.topPages.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No page view data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Page</th>
                  <th className="px-4 py-3 text-right font-medium">Views</th>
                  <th className="px-4 py-3 font-medium w-48"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rt.topPages.slice(0, 15).map((p) => {
                  const maxViews = rt.topPages[0]?.views ?? 1;
                  const pct = Math.round((p.views / maxViews) * 100);
                  return (
                    <tr key={p.page} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-700">{p.page}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{p.views}</td>
                      <td className="px-4 py-2.5">
                        <div className="h-2 rounded-full bg-gray-100">
                          <div className="h-2 rounded-full bg-[#1a6de3]" style={{ width: `${pct}%` }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {/* Live Visitor Feed */}
      <ChartCard title="Live Visitor Feed" subtitle="Most recent visitors on the site">
        {rt.visitors.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">No visitors right now</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Page</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Last Seen</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rt.visitors.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-700 max-w-xs truncate">{v.page}</td>
                    <td className="px-4 py-2.5 text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span>{COUNTRY_FLAGS[v.country] ?? "🌍"}</span>
                        <span>{v.city ? `${v.city}, ${v.country}` : v.country || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{v.device}</td>
                    <td className="px-4 py-2.5 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(v.lastSeen)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>
    </div>
  );
}

// ─── Sales Tab ───────────────────────────────────────────────────────────────

function SalesTab({ data }: { data: AnalyticsData }) {
  const [range, setRange] = useState(30);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const cutoffStr = range > 0
    ? (() => { const d = new Date(); d.setDate(d.getDate() - range); return d.toISOString().slice(0, 10); })()
    : customFrom || "1970-01-01";
  const endStr = range > 0 ? new Date().toISOString().slice(0, 10) : (customTo || "9999-12-31");
  const filtered = data.revenueTimeSeries.filter((d) => d.date >= cutoffStr && d.date <= endStr);
  const rangeLabel = range > 0 ? `Last ${range} days` : `${customFrom} to ${customTo}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Revenue (30d)" value={formatCurrency(data.kpis.last30Revenue)} sub="Last 30 days" icon={DollarSign} color="text-emerald-600 bg-emerald-50" change={data.kpis.revenueChange} />
        <KPICard label="Total Revenue" value={formatCurrency(data.kpis.totalRevenue)} sub="All time" icon={TrendingUp} color="text-green-600 bg-green-50" />
        <KPICard label="Avg Order Value" value={formatCurrency(data.kpis.avgOrderValue)} sub="All time" icon={ShoppingCart} color="text-violet-600 bg-violet-50" />
        <KPICard label="Orders (30d)" value={data.kpis.last30Orders.toLocaleString()} sub="Last 30 days" icon={ShoppingBag} color="text-blue-600 bg-blue-50" />
      </div>

      {/* Revenue + Orders Combined Chart */}
      <ChartCard title="Revenue & Orders" subtitle={rangeLabel}>
        <div className="mb-4">
          <DateRangePicker range={range} setRange={setRange} customFrom={customFrom} customTo={customTo} setCustomFrom={setCustomFrom} setCustomTo={setCustomTo} />
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filtered}>
              <defs>
                <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0b3d7a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0b3d7a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis yAxisId="revenue" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={60} />
              <YAxis yAxisId="orders" orientation="right" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Area yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue" stroke="#0b3d7a" strokeWidth={2} fill="url(#revGrad2)" />
              <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status */}
        <ChartCard title="Order Status Breakdown" subtitle="All orders by status">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.orderStatusBreakdown} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="status">
                  {data.orderStatusBreakdown.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#9ca3af"} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {data.orderStatusBreakdown.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5 text-sm text-gray-600">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#9ca3af" }} />
                <span className="capitalize">{entry.status}</span>
                <span className="font-semibold text-gray-900">({entry.count})</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Payment Methods */}
        <ChartCard title="Payment Methods" subtitle="How customers pay">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.paymentBreakdown} cx="50%" cy="45%" innerRadius={50} outerRadius={85} paddingAngle={3} dataKey="count" nameKey="method">
                  {data.paymentBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {data.paymentBreakdown.map((entry, i) => (
              <div key={entry.method} className="flex items-center gap-1.5 text-sm text-gray-600">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span>{entry.method}</span>
                <span className="font-semibold text-gray-900">({entry.count})</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* AOV Trend */}
      <ChartCard title="Average Order Value Trend" subtitle="Weekly AOV — last 90 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.aovTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" tickFormatter={formatDateShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} width={60} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Line type="monotone" dataKey="aov" name="AOV" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top Regions by Revenue */}
      <ChartCard title="Revenue by Region" subtitle="Top provinces/states by revenue">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topRegions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="region" width={80} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Revenue by Country */}
      <ChartCard title="Revenue by Country" subtitle="Where your revenue comes from">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.revenueByCountry} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="country" width={50} tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#0b3d7a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Country breakdown table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-3 py-2 font-medium">Country</th>
                <th className="px-3 py-2 text-right font-medium">Orders</th>
                <th className="px-3 py-2 text-right font-medium">Revenue</th>
                <th className="px-3 py-2 text-right font-medium">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.revenueByCountry.map((c) => (
                <tr key={c.country} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2 font-medium text-gray-900">
                    {COUNTRY_FLAGS[c.country] ?? ""} {c.country}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-600">{c.orders}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatCurrency(c.revenue)}</td>
                  <td className="px-3 py-2 text-right text-gray-500">
                    {data.kpis.totalRevenue > 0 ? `${((c.revenue / data.kpis.totalRevenue) * 100).toFixed(1)}%` : "0%"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Abandoned Checkout Stats */}
      <ChartCard title="Checkout Funnel" subtitle="Completed vs abandoned checkouts">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
            <p className="text-2xl font-bold text-green-700">{data.abandonedStats.completed}</p>
            <p className="text-xs font-medium text-green-600">Completed</p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">{data.abandonedStats.pending}</p>
            <p className="text-xs font-medium text-amber-600">Pending (Unpaid)</p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-2xl font-bold text-red-700">{data.abandonedStats.cancelled}</p>
            <p className="text-xs font-medium text-red-600">Cancelled / Expired</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{data.abandonedStats.recoveryRate}%</p>
            <p className="text-xs font-medium text-blue-600">Completion Rate</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 rounded-full bg-gray-100 overflow-hidden flex">
              <div
                className="h-full bg-green-500 transition-all"
                style={{ width: `${data.abandonedStats.recoveryRate}%` }}
              />
              <div
                className="h-full bg-red-400 transition-all"
                style={{ width: `${100 - data.abandonedStats.recoveryRate}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 shrink-0">
            {formatCurrency(data.abandonedStats.revenueLost)} lost
          </p>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── Products Tab ────────────────────────────────────────────────────────────

function ProductsTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      {/* Top Products by Revenue */}
      <ChartCard title="Top Products by Revenue" subtitle="Best-selling products by total revenue">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProductsByRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#0b3d7a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Top Products by Quantity */}
      <ChartCard title="Top Products by Units Sold" subtitle="Most popular products by quantity">
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProductsByRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="qty" name="Units Sold" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Product Performance Table */}
      <ChartCard title="Product Performance" subtitle="Revenue and quantity breakdown">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50/50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Revenue</th>
                <th className="px-4 py-3 text-right font-medium">Units</th>
                <th className="px-4 py-3 text-right font-medium">Avg Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.topProductsByRevenue.map((p, i) => (
                <tr key={p.name} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">{i + 1}</span>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{p.fullName}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatCurrency(p.revenue)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{p.qty}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{formatCurrency(p.qty > 0 ? p.revenue / p.qty : 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── Customers Tab ───────────────────────────────────────────────────────────

function CustomersTab({ data }: { data: AnalyticsData }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard label="Total Customers" value={data.kpis.totalCustomers.toLocaleString()} sub="Registered accounts" icon={Users} color="text-indigo-600 bg-indigo-50" />
        <KPICard label="Total Orders" value={data.kpis.totalOrders.toLocaleString()} sub="All time" icon={ShoppingBag} color="text-blue-600 bg-blue-50" />
        <KPICard
          label="Orders / Customer"
          value={data.kpis.totalCustomers > 0 ? (data.kpis.totalOrders / data.kpis.totalCustomers).toFixed(1) : "0"}
          sub="Average"
          icon={CreditCard}
          color="text-amber-600 bg-amber-50"
        />
        <KPICard
          label="Revenue / Customer"
          value={data.kpis.totalCustomers > 0 ? formatCurrency(data.kpis.totalRevenue / data.kpis.totalCustomers) : "$0"}
          sub="Lifetime average"
          icon={DollarSign}
          color="text-emerald-600 bg-emerald-50"
        />
      </div>

      {/* Customer Acquisition */}
      <ChartCard title="Customer Acquisition" subtitle="New registered accounts by month">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.customerAcquisition}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={40} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="New Customers" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Cumulative Growth */}
      <ChartCard title="Customer Growth" subtitle="Cumulative registered accounts">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data.customerAcquisition.reduce<{ month: string; total: number }[]>((acc, item) => {
                const prev = acc.length > 0 ? acc[acc.length - 1].total : 0;
                acc.push({ month: item.month, total: prev + item.count });
                return acc;
              }, [])}
            >
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={50} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total" name="Total Customers" stroke="#6366f1" strokeWidth={2} fill="url(#custGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Regions */}
        <ChartCard title="Customers by Region" subtitle="Orders by province/state">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topRegions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="region" width={80} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="orders" name="Orders" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Revenue by Region */}
        <ChartCard title="Revenue by Region" subtitle="Revenue by province/state">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topRegions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="region" width={80} tick={{ fontSize: 11, fill: "#374151" }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{ fill: "#f9fafb" }} />
                <Bar dataKey="revenue" name="Revenue" fill="#0b3d7a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-[#0b3d7a]" />
        <span className="ml-3 text-gray-500">Loading analytics...</span>
      </div>
    );
  }

  if (!data) {
    return <p className="py-16 text-center text-gray-500">Failed to load analytics data.</p>;
  }

  return (
    <div>
      {/* Tab Navigation */}
      <div className="mb-6 flex gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-white text-[#0b3d7a] shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === "realtime" && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab data={data} />}
      {activeTab === "realtime" && <RealtimeTab />}
      {activeTab === "sales" && <SalesTab data={data} />}
      {activeTab === "products" && <ProductsTab data={data} />}
      {activeTab === "customers" && <CustomersTab data={data} />}
    </div>
  );
}

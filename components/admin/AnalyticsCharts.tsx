"use client";

import { useEffect, useState } from "react";
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
  Legend,
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
} from "lucide-react";

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
  };
  revenueTimeSeries: { date: string; revenue: number; orders: number }[];
  orderStatusBreakdown: { status: string; count: number }[];
  topProductsByRevenue: { name: string; fullName: string; revenue: number; qty: number }[];
  paymentBreakdown: { method: string; count: number }[];
  customerAcquisition: { month: string; count: number }[];
  aovTimeSeries: { week: string; aov: number; orders: number }[];
  topRegions: { region: string; orders: number; revenue: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  processing: "#3b82f6",
  shipped: "#8b5cf6",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#6b7280",
};

const CHART_COLORS = ["#0b3d7a", "#1a6de3", "#3b82f6", "#60a5fa", "#93c5fd", "#6366f1", "#8b5cf6", "#a78bfa", "#22c55e", "#f59e0b"];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
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

function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  change,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof DollarSign;
  color: string;
  change?: number;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              change >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
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

function ChartCard({ title, subtitle, children, className = "" }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
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

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<30 | 60 | 90>(30);

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

  const { kpis } = data;

  // Filter revenue time series by selected range
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - range);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const filteredRevenue = data.revenueTimeSeries.filter((d) => d.date >= cutoffStr);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Revenue (30d)"
          value={formatCurrency(kpis.last30Revenue)}
          sub="Last 30 days"
          icon={DollarSign}
          color="text-emerald-600 bg-emerald-50"
          change={kpis.revenueChange}
        />
        <KPICard
          label="Total Revenue"
          value={formatCurrency(kpis.totalRevenue)}
          sub="All time"
          icon={TrendingUp}
          color="text-green-600 bg-green-50"
        />
        <KPICard
          label="Orders (30d)"
          value={kpis.last30Orders.toLocaleString()}
          sub="Last 30 days"
          icon={ShoppingBag}
          color="text-blue-600 bg-blue-50"
        />
        <KPICard
          label="Avg Order Value"
          value={formatCurrency(kpis.avgOrderValue)}
          sub="All time"
          icon={Package}
          color="text-violet-600 bg-violet-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Total Orders"
          value={kpis.totalOrders.toLocaleString()}
          sub="All time (excl. pending)"
          icon={ShoppingBag}
          color="text-[#0b3d7a] bg-[#1a6de3]/10"
        />
        <KPICard
          label="Total Customers"
          value={kpis.totalCustomers.toLocaleString()}
          sub="Registered accounts"
          icon={Users}
          color="text-indigo-600 bg-indigo-50"
        />
        <KPICard
          label="Active Products"
          value={kpis.activeProducts.toLocaleString()}
          sub="In catalog"
          icon={Package}
          color="text-amber-600 bg-amber-50"
        />
        <KPICard
          label="Revenue / Order (30d)"
          value={kpis.last30Orders > 0 ? formatCurrency(kpis.last30Revenue / kpis.last30Orders) : "$0"}
          sub="Last 30 days avg"
          icon={kpis.revenueChange >= 0 ? TrendingUp : TrendingDown}
          color={kpis.revenueChange >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}
        />
      </div>

      {/* Revenue Chart */}
      <ChartCard
        title="Revenue Over Time"
        subtitle={`Daily revenue — last ${range} days`}
      >
        <div className="mb-4 flex gap-2">
          {([30, 60, 90] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r
                  ? "bg-[#0b3d7a] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredRevenue}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0b3d7a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0b3d7a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="#0b3d7a"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Orders Over Time */}
      <ChartCard title="Orders Over Time" subtitle={`Daily orders — last ${range} days`}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#1a6de3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Order Status Breakdown */}
        <ChartCard title="Order Status Breakdown" subtitle="All orders by status">
          <div className="flex items-center justify-center">
            <div className="h-64 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.orderStatusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                    label={(props) => `${props.name ?? ""} (${props.value})`}
                  >
                    {data.orderStatusBreakdown.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "#9ca3af"}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {data.orderStatusBreakdown.map((entry) => (
              <div key={entry.status} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[entry.status] ?? "#9ca3af" }}
                />
                <span className="capitalize">{entry.status}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Payment Method Breakdown */}
        <ChartCard title="Payment Methods" subtitle="How customers pay">
          <div className="flex items-center justify-center">
            <div className="h-64 w-full max-w-xs">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="method"
                    label={(props) => `${props.name ?? ""} (${props.value})`}
                  >
                    {data.paymentBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {data.paymentBreakdown.map((entry, i) => (
              <div key={entry.method} className="flex items-center gap-1.5 text-xs text-gray-600">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                />
                <span>{entry.method}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Top Products by Revenue */}
      <ChartCard title="Top Products by Revenue" subtitle="Best-selling products by total revenue">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.topProductsByRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: "#374151" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={<CustomTooltip formatter={formatCurrency} />}
                cursor={{ fill: "#f9fafb" }}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#0b3d7a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* AOV Trend */}
      <ChartCard title="Average Order Value Trend" subtitle="Weekly AOV — last 90 days">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.aovTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                tickFormatter={formatDateShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={(v) => `$${v}`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip formatter={formatCurrency} />} />
              <Line
                type="monotone"
                dataKey="aov"
                name="AOV"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Customer Acquisition */}
        <ChartCard title="Customer Acquisition" subtitle="New registered accounts by month">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.customerAcquisition}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  tickFormatter={formatMonthShort}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="New Customers" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Regions */}
        <ChartCard title="Top Regions" subtitle="Revenue by province/state">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topRegions} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${v}`}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="region"
                  width={80}
                  tick={{ fontSize: 11, fill: "#374151" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={<CustomTooltip formatter={formatCurrency} />}
                  cursor={{ fill: "#f9fafb" }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

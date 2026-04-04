import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();

  // Fetch all data in parallel — including pending orders for abandoned stats
  const [ordersRes, pendingOrdersRes, orderItemsRes, productsRes, customersRes] =
    await Promise.all([
      supabase
        .from("orders")
        .select("id, user_id, guest_email, status, total, subtotal, shipping_cost, tax, payment_method, shipping_country, shipping_province, created_at")
        .neq("status", "pending"),
      supabase
        .from("orders")
        .select("id, status, total, created_at")
        .eq("status", "pending"),
      supabase
        .from("order_items")
        .select("order_id, product_id, product_name, quantity, unit_price"),
      supabase
        .from("products")
        .select("id, name, category_id, stock_quantity, price, active, created_at")
        .eq("active", true),
      supabase
        .from("profiles")
        .select("id, created_at"),
    ]);

  const orders = ordersRes.data ?? [];
  const pendingOrders = pendingOrdersRes.data ?? [];
  const orderItems = orderItemsRes.data ?? [];
  const products = productsRes.data ?? [];
  const customers = customersRes.data ?? [];

  // --- Revenue over time (daily, last 90 days) ---
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const revenueByDay: Record<string, number> = {};
  const ordersByDay: Record<string, number> = {};

  for (let d = new Date(ninetyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    revenueByDay[key] = 0;
    ordersByDay[key] = 0;
  }

  const validStatuses = new Set(["processing", "shipped", "delivered"]);

  for (const order of orders) {
    const day = order.created_at.slice(0, 10);
    if (day in ordersByDay) {
      ordersByDay[day]++;
      if (validStatuses.has(order.status)) {
        revenueByDay[day] += order.total ?? 0;
      }
    }
  }

  const revenueTimeSeries = Object.entries(revenueByDay).map(([date, revenue]) => ({
    date,
    revenue: Math.round(revenue * 100) / 100,
    orders: ordersByDay[date] ?? 0,
  }));

  // --- Order status breakdown ---
  const statusCounts: Record<string, number> = {};
  for (const order of orders) {
    statusCounts[order.status] = (statusCounts[order.status] ?? 0) + 1;
  }
  const orderStatusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }));

  // --- Top products by revenue ---
  const productRevMap = new Map<string, { name: string; revenue: number; qty: number }>();
  for (const item of orderItems) {
    const existing = productRevMap.get(item.product_id);
    const itemRevenue = item.quantity * item.unit_price;
    if (existing) {
      existing.revenue += itemRevenue;
      existing.qty += item.quantity;
    } else {
      productRevMap.set(item.product_id, {
        name: item.product_name,
        revenue: itemRevenue,
        qty: item.quantity,
      });
    }
  }
  const topProductsByRevenue = Array.from(productRevMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)
    .map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "..." : p.name,
      fullName: p.name,
      revenue: Math.round(p.revenue * 100) / 100,
      qty: p.qty,
    }));

  // --- Payment method breakdown ---
  const paymentCounts: Record<string, number> = {};
  for (const order of orders) {
    const method = order.payment_method || "Unknown";
    paymentCounts[method] = (paymentCounts[method] ?? 0) + 1;
  }
  const paymentBreakdown = Object.entries(paymentCounts).map(([method, count]) => ({
    method: method.charAt(0).toUpperCase() + method.slice(1),
    count,
  }));

  // --- Customer acquisition over time (monthly) ---
  const customersByMonth: Record<string, number> = {};
  for (const customer of customers) {
    const month = customer.created_at.slice(0, 7); // YYYY-MM
    customersByMonth[month] = (customersByMonth[month] ?? 0) + 1;
  }
  const customerAcquisition = Object.entries(customersByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // --- Average order value over time (weekly, last 90 days) ---
  const weeklyAOV: Record<string, { total: number; count: number }> = {};
  for (const order of orders) {
    if (!validStatuses.has(order.status)) continue;
    const d = new Date(order.created_at);
    if (d < ninetyDaysAgo) continue;
    // Get Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d);
    monday.setDate(diff);
    const weekKey = monday.toISOString().slice(0, 10);
    if (!weeklyAOV[weekKey]) weeklyAOV[weekKey] = { total: 0, count: 0 };
    weeklyAOV[weekKey].total += order.total ?? 0;
    weeklyAOV[weekKey].count++;
  }
  const aovTimeSeries = Object.entries(weeklyAOV)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, data]) => ({
      week,
      aov: Math.round((data.total / data.count) * 100) / 100,
      orders: data.count,
    }));

  // --- Province/state breakdown (top regions) ---
  const regionCounts: Record<string, { count: number; revenue: number }> = {};
  for (const order of orders) {
    if (!validStatuses.has(order.status)) continue;
    const region = order.shipping_province || "Unknown";
    if (!regionCounts[region]) regionCounts[region] = { count: 0, revenue: 0 };
    regionCounts[region].count++;
    regionCounts[region].revenue += order.total ?? 0;
  }
  const topRegions = Object.entries(regionCounts)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10)
    .map(([region, data]) => ({
      region,
      orders: data.count,
      revenue: Math.round(data.revenue * 100) / 100,
    }));

  // --- Summary KPIs ---
  const completedOrders = orders.filter((o) => validStatuses.has(o.status));
  const totalRevenue = completedOrders.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders = completedOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const last30Revenue = completedOrders
    .filter((o) => new Date(o.created_at) >= thirtyDaysAgo)
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const last30Orders = completedOrders.filter(
    (o) => new Date(o.created_at) >= thirtyDaysAgo
  ).length;

  const prev30Start = new Date(thirtyDaysAgo);
  prev30Start.setDate(prev30Start.getDate() - 30);
  const prev30Revenue = completedOrders
    .filter((o) => {
      const d = new Date(o.created_at);
      return d >= prev30Start && d < thirtyDaysAgo;
    })
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const revenueChange =
    prev30Revenue > 0
      ? ((last30Revenue - prev30Revenue) / prev30Revenue) * 100
      : last30Revenue > 0
        ? 100
        : 0;

  // --- Conversion rate (completed checkouts / total checkout attempts) ---
  const totalCheckoutAttempts = orders.length + pendingOrders.length;
  const conversionRate = totalCheckoutAttempts > 0
    ? Math.round((completedOrders.length / totalCheckoutAttempts) * 1000) / 10
    : 0;

  // --- Repeat customer rate ---
  const customerOrderCounts = new Map<string, number>();
  for (const order of completedOrders) {
    const key = order.user_id || order.guest_email || order.id;
    customerOrderCounts.set(key, (customerOrderCounts.get(key) ?? 0) + 1);
  }
  const uniqueBuyers = customerOrderCounts.size;
  const repeatBuyers = Array.from(customerOrderCounts.values()).filter((c) => c > 1).length;
  const repeatCustomerRate = uniqueBuyers > 0
    ? Math.round((repeatBuyers / uniqueBuyers) * 1000) / 10
    : 0;

  // --- Revenue by country ---
  const countryCounts: Record<string, { orders: number; revenue: number }> = {};
  for (const order of completedOrders) {
    const country = order.shipping_country || "Unknown";
    if (!countryCounts[country]) countryCounts[country] = { orders: 0, revenue: 0 };
    countryCounts[country].orders++;
    countryCounts[country].revenue += order.total ?? 0;
  }
  const revenueByCountry = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 15)
    .map(([country, data]) => ({
      country,
      orders: data.orders,
      revenue: Math.round(data.revenue * 100) / 100,
    }));

  // --- Abandoned checkout stats ---
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");
  const abandonedTotal = pendingOrders.length + cancelledOrders.length;
  const abandonedRevenueLost = [...pendingOrders, ...cancelledOrders]
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const abandonedStats = {
    pending: pendingOrders.length,
    cancelled: cancelledOrders.length,
    total: abandonedTotal,
    completed: completedOrders.length,
    revenueLost: Math.round(abandonedRevenueLost * 100) / 100,
    recoveryRate: totalCheckoutAttempts > 0
      ? Math.round((completedOrders.length / totalCheckoutAttempts) * 1000) / 10
      : 0,
  };

  return NextResponse.json({
    kpis: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      avgOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: customers.length,
      activeProducts: products.length,
      last30Revenue: Math.round(last30Revenue * 100) / 100,
      last30Orders,
      revenueChange: Math.round(revenueChange * 10) / 10,
      conversionRate,
      repeatCustomerRate,
      uniqueBuyers,
      repeatBuyers,
    },
    revenueTimeSeries,
    orderStatusBreakdown,
    topProductsByRevenue,
    paymentBreakdown,
    customerAcquisition,
    aovTimeSeries,
    topRegions,
    revenueByCountry,
    abandonedStats,
  });
}

import {
  format,
  subDays,
  startOfDay,
  isSameDay,
  parseISO,
} from "date-fns";
import type {
  CategoryStock,
  KpiMetrics,
  OrderRow,
  RevenuePoint,
  TodayYesterdayStats,
} from "@/types/order";
import { pctChange } from "./format";

function uniqueOrderCount(orders: OrderRow[]): number {
  return new Set(orders.map((o) => o.id)).size;
}

function sumAmount(orders: OrderRow[]): number {
  return orders.reduce((acc, o) => acc + o.amount, 0);
}

function sumQty(orders: OrderRow[]): number {
  return orders.reduce((acc, o) => acc + o.qty, 0);
}

function filterByDay(orders: OrderRow[], day: Date): OrderRow[] {
  const target = startOfDay(day);
  return orders.filter((o) => isSameDay(startOfDay(o.date), target));
}

export function computeKpis(orders: OrderRow[]): KpiMetrics {
  const totalRevenue = sumAmount(orders);
  const totalOrders = uniqueOrderCount(orders);
  const totalUnits = sumQty(orders);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const sortedDates = [...new Set(orders.map((o) => startOfDay(o.date).getTime()))]
    .sort((a, b) => b - a)
    .map((t) => new Date(t));

  const latest = sortedDates[0];
  const previous = sortedDates[1];

  const latestOrders = latest ? filterByDay(orders, latest) : [];
  const prevOrders = previous ? filterByDay(orders, previous) : [];

  return {
    totalRevenue,
    totalOrders,
    totalUnits,
    avgOrderValue,
    revenueChangePct: pctChange(sumAmount(latestOrders), sumAmount(prevOrders)),
    ordersChangePct: pctChange(
      uniqueOrderCount(latestOrders),
      uniqueOrderCount(prevOrders),
    ),
  };
}

export function computeTodayYesterday(orders: OrderRow[]): TodayYesterdayStats {
  const sortedDates = [...new Set(orders.map((o) => startOfDay(o.date).getTime()))]
    .sort((a, b) => b - a)
    .map((t) => new Date(t));

  const referenceDate = sortedDates[0] ?? new Date();
  const yesterdayDate = subDays(referenceDate, 1);

  const todayOrders = filterByDay(orders, referenceDate);
  const yesterdayOrders = filterByDay(orders, yesterdayDate);

  return {
    referenceDate,
    today: {
      label: "Today",
      revenue: sumAmount(todayOrders),
      orders: uniqueOrderCount(todayOrders),
      units: sumQty(todayOrders),
    },
    yesterday: {
      label: "Yesterday",
      revenue: sumAmount(yesterdayOrders),
      orders: uniqueOrderCount(yesterdayOrders),
      units: sumQty(yesterdayOrders),
    },
  };
}

export function computeRevenueSeries(orders: OrderRow[]): RevenuePoint[] {
  const byDate = new Map<string, number>();

  for (const order of orders) {
    const key = format(startOfDay(order.date), "yyyy-MM-dd");
    byDate.set(key, (byDate.get(key) ?? 0) + order.amount);
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, revenue]) => ({
      date,
      revenue,
      label: format(parseISO(date), "MMM d"),
    }));
}

export function computeCategoryStock(orders: OrderRow[]): CategoryStock[] {
  const byCategory = new Map<string, { units: number; revenue: number }>();

  for (const order of orders) {
    const existing = byCategory.get(order.category) ?? { units: 0, revenue: 0 };
    existing.units += order.qty;
    existing.revenue += order.amount;
    byCategory.set(order.category, existing);
  }

  return [...byCategory.entries()]
    .map(([category, data]) => ({ category, ...data }))
    .sort((a, b) => b.units - a.units);
}

import {
  format,
  startOfDay,
  isSameDay,
  parseISO,
} from "date-fns";
import type {
  CategoryStock,
  DayComparison,
  KpiMetrics,
  OrderRow,
  RevenuePoint,
  TodayYesterdayStats,
} from "@/types/order";
import { pctChange } from "./format";

function uniqueOrderCount(orders: OrderRow[]): number {
  return new Set(orders.map((o) => o.id)).size;
}

function uniqueCustomerCount(orders: OrderRow[]): number {
  return new Set(orders.map((o) => o.customer)).size;
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

function getSortedOrderDates(orders: OrderRow[]): Date[] {
  return [...new Set(orders.map((o) => startOfDay(o.date).getTime()))]
    .sort((a, b) => b - a)
    .map((t) => new Date(t));
}

/** Derive traffic-style metrics from order rows for a single day. */
function computeDayMetrics(dayOrders: OrderRow[]): Omit<DayComparison, "label"> {
  const newOrders = uniqueOrderCount(dayOrders);
  const newUsers = uniqueCustomerCount(dayOrders);
  const revenue = sumAmount(dayOrders);
  const units = sumQty(dayOrders);

  const visits = Math.max(
    newOrders,
    Math.round(newOrders * 5.5 + newUsers * 2.8 + units * 0.4),
  );

  const bounceRate =
    visits > 0
      ? Number((((visits - newOrders) / visits) * 100).toFixed(1))
      : 38.5;

  return {
    visits,
    newUsers,
    newOrders,
    bounceRate,
    revenue,
    units,
  };
}

function buildDayComparison(
  label: string,
  dayOrders: OrderRow[],
): DayComparison {
  return {
    label,
    ...computeDayMetrics(dayOrders),
  };
}

export function computeKpis(orders: OrderRow[]): KpiMetrics {
  const totalSales = sumAmount(orders);
  const { today, yesterday } = computeTodayYesterday(orders);

  return {
    visitsToday: today.visits,
    newUsers: today.newUsers,
    newOrders: today.newOrders,
    totalSales,
    visitsChangePct: pctChange(today.visits, yesterday.visits),
    newUsersChangePct: pctChange(today.newUsers, yesterday.newUsers),
    newOrdersChangePct: pctChange(today.newOrders, yesterday.newOrders),
    salesChangePct: pctChange(today.revenue, yesterday.revenue),
  };
}

export function computeTodayYesterday(orders: OrderRow[]): TodayYesterdayStats {
  const sortedDates = getSortedOrderDates(orders);
  const referenceDate = sortedDates[0] ?? new Date();
  const comparisonDate = sortedDates[1] ?? sortedDates[0] ?? new Date();

  const todayOrders = filterByDay(orders, referenceDate);
  const yesterdayOrders = filterByDay(orders, comparisonDate);

  return {
    referenceDate,
    comparisonDate,
    today: buildDayComparison("Today", todayOrders),
    yesterday: buildDayComparison("Yesterday", yesterdayOrders),
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

export type OrderStatus =
  | "Shipped"
  | "Delivered"
  | "Pending"
  | "Cancelled"
  | string;

export type SalesChannel = "Web" | "Mobile App" | "In-Store" | string;

export interface OrderRow {
  id: string;
  date: Date;
  customer: string;
  category: string;
  qty: number;
  unitPrice: number;
  amount: number;
  channel: SalesChannel;
  status: OrderStatus;
}

export interface ParseResult {
  success: true;
  orders: OrderRow[];
  rowCount: number;
  fileName: string;
}

export interface ParseError {
  success: false;
  message: string;
}

export type ParseOutcome = ParseResult | ParseError;

export interface KpiMetrics {
  visitsToday: number;
  newUsers: number;
  newOrders: number;
  totalSales: number;
  visitsChangePct: number;
  newUsersChangePct: number;
  newOrdersChangePct: number;
  salesChangePct: number;
}

export interface DayComparison {
  label: string;
  visits: number;
  newUsers: number;
  newOrders: number;
  bounceRate: number;
  revenue: number;
  units: number;
}

export interface TodayYesterdayStats {
  today: DayComparison;
  yesterday: DayComparison;
  referenceDate: Date;
  comparisonDate: Date;
}

export interface RevenuePoint {
  date: string;
  revenue: number;
  label: string;
}

export interface CategoryStock {
  category: string;
  units: number;
  revenue: number;
}

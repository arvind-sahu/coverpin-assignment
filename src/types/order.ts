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
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  avgOrderValue: number;
  revenueChangePct: number;
  ordersChangePct: number;
}

export interface DayComparison {
  label: string;
  revenue: number;
  orders: number;
  units: number;
}

export interface TodayYesterdayStats {
  today: DayComparison;
  yesterday: DayComparison;
  referenceDate: Date;
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

"use client";

import { useMemo } from "react";
import { useOrders } from "@/context/OrdersContext";
import {
  computeCategoryStock,
  computeKpis,
  computeRevenueSeries,
  computeTodayYesterday,
} from "@/lib/analytics";
import { KpiCards } from "./KpiCards";
import { TodayYesterdayStatsPanel } from "./TodayYesterdayStats";
import { RevenueChart } from "./RevenueChart";
import { ProductStockChart } from "./ProductStockChart";
import { OrderListTable } from "./OrderListTable";

export function DashboardTab() {
  const { orders, isSampleData, fileName, resetToSampleData } = useOrders();

  const kpis = useMemo(() => computeKpis(orders), [orders]);
  const todayYesterday = useMemo(() => computeTodayYesterday(orders), [orders]);
  const revenueSeries = useMemo(() => computeRevenueSeries(orders), [orders]);
  const categoryStock = useMemo(() => computeCategoryStock(orders), [orders]);

  return (
    <div className="space-y-6">
      {isSampleData && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Showing sample data. Upload an Excel file on the Upload tab to replace
          it with your own orders.
        </div>
      )}
      {!isSampleData && fileName && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <div>
            Dashboard reflects data from <strong>{fileName}</strong> ({orders.length}{" "}
            rows).
          </div>
          <button
            onClick={resetToSampleData}
            className="self-start sm:self-auto rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-200 transition-colors cursor-pointer"
          >
            Reset to Sample Data
          </button>
        </div>
      )}

      <KpiCards metrics={kpis} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TodayYesterdayStatsPanel stats={todayYesterday} />
        <RevenueChart data={revenueSeries} />
      </div>

      <ProductStockChart data={categoryStock} />

      <OrderListTable orders={orders} />
    </div>
  );
}

"use client";

import type { TodayYesterdayStats } from "@/types/order";
import { formatCurrency, formatDisplayDate, formatNumber, pctChange } from "@/lib/format";

interface TodayYesterdayStatsProps {
  stats: TodayYesterdayStats;
}

interface StatRowProps {
  label: string;
  todayValue: number;
  yesterdayValue: number;
  format: (n: number) => string;
}

function StatRow({ label, todayValue, yesterdayValue, format }: StatRowProps) {
  const change = pctChange(todayValue, yesterdayValue);
  const max = Math.max(todayValue, yesterdayValue, 1);
  const todayPct = (todayValue / max) * 100;
  const yesterdayPct = (yesterdayValue / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span
          className={`text-xs font-semibold ${
            change >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {change >= 0 ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-slate-500">Today</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${todayPct}%` }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-xs font-medium text-slate-700">
            {format(todayValue)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-slate-500">Yesterday</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-300 transition-all"
              style={{ width: `${yesterdayPct}%` }}
            />
          </div>
          <span className="w-20 shrink-0 text-right text-xs font-medium text-slate-500">
            {format(yesterdayValue)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TodayYesterdayStatsPanel({ stats }: TodayYesterdayStatsProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Statistics</h3>
          <p className="text-xs text-slate-500">
            Today vs yesterday · ref. {formatDisplayDate(stats.referenceDate)}
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <StatRow
          label="Income"
          todayValue={stats.today.revenue}
          yesterdayValue={stats.yesterday.revenue}
          format={formatCurrency}
        />
        <StatRow
          label="Orders"
          todayValue={stats.today.orders}
          yesterdayValue={stats.yesterday.orders}
          format={formatNumber}
        />
        <StatRow
          label="Products Sold"
          todayValue={stats.today.units}
          yesterdayValue={stats.yesterday.units}
          format={formatNumber}
        />
      </div>
    </div>
  );
}

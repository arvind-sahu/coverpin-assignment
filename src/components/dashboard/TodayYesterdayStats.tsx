"use client";

import type { TodayYesterdayStats } from "@/types/order";
import {
  formatCurrency,
  formatDisplayDate,
  formatNumber,
  pctChange,
} from "@/lib/format";

interface TodayYesterdayStatsProps {
  stats: TodayYesterdayStats;
}

export function TodayYesterdayStatsPanel({ stats }: TodayYesterdayStatsProps) {
  const metrics = [
    {
      name: "New Orders",
      today: stats.today.newOrders,
      yesterday: stats.yesterday.newOrders,
      value: formatNumber(stats.today.newOrders),
      sublabel: "today",
      change: pctChange(stats.today.newOrders, stats.yesterday.newOrders),
      lowerIsBetter: false,
    },
    {
      name: "Visits",
      today: stats.today.visits,
      yesterday: stats.yesterday.visits,
      value: formatNumber(stats.today.visits),
      sublabel: "today",
      change: pctChange(stats.today.visits, stats.yesterday.visits),
      lowerIsBetter: false,
    },
    {
      name: "Bounce Rate",
      today: stats.today.bounceRate,
      yesterday: stats.yesterday.bounceRate,
      value: `${stats.today.bounceRate.toFixed(1)}%`,
      sublabel: "Minimum",
      change: pctChange(stats.today.bounceRate, stats.yesterday.bounceRate),
      lowerIsBetter: true,
    },
    {
      name: "New Users",
      today: stats.today.newUsers,
      yesterday: stats.yesterday.newUsers,
      value: formatNumber(stats.today.newUsers),
      sublabel: "today",
      change: pctChange(stats.today.newUsers, stats.yesterday.newUsers),
      lowerIsBetter: false,
    },
    {
      name: "Revenue",
      today: stats.today.revenue,
      yesterday: stats.yesterday.revenue,
      value: formatCurrency(stats.today.revenue),
      sublabel: "today",
      change: pctChange(stats.today.revenue, stats.yesterday.revenue),
      lowerIsBetter: false,
    },
    {
      name: "Units Sold",
      today: stats.today.units,
      yesterday: stats.yesterday.units,
      value: formatNumber(stats.today.units),
      sublabel: "today",
      change: pctChange(stats.today.units, stats.yesterday.units),
      lowerIsBetter: false,
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between h-full min-h-[380px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Statistics</h3>
        <p className="text-xs text-slate-500">
          Today: {formatDisplayDate(stats.referenceDate)} · Yesterday:{" "}
          {formatDisplayDate(stats.comparisonDate)}
        </p>
      </div>

      {/* Chart and Labels Area */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
        <div className="flex justify-between items-end min-w-[500px] h-56 pt-4">
          {metrics.map((item) => {
            const maxVal = Math.max(item.today, item.yesterday, 1);
            const todayHeight = (item.today / maxVal) * 100;
            const yesterdayHeight = (item.yesterday / maxVal) * 100;

            // Determine if the change is an improvement
            const isImprovement = item.lowerIsBetter
              ? item.change < 0
              : item.change > 0;
            const hasChange = item.change !== 0;
            const isIncrease = item.change > 0;

            return (
              <div
                key={item.name}
                className="flex flex-col items-center justify-end h-full flex-1 px-1"
              >
                {/* Vertical Bars */}
                <div className="flex items-end gap-[3px] h-28 w-full justify-center">
                  {/* Today Bar (Teal/Green) */}
                  <div
                    className="w-2.5 bg-teal-600 transition-all duration-500 ease-out"
                    style={{
                      height: `${todayHeight}%`,
                      minHeight: item.today > 0 ? "4px" : "0px",
                    }}
                    title={`Today: ${item.value}`}
                  />
                  {/* Yesterday Bar (Blue) */}
                  <div
                    className="w-2.5 bg-blue-600 transition-all duration-500 ease-out"
                    style={{
                      height: `${yesterdayHeight}%`,
                      minHeight: item.yesterday > 0 ? "4px" : "0px",
                    }}
                    title={`Yesterday: ${
                      item.name === "Revenue"
                        ? formatCurrency(item.yesterday)
                        : item.name === "Bounce Rate"
                        ? `${item.yesterday.toFixed(1)}%`
                        : formatNumber(item.yesterday)
                    }`}
                  />
                </div>

                {/* Labels */}
                <div className="mt-4 flex flex-col items-center text-center">
                  <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {item.sublabel}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-slate-900">
                      {item.value}
                    </span>
                    {hasChange && (
                      <span
                        className={`text-[9px] font-bold ${
                          isImprovement ? "text-emerald-500" : "text-red-500"
                        }`}
                        title={`${item.change.toFixed(1)}%`}
                      >
                        {isIncrease ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

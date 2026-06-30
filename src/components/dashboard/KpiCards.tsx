"use client";

import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import type { KpiMetrics } from "@/types/order";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface KpiCardsProps {
  metrics: KpiMetrics;
}

const CARDS = [
  {
    key: "totalRevenue" as const,
    label: "Total Revenue",
    icon: DollarSign,
    iconBg: "bg-emerald-100 text-emerald-600",
    format: formatCurrency,
    changeKey: "revenueChangePct" as const,
  },
  {
    key: "totalOrders" as const,
    label: "Total Orders",
    icon: ShoppingCart,
    iconBg: "bg-blue-100 text-blue-600",
    format: formatNumber,
    changeKey: "ordersChangePct" as const,
  },
  {
    key: "totalUnits" as const,
    label: "Products Sold",
    icon: Package,
    iconBg: "bg-violet-100 text-violet-600",
    format: formatNumber,
    changeKey: null,
  },
  {
    key: "avgOrderValue" as const,
    label: "Avg Order Value",
    icon: TrendingUp,
    iconBg: "bg-amber-100 text-amber-600",
    format: formatCurrency,
    changeKey: null,
  },
];

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        const change = card.changeKey ? metrics[card.changeKey] : null;

        return (
          <div
            key={card.key}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {card.format(value)}
                </p>
                {change !== null && (
                  <p
                    className={`mt-1 text-xs font-medium ${
                      change >= 0 ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {formatPercent(change)} vs prior day
                  </p>
                )}
              </div>
              <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

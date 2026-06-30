"use client";

import {
  DollarSign,
  Eye,
  ShoppingCart,
  UserPlus,
} from "lucide-react";
import type { KpiMetrics } from "@/types/order";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

interface KpiCardsProps {
  metrics: KpiMetrics;
}

const CARDS = [
  {
    key: "visitsToday" as const,
    label: "Visits Today",
    description: "Estimated site sessions",
    icon: Eye,
    accent: "from-sky-500 to-blue-600",
    iconBg: "bg-sky-100 text-sky-600",
    format: formatNumber,
    changeKey: "visitsChangePct" as const,
  },
  {
    key: "newUsers" as const,
    label: "New Users",
    description: "Unique customers today",
    icon: UserPlus,
    accent: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-100 text-violet-600",
    format: formatNumber,
    changeKey: "newUsersChangePct" as const,
  },
  {
    key: "newOrders" as const,
    label: "New Orders",
    description: "Orders placed today",
    icon: ShoppingCart,
    accent: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-100 text-emerald-600",
    format: formatNumber,
    changeKey: "newOrdersChangePct" as const,
  },
  {
    key: "totalSales" as const,
    label: "Total Sales",
    description: "Sum of all order amounts",
    icon: DollarSign,
    accent: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-100 text-amber-600",
    format: formatCurrency,
    changeKey: "salesChangePct" as const,
  },
];

export function KpiCards({ metrics }: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = metrics[card.key];
        const change = metrics[card.changeKey];
        const isPositive = change >= 0;

        return (
          <div
            key={card.key}
            className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.accent}`}
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {card.format(value)}
                </p>
                <p className="mt-1 text-xs text-slate-400">{card.description}</p>
                <p
                  className={`mt-3 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {formatPercent(change)} vs yesterday
                </p>
              </div>
              <div className={`shrink-0 rounded-xl p-3 ${card.iconBg}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

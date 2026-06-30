"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { CategoryStock } from "@/types/order";
import { formatNumber } from "@/lib/format";

interface ProductStockChartProps {
  data: CategoryStock[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"];

export function ProductStockChart({ data }: ProductStockChartProps) {
  const totalUnits = data.reduce((sum, item) => sum + item.units, 0);

  const chartData = data.map((item) => ({
    name: item.category,
    units: item.units,
    share: totalUnits > 0 ? (item.units / totalUnits) * 100 : 0,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-900">Product Stock</h3>
        <p className="text-xs text-slate-500">Units sold by category</p>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="units"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={95}
              paddingAngle={2}
              label={({ name, percent }) =>
                (percent ?? 0) >= 0.08
                  ? `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  : ""
              }
              labelLine={false}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => {
                const share = item?.payload?.share ?? 0;
                return [
                  `${formatNumber(Number(value))} units (${share.toFixed(1)}%)`,
                  item?.payload?.name ?? "Category",
                ];
              }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-xs text-slate-600">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

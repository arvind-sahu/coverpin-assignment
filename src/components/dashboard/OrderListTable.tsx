"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { format } from "date-fns";
import type { OrderRow } from "@/types/order";
import { formatCurrencyDetailed } from "@/lib/format";

interface OrderListTableProps {
  orders: OrderRow[];
}

const PAGE_SIZE = 8;

const STATUS_STYLES: Record<string, string> = {
  Shipped: "bg-blue-600 text-white",
  Delivered: "bg-emerald-600 text-white",
  Pending: "bg-amber-500 text-white",
  Cancelled: "bg-red-600 text-white",
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "bg-slate-500 text-white";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${style}`}
    >
      {status}
    </span>
  );
}

export function OrderListTable({ orders }: OrderListTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customer.toLowerCase().includes(q) ||
        o.category.toLowerCase().includes(q) ||
        o.channel.toLowerCase().includes(q) ||
        o.status.toLowerCase().includes(q),
    );
  }, [orders, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageOrders = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Order List</h3>
          <p className="text-xs text-slate-500">{filtered.length} orders</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Search orders…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3">Order ID</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3 text-right">Qty</th>
              <th className="px-5 py-3 text-right">Amount</th>
              <th className="px-5 py-3">Channel</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pageOrders.map((order) => (
              <tr key={`${order.id}-${order.date.toISOString()}-${order.category}`} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 font-medium text-slate-900">#{order.id}</td>
                <td className="px-5 py-3 text-slate-600">
                  {format(order.date, "MMM d, yyyy")}
                </td>
                <td className="px-5 py-3 text-slate-600">{order.customer}</td>
                <td className="px-5 py-3 text-slate-600">{order.category}</td>
                <td className="px-5 py-3 text-right text-slate-600">{order.qty}</td>
                <td className="px-5 py-3 text-right font-medium text-slate-900">
                  {formatCurrencyDetailed(order.amount)}
                </td>
                <td className="px-5 py-3 text-slate-600">{order.channel}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
            {pageOrders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                  No orders match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
          <p className="text-xs text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

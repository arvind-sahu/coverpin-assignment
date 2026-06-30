"use client";

import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { OrdersProvider } from "@/context/OrdersContext";
import { TabNav, type TabId } from "@/components/TabNav";
import { DashboardTab } from "@/components/dashboard/DashboardTab";
import { UploadTab } from "@/components/upload/UploadTab";

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                Order Analytics
              </h1>
              <p className="text-xs text-slate-500">Sales dashboard</p>
            </div>
          </div>
          <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === "dashboard" ? <DashboardTab /> : <UploadTab />}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <OrdersProvider>
      <AppShell />
    </OrdersProvider>
  );
}

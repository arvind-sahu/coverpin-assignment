"use client";

import { OrdersProvider } from "@/context/OrdersContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <OrdersProvider>{children}</OrdersProvider>;
}

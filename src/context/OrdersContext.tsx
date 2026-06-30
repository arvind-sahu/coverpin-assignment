"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { OrderRow } from "@/types/order";
import { parseExcelFile } from "@/lib/parseExcel";
import { SAMPLE_ORDERS } from "@/lib/sampleData";

export type UploadStatus = "idle" | "loading" | "success" | "error";

interface OrdersContextValue {
  orders: OrderRow[];
  fileName: string | null;
  isSampleData: boolean;
  uploadStatus: UploadStatus;
  uploadMessage: string | null;
  uploadFile: (file: File) => Promise<void>;
  resetUploadStatus: () => void;
  resetToSampleData: () => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRow[]>(SAMPLE_ORDERS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Load initial data from localStorage on client-side mount
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem("orders");
      const storedFileName = localStorage.getItem("fileName");
      const storedIsSampleData = localStorage.getItem("isSampleData");

      if (storedOrders && storedIsSampleData === "false") {
        const parsed = JSON.parse(storedOrders) as (Omit<OrderRow, "date"> & {
          date: string;
        })[];
        const ordersWithDates = parsed.map((o) => ({
          ...o,
          date: new Date(o.date),
        }));
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrders(ordersWithDates);
        setFileName(storedFileName);
        setIsSampleData(false);
      }
    } catch (e) {
      console.error("Failed to load orders from localStorage on mount:", e);
    }
  }, []);

  // Synchronize state across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "orders" || e.key === "fileName" || e.key === "isSampleData") {
        try {
          const storedOrders = localStorage.getItem("orders");
          const storedFileName = localStorage.getItem("fileName");
          const storedIsSampleData = localStorage.getItem("isSampleData");

          if (storedOrders && storedIsSampleData === "false") {
            const parsed = JSON.parse(storedOrders) as (Omit<OrderRow, "date"> & {
              date: string;
            })[];
            const ordersWithDates = parsed.map((o) => ({
              ...o,
              date: new Date(o.date),
            }));
            setOrders(ordersWithDates);
            setFileName(storedFileName);
            setIsSampleData(false);
          } else {
            setOrders(SAMPLE_ORDERS);
            setFileName(null);
            setIsSampleData(true);
          }
        } catch (err) {
          console.error("Failed to synchronize orders across tabs:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const uploadFile = useCallback(async (file: File) => {
    setUploadStatus("loading");
    setUploadMessage(null);

    // Yield to the UI so the loading state renders before parsing
    await new Promise((resolve) => setTimeout(resolve, 0));

    const result = await parseExcelFile(file);

    if (!result.success) {
      setUploadStatus("error");
      setUploadMessage(result.message);
      return;
    }

    setOrders(result.orders);
    setFileName(result.fileName);
    setIsSampleData(false);
    setUploadStatus("success");
    setUploadMessage(
      `Successfully loaded ${result.rowCount} order line${result.rowCount === 1 ? "" : "s"} from "${result.fileName}".`,
    );

    // Persist to localStorage
    try {
      localStorage.setItem("orders", JSON.stringify(result.orders));
      localStorage.setItem("fileName", result.fileName);
      localStorage.setItem("isSampleData", "false");
    } catch (e) {
      console.error("Failed to save orders to localStorage:", e);
    }
  }, []);

  const resetUploadStatus = useCallback(() => {
    setUploadStatus("idle");
    setUploadMessage(null);
  }, []);

  const resetToSampleData = useCallback(() => {
    setOrders(SAMPLE_ORDERS);
    setFileName(null);
    setIsSampleData(true);
    setUploadStatus("idle");
    setUploadMessage(null);

    try {
      localStorage.removeItem("orders");
      localStorage.removeItem("fileName");
      localStorage.removeItem("isSampleData");
    } catch (e) {
      console.error("Failed to clear orders from localStorage:", e);
    }
  }, []);

  const value = useMemo(
    () => ({
      orders,
      fileName,
      isSampleData,
      uploadStatus,
      uploadMessage,
      uploadFile,
      resetUploadStatus,
      resetToSampleData,
    }),
    [
      orders,
      fileName,
      isSampleData,
      uploadStatus,
      uploadMessage,
      uploadFile,
      resetUploadStatus,
      resetToSampleData,
    ],
  );

  return (
    <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return ctx;
}

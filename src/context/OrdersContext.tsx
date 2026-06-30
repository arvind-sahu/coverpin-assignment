"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
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
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<OrderRow[]>(SAMPLE_ORDERS);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSampleData, setIsSampleData] = useState(true);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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
  }, []);

  const resetUploadStatus = useCallback(() => {
    setUploadStatus("idle");
    setUploadMessage(null);
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
    }),
    [
      orders,
      fileName,
      isSampleData,
      uploadStatus,
      uploadMessage,
      uploadFile,
      resetUploadStatus,
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

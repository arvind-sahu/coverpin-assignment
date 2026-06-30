"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { useOrders } from "@/context/OrdersContext";

export function UploadTab() {
  const { uploadFile, uploadStatus, uploadMessage, resetUploadStatus } =
    useOrders();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      resetUploadStatus();
      await uploadFile(file);
    },
    [uploadFile, resetUploadStatus],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      void handleFile(file);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload Excel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload an <strong>.xlsx</strong> file with order data. The dashboard
          updates immediately — no page reload.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50"
            : "border-slate-300 bg-white hover:border-blue-300 hover:bg-slate-50"
        } ${uploadStatus === "loading" ? "pointer-events-none opacity-70" : ""}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          {uploadStatus === "loading" ? (
            <Loader2 className="h-7 w-7 animate-spin" />
          ) : (
            <Upload className="h-7 w-7" />
          )}
        </div>

        <p className="text-base font-medium text-slate-900">
          {uploadStatus === "loading"
            ? "Parsing your file…"
            : "Drag & drop your Excel file here"}
        </p>
        <p className="mt-1 text-sm text-slate-500">or click to browse</p>
        <p className="mt-4 text-xs text-slate-400">.xlsx only · up to 2,000 rows</p>
      </div>

      {uploadStatus === "success" && uploadMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Upload successful</p>
            <p className="mt-0.5 whitespace-pre-line">{uploadMessage}</p>
            <p className="mt-2 text-emerald-700">
              Switch to the Dashboard tab to see updated analytics.
            </p>
          </div>
        </div>
      )}

      {uploadStatus === "error" && uploadMessage && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Upload failed</p>
            <p className="mt-0.5 whitespace-pre-line">{uploadMessage}</p>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Expected file format</h3>
        </div>
        <p className="mb-3 text-sm text-slate-600">
          One row per order line, with a header row. Required columns:
        </p>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-3 py-2">id</th>
                <th className="px-3 py-2">date</th>
                <th className="px-3 py-2">customer</th>
                <th className="px-3 py-2">category</th>
                <th className="px-3 py-2">qty</th>
                <th className="px-3 py-2">u.price</th>
                <th className="px-3 py-2">amount</th>
                <th className="px-3 py-2">channel</th>
                <th className="px-3 py-2">status</th>
              </tr>
            </thead>
            <tbody className="text-slate-500">
              <tr className="border-t border-slate-100">
                <td className="px-3 py-2">1001</td>
                <td className="px-3 py-2">2024-03-09</td>
                <td className="px-3 py-2">Ruby Curd</td>
                <td className="px-3 py-2">Mobiles</td>
                <td className="px-3 py-2">2</td>
                <td className="px-3 py-2">900</td>
                <td className="px-3 py-2">1800</td>
                <td className="px-3 py-2">Web</td>
                <td className="px-3 py-2">Shipped</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Column names are flexible (e.g. &quot;quantity&quot; for qty). Optional
          columns default to sensible values when missing.{" "}
          <a
            href="/sample-orders.xlsx"
            download
            className="font-medium text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Download sample .xlsx
          </a>
        </p>
      </div>
    </div>
  );
}

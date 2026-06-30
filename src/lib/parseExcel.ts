import * as XLSX from "xlsx";
import type { OrderRow, ParseOutcome } from "@/types/order";
import {
  getMissingRequiredFields,
  mapHeaders,
  type CanonicalField,
} from "./columnMapping";

const ACCEPTED_EXTENSIONS = [".xlsx"];
const MAX_ROWS = 2500;

function isXlsxFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date && !isNaN(value.getTime())) return value;

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) {
      return new Date(parsed.y, parsed.m - 1, parsed.d);
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && !isNaN(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[$,\s]/g, "");
    const num = Number(cleaned);
    if (!isNaN(num)) return num;
  }
  return null;
}

function cellValue(row: unknown[], index: number | undefined): unknown {
  if (index === undefined) return undefined;
  return row[index];
}

function parseRow(
  row: unknown[],
  mapping: Map<CanonicalField, number>,
  rowIndex: number,
): OrderRow | string {
  const id = String(cellValue(row, mapping.get("id")) ?? "").trim();
  const dateRaw = cellValue(row, mapping.get("date"));
  const category = String(cellValue(row, mapping.get("category")) ?? "").trim();
  const qty = parseNumber(cellValue(row, mapping.get("qty")));
  const amount = parseNumber(cellValue(row, mapping.get("amount")));

  if (!id && !category && qty === null && amount === null) {
    return "skip";
  }

  if (!id) return `Row ${rowIndex + 2}: missing order id.`;
  const date = parseDate(dateRaw);
  if (!date) return `Row ${rowIndex + 2}: invalid or missing date.`;
  if (!category) return `Row ${rowIndex + 2}: missing category.`;
  if (qty === null || qty < 0) return `Row ${rowIndex + 2}: invalid quantity.`;
  if (amount === null || amount < 0) return `Row ${rowIndex + 2}: invalid amount.`;

  const customerRaw = cellValue(row, mapping.get("customer"));
  const unitPriceRaw = cellValue(row, mapping.get("unitPrice"));
  const channelRaw = cellValue(row, mapping.get("channel"));
  const statusRaw = cellValue(row, mapping.get("status"));

  const unitPrice =
    parseNumber(unitPriceRaw) ?? (qty > 0 ? amount / qty : 0);

  return {
    id,
    date,
    customer: customerRaw ? String(customerRaw).trim() : "Unknown",
    category,
    qty,
    unitPrice,
    amount,
    channel: channelRaw ? String(channelRaw).trim() : "Unknown",
    status: statusRaw ? String(statusRaw).trim() : "Pending",
  };
}

export async function parseExcelFile(file: File): Promise<ParseOutcome> {
  if (!isXlsxFile(file)) {
    return {
      success: false,
      message: "Invalid file type. Please upload an .xlsx Excel file.",
    };
  }

  let workbook: XLSX.WorkBook;
  try {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  } catch {
    return {
      success: false,
      message: "Could not read the file. It may be corrupted or password-protected.",
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { success: false, message: "The workbook has no sheets." };
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  if (rows.length < 2) {
    return {
      success: false,
      message: "The sheet is empty or has no data rows below the header.",
    };
  }

  const headers = (rows[0] as unknown[]).map((h) => String(h ?? ""));
  const mapping = mapHeaders(headers);
  const missing = getMissingRequiredFields(mapping);

  if (missing.length > 0) {
    return {
      success: false,
      message: `Missing required columns: ${missing.join(", ")}. Expected headers like id, date, category, qty, and amount.`,
    };
  }

  const dataRows = rows.slice(1);
  if (dataRows.length > MAX_ROWS) {
    return {
      success: false,
      message: `File has ${dataRows.length} rows. Maximum supported is ${MAX_ROWS}.`,
    };
  }

  const orders: OrderRow[] = [];
  const errors: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i] as unknown[];
    const result = parseRow(row, mapping, i);

    if (result === "skip") continue;
    if (typeof result === "string") {
      errors.push(result);
      if (errors.length >= 5) break;
      continue;
    }
    orders.push(result);
  }

  if (errors.length > 0) {
    return {
      success: false,
      message: `Validation failed:\n${errors.join("\n")}${
        errors.length >= 5 ? "\n…and possibly more errors." : ""
      }`,
    };
  }

  if (orders.length === 0) {
    return {
      success: false,
      message: "No valid order rows were found in the file.",
    };
  }

  return {
    success: true,
    orders,
    rowCount: orders.length,
    fileName: file.name,
  };
}

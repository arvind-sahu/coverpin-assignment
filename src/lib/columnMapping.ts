/** Maps normalized header keys to canonical field names. */
const COLUMN_ALIASES: Record<string, string[]> = {
  id: ["id", "order id", "order_id", "orderid", "order no", "order number"],
  date: ["date", "order date", "order_date", "orderdate", "created", "created at"],
  customer: ["customer", "customer name", "customer_name", "client", "buyer", "name"],
  category: ["category", "product category", "product_category", "product", "type"],
  qty: ["qty", "quantity", "units", "unit", "count"],
  unitPrice: [
    "u.price",
    "u price",
    "unit price",
    "unit_price",
    "unitprice",
    "price",
    "rate",
  ],
  amount: ["amount", "total", "revenue", "sales", "total amount", "line total"],
  channel: ["channel", "sales channel", "sales_channel", "source", "platform"],
  status: ["status", "order status", "order_status", "state"],
};

export const REQUIRED_FIELDS = ["id", "date", "category", "qty", "amount"] as const;

export type CanonicalField = keyof typeof COLUMN_ALIASES;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, " ");
}

export function mapHeaders(headers: string[]): Map<CanonicalField, number> {
  const mapping = new Map<CanonicalField, number>();
  const normalized = headers.map(normalizeHeader);

  for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
    CanonicalField,
    string[],
  ][]) {
    const index = normalized.findIndex((h) => aliases.includes(h));
    if (index !== -1) {
      mapping.set(field, index);
    }
  }

  return mapping;
}

export function getMissingRequiredFields(
  mapping: Map<CanonicalField, number>,
): string[] {
  return REQUIRED_FIELDS.filter((field) => !mapping.has(field));
}

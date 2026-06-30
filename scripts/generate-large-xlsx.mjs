import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const categories = ["Mobiles", "Tablets", "Televisions", "Laptops", "Audio", "Wearables"];
const customers = [
  "Ruby Curd", "Will Johnson", "Bobby Gray", "Robert C.", "Steven G.",
  "Maria Lopez", "Chen Wei", "Anita Desai", "Tom Becker", "Sara Khan",
  "John Doe", "Jane Smith", "Alice Brown", "Charlie Green", "David White"
];
const channels = ["Web", "Mobile App", "In-Store"];
const statuses = ["Shipped", "Delivered", "Pending", "Cancelled"];

const rows = [
  ["id", "date", "customer", "category", "qty", "u.price", "amount", "channel", "status"]
];

// Generate 2000 rows
for (let i = 1; i <= 2000; i++) {
  const id = 1000 + i;
  // Random date in 2024
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const date = `2024-${month}-${day}`;
  
  const customer = customers[Math.floor(Math.random() * customers.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const qty = Math.floor(Math.random() * 5) + 1;
  const unitPrice = Math.floor(Math.random() * 1500) + 50;
  const amount = qty * unitPrice;
  const channel = channels[Math.floor(Math.random() * channels.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  rows.push([id, date, customer, category, qty, unitPrice, amount, channel, status]);
}

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, "Orders");

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "large-orders.xlsx");
writeFileSync(outPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log(`Wrote 2000 rows to ${outPath}`);

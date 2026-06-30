/**
 * Generates public/sample-orders.xlsx for testing uploads.
 * Run: npm run generate-sample
 */
import * as XLSX from "xlsx";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const rows = [
  ["id", "date", "customer", "category", "qty", "u.price", "amount", "channel", "status"],
  [1001, "2024-03-09", "Ruby Curd", "Mobiles", 2, 900, 1800, "Web", "Shipped"],
  [1002, "2024-03-15", "Will Johnson", "Tablets", 1, 700, 700, "Mobile App", "Delivered"],
  [1003, "2024-03-18", "Bobby Gray", "Televisions", 3, 1500, 4200, "In-Store", "Pending"],
  [1004, "2024-03-27", "Robert C.", "Laptops", 2, 2000, 4000, "Web", "Shipped"],
  [1005, "2024-04-01", "Steven G.", "Mobiles", 1, 950, 950, "Mobile App", "Pending"],
  [1006, "2024-04-04", "Maria Lopez", "Tablets", 4, 650, 2500, "Web", "Delivered"],
  [1007, "2024-04-09", "Chen Wei", "Laptops", 1, 1800, 1750, "In-Store", "Shipped"],
  [1008, "2024-04-12", "Anita Desai", "Televisions", 2, 1200, 2400, "Web", "Delivered"],
  [1009, "2024-04-15", "Tom Becker", "Mobiles", 5, 800, 3950, "Mobile App", "Pending"],
  [1010, "2024-04-20", "Sara Khan", "Laptops", 1, 2200, 2200, "Web", "Shipped"],
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb, ws, "Orders");

const outDir = join(process.cwd(), "public");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "sample-orders.xlsx");
writeFileSync(outPath, XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
console.log(`Wrote ${outPath}`);

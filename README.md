# Order Analytics Dashboard

A single-page analytics dashboard with Excel upload, built as a **Next.js (React)** frontend application.

## Live demo

> Deploy to Vercel (recommended) or AWS Amplify — see [Deployment](#deployment) below.

## Stack choice

| Choice | Why |
|--------|-----|
| **Next.js 16 + React 19** | Fast to ship, excellent Vercel/AWS deployment, App Router for clean structure |
| **Client-side Excel parsing (`xlsx`)** | ~2,000 rows parse in milliseconds in the browser — no backend needed, simpler free-tier hosting, instant dashboard updates |
| **React Context** | Shared order state across Dashboard and Upload tabs without page reloads |
| **Recharts** | Lightweight, composable charts for revenue and category views |
| **Tailwind CSS** | Responsive layout matching reference dashboard widgets |

### Why client-side parsing?

For files up to ~2,000 rows, parsing in the browser avoids an API round-trip, keeps deployment to a static/SSR frontend only (free on Vercel), and updates the dashboard immediately after upload. A server-side parser would add latency and infrastructure for little gain at this scale.

## Features

- **Two tabs**: Dashboard · Upload Excel
- **Shared state**: Upload on one tab → Dashboard reflects new data instantly (no reload)
- **Dashboard widgets**:
  - KPI cards — total revenue, orders, units sold, average order value
  - Statistics — today vs yesterday (income, orders, products sold)
  - Revenue — area chart by date
  - Product Stock — horizontal bar chart of units sold by category
  - Order List — searchable, paginated table
- **Upload**: drag-and-drop + file picker, loading/success/error feedback, validation

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
npm start
```

## Excel file contract

### Required columns (flexible header names)

| Field | Accepted headers (examples) |
|-------|----------------------------|
| `id` | id, order id, order_id |
| `date` | date, order date |
| `category` | category, product category, product |
| `qty` | qty, quantity, units |
| `amount` | amount, total, revenue, sales |

### Optional columns

| Field | Default if missing |
|-------|-------------------|
| `customer` | `"Unknown"` |
| `u.price` / unit price | `amount / qty` |
| `channel` | `"Unknown"` |
| `status` | `"Pending"` |

### Validation rules

- Only `.xlsx` files accepted
- First sheet is read; must have a header row and at least one data row
- Missing required columns → clear error listing what's missing
- Invalid rows (bad date, negative qty/amount) → row-level error messages (up to 5 shown)
- Maximum 2,500 rows

### Example row

```
id | date       | customer    | category    | qty | u.price | amount | channel    | status
1001 | 2024-03-09 | Ruby Curd | Mobiles     | 2   | 900     | 1800   | Web        | Shipped
```

Generate a test file:

```bash
npm run generate-sample
```

This writes `public/sample-orders.xlsx`.

## Assumptions

1. **One row = one order line** (not necessarily one order). Multiple lines can share the same `id`.
2. **“Total Orders”** = count of unique `id` values, not row count.
3. **“Today / Yesterday”** uses the **most recent date in the dataset** as “today” and the **calendar day before** as “yesterday”. This keeps the comparison meaningful when sample/historical data is loaded (real calendar today would often show zeros).
4. **“Product Stock”** shows **units sold per category** (inventory movement proxy), not live warehouse stock — the upload file has no stock-on-hand column.
5. **KPI % change** on revenue/orders cards compares the latest day in the data vs the previous day that has orders.
6. **Currency** is displayed as USD regardless of source data.
7. **Before upload**, the dashboard seeds with the brief’s 10-row sample dataset.

## Project structure

```
src/
├── app/              # Next.js pages & layout
├── components/
│   ├── dashboard/    # KPI cards, charts, order table
│   └── upload/       # File upload UI
├── context/          # Shared orders state
├── lib/
│   ├── analytics.ts  # Metric computations
│   ├── columnMapping.ts
│   ├── parseExcel.ts # Validation & parsing
│   └── sampleData.ts
└── types/
```

## Deployment

### Vercel (recommended, free tier)

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** — no env vars needed.
4. Deploy.

Or with CLI:

```bash
npx vercel
```

### AWS Amplify Hosting (free tier eligible)

1. Push to GitHub.
2. AWS Console → **Amplify** → **Host web app** → connect repo.
3. Build settings (auto-detected for Next.js):

   - Build command: `npm run build`
   - Output: `.next` (Amplify SSR for Next.js)

### AWS S3 + CloudFront (static export)

This app uses client-only features (file upload, Recharts). For a static export you'd need `output: 'export'` in `next.config` — the default SSR deployment on Vercel/Amplify is simpler.

## License

MIT

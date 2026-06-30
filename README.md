# Order Analytics Dashboard

A single-page analytics dashboard with Excel upload, built as a **Next.js (React)** frontend application.

## Live demo

**AWS Amplify:** [https://main.d1y04k57dveds6.amplifyapp.com](https://main.d1y04k57dveds6.amplifyapp.com)

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

### Cross-Tab Synchronization and Persistence

To ensure immediate data synchronization across multiple browser tabs without requiring full page reloads, we implemented a custom synchronization layer inside `src/context/OrdersContext.tsx`:
1. **Persistence:** Uploaded orders, the active file name, and the state flag are saved to `localStorage` upon successful upload.
2. **On-Mount Hydration:** When the app mounts, it checks for uploaded data in `localStorage` and loads it, ensuring that state is preserved across page refreshes and new tabs.
3. **Cross-Tab Sync:** We listen to the native browser `storage` event. When an upload occurs in one browser tab, all other open tabs of the same origin receive this event and update their React state immediately, ensuring seamless real-time synchronization.
4. **Reset to Sample Data:** A "Reset to Sample Data" button is provided on both the Dashboard and Upload tabs, allowing users to instantly clear `localStorage` and return to the default sample dataset across all tabs.

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
8. **Empty File Validation:** Files with a size of 0 bytes are rejected immediately to prevent silent failures or parsing errors.
9. **Flexible Column Mapping:** Header names are matched using a set of common aliases (e.g., `qty`, `quantity`, `units` map to `qty`). Required fields must be present, while optional fields are filled with sensible defaults (e.g., `customer` defaults to `"Unknown"`, `unitPrice` defaults to `amount / qty`, and `status` defaults to `"Pending"`).

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

## CI/CD and deployment

### Pipeline overview

| Stage | Trigger | What runs |
|-------|---------|-----------|
| **CI** | Push or PR to `main` | `npm ci` → lint → build (GitHub Actions) |
| **CD** | CI succeeds on `main` | Triggers AWS Amplify release job (GitHub Actions) |
| **Build** | Amplify release job | Uses `amplify.yml` → `npm ci` → `npm run build` → deploy `.next` (SSR) |

Manual deploy: **Actions → Deploy to AWS Amplify → Run workflow**.

### GitHub secrets (required for CD)

These are configured in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user `github-actions-coverpin` access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | `ap-south-1` |
| `AMPLIFY_APP_ID` | `d1y04k57dveds6` |
| `AMPLIFY_BRANCH_NAME` | Optional; defaults to `main` |

The IAM policy (least privilege) is in [`scripts/iam-amplify-deploy-policy.json`](scripts/iam-amplify-deploy-policy.json).

### AWS Amplify

The app uses **WEB_COMPUTE** (Next.js SSR). Build settings live in [`amplify.yml`](amplify.yml) at the repo root.

**Live URL:** [https://main.d1y04k57dveds6.amplifyapp.com](https://main.d1y04k57dveds6.amplifyapp.com)

### Alternative: Vercel (free tier)

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Framework preset: **Next.js** — no env vars needed.

```bash
npx vercel
```

## License

MIT

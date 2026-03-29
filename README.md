# COT Analytics Dashboard

A full-stack Next.js dashboard for analysing CFTC Commitment of Traders (COT) data stored in Supabase.

## Stack

- **Next.js 14** (Pages Router)
- **React 18** + **TypeScript**
- **Tailwind CSS** — dark theme, custom design tokens
- **Supabase JS** — direct client-side queries
- **Apache ECharts** (via `echarts-for-react`) — interactive time-series charts
- **SheetJS (xlsx)** — Excel export
- **date-fns** — date utilities

---

## Quick Start

### 1. Clone / unzip the project

```bash
cd cot-dashboard
```

### 2. Configure Supabase credentials

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Both values are found in your Supabase project → Settings → API.

### 3. Install dependencies and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Expected Supabase Table

Table name: `cot_weekly_raw`

| Column | Type |
|--------|------|
| market_and_exchange_names | text |
| report_date_as_mm_dd_yyyy | text |
| as_of_date_in_form_yyyymmdd | text |
| open_interest_all | integer |
| prod_merc_positions_long_all | integer |
| prod_merc_positions_short_all | integer |
| swap_positions_long_all | integer |
| swap_positions_short_all | integer |
| m_money_positions_long_all | integer |
| m_money_positions_short_all | integer |
| traders_tot_all | integer |

Make sure your Supabase **Row Level Security** policy allows `SELECT` for anonymous users (or use the service key for server-side queries).

---

## Project Structure

```
cot-dashboard/
├── pages/
│   ├── _app.tsx              # Global app wrapper
│   ├── _document.tsx         # HTML document
│   ├── index.tsx             # Dashboard overview
│   └── commodity/
│       └── [name].tsx        # Per-commodity detail page
├── components/
│   ├── Layout.tsx            # Sidebar + main layout
│   ├── Sidebar.tsx           # Left navigation with commodity list
│   ├── SummaryCard.tsx       # Dashboard commodity card
│   ├── FilterBar.tsx         # Date range filters
│   ├── ExportButtons.tsx     # CSV / Excel export
│   └── charts/
│       ├── OpenInterestChart.tsx
│       ├── CommercialChart.tsx
│       └── ManagedMoneyChart.tsx
├── lib/
│   ├── supabase.ts           # Supabase client singleton
│   ├── queries.ts            # All data-fetching functions
│   └── types.ts              # TypeScript interfaces
├── utils/
│   ├── exportData.ts         # CSV + Excel export logic
│   └── format.ts             # Number/date formatters
├── styles/
│   └── globals.css           # Tailwind + Google Fonts
├── .env.local.example        # Credential template
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Features

| Feature | Details |
|---------|---------|
| **Market overview** | Cards with latest OI, commercial and MM positions |
| **Search** | Filter cards by market name |
| **Detail page** | `/commodity/[name]` with 3 historical charts |
| **Date filters** | From / To date range on both pages |
| **Export CSV** | Downloads filtered rows as `.csv` |
| **Export Excel** | Downloads filtered rows as `.xlsx` via SheetJS |
| **Raw data table** | Last 52 weeks in sortable table on detail page |
| **Loading states** | Skeleton loaders and spinners |
| **Row limit** | Max 2000 rows per query to Supabase |

---

## Supabase RLS Quick Setup

If you have RLS enabled and need anonymous read access:

```sql
-- Allow anonymous reads on cot_weekly_raw
CREATE POLICY "Allow public read" ON cot_weekly_raw
  FOR SELECT USING (true);
```

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start Next.js dev server (http://localhost:3000)
npm run build    # production build
npm start        # run production build
npm run lint     # next lint
```

There is no test suite/runner configured.

### Environment setup

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Architecture

### Two Supabase tables, two data streams

All data comes from two Supabase tables queried directly from the client with the anon key — there is no server-side API layer. RLS must allow anonymous `SELECT`.

- **`cot_weekly_raw`** — CFTC Disaggregated COT for commodity futures. Participant columns: `prod_merc` (Producer/Merchant), `swap`, `m_money` (Managed Money).
- **`cot_financials_raw`** — CFTC Disaggregated COT for financial futures (equity indices, rates, FX). Participant columns: `dealer`, `asset_mgr` (Asset Manager), `lev_money` (Leveraged Money).

All queries in `lib/queries.ts` go through **Supabase RPC functions** (not direct table queries) to bypass PostgREST's row cap: `get_latest_commodities`, `get_commodity_history`, `get_latest_financials`, `get_financial_history`.

### Auth — server-side httpOnly cookie

`pages/_app.tsx` wraps every page in `AuthGuard` (`components/AuthGuard.tsx`), which calls `GET /api/check` on mount. If the server returns 401, it redirects to `/login`.

`pages/login.tsx` POSTs to `POST /api/auth` with `{ user, pass }`. The API handler (`pages/api/auth.ts`) reads `AUTH_USER` and `AUTH_PASSWORD` from **server-side environment variables** (set in Vercel dashboard — never hardcoded) and, on success, sets a `cot_session=1; HttpOnly; Secure; SameSite=Strict` cookie.

Credentials are **never** in the client bundle. The cookie is not accessible to JS. Supabase reads still happen with the public anon key (see RLS note above).

### Three page groups, two parallel commodity-detail implementations

**Commodity pages** (data from `cot_weekly_raw`):

- **`/`** (`pages/index.tsx`) — dashboard grid of `SummaryCard` components. Cards link to `/markets/[commodity]`.
- **`/commodity/[name]`** (`pages/commodity/[name].tsx`) — rendered inside `Layout`/`Sidebar`. Fetches via `lib/queries.fetchCommodityData`. Charts are ECharts (`echarts-for-react`) components in `components/charts/` (OpenInterest, Commercial, ManagedMoney, NetPositioning, CommercialCombined, NetFund), dynamically imported with `ssr: false`. Includes `FilterBar`, `ExportButtons`, and a raw-data table.
- **`/markets/[commodity]`** (`pages/markets/[commodity].tsx`) — a standalone full-page "professional analysis" view with **no** `Layout`/`Sidebar`. Fetches via `lib/queries.fetchCommodityData` (same RPC as `/commodity/[name]`). Renders KPI cards, a COT Index gauge + bullish/bearish signal banner, and ECharts chart components (CommercialCombinedChart, NetFundChart, OpenInterestChart, NetPositioningChart). Uses helper functions from `utils/cotCalculations.ts` (`processRawCotData`, `buildCotSummary`, `cotIndexColor`, `cotIndexLabel`, etc.) alongside `lib/types.ts`'s `CotRow` type.

**Navigation is inconsistent between commodity pages**: `SummaryCard` links to `/markets/[commodity]` (the professional analysis view), while `Sidebar` links to `/commodity/[name]` (the layout-wrapped ECharts view). When changing navigation or adding a commodity view, check which page is intended.

**Financial futures pages** (data from `cot_financials_raw`):

- **`/financials`** (`pages/financials.tsx`) — dashboard grid of `FinancialCard` components, grouped by category (equity/rates/FX) using `lib/marketCategories.ts`. Fetches via `lib/queries.fetchFinancialSummaries`.
- **`/financials/[name]`** (`pages/financials/[name].tsx`) — detail page rendered inside `Layout`/`Sidebar`. Fetches via `lib/queries.fetchFinancialData`. Charts are ECharts components in `components/charts/FinancialPositionsChart.tsx` (FinancialOIChart, AssetManagerChart, DealerLevMoneyChart).

### `lib/` vs `utils/`

- `lib/` is the shared data layer: `supabase.ts` (client singleton), `queries.ts` (all Supabase RPCs), `types.ts` (`CotRow`, `CotFinancialsRow`, `CommoditySummary`, `FinancialSummary`), `marketCategories.ts` (keyword-based sector/category classifier for both commodity and financial markets).
- `utils/` mixes general formatting helpers (`format.ts`, `exportData.ts`) with `cotCalculations.ts`, a self-contained analytics module (COT Index calculation, net positions, summary builder) used only by the `/markets` page and `COTChart.tsx`.

### Two date formats, two parsers

Rows carry both `report_date_as_mm_dd_yyyy` (`MM/DD/YYYY`) and `as_of_date_in_form_yyyymmdd` (`YYYYMMDD` string). `utils/format.ts#formatDate` only handles the `YYYYMMDD` form (used by `lib/queries.ts` and the `/commodity` page). `utils/cotCalculations.ts#parseReportDate` handles both forms and is used by the `/markets` page. Keep this distinction in mind when touching date logic — a fix in one parser does not fix the other.

### Charting libraries

Both ECharts (`echarts-for-react`) and Recharts are listed as dependencies, but **all active charts use ECharts**. ECharts components must be dynamically imported with `{ ssr: false }` — `next.config.js` also has `transpilePackages: ["echarts", "zrender"]` for this reason. Recharts (`recharts` package) remains in `package.json` but is not currently used by any page.

### Deploying to Vercel

GitHub integration is connected but does **not** auto-deploy — all deployments must be triggered manually via the `deploy_to_vercel` MCP tool (or `mcp__cf3a5a7d-...__deploy_to_vercel`).

**Key parameters:**
- `target`: `"production"`
- `name`: `"cot-dashboard"`
- `teamId`: `"team_t6GoP4lcF0cRryuwyFR1gjue"`
- `projectSettings`: `{ "framework": "nextjs" }`

**All 43 source files must be included** in a single call (config + pages + components + lib + utils + styles). Missing any file causes the build to succeed but routes to 404.

**To avoid the 32k output token limit:** make the `deploy_to_vercel` call directly without generating large text output beforehand. Read files in parallel batches, then call the tool immediately.

**Required Vercel env vars** (set in dashboard, not in code):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `AUTH_USER`
- `AUTH_PASSWORD`

### Deploying — corrected workflow

GitHub push **does** trigger Vercel auto-deploy, but the trigger can take several minutes. If the change needs to be live immediately, run:

```bash
vercel --prod --scope antrade --yes
```

`pages/markets/[commodity].tsx` now performs a **permanent 301 redirect** to `/commodity/[name]` — it should not be reverted.

---

## Phase: GOLD charts complete — pending replication to all commodities

### What was built (GOLD — `pages/commodity/[name].tsx`)

Three new chart cards were added after "Managed Money" and before "Posiciones Netas Combinadas":

1. **Other Reportables** (`components/charts/CommodityOtherReportablesChart.tsx`)  
   Long / Short / Net bars — uses `other_rept_positions_long_all` / `other_rept_positions_short_all`.

2. **Non-Reportable** (`components/charts/CommodityNonreportableChart.tsx`)  
   Long / Short / Net bars — uses `nonrept_positions_long_all` / `nonrept_positions_short_all`.

3. **Número de Traders por Categoría** (`components/charts/TradersBreakdownChart.tsx`)  
   5 line series: Prod/Merc, Swap, Managed Money, Other Rept., Total — uses `traders_prod_merc_*`, `traders_swap_*`, `traders_m_money_*`, `traders_other_rept_*`, `traders_tot_all`.

**Posiciones Netas Combinadas** (`components/charts/CommodityCombinedNetChart.tsx`) was updated to include two new net lines:
- **Other Reportables Net** (naranja `#fb923c`)
- **Non-Reportable Net** (violeta `#a78bfa`)

All new series are null-safe — data exists only from **2017 onwards** (CFTC bulk 2006–2016 ZIP uses older format without those columns). Pre-2017 renders as gap, not error.

### Supabase RPC `get_commodity_history`

Replaced (DROP + CREATE FUNCTION with SECURITY DEFINER) to return 22 columns including all 12 new ones. GRANT EXECUTE to anon, authenticated, service_role.

### DB columns added to `cot_weekly_raw` (via `load_commodities.py` and `load_disagg_historical.py`)

```
other_rept_positions_long_all   other_rept_positions_short_all
nonrept_positions_long_all      nonrept_positions_short_all
traders_prod_merc_long_all      traders_prod_merc_short_all
traders_swap_long_all           traders_swap_short_all
traders_m_money_long_all        traders_m_money_short_all
traders_other_rept_long_all     traders_other_rept_short_all
```

### `lib/types.ts` — `CotRow` interface

All 12 new columns added as `number` (nullable-safe in components with `?? null`).

### Next step (awaiting command)

**Replicate** the same 3 chart cards + combined-net update to **all other commodity instruments**. Since `pages/commodity/[name].tsx` is the single shared page for all commodities, the changes are already live for every instrument — no per-instrument work needed. Just verify the data is populated in `cot_weekly_raw` for each instrument.

### CI

`.github/workflows/ping-supabase.yml` periodically hits the Supabase REST API with the public anon key so the free-tier project doesn't auto-pause from inactivity.

### Path alias

`tsconfig.json` defines `@/*` → repo root, but most existing imports use relative paths (`../lib/...`, `../../components/...`).

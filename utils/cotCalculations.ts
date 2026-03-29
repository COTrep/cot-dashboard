// ─────────────────────────────────────────────────────────────────────────────
// utils/cotCalculations.ts
// COT professional analysis calculations
// Drop this file into your existing utils/ folder — no other changes needed.
// ─────────────────────────────────────────────────────────────────────────────

export interface RawCotRow {
  market_and_exchange_names: string;
  report_date_as_mm_dd_yyyy: string;
  as_of_date_in_form_yyyymmdd?: string;
  prod_merc_positions_long_all: number;
  prod_merc_positions_short_all: number;
  m_money_positions_long_all: number;
  m_money_positions_short_all: number;
  open_interest_all: number;
}

export interface ProcessedCotRow {
  date: string;           // ISO yyyy-mm-dd for chart axis
  rawDate: string;        // original from DB
  commercialNet: number;
  managedMoneyNet: number;
  openInterest: number;
  cotIndex: number | null; // null until enough data for window
}

export interface CotSummary {
  latestDate: string;
  commercialNet: number;
  managedMoneyNet: number;
  openInterest: number;
  cotIndex: number | null;
  commercialNetChange: number;  // week-over-week
  managedMoneyNetChange: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse "MM/DD/YYYY" → "YYYY-MM-DD" for sorting & charting */
export function parseReportDate(mmddyyyy: string): string {
  if (!mmddyyyy) return "";
  // Handle both "MM/DD/YYYY" and "YYYYMMDD" formats
  if (mmddyyyy.includes("/")) {
    const [mm, dd, yyyy] = mmddyyyy.split("/");
    return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
  }
  if (mmddyyyy.length === 8) {
    return `${mmddyyyy.slice(0, 4)}-${mmddyyyy.slice(4, 6)}-${mmddyyyy.slice(6, 8)}`;
  }
  return mmddyyyy;
}

/** Subtract N years from an ISO date string */
export function subtractYears(isoDate: string, years: number): string {
  const d = new Date(isoDate);
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
}

/** Filter rows to the last N months relative to the most recent date in the set */
export function filterByTimeframe(
  rows: ProcessedCotRow[],
  months: number
): ProcessedCotRow[] {
  if (!rows.length) return rows;
  const latest = rows[rows.length - 1].date;
  const cutoff = new Date(latest);
  cutoff.setMonth(cutoff.getMonth() - months);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  return rows.filter((r) => r.date >= cutoffStr);
}

// ─── COT Index ───────────────────────────────────────────────────────────────

/**
 * COT Index = (Current - Min) / (Max - Min) * 100
 * Calculated over a rolling 3-year (156-week) window for each data point.
 * Returns null when there are fewer than 2 distinct values in the window.
 */
function calcCotIndex(
  values: number[],
  windowSize: number = 156
): (number | null)[] {
  return values.map((_, i) => {
    const start = Math.max(0, i - windowSize + 1);
    const window = values.slice(start, i + 1);
    const min = Math.min(...window);
    const max = Math.max(...window);
    if (max === min) return null;
    return ((values[i] - min) / (max - min)) * 100;
  });
}

// ─── Main processor ──────────────────────────────────────────────────────────

/**
 * Takes raw Supabase rows and returns processed rows ready for charting.
 * Sorts chronologically, computes nets and COT index.
 */
export function processRawCotData(rows: RawCotRow[]): ProcessedCotRow[] {
  if (!rows.length) return [];

  // Sort ascending by date
  const sorted = [...rows].sort((a, b) => {
    const da = parseReportDate(a.report_date_as_mm_dd_yyyy);
    const db = parseReportDate(b.report_date_as_mm_dd_yyyy);
    return da.localeCompare(db);
  });

  const commercialNets = sorted.map(
    (r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all
  );
  const cotIndexValues = calcCotIndex(commercialNets);

  return sorted.map((r, i) => ({
    date: parseReportDate(r.report_date_as_mm_dd_yyyy),
    rawDate: r.report_date_as_mm_dd_yyyy,
    commercialNet: commercialNets[i],
    managedMoneyNet:
      r.m_money_positions_long_all - r.m_money_positions_short_all,
    openInterest: r.open_interest_all,
    cotIndex: cotIndexValues[i],
  }));
}

/**
 * Derive the summary metrics from the full processed dataset (not the filtered view).
 * Uses the last two rows for week-over-week changes.
 */
export function buildCotSummary(allRows: ProcessedCotRow[]): CotSummary | null {
  if (!allRows.length) return null;
  const latest = allRows[allRows.length - 1];
  const prev = allRows.length > 1 ? allRows[allRows.length - 2] : null;

  return {
    latestDate: latest.date,
    commercialNet: latest.commercialNet,
    managedMoneyNet: latest.managedMoneyNet,
    openInterest: latest.openInterest,
    cotIndex: latest.cotIndex,
    commercialNetChange: prev
      ? latest.commercialNet - prev.commercialNet
      : 0,
    managedMoneyNetChange: prev
      ? latest.managedMoneyNet - prev.managedMoneyNet
      : 0,
  };
}

// ─── Formatters ──────────────────────────────────────────────────────────────

export function fmtNumber(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function fmtChange(n: number): string {
  return `${n >= 0 ? "+" : ""}${fmtNumber(n)}`;
}

/** Returns Tailwind colour classes based on bullish/bearish signal */
export function signalColor(value: number): string {
  return value >= 0 ? "text-emerald-400" : "text-rose-400";
}

export function cotIndexColor(index: number | null): string {
  if (index === null) return "text-slate-400";
  if (index >= 70) return "text-emerald-400";
  if (index <= 30) return "text-rose-400";
  return "text-amber-400";
}

export function cotIndexLabel(index: number | null): string {
  if (index === null) return "—";
  if (index >= 70) return "Bullish";
  if (index <= 30) return "Bearish";
  return "Neutral";
}

import { supabase } from "./supabase";
import type { CotRow, CommoditySummary, CotFinancialsRow, FinancialSummary } from "./types";

const TABLE = "cot_weekly_raw";
const FINANCIALS_TABLE = "cot_financials_raw";
const ROW_LIMIT = 5000;

/** Fetch all distinct commodity names */
export async function fetchCommodityList(): Promise<string[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("market_and_exchange_names")
    .order("market_and_exchange_names", { ascending: true })
    .limit(5000);

  if (error) throw new Error(error.message);

  const unique = Array.from(
    new Set((data ?? []).map((r: Pick<CotRow, "market_and_exchange_names">) => r.market_and_exchange_names))
  ).sort();
  return unique;
}

/** Fetch rows for a specific commodity, optionally filtered by date range */
export async function fetchCommodityData(
  commodity: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CotRow[]> {
  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("market_and_exchange_names", commodity)
    .order("as_of_date_in_form_yyyymmdd", { ascending: true })
    .limit(ROW_LIMIT);

  if (dateFrom) {
    query = query.gte("as_of_date_in_form_yyyymmdd", dateFrom.replace(/-/g, ""));
  }
  if (dateTo) {
    query = query.lte("as_of_date_in_form_yyyymmdd", dateTo.replace(/-/g, ""));
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CotRow[];
}

/** Fetch latest row per commodity for the dashboard summary cards */
export async function fetchDashboardSummaries(): Promise<CommoditySummary[]> {
  // Fetch latest record per commodity by getting all and deduplicating client-side
  // (Supabase free tier doesn't support DISTINCT ON)
  const { data, error } = await supabase
    .from(TABLE)
    .select(
      "market_and_exchange_names, as_of_date_in_form_yyyymmdd, open_interest_all, prod_merc_positions_long_all, prod_merc_positions_short_all, m_money_positions_long_all, m_money_positions_short_all"
    )
    .order("report_date_as_mm_dd_yyyy", { ascending: false })
    .limit(ROW_LIMIT);

  if (error) throw new Error(error.message);

  // Keep only the most recent row per commodity
  const seen = new Map<string, CommoditySummary>();
  for (const r of (data ?? []) as CotRow[]) {
    if (!seen.has(r.market_and_exchange_names)) {
      seen.set(r.market_and_exchange_names, {
        name: r.market_and_exchange_names,
        openInterest: r.open_interest_all,
        commercialLong: r.prod_merc_positions_long_all,
        commercialShort: r.prod_merc_positions_short_all,
        managedMoneyLong: r.m_money_positions_long_all,
        managedMoneyShort: r.m_money_positions_short_all,
        latestDate: r.as_of_date_in_form_yyyymmdd,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

/** Fetch latest row per financial instrument for the financials dashboard */
export async function fetchFinancialSummaries(): Promise<FinancialSummary[]> {
  const { data, error } = await supabase
    .from(FINANCIALS_TABLE)
    .select(
      "market_and_exchange_names, as_of_date_in_form_yyyymmdd, open_interest_all, dealer_positions_long_all, dealer_positions_short_all, asset_mgr_positions_long_all, asset_mgr_positions_short_all, lev_money_positions_long_all, lev_money_positions_short_all"
    )
    .order("as_of_date_in_form_yyyymmdd", { ascending: false })
    .limit(ROW_LIMIT);

  if (error) throw new Error(error.message);

  const seen = new Map<string, FinancialSummary>();
  for (const r of (data ?? []) as CotFinancialsRow[]) {
    if (!seen.has(r.market_and_exchange_names)) {
      seen.set(r.market_and_exchange_names, {
        name: r.market_and_exchange_names,
        openInterest: r.open_interest_all,
        dealerLong: r.dealer_positions_long_all,
        dealerShort: r.dealer_positions_short_all,
        assetMgrLong: r.asset_mgr_positions_long_all,
        assetMgrShort: r.asset_mgr_positions_short_all,
        levMoneyLong: r.lev_money_positions_long_all,
        levMoneyShort: r.lev_money_positions_short_all,
        latestDate: r.as_of_date_in_form_yyyymmdd,
      });
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/** Fetch historical rows for a specific financial instrument */
export async function fetchFinancialData(
  market: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CotFinancialsRow[]> {
  let query = supabase
    .from(FINANCIALS_TABLE)
    .select("*")
    .eq("market_and_exchange_names", market)
    .order("as_of_date_in_form_yyyymmdd", { ascending: true })
    .limit(ROW_LIMIT);

  if (dateFrom) query = query.gte("as_of_date_in_form_yyyymmdd", dateFrom);
  if (dateTo)   query = query.lte("as_of_date_in_form_yyyymmdd", dateTo);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []) as CotFinancialsRow[];
}

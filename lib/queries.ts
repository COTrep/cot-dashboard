import { supabase } from "./supabase";
import type { CotRow, CommoditySummary, CotFinancialsRow, FinancialSummary } from "./types";

const TABLE = "cot_weekly_raw";

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

/** Fetch all rows for a specific commodity — uses RPC to bypass PostgREST row cap */
export async function fetchCommodityData(
  commodity: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CotRow[]> {
  const { data, error } = await supabase.rpc("get_commodity_history", {
    p_market: commodity,
    p_from: dateFrom || null,
    p_to: dateTo || null,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as CotRow[];
}

/** Fetch latest row per commodity — uses RPC (DISTINCT ON) to bypass PostgREST row cap */
export async function fetchDashboardSummaries(): Promise<CommoditySummary[]> {
  const { data, error } = await supabase.rpc("get_latest_commodities");

  if (error) throw new Error(error.message);

  return ((data ?? []) as CotRow[])
    .map((r) => ({
      name: r.market_and_exchange_names,
      openInterest: r.open_interest_all,
      commercialLong: r.prod_merc_positions_long_all,
      commercialShort: r.prod_merc_positions_short_all,
      managedMoneyLong: r.m_money_positions_long_all,
      managedMoneyShort: r.m_money_positions_short_all,
      latestDate: r.as_of_date_in_form_yyyymmdd,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Fetch latest row per financial instrument — uses RPC (DISTINCT ON) to bypass PostgREST row cap */
export async function fetchFinancialSummaries(): Promise<FinancialSummary[]> {
  const { data, error } = await supabase.rpc("get_latest_financials");

  if (error) throw new Error(error.message);

  return ((data ?? []) as CotFinancialsRow[])
    .map((r) => ({
      name: r.market_and_exchange_names,
      openInterest: r.open_interest_all,
      dealerLong: r.dealer_positions_long_all,
      dealerShort: r.dealer_positions_short_all,
      assetMgrLong: r.asset_mgr_positions_long_all,
      assetMgrShort: r.asset_mgr_positions_short_all,
      levMoneyLong: r.lev_money_positions_long_all,
      levMoneyShort: r.lev_money_positions_short_all,
      latestDate: r.as_of_date_in_form_yyyymmdd,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Fetch all rows for a financial instrument — uses RPC to bypass PostgREST row cap */
export async function fetchFinancialData(
  market: string,
  dateFrom?: string,
  dateTo?: string
): Promise<CotFinancialsRow[]> {
  const { data, error } = await supabase.rpc("get_financial_history", {
    p_market: market,
    p_from: dateFrom || null,
    p_to: dateTo || null,
  });

  if (error) throw new Error(error.message);
  return (data ?? []) as CotFinancialsRow[];
}

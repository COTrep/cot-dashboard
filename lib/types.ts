export interface CotRow {
  market_and_exchange_names: string;
  report_date_as_mm_dd_yyyy: string;
  as_of_date_in_form_yyyymmdd: string;
  open_interest_all: number;
  prod_merc_positions_long_all: number;
  prod_merc_positions_short_all: number;
  swap_positions_long_all: number;
  swap_positions_short_all: number;
  m_money_positions_long_all: number;
  m_money_positions_short_all: number;
  traders_tot_all: number;
}

export interface CotFinancialsRow {
  market_and_exchange_names: string;
  report_date_as_mm_dd_yyyy: string;   // date → ISO string "YYYY-MM-DD"
  as_of_date_in_form_yyyymmdd: string; // date → ISO string "YYYY-MM-DD"
  open_interest_all: number;
  dealer_positions_long_all: number;
  dealer_positions_short_all: number;
  asset_mgr_positions_long_all: number;
  asset_mgr_positions_short_all: number;
  lev_money_positions_long_all: number;
  lev_money_positions_short_all: number;
  change_in_dealer_long_all: number;
  change_in_dealer_short_all: number;
  change_in_asset_mgr_long_all: number;
  change_in_asset_mgr_short_all: number;
  change_in_lev_money_long_all: number;
  change_in_lev_money_short_all: number;
  traders_tot_all: number;
}

export interface FinancialSummary {
  name: string;
  openInterest: number;
  dealerLong: number;
  dealerShort: number;
  assetMgrLong: number;
  assetMgrShort: number;
  levMoneyLong: number;
  levMoneyShort: number;
  latestDate: string;
}

export interface CotFilters {
  commodity: string;
  dateFrom: string;
  dateTo: string;
}

export interface CommoditySummary {
  name: string;
  openInterest: number;
  commercialLong: number;
  commercialShort: number;
  managedMoneyLong: number;
  managedMoneyShort: number;
  latestDate: string;
}

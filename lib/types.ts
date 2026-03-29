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

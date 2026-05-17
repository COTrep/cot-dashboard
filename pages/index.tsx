import React, { useEffect, useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import clsx from "clsx";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import FilterBar from "../components/FilterBar";
import ExportButtons from "../components/ExportButtons";
import { CardSkeleton } from "../components/ui/Skeletons";
import { fetchDashboardSummaries } from "../lib/queries";
import type { CommoditySummary } from "../lib/types";
import { getMarketSector } from "../lib/marketCategories";

type Tab = "all" | "commodities" | "financials";

const Dashboard: NextPage = () => {
  const [summaries, setSummaries] = useState<CommoditySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("all");

  useEffect(() => {
    setLoading(true);
    fetchDashboardSummaries()
      .then(setSummaries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tabFiltered = useMemo(() => {
    if (activeTab === "commodities")
      return summaries.filter((s) => getMarketSector(s.name) === "commodities");
    if (activeTab === "financials")
      return summaries.filter((s) => getMarketSector(s.name) === "financials");
    return summaries;
  }, [summaries, activeTab]);

  const filtered = useMemo(
    () => tabFiltered.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())),
    [tabFiltered, search]
  );

  const exportRows = useMemo(
    () =>
      filtered.map((s) => ({
        market_and_exchange_names: s.name,
        report_date_as_mm_dd_yyyy: s.latestDate,
        as_of_date_in_form_yyyymmdd: s.latestDate,
        open_interest_all: s.openInterest,
        prod_merc_positions_long_all: s.commercialLong,
        prod_merc_positions_short_all: s.commercialShort,
        swap_positions_long_all: 0,
        swap_positions_short_all: 0,
        m_money_positions_long_all: s.managedMoneyLong,
        m_money_positions_short_all: s.managedMoneyShort,
        traders_tot_all: 0,
      })),
    [filtered]
  );

  const counts = useMemo(() => ({
    all: summaries.length,
    commodities: summaries.filter((s) => getMarketSector(s.name) === "commodities").length,
    financials: summaries.filter((s) => getMarketSector(s.name) === "financials").length,
  }), [summaries]);

  const bullCount = useMemo(
    () => filtered.filter((s) => s.commercialLong > s.commercialShort).length,
    [filtered]
  );
  const bearCount = filtered.length - bullCount;

  return (
    <>
      <Head>
        <title>Commodities — COT Analytics</title>
        <meta name="description" content="CFTC Commitment of Traders analytics" />
      </Head>

      <Layout>
        <div className="px-6 py-6 max-w-[1400px] mx-auto">

          {/* Terminal header */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                  CFTC · COT Report · Weekly
                </span>
              </div>
              <h1 className="font-mono text-xl font-bold text-white tracking-tight">
                Commodities Positioning
              </h1>
            </div>

            <Link
              href="/financials"
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 rounded text-xs font-mono font-medium transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              FINANCIALS DASHBOARD
            </Link>
          </div>

          {/* Stats strip */}
          {!loading && !error && (
            <div className="flex items-center gap-4 mb-5 px-3 py-2 bg-[#0d1117] border border-slate-800/60 rounded text-[11px] font-mono">
              <span className="text-slate-500">MARKETS</span>
              <span className="text-white font-bold">{filtered.length}</span>
              <span className="text-slate-700">|</span>
              <span className="text-emerald-400">▲ BULL {bullCount}</span>
              <span className="text-rose-400">▼ BEAR {bearCount}</span>
              {search && (
                <>
                  <span className="text-slate-700">|</span>
                  <span className="text-slate-500">filter: &quot;{search}&quot;</span>
                </>
              )}
            </div>
          )}

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            {/* Tabs */}
            <div className="flex items-center border-b border-slate-800">
              {(["all", "commodities", "financials"] as Tab[]).map((tab) => {
                const labels = { all: "ALL MARKETS", commodities: "COMMODITIES", financials: "FINANCIALS" };
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      "px-4 py-2 text-xs font-mono font-medium transition-colors border-b-2 -mb-px",
                      activeTab === tab
                        ? "border-brand-400 text-brand-400"
                        : "border-transparent text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {labels[tab]}
                    {!loading && (
                      <span className="ml-1.5 opacity-50">{counts[tab]}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search markets…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-[#0d1117] border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors w-52"
                />
              </div>
              <FilterBar
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={() => { setDateFrom(""); setDateTo(""); }}
              />
              <ExportButtons rows={exportRows} filenameBase="cot_dashboard" />
            </div>
          </div>

          {error && (
            <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 rounded px-4 py-3 mb-5 text-xs font-mono">
              ERROR: {error}
            </div>
          )}

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)
              : filtered.map((s) => <SummaryCard key={s.name} summary={s} />)}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24 text-slate-700">
              <p className="font-mono text-sm">NO RESULTS FOR &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;

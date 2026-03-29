import React, { useEffect, useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Layout from "../components/Layout";
import SummaryCard from "../components/SummaryCard";
import FilterBar from "../components/FilterBar";
import ExportButtons from "../components/ExportButtons";
import { CardSkeleton } from "../components/ui/Skeletons";
import { fetchDashboardSummaries } from "../lib/queries";
import type { CommoditySummary } from "../lib/types";

const Dashboard: NextPage = () => {
  const [summaries, setSummaries] = useState<CommoditySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchDashboardSummaries()
      .then(setSummaries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return summaries.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [summaries, search]);

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

  return (
    <>
      <Head>
        <title>COT Analytics Dashboard</title>
        <meta
          name="description"
          content="CFTC Commitment of Traders analytics"
        />
      </Head>

      <Layout>
        <div className="px-8 py-8 max-w-[1400px] mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Market Overview
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              CFTC Commitment of Traders — latest positioning snapshot per
              market
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-800">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>

              <input
                type="text"
                placeholder="Search markets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors w-64"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <FilterBar
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                onReset={() => {
                  setDateFrom("");
                  setDateTo("");
                }}
              />

              <ExportButtons rows={exportRows} filenameBase="cot_dashboard" />
            </div>
          </div>

          {!loading && (
            <div className="flex gap-6 mb-6 text-sm">
              <span className="text-slate-400">
                <span className="font-mono text-white font-bold">
                  {filtered.length}
                </span>{" "}
                markets
              </span>

              {search && (
                <span className="text-slate-500 font-mono text-xs">
                  Filtered by: &ldquo;{search}&rdquo;
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 rounded-xl px-5 py-4 mb-6 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))
              : filtered.map((s) => (
                  <Link
                    key={s.name}
                    href={`/markets/${encodeURIComponent(s.name)}`}
                  >
                    <div className="cursor-pointer hover:scale-[1.02] transition-transform">
                      <SummaryCard summary={s} />
                    </div>
                  </Link>
                ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-24 text-slate-600">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-mono">
                No markets found for &ldquo;{search}&rdquo;
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default Dashboard;
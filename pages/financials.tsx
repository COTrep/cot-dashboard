import React, { useEffect, useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import clsx from "clsx";
import Layout from "../components/Layout";
import FinancialCard from "../components/FinancialCard";
import { CardSkeleton } from "../components/ui/Skeletons";
import { fetchFinancialSummaries } from "../lib/queries";
import type { FinancialSummary } from "../lib/types";
import {
  getMarketCategory,
  getCategoryLabel,
  getCategoryIcon,
  FINANCIAL_CATEGORY_ORDER,
  type MarketCategory,
} from "../lib/marketCategories";
import { formatNumber } from "../utils/format";

// ── Stat strip ──────────────────────────────────────────────────────────────

interface StripStat {
  label: string;
  value: string;
  accent?: string;
}

function StatStrip({ stats }: { stats: StripStat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#0d1117] border border-slate-800/60 rounded px-4 py-3">
          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">{s.label}</p>
          <p className={clsx("text-xl font-mono font-bold", s.accent ?? "text-white")}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Category section ────────────────────────────────────────────────────────

function CategorySection({
  category,
  markets,
  search,
}: {
  category: MarketCategory;
  markets: FinancialSummary[];
  search: string;
}) {
  const filtered = useMemo(
    () => markets.filter((m) => m.name.toLowerCase().includes(search.toLowerCase())),
    [markets, search]
  );
  if (filtered.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/60">
        <span className="text-base">{getCategoryIcon(category)}</span>
        <h2 className="font-mono text-xs font-semibold text-slate-400 uppercase tracking-widest">
          {getCategoryLabel(category)}
        </h2>
        <span className="text-[10px] font-mono text-slate-600 bg-slate-800/60 px-1.5 py-0.5 rounded">
          {filtered.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
        {filtered.map((s) => (
          <FinancialCard key={s.name} summary={s} />
        ))}
      </div>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const FinancialsPage: NextPage = () => {
  const [summaries, setSummaries] = useState<FinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "all">("all");

  useEffect(() => {
    setLoading(true);
    fetchFinancialSummaries()
      .then(setSummaries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<MarketCategory, FinancialSummary[]>();
    for (const cat of FINANCIAL_CATEGORY_ORDER) map.set(cat, []);
    for (const s of summaries) {
      const cat = getMarketCategory(s.name);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return map;
  }, [summaries]);

  // Stats
  const stripStats = useMemo<StripStat[]>(() => {
    if (!summaries.length) return [];
    const totalOI = summaries.reduce((a, s) => a + s.openInterest, 0);
    const bullCount = summaries.filter((s) => {
      const t = s.assetMgrLong + s.assetMgrShort || 1;
      return (s.assetMgrLong / t) * 100 >= 60;
    }).length;
    const bearCount = summaries.filter((s) => {
      const t = s.assetMgrLong + s.assetMgrShort || 1;
      return (s.assetMgrLong / t) * 100 <= 40;
    }).length;
    return [
      { label: "Instruments", value: String(summaries.length) },
      { label: "Total OI", value: formatNumber(totalOI), accent: "text-brand-400" },
      { label: "Bullish", value: String(bullCount), accent: "text-emerald-400" },
      { label: "Bearish", value: String(bearCount), accent: "text-rose-400" },
    ];
  }, [summaries]);

  const categoryTabs: Array<{ key: MarketCategory | "all"; label: string }> = [
    { key: "all", label: "ALL" },
    { key: "equity", label: "EQUITY" },
    { key: "rates", label: "RATES" },
    { key: "fx", label: "FX" },
  ];

  const visibleGroups = useMemo(
    () => activeCategory === "all" ? FINANCIAL_CATEGORY_ORDER : [activeCategory as MarketCategory],
    [activeCategory]
  );

  return (
    <>
      <Head>
        <title>Financials — COT Analytics</title>
      </Head>

      <Layout>
        <div className="px-6 py-6 max-w-[1400px] mx-auto">

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-slate-600">
                <a href="/" className="hover:text-slate-400 transition-colors">DASHBOARD</a>
                <span className="mx-2 text-slate-700">/</span>
                <span className="text-slate-400">FINANCIALS</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
              <h1 className="font-mono text-xl font-bold text-white tracking-tight">
                Financial Futures
              </h1>
            </div>
            <p className="text-[11px] font-mono text-slate-600 mt-1 uppercase tracking-wide">
              CFTC Disaggregated COT · Equity Indices · Rates · FX
            </p>
          </div>

          {/* Stats */}
          {!loading && !error && <StatStrip stats={stripStats} />}

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            {/* Category tabs */}
            <div className="flex items-center border-b border-slate-800">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={clsx(
                    "px-4 py-2 text-xs font-mono font-medium transition-colors border-b-2 -mb-px",
                    activeCategory === tab.key
                      ? "border-violet-400 text-violet-400"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  )}
                >
                  {tab.label}
                  {tab.key !== "all" && !loading && (
                    <span className="ml-1.5 opacity-50">
                      {grouped.get(tab.key as MarketCategory)?.length ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search financial markets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0d1117] border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-600 transition-colors w-56"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 rounded px-4 py-3 mb-5 text-xs font-mono">
              ERROR: {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {Array.from({ length: 12 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}

          {/* Content */}
          {!loading && !error && visibleGroups.map((cat) => (
            <CategorySection
              key={cat}
              category={cat}
              markets={grouped.get(cat) ?? []}
              search={search}
            />
          ))}

          {!loading && !error && summaries.length === 0 && (
            <div className="text-center py-24 text-slate-700">
              <p className="font-mono text-sm">NO DATA IN cot_financials_raw</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default FinancialsPage;

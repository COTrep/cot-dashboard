import React, { useEffect, useState, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import clsx from "clsx";
import Layout from "../components/Layout";
import FinancialCard from "../components/FinancialCard";
import { CardSkeleton } from "../components/ui/Skeletons";
import { fetchDashboardSummaries } from "../lib/queries";
import type { CommoditySummary } from "../lib/types";
import {
  getMarketSector,
  getMarketCategory,
  getCategoryLabel,
  getCategoryIcon,
  FINANCIAL_CATEGORY_ORDER,
  type MarketCategory,
} from "../lib/marketCategories";
import { formatNumber } from "../utils/format";

// ── Stat summary strip ──────────────────────────────────────────────────────

interface StripStat {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}

function StatStrip({ stats }: { stats: StripStat[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-3"
        >
          <p className="text-xs text-slate-500 mb-1">{s.label}</p>
          <p className={clsx("text-xl font-mono font-bold", s.accent ?? "text-white")}>
            {s.value}
          </p>
          {s.sub && <p className="text-xs text-slate-600 font-mono mt-0.5">{s.sub}</p>}
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
  markets: CommoditySummary[];
  search: string;
}) {
  const filtered = useMemo(
    () =>
      markets.filter((m) =>
        m.name.toLowerCase().includes(search.toLowerCase())
      ),
    [markets, search]
  );

  if (filtered.length === 0) return null;

  const icon = getCategoryIcon(category);
  const label = getCategoryLabel(category);

  return (
    <section className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <h2 className="font-display text-base font-semibold text-white tracking-tight">
          {label}
        </h2>
        <span className="ml-1 text-xs font-mono text-slate-500 bg-surface-800 px-2 py-0.5 rounded-full">
          {filtered.length}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((s) => (
          <FinancialCard key={s.name} summary={s} />
        ))}
      </div>
    </section>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const FinancialsPage: NextPage = () => {
  const [summaries, setSummaries] = useState<CommoditySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<MarketCategory | "all">(
    "all"
  );

  useEffect(() => {
    setLoading(true);
    fetchDashboardSummaries()
      .then(setSummaries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const financials = useMemo(
    () => summaries.filter((s) => getMarketSector(s.name) === "financials"),
    [summaries]
  );

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<MarketCategory, CommoditySummary[]>();
    for (const cat of FINANCIAL_CATEGORY_ORDER) map.set(cat, []);
    for (const s of financials) {
      const cat = getMarketCategory(s.name);
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return map;
  }, [financials]);

  // Strip stats
  const stripStats = useMemo<StripStat[]>(() => {
    if (!financials.length) return [];
    const totalOI = financials.reduce((a, s) => a + s.openInterest, 0);
    const bullCount = financials.filter((s) => {
      const mmTotal = s.managedMoneyLong + s.managedMoneyShort || 1;
      return (s.managedMoneyLong / mmTotal) * 100 >= 60;
    }).length;
    const bearCount = financials.filter((s) => {
      const mmTotal = s.managedMoneyLong + s.managedMoneyShort || 1;
      return (s.managedMoneyLong / mmTotal) * 100 <= 40;
    }).length;
    return [
      {
        label: "Financial Markets",
        value: String(financials.length),
        sub: "tracked instruments",
      },
      {
        label: "Total Open Interest",
        value: formatNumber(totalOI),
        sub: "across all financials",
        accent: "text-brand-400",
      },
      {
        label: "Bullish Signals",
        value: String(bullCount),
        sub: "MM sentiment ≥ 60%",
        accent: "text-emerald-400",
      },
      {
        label: "Bearish Signals",
        value: String(bearCount),
        sub: "MM sentiment ≤ 40%",
        accent: "text-rose-400",
      },
    ];
  }, [financials]);

  const categoryTabs: Array<{ key: MarketCategory | "all"; label: string }> = [
    { key: "all", label: "All" },
    { key: "equity", label: "Equity" },
    { key: "rates", label: "Rates" },
    { key: "fx", label: "FX" },
  ];

  const visibleGroups = useMemo(() => {
    if (activeCategory === "all") return FINANCIAL_CATEGORY_ORDER;
    return [activeCategory as MarketCategory];
  }, [activeCategory]);

  return (
    <>
      <Head>
        <title>Financials — COT Analytics</title>
        <meta
          name="description"
          content="COT positioning for financial futures: equities, rates and currencies"
        />
      </Head>

      <Layout>
        <div className="px-8 py-8 max-w-[1400px] mx-auto">
          {/* Page header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-slate-500 text-sm font-mono">
                <a href="/" className="hover:text-white transition-colors">Dashboard</a>
                <span className="mx-2">/</span>
                <span className="text-white">Financials</span>
              </span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white tracking-tight">
              Financial Futures
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              CFTC COT positioning — equity indices, interest rates &amp; currencies
            </p>
          </div>

          {/* Stat strip */}
          {!loading && !error && <StatStrip stats={stripStats} />}

          {/* Controls row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-800">
            {/* Category tabs */}
            <div className="flex items-center gap-1 bg-surface-900 border border-surface-800 rounded-lg p-1">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={clsx(
                    "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                    activeCategory === tab.key
                      ? "bg-brand-600 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  {tab.label}
                  {tab.key !== "all" && (
                    <span className="ml-1.5 text-xs opacity-60">
                      {grouped.get(tab.key as MarketCategory)?.length ?? 0}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
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
                placeholder="Search financial markets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-brand-500 transition-colors w-64"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 rounded-xl px-5 py-4 mb-6 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Content grouped by category */}
          {!loading &&
            !error &&
            visibleGroups.map((cat) => (
              <CategorySection
                key={cat}
                category={cat}
                markets={grouped.get(cat) ?? []}
                search={search}
              />
            ))}

          {!loading && !error && financials.length === 0 && (
            <div className="text-center py-24 text-slate-600">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-mono text-sm">
                No financial futures found in the current dataset.
              </p>
              <p className="text-xs mt-2 text-slate-700">
                The keyword classifier may need tuning for your market names.
              </p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default FinancialsPage;

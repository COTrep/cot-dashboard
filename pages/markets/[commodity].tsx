// ─────────────────────────────────────────────────────────────────────────────
// pages/markets/[commodity].tsx
// Professional COT analysis page per commodity.
// Shares data source (RPC get_commodity_history) and chart components with
// pages/commodity/[name].tsx — only the KPI/gauge/signal-banner layout below
// is unique to this page.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useState, useCallback, useMemo } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import FilterBar from "../../components/FilterBar";
import { fetchCommodityData } from "../../lib/queries";
import type { CotRow } from "../../lib/types";
import {
  processRawCotData,
  buildCotSummary,
  fmtNumber,
  fmtChange,
  signalColor,
  cotIndexColor,
  cotIndexLabel,
  type ProcessedCotRow,
  type CotSummary,
} from "../../utils/cotCalculations";

const ChartSkeleton = () => (
  <div className="animate-pulse bg-slate-800 rounded-xl h-[300px]" />
);

const CommercialCombinedChart = dynamic(
  () => import("../../components/charts/CommercialCombinedChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const NetFundChart = dynamic(
  () => import("../../components/charts/NetFundChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const OpenInterestChart = dynamic(
  () => import("../../components/charts/OpenInterestChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const NetPositioningChart = dynamic(
  () => import("../../components/charts/NetPositioningChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function decode(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  change,
  colorClass,
  sub,
}: {
  label: string;
  value: string;
  change?: string;
  colorClass: string;
  sub?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-1">
      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">{label}</p>
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</p>
      {change && (
        <p
          className={`text-xs font-mono ${
            change.startsWith("+") ? "text-emerald-500" : "text-rose-500"
          }`}
        >
          {change} <span className="text-slate-600">vs prev week</span>
        </p>
      )}
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-800 rounded-xl ${className ?? ""}`} />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-[300px]" />
    </div>
  );
}

// ─── COT Index gauge ──────────────────────────────────────────────────────────

function CotIndexGauge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-500 font-mono text-2xl font-bold">—</span>;
  const pct = Math.max(0, Math.min(100, value));
  const colorClass = cotIndexColor(value);
  const label = cotIndexLabel(value);

  return (
    <div className="flex flex-col gap-1">
      <p className={`text-2xl font-bold font-mono ${colorClass}`}>
        {value.toFixed(1)}%
      </p>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              value >= 70
                ? "bg-emerald-500"
                : value <= 30
                ? "bg-rose-500"
                : "bg-amber-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span
          className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${colorClass}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const CommodityAnalysisPage: NextPage = () => {
  const router = useRouter();
  const { commodity } = router.query;
  const commodityName = typeof commodity === "string" ? decode(commodity) : null;

  const [data, setData] = useState<CotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = useCallback(() => {
    if (!commodityName) return;
    setLoading(true);
    setError(null);
    fetchCommodityData(commodityName, dateFrom || undefined, dateTo || undefined)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [commodityName, dateFrom, dateTo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Process data for KPI cards / COT Index gauge / signal banner ─────────
  const processed: ProcessedCotRow[] = useMemo(
    () => processRawCotData(data),
    [data]
  );

  const summary: CotSummary | null = useMemo(
    () => buildCotSummary(processed),
    [processed]
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  const title = commodityName
    ? `${commodityName} — COT Analysis`
    : "COT Analysis";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`COT professional analysis for ${commodityName}`}
        />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
            <a href="/" className="hover:text-brand-400 transition-colors">
              Dashboard
            </a>
            <span>/</span>
            <span className="text-slate-400">Markets</span>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-[260px]">
              {commodityName ?? "…"}
            </span>
          </nav>

          {/* ── Page title ── */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight mb-1">
                  {commodityName ?? "Loading…"}
                </h1>
                <p className="text-sm text-slate-400">
                  CFTC · Commitment of Traders · Professional Analysis
                </p>
              </div>
              {summary && (
                <span className="text-xs font-mono text-slate-500 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900">
                  Latest: {summary.latestDate}
                </span>
              )}
            </div>
          </div>

          {/* ── Date range controls ── */}
          <div className="mb-6 pb-6 border-b border-slate-800">
            <FilterBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onReset={() => { setDateFrom(""); setDateTo(""); }}
            />
          </div>

          {/* ── Error ── */}
          {error && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 rounded-xl px-5 py-4 mb-6 text-sm">
              <strong>Error fetching data:</strong> {error}
            </div>
          )}

          {/* ── Loading ── */}
          {loading && <LoadingSkeleton />}

          {/* ── Content ── */}
          {!loading && !error && (
            <>
              {data.length === 0 ? (
                <div className="text-center py-24 text-slate-600 font-mono">
                  No data found for this commodity.
                </div>
              ) : (
                <>
                  {/* ── KPI cards ── */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Commercial Net */}
                    <MetricCard
                      label="Commercial Net"
                      value={
                        summary
                          ? `${summary.commercialNet >= 0 ? "+" : ""}${fmtNumber(summary.commercialNet)}`
                          : "—"
                      }
                      change={
                        summary ? fmtChange(summary.commercialNetChange) : undefined
                      }
                      colorClass={signalColor(summary?.commercialNet ?? 0)}
                    />

                    {/* Managed Money Net */}
                    <MetricCard
                      label="Managed Money Net"
                      value={
                        summary
                          ? `${summary.managedMoneyNet >= 0 ? "+" : ""}${fmtNumber(summary.managedMoneyNet)}`
                          : "—"
                      }
                      change={
                        summary
                          ? fmtChange(summary.managedMoneyNetChange)
                          : undefined
                      }
                      colorClass={signalColor(summary?.managedMoneyNet ?? 0)}
                    />

                    {/* COT Index */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 flex flex-col gap-2">
                      <p className="text-[11px] uppercase tracking-widest text-slate-500 font-mono">
                        COT Index <span className="normal-case">(156wk rolling)</span>
                      </p>
                      <CotIndexGauge value={summary?.cotIndex ?? null} />
                    </div>

                    {/* Open Interest */}
                    <MetricCard
                      label="Open Interest"
                      value={summary ? fmtNumber(summary.openInterest) : "—"}
                      colorClass="text-slate-200"
                      sub="Total open contracts"
                    />
                  </div>

                  {/* ── Signal banner ── */}
                  {summary?.cotIndex !== null && summary?.cotIndex !== undefined && (
                    <div
                      className={`mb-6 rounded-xl border px-5 py-3 flex items-center gap-3 text-sm ${
                        summary.cotIndex >= 70
                          ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                          : summary.cotIndex <= 30
                          ? "bg-rose-950/40 border-rose-800 text-rose-300"
                          : "bg-amber-950/30 border-amber-900 text-amber-300"
                      }`}
                    >
                      <span className="text-lg">
                        {summary.cotIndex >= 70
                          ? "🟢"
                          : summary.cotIndex <= 30
                          ? "🔴"
                          : "🟡"}
                      </span>
                      <div>
                        <span className="font-semibold">
                          {cotIndexLabel(summary.cotIndex)} signal
                        </span>
                        {" — "}
                        <span className="opacity-80">
                          COT Index at{" "}
                          <strong>{summary.cotIndex.toFixed(1)}%</strong>.{" "}
                          {summary.cotIndex >= 70
                            ? "Commercials are historically net long — often a bullish contrarian signal."
                            : summary.cotIndex <= 30
                            ? "Commercials are historically net short — often a bearish contrarian signal."
                            : "Positioning is within neutral historical range."}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ── Charts ── */}
                  <div className="space-y-5">
                    <ChartCard
                      title="Commercial Net"
                      subtitle="Producer/Merchant + Swap Dealers combinados — el 'Commercial graph' para UCL/LCL"
                    >
                      <CommercialCombinedChart data={data} />
                    </ChartCard>

                    <ChartCard
                      title="Net-Fund Position"
                      subtitle="Managed Money neto — sin el ruido de los demás grupos"
                    >
                      <NetFundChart data={data} />
                    </ChartCard>

                    <ChartCard
                      title="Open Interest"
                      subtitle="Total open contracts over time"
                    >
                      <OpenInterestChart data={data} />
                    </ChartCard>

                    <ChartCard
                      title="Net Positioning + Open Interest (vista combinada)"
                      subtitle="Commercial, Swap Dealers y Managed Money por separado, vs Open Interest"
                    >
                      <NetPositioningChart data={data} />
                    </ChartCard>
                  </div>

                  {/* ── Legend / methodology note ── */}
                  <div className="mt-4 px-1 flex flex-wrap gap-x-6 gap-y-1 text-[11px] font-mono text-slate-600">
                    <span>
                      <span className="text-emerald-600">●</span> Commercial Net
                      = Prod/Merc Long − Short
                    </span>
                    <span>
                      <span className="text-sky-600">●</span> MM Net = Managed
                      Money Long − Short
                    </span>
                    <span>
                      COT Index = (Current − Min) / (Max − Min) × 100, rolling
                      156-week window
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CommodityAnalysisPage;

import React, { useEffect, useState, useCallback } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import FilterBar from "../../components/FilterBar";
import LegacyEquivalencePanel from "../../components/charts/LegacyEquivalencePanel";
import { fetchCommodityData } from "../../lib/queries";
import type { CotRow } from "../../lib/types";

const ChartSkeleton = () => (
  <div className="animate-pulse bg-slate-800 rounded-xl h-[300px]" />
);

const ProducerMerchantChart = dynamic(
  () => import("../../components/charts/ProducerMerchantChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const SwapDealersChart = dynamic(
  () => import("../../components/charts/SwapDealersChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const ManagedMoneyChart = dynamic(
  () => import("../../components/charts/ManagedMoneyChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CommodityCombinedNetChart = dynamic(
  () => import("../../components/charts/CommodityCombinedNetChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const OpenInterestChart = dynamic(
  () => import("../../components/charts/OpenInterestChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function decode(slug: string): string {
  try { return decodeURIComponent(slug); } catch { return slug; }
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
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
  return <div className={`animate-pulse bg-slate-800 rounded-xl ${className ?? ""}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[360px]" />
      ))}
    </div>
  );
}

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

  useEffect(() => { loadData(); }, [loadData]);

  const latest = data[data.length - 1];
  const title = commodityName ? `${commodityName} — COT Analysis` : "COT Analysis";

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={`COT analysis for ${commodityName}`} />
      </Head>

      <div className="min-h-screen bg-slate-950 text-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
            <a href="/" className="hover:text-brand-400 transition-colors">Dashboard</a>
            <span>/</span>
            <span className="text-slate-400">Markets</span>
            <span>/</span>
            <span className="text-slate-200 truncate max-w-[260px]">{commodityName ?? "…"}</span>
          </nav>

          {/* Title */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-white leading-tight mb-1">
                  {commodityName ?? "Loading…"}
                </h1>
                <p className="text-sm text-slate-400">CFTC · Commitment of Traders · Disaggregated</p>
              </div>
              {latest && (
                <span className="text-xs font-mono text-slate-500 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900">
                  Latest: {latest.as_of_date_in_form_yyyymmdd} · {data.length} weeks
                </span>
              )}
            </div>
          </div>

          {/* Date range controls */}
          <div className="mb-6 pb-6 border-b border-slate-800">
            <FilterBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onReset={() => { setDateFrom(""); setDateTo(""); }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 rounded-xl px-5 py-4 mb-6 text-sm">
              <strong>Error fetching data:</strong> {error}
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : data.length === 0 ? (
            <div className="text-center py-24 text-slate-600 font-mono">
              No data found for this commodity.
            </div>
          ) : (
            <>
              {/* Equivalence panel — always visible */}
              <LegacyEquivalencePanel type="commodity" />

              {/* Charts */}
              <div className="space-y-5">
                <ChartCard
                  title="Producer/Merchant (Commercials)"
                  subtitle="Long, Short y Neto — hedgers institucionales"
                >
                  <ProducerMerchantChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Swap Dealers (parte de Commercials)"
                  subtitle="Long, Short y Neto — intermediarios de swap"
                >
                  <SwapDealersChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Managed Money (Non-Commercial / Funds)"
                  subtitle="Long, Short y Neto — fondos especulativos"
                >
                  <ManagedMoneyChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Posiciones Netas Combinadas"
                  subtitle="Neto de cada grupo superpuesto — click en leyenda para mostrar/ocultar"
                >
                  <CommodityCombinedNetChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Open Interest"
                  subtitle="Total de contratos abiertos"
                >
                  <OpenInterestChart data={data} />
                </ChartCard>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CommodityAnalysisPage;

import React, { useEffect, useState, useCallback } from "react";
import type { NextPage, GetServerSideProps } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import Layout from "../../components/Layout";
import FilterBar from "../../components/FilterBar";
import ExportButtons from "../../components/ExportButtons";
import { ChartSkeleton, Spinner } from "../../components/ui/Skeletons";
import { fetchCommodityData } from "../../lib/queries";
import { unslugify, formatDate, formatNumber } from "../../utils/format";
import type { CotRow } from "../../lib/types";

// Dynamic imports to avoid SSR issues with ECharts
const OpenInterestChart = dynamic(
  () => import("../../components/charts/OpenInterestChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const CommercialChart = dynamic(
  () => import("../../components/charts/CommercialChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);
const ManagedMoneyChart = dynamic(
  () => import("../../components/charts/ManagedMoneyChart"),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

interface Props {
  commodityName: string;
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-mono font-bold ${color}`}>{formatNumber(value)}</p>
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
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
      <div className="mb-4">
        <h2 className="font-display font-semibold text-white text-base">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const CommodityPage: NextPage<Props> = ({ commodityName }) => {
  const [data, setData] = useState<CotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const loadData = useCallback(() => {
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

  const latest = data[data.length - 1];

  return (
    <>
      <Head>
        <title>{commodityName} — COT Analytics</title>
      </Head>

      <Layout selectedCommodity={commodityName}>
        <div className="px-8 py-8 max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <a
              href="/"
              className="text-xs text-slate-500 hover:text-brand-400 font-mono transition-colors inline-flex items-center gap-1 mb-3"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Dashboard
            </a>
            <h1 className="font-display text-2xl font-bold text-white leading-tight">
              {commodityName}
            </h1>
            {latest && (
              <p className="text-slate-400 text-sm mt-1 font-mono">
                Latest data: {formatDate(latest.as_of_date_in_form_yyyymmdd)} ·{" "}
                {data.length} weeks loaded
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-surface-800">
            <FilterBar
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              onReset={() => { setDateFrom(""); setDateTo(""); }}
            />
            <ExportButtons rows={data} filenameBase={`cot_${commodityName.slice(0, 30)}`} />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-900/30 border border-rose-700 text-rose-300 rounded-xl px-5 py-4 mb-6 text-sm">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* KPI badges */}
          {loading ? (
            <Spinner />
          ) : latest ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                <StatBadge
                  label="Open Interest"
                  value={latest.open_interest_all}
                  color="text-white"
                />
                <StatBadge
                  label="Commercial Long"
                  value={latest.prod_merc_positions_long_all}
                  color="text-emerald-400"
                />
                <StatBadge
                  label="Commercial Short"
                  value={latest.prod_merc_positions_short_all}
                  color="text-rose-400"
                />
                <StatBadge
                  label="MM Long"
                  value={latest.m_money_positions_long_all}
                  color="text-sky-400"
                />
                <StatBadge
                  label="MM Short"
                  value={latest.m_money_positions_short_all}
                  color="text-amber-400"
                />
              </div>

              {/* Charts */}
              <div className="space-y-5">
                <ChartCard
                  title="Open Interest"
                  subtitle="Total open contracts over time"
                >
                  <OpenInterestChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Commercial Positions"
                  subtitle="Producer / merchant long vs short (hedgers)"
                >
                  <CommercialChart data={data} />
                </ChartCard>

                <ChartCard
                  title="Managed Money Positions"
                  subtitle="Speculator (hedge fund) long vs short"
                >
                  <ManagedMoneyChart data={data} />
                </ChartCard>
              </div>

              {/* Raw data table */}
              <div className="mt-6 bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-surface-800">
                  <h2 className="font-display font-semibold text-white text-sm">Raw Data</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-surface-800 text-slate-500">
                        {[
                          "Date",
                          "Open Interest",
                          "Comm. Long",
                          "Comm. Short",
                          "Comm. Net",
                          "MM Long",
                          "MM Short",
                          "MM Net",
                          "Traders",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-right first:text-left whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...data].reverse().slice(0, 52).map((r, i) => {
                        const commNet =
                          r.prod_merc_positions_long_all - r.prod_merc_positions_short_all;
                        const mmNet =
                          r.m_money_positions_long_all - r.m_money_positions_short_all;
                        return (
                          <tr
                            key={i}
                            className="border-b border-surface-800/50 hover:bg-surface-800/40 transition-colors"
                          >
                            <td className="px-4 py-2 text-slate-400">
                              {formatDate(r.as_of_date_in_form_yyyymmdd)}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-200">
                              {r.open_interest_all.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-emerald-400">
                              {r.prod_merc_positions_long_all.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-rose-400">
                              {r.prod_merc_positions_short_all.toLocaleString()}
                            </td>
                            <td
                              className={`px-4 py-2 text-right font-semibold ${
                                commNet >= 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {commNet >= 0 ? "+" : ""}
                              {commNet.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-sky-400">
                              {r.m_money_positions_long_all.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-amber-400">
                              {r.m_money_positions_short_all.toLocaleString()}
                            </td>
                            <td
                              className={`px-4 py-2 text-right font-semibold ${
                                mmNet >= 0 ? "text-sky-400" : "text-amber-400"
                              }`}
                            >
                              {mmNet >= 0 ? "+" : ""}
                              {mmNet.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-slate-500">
                              {r.traders_tot_all.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {data.length > 52 && (
                  <p className="px-5 py-3 text-xs text-slate-600 border-t border-surface-800">
                    Showing last 52 weeks in table. Export to see all {data.length} rows.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-600">
              <p className="font-mono">No data found for this market.</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const name = params?.name as string;
  return {
    props: {
      commodityName: unslugify(name),
    },
  };
};

export default CommodityPage;

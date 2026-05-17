import React from "react";
import Link from "next/link";
import clsx from "clsx";
import type { FinancialSummary } from "../lib/types";
import { formatNumber } from "../utils/format";
import {
  getMarketCategory,
  getCategoryLabel,
  CATEGORY_STYLES,
} from "../lib/marketCategories";

interface Props {
  summary: FinancialSummary;
}

function SentimentGauge({ value }: { value: number }) {
  const color =
    value >= 60 ? "bg-emerald-500" : value <= 40 ? "bg-rose-500" : "bg-amber-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-slate-800 rounded-sm overflow-hidden">
        <div className={clsx("h-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="text-[10px] font-mono text-slate-400 w-7 text-right">{value}%</span>
    </div>
  );
}

function SignalChip({ value }: { value: number }) {
  if (value >= 60)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
        ▲ BULL
      </span>
    );
  if (value <= 40)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/25">
        ▼ BEAR
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-amber-500/10 text-amber-400 border border-amber-500/25">
      ◆ NEUTRAL
    </span>
  );
}

function formatDateIso(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export default function FinancialCard({ summary }: Props) {
  const category = getMarketCategory(summary.name);
  const styles = CATEGORY_STYLES[category];
  const label = getCategoryLabel(category);

  // Asset managers = institutional "smart money" for financials
  const assetMgrNet = summary.assetMgrLong - summary.assetMgrShort;
  const levMoneyNet = summary.levMoneyLong - summary.levMoneyShort;
  const dealerNet   = summary.dealerLong - summary.dealerShort;

  // Sentiment based on asset manager long ratio
  const amTotal = summary.assetMgrLong + summary.assetMgrShort || 1;
  const sentiment = Math.round((summary.assetMgrLong / amTotal) * 100);

  return (
    <Link
      href={`/financials/${encodeURIComponent(summary.name)}`}
      className={clsx(
        "block bg-[#0d1117] border border-slate-800/80 rounded-lg overflow-hidden",
        "hover:border-slate-600 hover:bg-[#111820] transition-all group"
      )}
    >
      {/* Accent bar */}
      <div className={clsx("h-0.5 w-full", styles.bar)} />

      <div className="p-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={clsx("text-[10px] font-mono font-semibold uppercase tracking-wider", styles.accent)}>
                {label}
              </span>
            </div>
            <h3 className="text-xs font-mono font-semibold text-white leading-tight truncate">
              {summary.name.split(" - ")[0]}
            </h3>
            <p className="text-[10px] font-mono text-slate-600 mt-0.5">
              {formatDateIso(summary.latestDate)}
            </p>
          </div>
          <SignalChip value={sentiment} />
        </div>

        {/* OI */}
        <div className="mb-3">
          <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">Open Interest</p>
          <p className="text-sm font-mono font-bold text-slate-200">
            {formatNumber(summary.openInterest)}
          </p>
        </div>

        {/* Asset Mgr Sentiment */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wide">Asset Mgr Sentiment</span>
          </div>
          <SentimentGauge value={sentiment} />
        </div>

        {/* Net positions grid */}
        <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-slate-800/60">
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase mb-0.5">Dealer</p>
            <p className={clsx("text-[11px] font-mono font-bold", dealerNet >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {dealerNet >= 0 ? "+" : ""}{formatNumber(dealerNet)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase mb-0.5">Asset Mgr</p>
            <p className={clsx("text-[11px] font-mono font-bold", assetMgrNet >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {assetMgrNet >= 0 ? "+" : ""}{formatNumber(assetMgrNet)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-600 uppercase mb-0.5">Lev Money</p>
            <p className={clsx("text-[11px] font-mono font-bold", levMoneyNet >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {levMoneyNet >= 0 ? "+" : ""}{formatNumber(levMoneyNet)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

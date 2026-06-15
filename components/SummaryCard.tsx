import React from "react";
import Link from "next/link";
import clsx from "clsx";
import type { CommoditySummary } from "../lib/types";
import { formatNumber, formatDate } from "../utils/format";
import {
  getMarketCategory,
  CATEGORY_STYLES,
} from "../lib/marketCategories";

interface Props {
  summary: CommoditySummary;
}

function PositionBar({ long, short }: { long: number; short: number }) {
  const total = long + short || 1;
  const longPct = (long / total) * 100;
  return (
    <div className="flex h-1 rounded-sm overflow-hidden bg-slate-800">
      <div className="bg-emerald-500 transition-all" style={{ width: `${longPct}%` }} />
      <div className="bg-rose-600 flex-1" />
    </div>
  );
}

function SignalBadge({ net }: { net: number }) {
  // Rough signal: positive commercial net = smart money long = bullish
  if (net > 0)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
        ▲ BULL
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-rose-500/10 text-rose-400 border border-rose-500/25">
      ▼ BEAR
    </span>
  );
}

export default function SummaryCard({ summary }: Props) {
  const category = getMarketCategory(summary.name);
  const styles = CATEGORY_STYLES[category];

  const commNet = summary.commercialLong - summary.commercialShort;
  const mmNet = summary.managedMoneyLong - summary.managedMoneyShort;

  return (
    <Link
      href={`/markets/${encodeURIComponent(summary.name)}`}
      className={clsx(
        "block bg-[#0d1117] border border-slate-800/80 rounded-lg overflow-hidden",
        "hover:border-slate-600 hover:bg-[#111820] transition-all group"
      )}
    >
      {/* Accent bar top */}
      <div className={clsx("h-0.5 w-full", styles.bar)} />

      <div className="p-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <h3 className="text-xs font-mono font-semibold text-white leading-tight truncate group-hover:text-slate-200 transition-colors">
              {summary.name}
            </h3>
            <p className="text-[10px] font-mono text-slate-600 mt-0.5">
              {formatDate(summary.latestDate)}
            </p>
          </div>
          <SignalBadge net={commNet} />
        </div>

        {/* OI + MM Net row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">Open Interest</p>
            <p className="text-sm font-mono font-bold text-slate-200">
              {formatNumber(summary.openInterest)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-slate-600 uppercase tracking-wide mb-0.5">MM Net</p>
            <p className={clsx(
              "text-sm font-mono font-bold",
              mmNet >= 0 ? "text-emerald-400" : "text-rose-400"
            )}>
              {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
            </p>
          </div>
        </div>

        {/* Net positions */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-slate-600">COMMERCIAL</span>
              <span className={clsx(
                "text-[10px] font-mono font-medium",
                commNet >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {commNet >= 0 ? "+" : ""}{formatNumber(commNet)}
              </span>
            </div>
            <PositionBar long={summary.commercialLong} short={summary.commercialShort} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-slate-600">MANAGED MONEY</span>
              <span className={clsx(
                "text-[10px] font-mono font-medium",
                mmNet >= 0 ? "text-emerald-400" : "text-rose-400"
              )}>
                {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
              </span>
            </div>
            <PositionBar long={summary.managedMoneyLong} short={summary.managedMoneyShort} />
          </div>
        </div>
      </div>
    </Link>
  );
}

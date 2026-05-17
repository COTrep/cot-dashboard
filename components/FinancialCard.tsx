import React from "react";
import Link from "next/link";
import clsx from "clsx";
import type { CommoditySummary } from "../lib/types";
import { formatNumber, formatDate } from "../utils/format";
import {
  getMarketCategory,
  getCategoryLabel,
  CATEGORY_STYLES,
} from "../lib/marketCategories";

interface Props {
  summary: CommoditySummary;
}

function SignalBadge({ value }: { value: number }) {
  if (value >= 60)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        BULL
      </span>
    );
  if (value <= 40)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        BEAR
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
      NEUTRAL
    </span>
  );
}

function SentimentBar({
  long,
  short,
  barColor,
}: {
  long: number;
  short: number;
  barColor: string;
}) {
  const total = Math.abs(long) + Math.abs(short) || 1;
  const longPct = (Math.abs(long) / total) * 100;
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden bg-surface-800">
      <div
        className={clsx("transition-all", barColor)}
        style={{ width: `${longPct}%` }}
      />
      <div className="bg-rose-600/60 flex-1" />
    </div>
  );
}

export default function FinancialCard({ summary }: Props) {
  const category = getMarketCategory(summary.name);
  const styles = CATEGORY_STYLES[category];
  const label = getCategoryLabel(category);

  const commNet = summary.commercialLong - summary.commercialShort;
  const mmNet = summary.managedMoneyLong - summary.managedMoneyShort;

  // Sentiment 0-100: based on MM long ratio vs total MM positions
  const mmTotal = summary.managedMoneyLong + summary.managedMoneyShort || 1;
  const sentiment = Math.round((summary.managedMoneyLong / mmTotal) * 100);

  return (
    <Link
      href={`/markets/${encodeURIComponent(summary.name)}`}
      className={clsx(
        "block rounded-xl p-4 border transition-all group hover:scale-[1.02]",
        styles.bg,
        styles.border,
        "hover:brightness-110"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx("text-xs font-mono font-medium", styles.accent)}>
              {label}
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-xs font-mono text-slate-500">
              {formatDate(summary.latestDate)}
            </span>
          </div>
          <h3 className="text-sm font-display font-semibold text-white leading-tight truncate group-hover:text-white transition-colors">
            {summary.name}
          </h3>
        </div>
        <SignalBadge value={sentiment} />
      </div>

      {/* Sentiment bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>MM Sentiment</span>
          <span className={clsx("font-mono font-bold", styles.accent)}>
            {sentiment}%
          </span>
        </div>
        <SentimentBar
          long={summary.managedMoneyLong}
          short={summary.managedMoneyShort}
          barColor={styles.bar}
        />
      </div>

      {/* OI */}
      <div className="mb-3 flex items-baseline gap-2">
        <div>
          <p className="text-xs text-slate-500">Open Interest</p>
          <p className="text-lg font-mono font-bold text-white">
            {formatNumber(summary.openInterest)}
          </p>
        </div>
      </div>

      {/* Net positions */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Commercial Net</p>
          <p
            className={clsx(
              "text-sm font-mono font-semibold",
              commNet >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {commNet >= 0 ? "+" : ""}
            {formatNumber(commNet)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">MM Net</p>
          <p
            className={clsx(
              "text-sm font-mono font-semibold",
              mmNet >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {mmNet >= 0 ? "+" : ""}
            {formatNumber(mmNet)}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-end mt-2">
        <svg
          className={clsx("w-3.5 h-3.5 transition-colors", styles.accent, "opacity-40 group-hover:opacity-100")}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>
    </Link>
  );
}

import React from "react";
import type { CommoditySummary } from "../lib/types";
import { formatNumber, formatDate, slugify } from "../utils/format";
import Link from "next/link";
import clsx from "clsx";

interface Props {
  summary: CommoditySummary;
}

function NetBar({ long, short }: { long: number; short: number }) {
  const total = long + short || 1;
  const longPct = (long / total) * 100;
  return (
    <div className="flex h-1 rounded-full overflow-hidden bg-surface-800 mt-1">
      <div
        className="bg-emerald-500 transition-all"
        style={{ width: `${longPct}%` }}
      />
      <div className="bg-rose-500 flex-1" />
    </div>
  );
}

function StatCell({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className={clsx("text-sm font-mono font-medium", className)}>{value}</p>
    </div>
  );
}

export default function SummaryCard({ summary }: Props) {
  const netCommercial = summary.commercialLong - summary.commercialShort;
  const netMM = summary.managedMoneyLong - summary.managedMoneyShort;

  return (
    <Link
      href={`/commodity/${slugify(summary.name)}`}
      className="block bg-surface-900 border border-surface-800 rounded-xl p-4 hover:border-brand-600/50 hover:bg-surface-800/60 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-slate-500 mb-0.5">{formatDate(summary.latestDate)}</p>
          <h3 className="text-sm font-display font-semibold text-white leading-tight truncate group-hover:text-brand-300 transition-colors">
            {summary.name}
          </h3>
        </div>
        <svg
          className="w-4 h-4 text-slate-600 group-hover:text-brand-400 shrink-0 transition-colors mt-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>

      {/* Open Interest */}
      <div className="mb-3">
        <p className="text-xs text-slate-500">Open Interest</p>
        <p className="text-xl font-mono font-bold text-white">
          {formatNumber(summary.openInterest)}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <StatCell
          label="Commercial L"
          value={formatNumber(summary.commercialLong)}
          className="text-emerald-400"
        />
        <StatCell
          label="Commercial S"
          value={formatNumber(summary.commercialShort)}
          className="text-rose-400"
        />
        <StatCell
          label="MM Long"
          value={formatNumber(summary.managedMoneyLong)}
          className="text-sky-400"
        />
        <StatCell
          label="MM Short"
          value={formatNumber(summary.managedMoneyShort)}
          className="text-amber-400"
        />
      </div>

      {/* Net bars */}
      <div className="mt-3 space-y-1.5">
        <div>
          <p className="text-xs text-slate-600 flex justify-between">
            <span>Commercial net</span>
            <span className={netCommercial >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {netCommercial >= 0 ? "+" : ""}{formatNumber(netCommercial)}
            </span>
          </p>
          <NetBar long={summary.commercialLong} short={summary.commercialShort} />
        </div>
        <div>
          <p className="text-xs text-slate-600 flex justify-between">
            <span>MM net</span>
            <span className={netMM >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {netMM >= 0 ? "+" : ""}{formatNumber(netMM)}
            </span>
          </p>
          <NetBar long={summary.managedMoneyLong} short={summary.managedMoneyShort} />
        </div>
      </div>
    </Link>
  );
}

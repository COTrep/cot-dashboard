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
    <div className="flex h-[3px] rounded-sm overflow-hidden bg-[#1a2030]">
      <div
        className="transition-all"
        style={{
          width: `${longPct}%`,
          background: "linear-gradient(90deg,#3b82f6,#06b6d4)",
        }}
      />
      <div
        className="flex-1"
        style={{ background: "linear-gradient(90deg,#f43f5e,#fb7185)" }}
      />
    </div>
  );
}

function SignalBadge({ net }: { net: number }) {
  if (net > 0)
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#0a1f17] text-[#10b981] border border-[#0f3324]">
        ▲ BULL
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-[#1a0914] text-[#f43f5e] border border-[#2d0f1a]">
      ▼ BEAR
    </span>
  );
}

function MiniSparkline({ values }: { values?: number[] }) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const W = 100;
  const H = 28;
  const pad = 2;

  const points = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (W - 2 * pad);
      const y = H - pad - ((v - min) / range) * (H - 2 * pad);
      return `${x},${y}`;
    })
    .join(" ");

  const lastValue = values[values.length - 1];
  const color = lastValue >= 0 ? "#10b981" : "#f43f5e";

  const rawZeroY = H - pad - ((0 - min) / range) * (H - 2 * pad);
  const zeroY = Math.max(pad, Math.min(H - pad, rawZeroY));

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-2.5"
    >
      <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="#252d3d" strokeWidth={0.5} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function SummaryCard({ summary }: Props) {
  const category = getMarketCategory(summary.name);
  const styles = CATEGORY_STYLES[category];

  const commNet = summary.commercialLong - summary.commercialShort;
  const mmNet = summary.managedMoneyLong - summary.managedMoneyShort;

  const normalizedIndex = Math.max(
    0,
    Math.min(100, ((commNet / (summary.openInterest || 1) + 1) / 2) * 100)
  );

  return (
    <Link
      href={`/markets/${encodeURIComponent(summary.name)}`}
      className="block relative rounded-lg overflow-hidden transition-all group"
      style={{
        background: "#161b27",
        border: "1px solid #252d3d",
        boxShadow: "0 2px 12px rgba(0,0,0,0.35)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#3b82f6";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 4px 20px rgba(59,130,246,0.1), 0 2px 12px rgba(0,0,0,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#252d3d";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.35)";
      }}
    >
      {/* Left stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: styles.stripe }}
      />

      {/* Top gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 h-16 pointer-events-none rounded-t-lg"
        style={{ background: `linear-gradient(180deg, ${styles.glow} 0%, transparent 100%)` }}
      />

      <div className="relative pl-4 pr-3.5 py-3.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="min-w-0">
            <h3 className="text-xs font-mono font-semibold text-[#f1f5f9] leading-tight truncate">
              {summary.name}
            </h3>
            <p className="text-[10px] font-mono text-[#3d4d6b] mt-0.5">
              {formatDate(summary.latestDate)}
            </p>
          </div>
          <SignalBadge net={commNet} />
        </div>

        {/* OI + MM Net row */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <p className="text-[10px] text-[#3d4d6b] uppercase tracking-wide mb-0.5">Open Interest</p>
            <p className="text-base font-mono font-bold text-[#f1f5f9]">
              {formatNumber(summary.openInterest)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#3d4d6b] uppercase tracking-wide mb-0.5">MM Net</p>
            <p
              className="text-base font-mono font-bold"
              style={{ color: mmNet >= 0 ? "#10b981" : "#f43f5e" }}
            >
              {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
            </p>
          </div>
        </div>

        {/* Net positions */}
        <div className="space-y-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-[#3d4d6b]">COMMERCIAL</span>
              <span
                className="text-[10px] font-mono font-medium"
                style={{ color: commNet >= 0 ? "#10b981" : "#f43f5e" }}
              >
                {commNet >= 0 ? "+" : ""}{formatNumber(commNet)}
              </span>
            </div>
            <PositionBar long={summary.commercialLong} short={summary.commercialShort} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono text-[#3d4d6b]">MANAGED MONEY</span>
              <span
                className="text-[10px] font-mono font-medium"
                style={{ color: mmNet >= 0 ? "#10b981" : "#f43f5e" }}
              >
                {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
              </span>
            </div>
            <PositionBar long={summary.managedMoneyLong} short={summary.managedMoneyShort} />
          </div>
        </div>

        {/* MM Net sparkline */}
        <MiniSparkline values={summary.mmNetHistory} />

        {/* COT Index proxy bar */}
        <div className="mt-2.5">
          <div className="flex justify-between text-[9px] font-mono text-[#3d4d6b] mb-0.5">
            <span>COT IDX</span>
            <span>{Math.round(normalizedIndex)}%</span>
          </div>
          <div className="h-[3px] bg-[#1a2030] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${normalizedIndex}%`,
                background:
                  normalizedIndex >= 50
                    ? "linear-gradient(90deg,#10b981,#06b6d4)"
                    : "#f43f5e",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

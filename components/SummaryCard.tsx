import React from "react";
import Link from "next/link";
import type { CommoditySummary } from "../lib/types";
import { formatNumber, formatDate } from "../utils/format";
import { getMarketCategory } from "../lib/marketCategories";

interface Props {
  summary: CommoditySummary;
}

const CATEGORY_ACCENT: Record<string, string> = {
  energy:      "#ef5350",
  metals:      "#26a69a",
  agriculture: "#ff6d00",
  livestock:   "#ff7043",
  equity:      "#2962ff",
  rates:       "#00bcd4",
  fx:          "#2962ff",
  other:       "#787b86",
};

function PositionBar({ long, short }: { long: number; short: number }) {
  const total = long + short || 1;
  const longPct = (long / total) * 100;
  return (
    <div className="flex h-[2px] overflow-hidden" style={{ background: "#ef5350" }}>
      <div style={{ width: `${longPct}%`, background: "#26a69a" }} />
    </div>
  );
}

function SignalBadge({ net }: { net: number }) {
  if (net > 0)
    return (
      <span
        className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-[2px]"
        style={{ background: "#0d1f1e", color: "#26a69a", border: "1px solid rgba(38,166,154,0.2)" }}
      >
        ▲ BULL
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-1 text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-[2px]"
      style={{ background: "#1f0d0d", color: "#ef5350", border: "1px solid rgba(239,83,80,0.2)" }}
    >
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
  const color = lastValue >= 0 ? "#26a69a" : "#ef5350";

  const rawZeroY = H - pad - ((0 - min) / range) * (H - 2 * pad);
  const zeroY = Math.max(pad, Math.min(H - pad, rawZeroY));

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-2"
    >
      <line x1={pad} y1={zeroY} x2={W - pad} y2={zeroY} stroke="#2a2e39" strokeWidth={0.5} />
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
  const accentColor = CATEGORY_ACCENT[category] ?? "#787b86";

  const commNet = summary.commercialLong - summary.commercialShort;
  const mmNet = summary.managedMoneyLong - summary.managedMoneyShort;

  const normalizedIndex = Math.max(
    0,
    Math.min(100, ((commNet / (summary.openInterest || 1) + 1) / 2) * 100)
  );

  return (
    <Link
      href={`/markets/${encodeURIComponent(summary.name)}`}
      className="block relative overflow-hidden transition-colors"
      style={{
        background: "#1e222d",
        border: "1px solid #2a2e39",
        borderRadius: "4px",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#363a45";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "#2a2e39";
      }}
    >
      {/* Left accent strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: accentColor }}
      />

      <div className="pl-3.5 pr-2.5 py-2.5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold leading-tight truncate tracking-tight" style={{ color: "#d1d4dc" }}>
              {summary.name}
            </h3>
            <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#4a5060" }}>
              {formatDate(summary.latestDate)}
            </p>
          </div>
          <SignalBadge net={commNet} />
        </div>

        {/* OI + MM Net row */}
        <div className="grid grid-cols-2 gap-2 mb-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#4a5060" }}>Open Interest</p>
            <p className="text-[14px] font-semibold font-mono tabular-nums" style={{ color: "#d1d4dc" }}>
              {formatNumber(summary.openInterest)}
            </p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: "#4a5060" }}>MM Net</p>
            <p
              className="text-[14px] font-semibold font-mono tabular-nums"
              style={{ color: mmNet >= 0 ? "#26a69a" : "#ef5350" }}
            >
              {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
            </p>
          </div>
        </div>

        {/* Position bars */}
        <div className="space-y-2 border-t pt-2" style={{ borderColor: "#2a2e39" }}>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "#4a5060" }}>Commercial</span>
              <span
                className="text-[9px] font-mono font-medium"
                style={{ color: commNet >= 0 ? "#26a69a" : "#ef5350" }}
              >
                {commNet >= 0 ? "+" : ""}{formatNumber(commNet)}
              </span>
            </div>
            <PositionBar long={summary.commercialLong} short={summary.commercialShort} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] uppercase tracking-wider" style={{ color: "#4a5060" }}>Managed Money</span>
              <span
                className="text-[9px] font-mono font-medium"
                style={{ color: mmNet >= 0 ? "#26a69a" : "#ef5350" }}
              >
                {mmNet >= 0 ? "+" : ""}{formatNumber(mmNet)}
              </span>
            </div>
            <PositionBar long={summary.managedMoneyLong} short={summary.managedMoneyShort} />
          </div>
        </div>

        {/* MM Net sparkline */}
        <MiniSparkline values={summary.mmNetHistory} />

        {/* COT Index bar */}
        <div className="mt-2">
          <div className="flex justify-between text-[9px] font-mono mb-0.5" style={{ color: "#4a5060" }}>
            <span>COT IDX</span>
            <span>{Math.round(normalizedIndex)}%</span>
          </div>
          <div className="h-[2px] rounded-full overflow-hidden" style={{ background: "#2a2e39" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${normalizedIndex}%`,
                background: normalizedIndex >= 50 ? "#26a69a" : "#ef5350",
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

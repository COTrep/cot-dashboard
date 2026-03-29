// ─────────────────────────────────────────────────────────────────────────────
// components/COTChart.tsx
// Recharts-based professional COT chart.
// Drop into your existing components/ folder.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo } from "react";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Area,
} from "recharts";
import type { ProcessedCotRow } from "../utils/cotCalculations";
import {
  filterByTimeframe,
  fmtNumber,
  cotIndexColor,
  cotIndexLabel,
} from "../utils/cotCalculations";

// ─── Types ───────────────────────────────────────────────────────────────────

type Timeframe = "6M" | "1Y" | "3Y";
const TIMEFRAME_MONTHS: Record<Timeframe, number> = { "6M": 6, "1Y": 12, "3Y": 36 };

interface COTChartProps {
  data: ProcessedCotRow[];
  commodity: string;
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function COTTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  const byKey = Object.fromEntries(payload.map((p: any) => [p.dataKey, p]));

  return (
    <div className="bg-[#0f172a] border border-slate-700 rounded-xl px-4 py-3 shadow-2xl text-xs font-mono space-y-1.5 min-w-[200px]">
      <p className="text-slate-400 font-sans text-[11px] mb-2 font-semibold">{label}</p>

      {byKey["commercialNet"] && (
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">Commercial Net</span>
          <span
            className={
              byKey["commercialNet"].value >= 0 ? "text-emerald-400" : "text-rose-400"
            }
          >
            {byKey["commercialNet"].value >= 0 ? "+" : ""}
            {fmtNumber(byKey["commercialNet"].value)}
          </span>
        </div>
      )}
      {byKey["managedMoneyNet"] && (
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">MM Net</span>
          <span
            className={
              byKey["managedMoneyNet"].value >= 0 ? "text-sky-400" : "text-orange-400"
            }
          >
            {byKey["managedMoneyNet"].value >= 0 ? "+" : ""}
            {fmtNumber(byKey["managedMoneyNet"].value)}
          </span>
        </div>
      )}
      {byKey["openInterest"] && (
        <div className="flex justify-between gap-6 border-t border-slate-800 pt-1.5 mt-1">
          <span className="text-slate-400">Open Interest</span>
          <span className="text-slate-200">{fmtNumber(byKey["openInterest"].value)}</span>
        </div>
      )}
      {byKey["cotIndex"] !== undefined && byKey["cotIndex"]?.value !== null && (
        <div className="flex justify-between gap-6">
          <span className="text-slate-400">COT Index</span>
          <span className={cotIndexColor(byKey["cotIndex"].value)}>
            {byKey["cotIndex"].value?.toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Tick formatters ─────────────────────────────────────────────────────────

function xTickFormatter(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function yTickFormatter(v: number): string {
  return fmtNumber(v);
}

// ─── Legend content ──────────────────────────────────────────────────────────

function CustomLegend() {
  return (
    <div className="flex flex-wrap gap-5 justify-center text-xs font-mono mt-2">
      {[
        { color: "#10b981", label: "Commercial Net" },
        { color: "#38bdf8", label: "Managed Money Net" },
        { color: "#64748b", label: "Open Interest", dashed: true },
      ].map(({ color, label, dashed }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-6 h-[2px]"
            style={{
              background: color,
              borderTop: dashed ? `2px dashed ${color}` : undefined,
              height: dashed ? 0 : 2,
            }}
          />
          <span className="text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function COTChart({ data, commodity }: COTChartProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [showCotIndex, setShowCotIndex] = useState(false);

  const filtered = useMemo(
    () => filterByTimeframe(data, TIMEFRAME_MONTHS[timeframe]),
    [data, timeframe]
  );

  // Compute axis domains with padding
  const nets = filtered.flatMap((r) => [r.commercialNet, r.managedMoneyNet]);
  const netMin = Math.min(...nets);
  const netMax = Math.max(...nets);
  const netPad = (netMax - netMin) * 0.1;

  const oiValues = filtered.map((r) => r.openInterest);
  const oiMin = Math.min(...oiValues);
  const oiMax = Math.max(...oiValues);
  const oiPad = (oiMax - oiMin) * 0.15;

  // Reduce tick density based on data length
  const tickInterval = Math.max(1, Math.floor(filtered.length / 10));

  return (
    <div className="w-full">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          {(["6M", "1Y", "3Y"] as Timeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                timeframe === tf
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* COT Index toggle */}
        <button
          onClick={() => setShowCotIndex((s) => !s)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            showCotIndex
              ? "border-violet-500 text-violet-300 bg-violet-500/10"
              : "border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${showCotIndex ? "bg-violet-400" : "bg-slate-600"}`}
          />
          COT Index overlay
        </button>
      </div>

      {/* Chart wrapper */}
      <div className="w-full" style={{ height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={filtered}
            margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
          >
            <defs>
              <linearGradient id="commGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mmGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={{ stroke: "#1e293b" }}
              tickFormatter={xTickFormatter}
              interval={tickInterval}
            />

            {/* Left axis: nets */}
            <YAxis
              yAxisId="net"
              domain={[netMin - netPad, netMax + netPad]}
              tick={{ fill: "#475569", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yTickFormatter}
              width={62}
            />

            {/* Right axis: OI */}
            <YAxis
              yAxisId="oi"
              orientation="right"
              domain={[oiMin - oiPad, oiMax + oiPad]}
              tick={{ fill: "#334155", fontSize: 10, fontFamily: "monospace" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yTickFormatter}
              width={62}
            />

            {/* Optional right axis for COT Index 0–100 */}
            {showCotIndex && (
              <YAxis
                yAxisId="cot"
                orientation="right"
                domain={[0, 100]}
                tick={{ fill: "#6d28d9", fontSize: 10, fontFamily: "monospace" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={42}
              />
            )}

            <Tooltip content={<COTTooltip />} />

            <ReferenceLine
              yAxisId="net"
              y={0}
              stroke="#334155"
              strokeDasharray="4 4"
            />

            {/* Open Interest — bars in background */}
            <Bar
              yAxisId="oi"
              dataKey="openInterest"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth={0.5}
              radius={[2, 2, 0, 0]}
              maxBarSize={12}
              name="Open Interest"
            />

            {/* Commercial Net — area + line */}
            <Area
              yAxisId="net"
              type="monotone"
              dataKey="commercialNet"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#commGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#10b981" }}
              name="Commercial Net"
            />

            {/* Managed Money Net */}
            <Area
              yAxisId="net"
              type="monotone"
              dataKey="managedMoneyNet"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#mmGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#38bdf8" }}
              name="Managed Money Net"
            />

            {/* COT Index overlay (optional) */}
            {showCotIndex && (
              <Line
                yAxisId="cot"
                type="monotone"
                dataKey="cotIndex"
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
                name="COT Index"
                connectNulls
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <CustomLegend />
    </div>
  );
}

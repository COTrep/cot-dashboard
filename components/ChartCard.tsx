import React, { useState } from "react";
import clsx from "clsx";

export type PeriodKey = "1Y" | "3Y" | "5Y" | "10Y" | "All";

const PERIODS: { key: PeriodKey; label: string; years?: number }[] = [
  { key: "1Y",  label: "1Y",  years: 1 },
  { key: "3Y",  label: "3Y",  years: 3 },
  { key: "5Y",  label: "5Y",  years: 5 },
  { key: "10Y", label: "10Y", years: 10 },
  { key: "All", label: "All" },
];

export function periodToDataZoomStart(key: PeriodKey, totalWeeks: number): number {
  const years = PERIODS.find(p => p.key === key)?.years;
  if (!years) return 0;
  const weeks = years * 52;
  if (totalWeeks <= weeks) return 0;
  return Math.round((1 - weeks / totalWeeks) * 100);
}

interface Props {
  title: string;
  subtitle?: string;
  defaultPeriod?: PeriodKey;
  showNetToggle?: boolean;
  dataLength?: number;
  children: (opts: { period: PeriodKey; netOnly: boolean; dzStart: number }) => React.ReactNode;
}

const btnBase =
  "text-[9px] font-bold tracking-wider uppercase font-mono px-2.5 py-1 rounded-md border transition-all";
const btnDefault =
  "border-[#252d3d] text-[#3d4d6b] bg-transparent hover:border-[#3b82f6] hover:text-[#8b98b2]";
const btnActive =
  "border-[#3b82f6] text-[#3b82f6] bg-[rgba(59,130,246,0.08)]";
const netActive =
  "border-[#a78bfa] text-[#a78bfa] bg-[rgba(167,139,250,0.06)]";

export default function ChartCard({
  title,
  subtitle,
  defaultPeriod = "All",
  showNetToggle = false,
  dataLength = 0,
  children,
}: Props) {
  const [period, setPeriod] = useState<PeriodKey>(defaultPeriod);
  const [netOnly, setNetOnly] = useState(false);

  const dzStart = periodToDataZoomStart(period, dataLength);

  return (
    <div className="bg-[#161b27] border border-[#252d3d] rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.35)] hover:border-[#3b82f6] transition-all">
      <div className="px-4 py-3 border-b border-[#1a2030] flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-sm tracking-tight text-[#f1f5f9]">{title}</h2>
          {subtitle && <p className="text-[10px] text-[#8b98b2] mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {showNetToggle && (
            <>
              <button
                onClick={() => setNetOnly(v => !v)}
                className={clsx(btnBase, netOnly ? netActive : btnDefault)}
              >
                Net
              </button>
              <div className="w-px h-4 bg-[#252d3d] mx-1" />
            </>
          )}
          <div className="flex items-center gap-1.5">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={clsx(btnBase, period === p.key ? btnActive : btnDefault)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {children({ period, netOnly, dzStart })}
    </div>
  );
}

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
  "text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[3px] border transition-colors";
const btnDefault =
  "border-transparent text-[#787b86] bg-transparent hover:bg-[#2a2e39] hover:text-[#d1d4dc]";
const btnActive =
  "bg-[#0a1535] text-[#2962ff] border-[rgba(41,98,255,.3)]";
const netActive =
  "bg-[rgba(38,166,154,.08)] text-[#26a69a] border-[rgba(38,166,154,.25)]";

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
    <div
      className="overflow-hidden transition-colors"
      style={{
        background: "#1e222d",
        border: "1px solid #2a2e39",
        borderRadius: "4px",
      }}
    >
      <div
        className="px-3 h-9 flex items-center justify-between border-b"
        style={{ borderColor: "#2a2e39" }}
      >
        <div>
          <h2 className="font-semibold text-[12px] tracking-tight" style={{ color: "#d1d4dc" }}>{title}</h2>
          {subtitle && <p className="text-[10px] mt-0.5" style={{ color: "#787b86" }}>{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {showNetToggle && (
            <>
              <button
                onClick={() => setNetOnly(v => !v)}
                className={clsx(btnBase, netOnly ? netActive : btnDefault)}
              >
                Net
              </button>
              <div className="w-px h-4 mx-1" style={{ background: "#2a2e39" }} />
            </>
          )}
          <div className="flex items-center gap-1">
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

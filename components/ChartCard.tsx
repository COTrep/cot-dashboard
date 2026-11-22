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
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="font-display font-semibold text-white text-base">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {showNetToggle && (
            <button
              onClick={() => setNetOnly(v => !v)}
              className={clsx(
                "px-2 py-0.5 rounded border text-[10px] font-mono transition-colors",
                netOnly
                  ? "border-brand-500 text-brand-400"
                  : "border-surface-700 text-slate-500 hover:text-slate-300"
              )}
            >
              Net
            </button>
          )}
          <div className="flex items-center gap-0.5">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={clsx(
                  "px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors",
                  period === p.key
                    ? "border-brand-500 text-brand-400"
                    : "border-surface-700 text-slate-500 hover:text-slate-300"
                )}
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

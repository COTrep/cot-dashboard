import React from "react";
import clsx from "clsx";

interface Props {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onReset: () => void;
}

const PRESETS: Array<{ label: string; years: number }> = [
  { label: "1Y", years: 1 },
  { label: "3Y", years: 3 },
  { label: "5Y", years: 5 },
  { label: "10Y", years: 10 },
  { label: "20Y", years: 20 },
];

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function FilterBar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: Props) {
  const inputClass =
    "bg-surface-800 border border-surface-700 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-brand-500 transition-colors font-mono";

  const applyPreset = (years: number) => {
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);
    onDateToChange(isoDate(to));
    onDateFromChange(isoDate(from));
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.years)}
            className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1.5 rounded-md border border-surface-700 hover:border-surface-500 transition-colors"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={onReset}
          className={clsx(
            "text-xs font-mono px-2.5 py-1.5 rounded-md border transition-colors",
            !dateFrom && !dateTo
              ? "border-brand-500 text-brand-400"
              : "border-surface-700 text-slate-400 hover:text-white hover:border-surface-500"
          )}
        >
          All
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 font-mono uppercase tracking-wider">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-slate-500 font-mono uppercase tracking-wider">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        onClick={onReset}
        className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-surface-700 hover:border-surface-500 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}

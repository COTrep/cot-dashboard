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

function presetMatchesDates(years: number, dateFrom: string, dateTo: string): boolean {
  if (!dateFrom || !dateTo) return false;
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - years);
  const expectedFrom = isoDate(from);
  const expectedTo = isoDate(to);
  return dateFrom === expectedFrom && dateTo === expectedTo;
}

const presetBase =
  "text-[9px] font-bold tracking-widest uppercase font-mono px-3 py-1.5 rounded-md border transition-all";
const presetDefault =
  "border-[#252d3d] text-[#3d4d6b] bg-transparent hover:border-[#3b82f6] hover:text-[#8b98b2]";
const presetActive =
  "border-[#3b82f6] text-[#3b82f6] bg-[rgba(59,130,246,0.08)]";

export default function FilterBar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: Props) {
  const inputClass =
    "bg-[#161b27] border border-[#252d3d] text-[#f1f5f9] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3b82f6] transition-colors font-mono";

  const applyPreset = (years: number) => {
    const to = new Date();
    const from = new Date();
    from.setFullYear(from.getFullYear() - years);
    onDateToChange(isoDate(to));
    onDateFromChange(isoDate(from));
  };

  const isAllActive = !dateFrom && !dateTo;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p.years)}
            className={clsx(
              presetBase,
              presetMatchesDates(p.years, dateFrom, dateTo) ? presetActive : presetDefault
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={onReset}
          className={clsx(presetBase, isAllActive ? presetActive : presetDefault)}
        >
          All
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#3d4d6b] font-mono uppercase tracking-wider">From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[9px] text-[#3d4d6b] font-mono uppercase tracking-wider">To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        onClick={onReset}
        className={clsx(presetBase, isAllActive ? presetActive : presetDefault)}
      >
        Reset
      </button>
    </div>
  );
}

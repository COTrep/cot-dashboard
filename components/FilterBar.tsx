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
  "text-[10px] font-semibold tracking-wide px-2 py-1 rounded-[3px] border transition-colors";
const presetDefault =
  "border-transparent text-[#787b86] bg-transparent hover:bg-[#2a2e39] hover:text-[#d1d4dc]";
const presetActive =
  "bg-[#0a1535] text-[#2962ff] border-[rgba(41,98,255,.3)]";

export default function FilterBar({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onReset,
}: Props) {
  const inputClass =
    "text-[11px] rounded-[3px] px-2.5 py-1.5 focus:outline-none transition-colors font-mono";

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
        <label className="text-[9px] uppercase tracking-wider" style={{ color: "#4a5060" }}>From</label>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className={inputClass}
          style={{
            background: "#2a2e39",
            border: "1px solid #363a45",
            color: "#d1d4dc",
          }}
          onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#2962ff"; }}
          onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#363a45"; }}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[9px] uppercase tracking-wider" style={{ color: "#4a5060" }}>To</label>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className={inputClass}
          style={{
            background: "#2a2e39",
            border: "1px solid #363a45",
            color: "#d1d4dc",
          }}
          onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "#2962ff"; }}
          onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "#363a45"; }}
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

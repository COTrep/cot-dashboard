import React from "react";

interface Props {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  onReset: () => void;
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

  return (
    <div className="flex flex-wrap items-center gap-3">
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

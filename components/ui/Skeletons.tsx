import React from "react";

export function ChartSkeleton() {
  return (
    <div className="h-[300px] bg-surface-900 rounded-xl border border-surface-800 animate-pulse flex items-center justify-center">
      <div className="flex gap-1 items-end h-24">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="w-3 bg-surface-700 rounded-sm"
            style={{ height: `${30 + Math.sin(i) * 20 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-4 animate-pulse space-y-3">
      <div className="h-3 w-24 bg-surface-800 rounded" />
      <div className="h-5 w-40 bg-surface-700 rounded" />
      <div className="h-8 w-28 bg-surface-700 rounded" />
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 bg-surface-800 rounded" />
        ))}
      </div>
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm py-12">
      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0110 10" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" />
      </svg>
      Loading data…
    </div>
  );
}

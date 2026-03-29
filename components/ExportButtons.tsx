import React, { useState } from "react";
import type { CotRow } from "../lib/types";
import { exportCsv, exportExcel } from "../utils/exportData";

interface Props {
  rows: CotRow[];
  filenameBase?: string;
}

export default function ExportButtons({ rows, filenameBase = "cot_data" }: Props) {
  const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null);

  const handleCsv = () => {
    exportCsv(rows, `${filenameBase}.csv`);
  };

  const handleExcel = async () => {
    setLoading("xlsx");
    try {
      await exportExcel(rows, `${filenameBase}.xlsx`);
    } finally {
      setLoading(null);
    }
  };

  const btnClass =
    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 font-mono">Export:</span>
      <button
        onClick={handleCsv}
        disabled={rows.length === 0}
        className={`${btnClass} border-surface-700 text-slate-300 hover:border-brand-500 hover:text-brand-300`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        CSV
      </button>
      <button
        onClick={handleExcel}
        disabled={rows.length === 0 || loading === "xlsx"}
        className={`${btnClass} border-surface-700 text-slate-300 hover:border-emerald-500 hover:text-emerald-300`}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        {loading === "xlsx" ? "..." : "Excel"}
      </button>
      <span className="text-xs text-slate-600 font-mono">{rows.length} rows</span>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";
import { calcUclLcl } from "../../utils/cotCalculations";

interface Props {
  data: CotRow[];
}

const labelStyle = {
  color: "#64748b",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10,
};

const fmtAbs = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

const K_OPTIONS = [1.0, 1.5, 2.0, 2.5, 3.0];

/** Commercial Net combinado: Producer/Merchant + Swap Dealers, con bandas UCL/LCL */
export default function CommercialCombinedChart({ data }: Props) {
  const [k, setK] = useState(2.0);

  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const net = data.map(
      (r) =>
        r.prod_merc_positions_long_all +
        r.swap_positions_long_all -
        (r.prod_merc_positions_short_all + r.swap_positions_short_all)
    );

    const { ucl, lcl } = calcUclLcl(net, 156, k);

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Commercial Net", "UCL", "LCL"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0,
        right: 0,
        itemWidth: 14,
        itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        formatter: (params: any[]) => {
          const date = params[0]?.axisValue ?? "";
          let html = `<div style="font-weight:600;margin-bottom:4px">${date}</div>`;
          for (const p of params) {
            if (p.value == null) continue;
            const color = p.seriesName === "Commercial Net" ? "#10b981" : "#fb923c";
            html += `<div style="display:flex;justify-content:space-between;gap:20px">
              <span style="color:#94a3b8">${p.seriesName}</span>
              <span style="color:${color};font-weight:600">${fmtAbs(p.value)}</span>
            </div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(dates.length / 8) },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...labelStyle, formatter: fmtAbs },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "Commercial Net",
          type: "line",
          data: net,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#10b981", width: 2 },
          markLine: {
            silent: true,
            symbol: "none",
            data: [{ yAxis: 0 }],
            lineStyle: { color: "#334155", type: "dashed", width: 1 },
            label: { show: false },
          },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16,185,129,0.2)" },
                { offset: 1, color: "rgba(16,185,129,0.01)" },
              ],
            },
          },
        },
        {
          name: "UCL",
          type: "line",
          data: ucl,
          smooth: 0.2,
          symbol: "none",
          lineStyle: { color: "#fb923c", width: 1.5, type: "dashed" },
          connectNulls: false,
        },
        {
          name: "LCL",
          type: "line",
          data: lcl,
          smooth: 0.2,
          symbol: "none",
          lineStyle: { color: "#fb923c", width: 1.5, type: "dashed" },
          connectNulls: false,
        },
      ],
    };
  }, [data, k]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[11px] font-mono text-slate-500">
          UCL/LCL · 156wk · {k.toFixed(1)} SD
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-mono text-slate-600 mr-0.5">k =</span>
          {K_OPTIONS.map((v) => (
            <button
              key={v}
              onClick={() => setK(v)}
              className={`text-[11px] font-mono px-1.5 py-0.5 rounded border transition-colors ${
                k === v
                  ? "bg-orange-900/40 text-orange-300 border-orange-700"
                  : "text-slate-500 border-slate-800 hover:border-slate-600 hover:text-slate-300"
              }`}
            >
              {v.toFixed(1)}
            </button>
          ))}
        </div>
      </div>
      <ReactECharts
        option={option}
        style={{ height: "300px", width: "100%" }}
        opts={{ renderer: "canvas" }}
      />
    </div>
  );
}

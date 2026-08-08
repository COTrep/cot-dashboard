import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotFinancialsRow } from "../../lib/types";

const LS = { color: "#64748b", fontFamily: "JetBrains Mono, monospace", fontSize: 10 };
const fmt = (v: number) =>
  v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(0)}K` : String(v);

export default function FinancialOIChart({ data }: { data: CotFinancialsRow[] }) {
  const option = useMemo(() => {
    const dates  = data.map((r) => r.as_of_date_in_form_yyyymmdd);
    const values = data.map((r) => r.open_interest_all);
    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        formatter: (params: any[]) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div><div>${Number(p.value).toLocaleString()}</div>`;
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 50 },
      xAxis: {
        type: "category", data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...LS, rotate: 30, interval: Math.floor(dates.length / 8) },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { ...LS, formatter: fmt },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [{
        name: "Open Interest", type: "line", data: values, smooth: 0.3, symbol: "none",
        lineStyle: { color: "#8b5cf6", width: 2 },
        areaStyle: {
          color: { type: "linear", x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [{ offset: 0, color: "rgba(139,92,246,0.3)" }, { offset: 1, color: "rgba(139,92,246,0.01)" }] },
        },
      }],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

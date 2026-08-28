import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";

const LS = { color: "#64748b", fontFamily: "JetBrains Mono, monospace", fontSize: 10 };
const fmt = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1e6 ? `${s}${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}${(a / 1e3).toFixed(0)}K` : String(v);
};

const COLORS = {
  prodMerc: "#10b981",
  swap: "#f59e0b",
  mMoney: "#38bdf8",
};

/** 3 net lines: Producer/Merchant, Swap Dealers, Managed Money. All visible by default, legend toggleable. */
export default function CommodityCombinedNetChart({ data }: { data: CotRow[] }) {
  const option = useMemo(() => {
    const dates       = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const prodMercNet = data.map((r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all);
    const swapNet     = data.map((r) => r.swap_positions_long_all - r.swap_positions_short_all);
    const mMoneyNet   = data.map((r) => r.m_money_positions_long_all - r.m_money_positions_short_all);
    const dzStart = data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0;

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Producer/Merchant Net", "Swap Dealers Net", "Managed Money Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        selectedMode: true,
        top: 0, right: 0, itemWidth: 14, itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`;
          const colorMap: Record<string, string> = {
            "Producer/Merchant Net": COLORS.prodMerc,
            "Swap Dealers Net": COLORS.swap,
            "Managed Money Net": COLORS.mMoney,
          };
          for (const p of params) {
            html += `<div style="display:flex;justify-content:space-between;gap:20px"><span style="color:#94a3b8">${p.seriesName}</span><span style="color:${colorMap[p.seriesName]};font-weight:600">${fmt(p.value)}</span></div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 36, bottom: 85 },
      xAxis: {
        type: "category", data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...LS, rotate: 30, interval: "auto" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { ...LS, formatter: fmt },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      dataZoom: [
        { type: "slider", start: dzStart, end: 100, height: 20, bottom: 8, borderColor: "#334155", fillerColor: "rgba(99,102,241,0.12)", handleStyle: { color: "#6366f1", borderColor: "#6366f1" }, textStyle: { color: "#64748b", fontSize: 9 }, showDetail: false },
        { type: "inside", start: dzStart, end: 100 },
      ],
      series: [
        {
          name: "Producer/Merchant Net", type: "line", data: prodMercNet, smooth: 0.3, symbol: "none",
          lineStyle: { color: COLORS.prodMerc, width: 2 },
          markLine: {
            silent: true, symbol: "none",
            data: [{ yAxis: 0 }],
            lineStyle: { color: "#334155", type: "dashed", width: 1 },
            label: { show: false },
          },
        },
        { name: "Swap Dealers Net", type: "line", data: swapNet, smooth: 0.3, symbol: "none", lineStyle: { color: COLORS.swap, width: 2 } },
        { name: "Managed Money Net", type: "line", data: mMoneyNet, smooth: 0.3, symbol: "none", lineStyle: { color: COLORS.mMoney, width: 2 } },
      ],
    };
  }, [data]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

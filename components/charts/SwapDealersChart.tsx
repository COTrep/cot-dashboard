import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL } from "../../lib/chartTheme";

const fmt = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1e6 ? `${s}${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}${(a / 1e3).toFixed(0)}K` : String(v);
};

export default function SwapDealersChart({ data, start, netOnly }: { data: CotRow[]; start?: number; netOnly?: boolean }) {
  const option = useMemo(() => {
    const dates  = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const longs  = data.map((r) => r.swap_positions_long_all);
    const shorts = data.map((r) => r.swap_positions_short_all);
    const nets   = data.map((r) => r.swap_positions_long_all - r.swap_positions_short_all);
    const dzStart = start ?? (data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0);
    return {
      backgroundColor: "transparent",
      legend: {
        data: netOnly ? ["Net"] : ["Long", "Short", "Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0, right: 0, itemWidth: 14, itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        ...CHART_TOOLTIP_STYLE,
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`;
          for (const p of params) {
            const c = p.seriesName === "Long" ? CHART_COLORS.swap.long : p.seriesName === "Short" ? CHART_COLORS.swap.short : CHART_COLORS.swap.net;
            html += `<div style="display:flex;justify-content:space-between;gap:20px"><span style="color:#94a3b8">${p.seriesName}</span><span style="color:${c};font-weight:600">${fmt(p.value)}</span></div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 30, bottom: 85 },
      xAxis: {
        type: "category", data: dates,
        axisLine: { lineStyle: { color: "#252d3d" } },
        axisLabel: { ...CHART_AXIS_LABEL, rotate: 30, interval: "auto" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { ...CHART_AXIS_LABEL, formatter: fmt },
        splitLine: { lineStyle: { color: "#252d3d" } },
      },
      dataZoom: [
        { type: "slider", start: dzStart, end: 100, height: 20, bottom: 8, borderColor: "#252d3d", fillerColor: "rgba(99,102,241,0.12)", handleStyle: { color: "#6366f1", borderColor: "#6366f1" }, textStyle: { color: "#3d4d6b", fontSize: 9 }, showDetail: false },
        { type: "inside", start: dzStart, end: 100 },
      ],
      series: [
        ...(!netOnly ? [
          {
            name: "Long", type: "line", data: longs, smooth: 0.3, symbol: "none",
            lineStyle: { color: CHART_COLORS.swap.long, width: 2 },
            markLine: {
              silent: true, symbol: "none",
              data: [{ yAxis: 0 }],
              lineStyle: { color: "#252d3d", type: "dashed", width: 1 },
              label: { show: false },
            },
          },
          { name: "Short", type: "line", data: shorts, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.swap.short, width: 2 } },
        ] : []),
        netOnly
          ? { name: "Net", type: "line", data: nets, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.swap.net, width: 2.5 } }
          : { name: "Net", type: "bar", data: nets, barMaxWidth: 6, itemStyle: { color: CHART_COLORS.swap.net, opacity: 0.7 } },
      ],
    };
  }, [data, start, netOnly]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotFinancialsRow } from "../../lib/types";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL } from "../../lib/chartTheme";

const fmt = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1e6 ? `${s}${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}${(a / 1e3).toFixed(0)}K` : String(v);
};

export default function AssetManagerChart({ data, start, netOnly }: { data: CotFinancialsRow[]; start?: number; netOnly?: boolean }) {
  const option = useMemo(() => {
    const dates  = data.map((r) => r.as_of_date_in_form_yyyymmdd);
    const longs  = data.map((r) => r.asset_mgr_positions_long_all);
    const shorts = data.map((r) => r.asset_mgr_positions_short_all);
    const nets   = data.map((r) => r.asset_mgr_positions_long_all - r.asset_mgr_positions_short_all);
    const dzStart = start ?? (data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0);
    return {
      backgroundColor: "transparent",
      legend: {
        data: netOnly ? ["Net"] : ["Long", "Short", "Net"],
        textStyle: { color: "#787b86", fontFamily: "Inter, system-ui", fontSize: 10 },
        top: 0, right: 0, itemWidth: 14, itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        ...CHART_TOOLTIP_STYLE,
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`;
          for (const p of params) {
            const c = p.seriesName === "Long" ? CHART_COLORS.prodMerc.long : p.seriesName === "Short" ? CHART_COLORS.prodMerc.short : CHART_COLORS.prodMerc.net;
            html += `<div style="display:flex;justify-content:space-between;gap:20px"><span style="color:#787b86">${p.seriesName}</span><span style="color:${c};font-weight:600">${fmt(p.value)}</span></div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 30, bottom: 85 },
      xAxis: {
        type: "category", data: dates,
        axisLine: { lineStyle: { color: "#2a2e39" } },
        axisLabel: { ...CHART_AXIS_LABEL, rotate: 30, interval: "auto" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { ...CHART_AXIS_LABEL, formatter: fmt },
        splitLine: { lineStyle: { color: "#2a2e39" } },
      },
      dataZoom: [
        { type: "slider", start: dzStart, end: 100, height: 20, bottom: 8, borderColor: "#2a2e39", fillerColor: "rgba(41,98,255,0.12)", handleStyle: { color: "#2962ff", borderColor: "#2962ff" }, textStyle: { color: "#4a5060", fontSize: 9 }, showDetail: false },
        { type: "inside", start: dzStart, end: 100 },
      ],
      series: [
        ...(!netOnly ? [
          {
            name: "Long", type: "line", data: longs, smooth: 0.3, symbol: "none",
            lineStyle: { color: CHART_COLORS.prodMerc.long, width: 2 },
            markLine: {
              silent: true, symbol: "none",
              data: [{ yAxis: 0 }],
              lineStyle: { color: "#2a2e39", type: "dashed", width: 1 },
              label: { show: false },
            },
          },
          { name: "Short", type: "line", data: shorts, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.prodMerc.short, width: 2 } },
        ] : []),
        netOnly
          ? { name: "Net", type: "line", data: nets, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.prodMerc.net, width: 2.5 } }
          : { name: "Net", type: "bar", data: nets, barMaxWidth: 6, itemStyle: { color: CHART_COLORS.prodMerc.net, opacity: 0.7 } },
      ],
    };
  }, [data, start, netOnly]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

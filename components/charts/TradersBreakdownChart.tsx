import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL } from "../../lib/chartTheme";

export default function TradersBreakdownChart({ data, start }: { data: CotRow[]; start?: number }) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));

    // Max of long/short per category — each trader is counted once
    const prodMerc   = data.map((r) => r.traders_prod_merc_long_all != null || r.traders_prod_merc_short_all != null
      ? Math.max(r.traders_prod_merc_long_all ?? 0, r.traders_prod_merc_short_all ?? 0) : null);
    const swap       = data.map((r) => r.traders_swap_long_all != null || r.traders_swap_short_all != null
      ? Math.max(r.traders_swap_long_all ?? 0, r.traders_swap_short_all ?? 0) : null);
    const mMoney     = data.map((r) => r.traders_m_money_long_all != null || r.traders_m_money_short_all != null
      ? Math.max(r.traders_m_money_long_all ?? 0, r.traders_m_money_short_all ?? 0) : null);
    const otherRept  = data.map((r) => r.traders_other_rept_long_all != null || r.traders_other_rept_short_all != null
      ? Math.max(r.traders_other_rept_long_all ?? 0, r.traders_other_rept_short_all ?? 0) : null);
    const total      = data.map((r) => r.traders_tot_all ?? null);

    const dzStart = start ?? (data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0);

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Prod/Merc", "Swap", "Managed Money", "Other Rept.", "Total"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0, right: 0, itemWidth: 14, itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        ...CHART_TOOLTIP_STYLE,
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`;
          const colors: Record<string, string> = {
            "Prod/Merc": CHART_COLORS.prodMerc.net,
            "Swap": CHART_COLORS.swap.net,
            "Managed Money": CHART_COLORS.mMoney.net,
            "Other Rept.": CHART_COLORS.otherRept.net,
            "Total": CHART_COLORS.oi,
          };
          for (const p of params) {
            if (p.value == null) continue;
            const c = colors[p.seriesName] ?? "#94a3b8";
            html += `<div style="display:flex;justify-content:space-between;gap:20px"><span style="color:#94a3b8">${p.seriesName}</span><span style="color:${c};font-weight:600">${p.value}</span></div>`;
          }
          return html;
        },
      },
      grid: { left: 50, right: 20, top: 30, bottom: 85 },
      xAxis: {
        type: "category", data: dates,
        axisLine: { lineStyle: { color: "#252d3d" } },
        axisLabel: { ...CHART_AXIS_LABEL, rotate: 30, interval: "auto" },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value", axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { ...CHART_AXIS_LABEL },
        splitLine: { lineStyle: { color: "#252d3d" } },
        minInterval: 1,
      },
      dataZoom: [
        { type: "slider", start: dzStart, end: 100, height: 20, bottom: 8, borderColor: "#252d3d", fillerColor: "rgba(99,102,241,0.12)", handleStyle: { color: "#6366f1", borderColor: "#6366f1" }, textStyle: { color: "#3d4d6b", fontSize: 9 }, showDetail: false },
        { type: "inside", start: dzStart, end: 100 },
      ],
      series: [
        { name: "Prod/Merc",     type: "line", data: prodMerc,  smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.prodMerc.net,  width: 2 } },
        { name: "Swap",          type: "line", data: swap,      smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.swap.net,      width: 2 } },
        { name: "Managed Money", type: "line", data: mMoney,    smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.mMoney.net,    width: 2 } },
        { name: "Other Rept.",   type: "line", data: otherRept, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.otherRept.net, width: 2 } },
        { name: "Total",         type: "line", data: total,     smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.oi, width: 1, type: "dashed" } },
      ],
    };
  }, [data, start]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

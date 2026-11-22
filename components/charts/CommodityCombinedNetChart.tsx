import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL } from "../../lib/chartTheme";

const fmt = (v: number) => {
  const a = Math.abs(v), s = v < 0 ? "-" : "";
  return a >= 1e6 ? `${s}${(a / 1e6).toFixed(1)}M` : a >= 1e3 ? `${s}${(a / 1e3).toFixed(0)}K` : String(v);
};

/** 5 net lines: Producer/Merchant, Swap Dealers, Managed Money, Other Reportables, Non-Reportable. */
export default function CommodityCombinedNetChart({ data, start }: { data: CotRow[]; start?: number }) {
  const option = useMemo(() => {
    const dates        = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const prodMercNet  = data.map((r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all);
    const swapNet      = data.map((r) => r.swap_positions_long_all - r.swap_positions_short_all);
    const mMoneyNet    = data.map((r) => r.m_money_positions_long_all - r.m_money_positions_short_all);
    const otherReptNet = data.map((r) =>
      r.other_rept_positions_long_all != null && r.other_rept_positions_short_all != null
        ? r.other_rept_positions_long_all - r.other_rept_positions_short_all
        : null
    );
    const nonReptNet   = data.map((r) =>
      r.nonrept_positions_long_all != null && r.nonrept_positions_short_all != null
        ? r.nonrept_positions_long_all - r.nonrept_positions_short_all
        : null
    );
    const dzStart = start ?? (data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0);

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Producer/Merchant Net", "Swap Dealers Net", "Managed Money Net", "Other Reportables Net", "Non-Reportable Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        selectedMode: true,
        top: 0, right: 0, itemWidth: 14, itemHeight: 8,
      },
      tooltip: {
        trigger: "axis",
        ...CHART_TOOLTIP_STYLE,
        formatter: (params: any[]) => {
          let html = `<div style="font-weight:600;margin-bottom:4px">${params[0]?.axisValue}</div>`;
          const colorMap: Record<string, string> = {
            "Producer/Merchant Net": CHART_COLORS.prodMerc.net,
            "Swap Dealers Net":      CHART_COLORS.swap.net,
            "Managed Money Net":     CHART_COLORS.mMoney.net,
            "Other Reportables Net": CHART_COLORS.otherRept.net,
            "Non-Reportable Net":    CHART_COLORS.nonRept.net,
          };
          for (const p of params) {
            if (p.value == null) continue;
            html += `<div style="display:flex;justify-content:space-between;gap:20px"><span style="color:#94a3b8">${p.seriesName}</span><span style="color:${colorMap[p.seriesName]};font-weight:600">${fmt(p.value)}</span></div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 20, top: 36, bottom: 85 },
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
        {
          name: "Producer/Merchant Net", type: "line", data: prodMercNet, smooth: 0.3, symbol: "none",
          lineStyle: { color: CHART_COLORS.prodMerc.net, width: 2 },
          markLine: {
            silent: true, symbol: "none",
            data: [{ yAxis: 0 }],
            lineStyle: { color: "#252d3d", type: "dashed", width: 1 },
            label: { show: false },
          },
        },
        { name: "Swap Dealers Net",       type: "line", data: swapNet,      smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.swap.net,      width: 2 } },
        { name: "Managed Money Net",      type: "line", data: mMoneyNet,    smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.mMoney.net,    width: 2 } },
        { name: "Other Reportables Net",  type: "line", data: otherReptNet, smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.otherRept.net, width: 2 } },
        { name: "Non-Reportable Net",     type: "line", data: nonReptNet,   smooth: 0.3, symbol: "none", lineStyle: { color: CHART_COLORS.nonRept.net,   width: 2 } },
      ],
    };
  }, [data, start]);
  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

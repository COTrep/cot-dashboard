import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";

interface Props {
  data: CotRow[];
}

const COLORS = {
  commercial: "#10b981",
  hedgeFunds: "#38bdf8",
  swapDealers: "#a78bfa",
  openInterest: "#64748b",
};

export default function NetPositioningChart({ data }: Props) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const commercialNet = data.map(
      (r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all
    );
    const hedgeFundsNet = data.map(
      (r) => r.m_money_positions_long_all - r.m_money_positions_short_all
    );
    const swapDealersNet = data.map(
      (r) => r.swap_positions_long_all - r.swap_positions_short_all
    );
    const openInterest = data.map((r) => r.open_interest_all);

    const labelStyle = {
      color: "#64748b",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 10,
    };

    const fmtNet = (v: number) => {
      const abs = Math.abs(v);
      const sign = v >= 0 ? "+" : "-";
      if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
      if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
      return String(v);
    };

    const fmtAbs = (v: number) => {
      const abs = Math.abs(v);
      if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
      return String(v);
    };

    const seriesColor = (name: string) =>
      name === "Commercial Net"
        ? COLORS.commercial
        : name === "Hedge Funds Net"
        ? COLORS.hedgeFunds
        : name === "Swap Dealers Net"
        ? COLORS.swapDealers
        : COLORS.openInterest;

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Commercial Net", "Hedge Funds Net", "Swap Dealers Net", "Open Interest"],
        textStyle: {
          color: "#94a3b8",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 10,
        },
        top: 0,
        right: 0,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: {
          color: "#e2e8f0",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: 11,
        },
        formatter: (params: any[]) => {
          const date = params[0]?.axisValue ?? "";
          let html = `<div style="margin-bottom:6px;color:#94a3b8;font-size:11px">${date}</div>`;
          for (const p of params) {
            const isOI = p.seriesName === "Open Interest";
            const value = isOI ? fmtAbs(p.value) : fmtNet(p.value);
            html += `<div style="display:flex;justify-content:space-between;gap:24px">
              <span style="color:#94a3b8">${p.seriesName}</span>
              <span style="color:${seriesColor(p.seriesName)};font-weight:600">${value}</span>
            </div>`;
          }
          return html;
        },
      },
      grid: { left: 60, right: 60, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: {
          ...labelStyle,
          rotate: 30,
          interval: Math.floor(dates.length / 8),
        },
        splitLine: { show: false },
      },
      yAxis: [
        {
          type: "value",
          name: "Net Positioning",
          nameTextStyle: { ...labelStyle, fontSize: 10 },
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...labelStyle, formatter: fmtAbs },
          splitLine: { lineStyle: { color: "#1e293b" } },
        },
        {
          type: "value",
          name: "Open Interest",
          nameTextStyle: { ...labelStyle, fontSize: 10 },
          position: "right",
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...labelStyle, formatter: fmtAbs },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: "Commercial Net",
          type: "line",
          yAxisIndex: 0,
          data: commercialNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.commercial, width: 2 },
          markLine: {
            silent: true,
            symbol: "none",
            data: [{ yAxis: 0 }],
            lineStyle: { color: "#334155", type: "dashed", width: 1 },
            label: { show: false },
          },
        },
        {
          name: "Hedge Funds Net",
          type: "line",
          yAxisIndex: 0,
          data: hedgeFundsNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.hedgeFunds, width: 2 },
        },
        {
          name: "Swap Dealers Net",
          type: "line",
          yAxisIndex: 0,
          data: swapDealersNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.swapDealers, width: 2 },
        },
        {
          name: "Open Interest",
          type: "line",
          yAxisIndex: 1,
          data: openInterest,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.openInterest, width: 1.5, type: "dashed" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(100,116,139,0.12)" },
                { offset: 1, color: "rgba(100,116,139,0)" },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  return (
    <ReactECharts
      option={option}
      style={{ height: "300px", width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}

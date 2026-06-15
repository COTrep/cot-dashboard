import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotFinancialsRow } from "../../lib/types";

interface Props {
  data: CotFinancialsRow[];
}

const labelStyle = {
  color: "#64748b",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10,
};

const yAxisDef = {
  type: "value" as const,
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: {
    ...labelStyle,
    formatter: (v: number) =>
      v >= 1_000_000
        ? `${(v / 1_000_000).toFixed(1)}M`
        : v >= 1_000
        ? `${(v / 1_000).toFixed(0)}K`
        : String(v),
  },
  splitLine: { lineStyle: { color: "#1e293b" } },
};

export function FinancialOIChart({ data }: Props) {
  const option = useMemo(() => ({
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
      type: "category",
      data: data.map((r) => r.as_of_date_in_form_yyyymmdd),
      axisLine: { lineStyle: { color: "#334155" } },
      axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(data.length / 8) },
      splitLine: { show: false },
    },
    yAxis: yAxisDef,
    series: [
      {
        name: "Open Interest",
        type: "line",
        data: data.map((r) => r.open_interest_all),
        smooth: 0.3,
        symbol: "none",
        lineStyle: { color: "#8b5cf6", width: 2 },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(139,92,246,0.3)" },
              { offset: 1, color: "rgba(139,92,246,0.01)" },
            ],
          },
        },
      },
    ],
  }), [data]);

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

export function AssetManagerChart({ data }: Props) {
  const option = useMemo(() => {
    const longs  = data.map((r) => r.asset_mgr_positions_long_all);
    const shorts  = data.map((r) => r.asset_mgr_positions_short_all);
    const net    = data.map((r) => r.asset_mgr_positions_long_all - r.asset_mgr_positions_short_all);

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Long", "Short", "Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0, right: 0,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
      },
      grid: { left: 60, right: 20, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: data.map((r) => r.as_of_date_in_form_yyyymmdd),
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(data.length / 8) },
        splitLine: { show: false },
      },
      yAxis: yAxisDef,
      series: [
        {
          name: "Long",
          type: "line",
          data: longs,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#10b981", width: 2 },
        },
        {
          name: "Short",
          type: "line",
          data: shorts,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#f43f5e", width: 2 },
        },
        {
          name: "Net",
          type: "bar",
          data: net,
          barMaxWidth: 6,
          itemStyle: {
            color: (params: any) => params.value >= 0 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)",
          },
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

export function DealerLevMoneyChart({ data }: Props) {
  const option = useMemo(() => {
    const dealerNet   = data.map((r) => r.dealer_positions_long_all - r.dealer_positions_short_all);
    const levMoneyNet = data.map((r) => r.lev_money_positions_long_all - r.lev_money_positions_short_all);

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Dealer Net", "Lev Money Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0, right: 0,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
      },
      grid: { left: 60, right: 20, top: 30, bottom: 50 },
      xAxis: {
        type: "category",
        data: data.map((r) => r.as_of_date_in_form_yyyymmdd),
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(data.length / 8) },
        splitLine: { show: false },
      },
      yAxis: yAxisDef,
      series: [
        {
          name: "Dealer Net",
          type: "line",
          data: dealerNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#f59e0b", width: 2 },
        },
        {
          name: "Lev Money Net",
          type: "line",
          data: levMoneyNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#0ea5e9", width: 2 },
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

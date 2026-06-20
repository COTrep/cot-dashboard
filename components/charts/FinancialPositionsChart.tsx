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

/** Net-Fund Position: Leveraged Funds net, sin los demás grupos */
export function NetFundChart({ data }: Props) {
  const option = useMemo(() => {
    const net = data.map(
      (r) => r.lev_money_positions_long_all - r.lev_money_positions_short_all
    );

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
        type: "category",
        data: data.map((r) => r.as_of_date_in_form_yyyymmdd),
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(data.length / 8) },
        splitLine: { show: false },
      },
      yAxis: yAxisDef,
      series: [
        {
          name: "Leveraged Funds Net",
          type: "line",
          data: net,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#0ea5e9", width: 2 },
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
                { offset: 0, color: "rgba(14,165,233,0.2)" },
                { offset: 1, color: "rgba(14,165,233,0.01)" },
              ],
            },
          },
        },
      ],
    };
  }, [data]);

  return <ReactECharts option={option} style={{ height: "300px", width: "100%" }} opts={{ renderer: "canvas" }} />;
}

/** Vista combinada: los 5 grupos TFF (Dealer, Asset Manager, Leveraged Funds, Other Reportables, Nonreportable) + Open Interest superpuesto. Leyenda toggleable (click para mostrar/ocultar cada serie). */
export function FinancialNetPositioningChart({ data }: Props) {
  const option = useMemo(() => {
    const dealerNet = data.map((r) => r.dealer_positions_long_all - r.dealer_positions_short_all);
    const assetMgrNet = data.map((r) => r.asset_mgr_positions_long_all - r.asset_mgr_positions_short_all);
    const levMoneyNet = data.map((r) => r.lev_money_positions_long_all - r.lev_money_positions_short_all);
    const otherReptNet = data.map((r) => r.other_rept_positions_long_all - r.other_rept_positions_short_all);
    const nonreptNet = data.map((r) => r.nonrept_positions_long_all - r.nonrept_positions_short_all);
    const openInterest = data.map((r) => r.open_interest_all);

    const COLORS = {
      dealer: "#f59e0b",
      assetMgr: "#10b981",
      levMoney: "#0ea5e9",
      otherRept: "#a78bfa",
      nonrept: "#f43f5e",
      openInterest: "#64748b",
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
      name === "Dealer Net" ? COLORS.dealer
      : name === "Asset Manager Net" ? COLORS.assetMgr
      : name === "Leveraged Funds Net" ? COLORS.levMoney
      : name === "Other Reportables Net" ? COLORS.otherRept
      : name === "Nonreportable Net" ? COLORS.nonrept
      : COLORS.openInterest;

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Dealer Net", "Asset Manager Net", "Leveraged Funds Net", "Other Reportables Net", "Nonreportable Net", "Open Interest"],
        selectedMode: true,
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0,
        right: 0,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "#1e293b",
        borderColor: "#334155",
        textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
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
        data: data.map((r) => r.as_of_date_in_form_yyyymmdd),
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(data.length / 8) },
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
          name: "Dealer Net",
          type: "line",
          yAxisIndex: 0,
          data: dealerNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.dealer, width: 2 },
        },
        {
          name: "Asset Manager Net",
          type: "line",
          yAxisIndex: 0,
          data: assetMgrNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.assetMgr, width: 2 },
        },
        {
          name: "Leveraged Funds Net",
          type: "line",
          yAxisIndex: 0,
          data: levMoneyNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.levMoney, width: 2 },
        },
        {
          name: "Other Reportables Net",
          type: "line",
          yAxisIndex: 0,
          data: otherReptNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.otherRept, width: 2 },
        },
        {
          name: "Nonreportable Net",
          type: "line",
          yAxisIndex: 0,
          data: nonreptNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: COLORS.nonrept, width: 2 },
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

  return <ReactECharts option={option} style={{ height: "320px", width: "100%" }} opts={{ renderer: "canvas" }} />;
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

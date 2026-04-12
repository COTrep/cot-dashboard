import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";

interface Props {
  data: CotRow[];
}

export default function NetComparisonChart({ data }: Props) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const commercialNet = data.map(
      (r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all
    );
    const mmNet = data.map(
      (r) => r.m_money_positions_long_all - r.m_money_positions_short_all
    );

    const labelStyle = {
      color: "#64748b",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 10,
    };

    const fmtVal = (v: number) => {
      const abs = Math.abs(v);
      const sign = v >= 0 ? "+" : "-";
      if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(2)}M`;
      if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}K`;
      return String(v);
    };

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Commercial Net", "MM Net"],
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
            const color =
              p.seriesName === "Commercial Net" ? "#10b981" : "#38bdf8";
            html += `<div style="display:flex;justify-content:space-between;gap:24px">
              <span style="color:#94a3b8">${p.seriesName}</span>
              <span style="color:${color};font-weight:600">${fmtVal(p.value)}</span>
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
        axisLabel: {
          ...labelStyle,
          rotate: 30,
          interval: Math.floor(dates.length / 8),
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          ...labelStyle,
          formatter: (v: number) => {
            const abs = Math.abs(v);
            if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
            if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
            return String(v);
          },
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "Commercial Net",
          type: "line",
          data: commercialNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#10b981", width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16,185,129,0.18)" },
                { offset: 1, color: "rgba(16,185,129,0.01)" },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: "none",
            data: [{ yAxis: 0 }],
            lineStyle: { color: "#334155", type: "dashed", width: 1 },
            label: { show: false },
          },
        },
        {
          name: "MM Net",
          type: "line",
          data: mmNet,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#38bdf8", width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(56,189,248,0.15)" },
                { offset: 1, color: "rgba(56,189,248,0.01)" },
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

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";

interface Props {
  data: CotRow[];
}

const labelStyle = {
  color: "#64748b",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: 10,
};

const fmtAbs = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
};

/** Net-Fund Position: Managed Money net, sin Commercial ni Open Interest */
export default function NetFundChart({ data }: Props) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const net = data.map(
      (r) => r.m_money_positions_long_all - r.m_money_positions_short_all
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
          return `<div style="font-weight:600">${p.axisValue}</div><div>${fmtAbs(p.value)}</div>`;
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 50 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(dates.length / 8) },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { ...labelStyle, formatter: fmtAbs },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
      series: [
        {
          name: "Managed Money Net",
          type: "line",
          data: net,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: "#38bdf8", width: 2 },
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
                { offset: 0, color: "rgba(56,189,248,0.2)" },
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

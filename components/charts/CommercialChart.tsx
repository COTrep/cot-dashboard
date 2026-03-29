import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";

interface Props {
  data: CotRow[];
}

export default function CommercialChart({ data }: Props) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const longs = data.map((r) => r.prod_merc_positions_long_all);
    const shorts = data.map((r) => r.prod_merc_positions_short_all);
    const net = data.map((r) => r.prod_merc_positions_long_all - r.prod_merc_positions_short_all);

    const labelStyle = {
      color: "#64748b",
      fontFamily: "JetBrains Mono, monospace",
      fontSize: 10,
    };

    return {
      backgroundColor: "transparent",
      legend: {
        data: ["Long", "Short", "Net"],
        textStyle: { color: "#94a3b8", fontFamily: "JetBrains Mono, monospace", fontSize: 10 },
        top: 0,
        right: 0,
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
        data: dates,
        axisLine: { lineStyle: { color: "#334155" } },
        axisLabel: { ...labelStyle, rotate: 30, interval: Math.floor(dates.length / 8) },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          ...labelStyle,
          formatter: (v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v),
        },
        splitLine: { lineStyle: { color: "#1e293b" } },
      },
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
            color: (params: any) =>
              params.value >= 0 ? "rgba(16,185,129,0.5)" : "rgba(244,63,94,0.5)",
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

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { CotRow } from "../../lib/types";
import { formatDate } from "../../utils/format";
import { CHART_COLORS, CHART_TOOLTIP_STYLE, CHART_AXIS_LABEL } from "../../lib/chartTheme";

interface Props {
  data: CotRow[];
}

export default function OpenInterestChart({ data, start }: Props & { start?: number }) {
  const option = useMemo(() => {
    const dates = data.map((r) => formatDate(r.as_of_date_in_form_yyyymmdd));
    const values = data.map((r) => r.open_interest_all);
    const dzStart = start ?? (data.length > 0 ? Math.max(0, Math.round((1 - Math.min(156, data.length) / data.length) * 100)) : 0);

    return {
      backgroundColor: "transparent",
      tooltip: {
        trigger: "axis",
        ...CHART_TOOLTIP_STYLE,
        formatter: (params: any[]) => {
          const p = params[0];
          return `<div style="font-weight:600">${p.axisValue}</div><div>${Number(p.value).toLocaleString()}</div>`;
        },
      },
      grid: { left: 60, right: 20, top: 20, bottom: 85 },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { lineStyle: { color: "#2a2e39" } },
        axisLabel: {
          ...CHART_AXIS_LABEL,
          rotate: 30,
          interval: "auto",
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          ...CHART_AXIS_LABEL,
          formatter: (v: number) =>
            v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}K` : String(v),
        },
        splitLine: { lineStyle: { color: "#2a2e39" } },
      },
      dataZoom: [
        { type: "slider", start: dzStart, end: 100, height: 20, bottom: 8, borderColor: "#2a2e39", fillerColor: "rgba(41,98,255,0.12)", handleStyle: { color: "#2962ff", borderColor: "#2962ff" }, textStyle: { color: "#4a5060", fontSize: 9 }, showDetail: false },
        { type: "inside", start: dzStart, end: 100 },
      ],
      series: [
        {
          name: "Open Interest",
          type: "line",
          data: values,
          smooth: 0.3,
          symbol: "none",
          lineStyle: { color: CHART_COLORS.oi, width: 2 },
          areaStyle: {
            color: {
              type: "linear",
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(71,85,105,0.3)" },
                { offset: 1, color: "rgba(71,85,105,0.01)" },
              ],
            },
          },
        },
      ],
    };
  }, [data, start]);

  return (
    <ReactECharts
      option={option}
      style={{ height: "300px", width: "100%" }}
      opts={{ renderer: "canvas" }}
    />
  );
}

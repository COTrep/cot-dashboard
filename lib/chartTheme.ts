export const CHART_COLORS = {
  prodMerc:  { long: "#06b6d4", short: "#f43f5e", net: "#10b981" },
  swap:      { long: "#f59e0b", short: "#fb7185", net: "#f97316" },
  mMoney:    { long: "#a78bfa", short: "#f43f5e", net: "#3b82f6" },
  otherRept: { long: "#fb7185", short: "#ef4444", net: "#f97316" },
  nonRept:   { long: "#34d399", short: "#a78bfa", net: "#10b981" },
  oi:        "#475569",
  zero:      "#252d3d",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#161b27",
  borderColor: "#252d3d",
  textStyle: { color: "#f1f5f9", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
} as const;

export const CHART_AXIS_LABEL = {
  color: "#3d4d6b", fontFamily: "JetBrains Mono, monospace", fontSize: 10,
} as const;

export const CHART_GRID = {
  left: 60, right: 20, top: 20, bottom: 40,
  containLabel: false,
} as const;

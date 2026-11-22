export const CHART_COLORS = {
  prodMerc:  { long: "#34d399", short: "#f87171", net: "#10b981" },
  swap:      { long: "#fbbf24", short: "#f97316", net: "#f59e0b" },
  mMoney:    { long: "#38bdf8", short: "#818cf8", net: "#0ea5e9" },
  otherRept: { long: "#fb923c", short: "#f43f5e", net: "#f97316" },
  nonRept:   { long: "#c084fc", short: "#e879f9", net: "#a855f7" },
  oi:        "#64748b",
  zero:      "#334155",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1e293b",
  borderColor: "#334155",
  textStyle: { color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", fontSize: 11 },
} as const;

export const CHART_AXIS_LABEL = {
  color: "#64748b", fontFamily: "JetBrains Mono, monospace", fontSize: 10,
} as const;

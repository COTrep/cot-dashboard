export const CHART_COLORS = {
  prodMerc:  { long: "#2962ff", short: "#ef5350", net: "#26a69a" },
  swap:      { long: "#ff6d00", short: "#ab47bc", net: "#ffd600" },
  mMoney:    { long: "#00bcd4", short: "#ff4081", net: "#40c4ff" },
  otherRept: { long: "#e040fb", short: "#ff7043", net: "#ce93d8" },
  nonRept:   { long: "#ffeb3b", short: "#ec407a", net: "#80cbc4" },
  oi:        "#787b86",
  zero:      "#2a2e39",
} as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1e222d",
  borderColor: "#2a2e39",
  textStyle: { color: "#d1d4dc", fontFamily: "Inter, system-ui", fontSize: 11 },
} as const;

export const CHART_AXIS_LABEL = {
  color: "#4a5060", fontFamily: "Inter, system-ui", fontSize: 10,
} as const;

export const CHART_GRID = {
  left: 60, right: 20, top: 20, bottom: 40,
  containLabel: false,
} as const;

export type MarketCategory =
  | "equity"
  | "rates"
  | "fx"
  | "energy"
  | "metals"
  | "agriculture"
  | "livestock"
  | "other";

export type MarketSector = "financials" | "commodities";

interface CategoryConfig {
  category: MarketCategory;
  sector: MarketSector;
  label: string;
  icon: string;
  keywords: string[];
}

const CATEGORIES: CategoryConfig[] = [
  {
    category: "equity",
    sector: "financials",
    label: "Equity Indices",
    icon: "📈",
    keywords: [
      "S&P 500",
      "S&P 400",
      "NASDAQ",
      "DOW JONES",
      "RUSSELL",
      "NIKKEI",
      "VIX",
      "E-MINI",
      "STOCK INDEX",
      "STOCK AVERAGE",
    ],
  },
  {
    category: "rates",
    sector: "financials",
    label: "Rates & Bonds",
    icon: "🏦",
    keywords: [
      "TREASURY",
      "T-BOND",
      "T-NOTE",
      "EURODOLLAR",
      "FEDERAL FUND",
      "LIBOR",
      "SOFR",
      "30-DAY",
      "10-YEAR",
      "5-YEAR",
      "2-YEAR",
      "U.S. TREASURY BOND",
    ],
  },
  {
    category: "fx",
    sector: "financials",
    label: "Currencies / FX",
    icon: "💱",
    keywords: [
      "EURO FX",
      "JAPANESE YEN",
      "BRITISH POUND",
      "CANADIAN DOLLAR",
      "SWISS FRANC",
      "AUSTRALIAN DOLLAR",
      "MEXICAN PESO",
      "NEW ZEALAND DOLLAR",
      "BRAZILIAN REAL",
      "SOUTH AFRICAN RAND",
      "BITCOIN",
      "U.S. DOLLAR INDEX",
      "DOLLAR INDEX",
    ],
  },
  {
    category: "energy",
    sector: "commodities",
    label: "Energy",
    icon: "⚡",
    keywords: [
      "CRUDE OIL",
      "NATURAL GAS",
      "HEATING OIL",
      "GASOLINE",
      "BRENT",
      "WTI",
      "RBOB",
      "PROPANE",
      "ETHANOL",
      "HENRY HUB",
      "NAT GAS",
    ],
  },
  {
    category: "metals",
    sector: "commodities",
    label: "Metals",
    icon: "🥇",
    keywords: [
      "GOLD",
      "SILVER",
      "COPPER",
      "PLATINUM",
      "PALLADIUM",
      "ALUMINUM",
      "ALUMINIUM",
      "ZINC",
      "NICKEL",
      "STEEL",
    ],
  },
  {
    category: "agriculture",
    sector: "commodities",
    label: "Agriculture",
    icon: "🌾",
    keywords: [
      "CORN",
      "SOYBEANS",
      "SOYBEAN",
      "WHEAT",
      "COFFEE",
      "COTTON",
      "SUGAR",
      "COCOA",
      "OATS",
      "RICE",
      "ORANGE JUICE",
      "LUMBER",
      "MILK",
      "CHEESE",
      "BUTTER",
      "CANOLA",
      "FRZN",
    ],
  },
  {
    category: "livestock",
    sector: "commodities",
    label: "Livestock",
    icon: "🐄",
    keywords: ["CATTLE", "HOGS", "HOG", "FEEDER", "PORK BELLY", "LEAN HOG", "LIVE"],
  },
];

export function getMarketCategory(name: string): MarketCategory {
  const upper = name.toUpperCase();
  for (const config of CATEGORIES) {
    if (config.keywords.some((kw) => upper.includes(kw))) {
      return config.category;
    }
  }
  return "other";
}

export function getMarketSector(name: string): MarketSector {
  const cat = getMarketCategory(name);
  return CATEGORIES.find((c) => c.category === cat)?.sector ?? "commodities";
}

export function getCategoryLabel(cat: MarketCategory): string {
  return CATEGORIES.find((c) => c.category === cat)?.label ?? "Other";
}

export function getCategoryIcon(cat: MarketCategory): string {
  return CATEGORIES.find((c) => c.category === cat)?.icon ?? "📊";
}

export const FINANCIAL_CATEGORY_ORDER: MarketCategory[] = [
  "equity",
  "rates",
  "fx",
];
export const COMMODITY_CATEGORY_ORDER: MarketCategory[] = [
  "energy",
  "metals",
  "agriculture",
  "livestock",
  "other",
];

export const CATEGORY_STYLES: Record<
  MarketCategory,
  { accent: string; bg: string; border: string; badge: string; bar: string; stripe: string; glow: string; accentColor: string }
> = {
  equity: {
    accentColor: "#2962ff",
    accent: "text-[#2962ff]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#0a1535] text-[#2962ff] border border-[rgba(41,98,255,0.2)]",
    bar: "bg-[#2962ff]",
    stripe: "#2962ff",
    glow: "rgba(41,98,255,0.12)",
  },
  rates: {
    accentColor: "#00bcd4",
    accent: "text-[#00bcd4]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#0d1f24] text-[#00bcd4] border border-[rgba(0,188,212,0.2)]",
    bar: "bg-[#00bcd4]",
    stripe: "#00bcd4",
    glow: "rgba(0,188,212,0.12)",
  },
  fx: {
    accentColor: "#2962ff",
    accent: "text-[#2962ff]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#0a1535] text-[#2962ff] border border-[rgba(41,98,255,0.2)]",
    bar: "bg-[#2962ff]",
    stripe: "#2962ff",
    glow: "rgba(41,98,255,0.12)",
  },
  energy: {
    accentColor: "#ef5350",
    accent: "text-[#ef5350]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#1f0d0d] text-[#ef5350] border border-[rgba(239,83,80,0.2)]",
    bar: "bg-[#ef5350]",
    stripe: "#ef5350",
    glow: "rgba(239,83,80,0.12)",
  },
  metals: {
    accentColor: "#26a69a",
    accent: "text-[#26a69a]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#0d1f1e] text-[#26a69a] border border-[rgba(38,166,154,0.2)]",
    bar: "bg-[#26a69a]",
    stripe: "#26a69a",
    glow: "rgba(38,166,154,0.12)",
  },
  agriculture: {
    accentColor: "#ff6d00",
    accent: "text-[#ff6d00]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#1f1000] text-[#ff6d00] border border-[rgba(255,109,0,0.2)]",
    bar: "bg-[#ff6d00]",
    stripe: "#ff6d00",
    glow: "rgba(255,109,0,0.12)",
  },
  livestock: {
    accentColor: "#ff7043",
    accent: "text-[#ff7043]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#1f0e09] text-[#ff7043] border border-[rgba(255,112,67,0.2)]",
    bar: "bg-[#ff7043]",
    stripe: "#ff7043",
    glow: "rgba(255,112,67,0.12)",
  },
  other: {
    accentColor: "#787b86",
    accent: "text-[#787b86]",
    bg: "bg-[#1e222d]",
    border: "border-[#2a2e39]",
    badge: "bg-[#1e222d] text-[#787b86] border border-[#2a2e39]",
    bar: "bg-[#787b86]",
    stripe: "#787b86",
    glow: "rgba(120,123,134,0.1)",
  },
};

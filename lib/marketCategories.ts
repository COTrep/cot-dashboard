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
  { accent: string; bg: string; border: string; badge: string; bar: string; stripe: string; glow: string }
> = {
  equity: {
    accent: "text-[#3b82f6]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1d3461] text-[#60a5fa] border border-[#1d4ed8]",
    bar: "bg-[#3b82f6]",
    stripe: "linear-gradient(180deg,#3b82f6,#a78bfa)",
    glow: "rgba(59,130,246,0.15)",
  },
  rates: {
    accent: "text-[#a78bfa]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1d1836] text-[#a78bfa] border border-[#4c1d95]",
    bar: "bg-[#a78bfa]",
    stripe: "linear-gradient(180deg,#3b82f6,#a78bfa)",
    glow: "rgba(167,139,250,0.15)",
  },
  fx: {
    accent: "text-[#06b6d4]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#0c2231] text-[#06b6d4] border border-[#164e63]",
    bar: "bg-[#06b6d4]",
    stripe: "linear-gradient(180deg,#3b82f6,#a78bfa)",
    glow: "rgba(6,182,212,0.15)",
  },
  energy: {
    accent: "text-[#f43f5e]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1a0914] text-[#f43f5e] border border-[#2d0f1a]",
    bar: "bg-[#f43f5e]",
    stripe: "linear-gradient(180deg,#f43f5e,#f97316)",
    glow: "rgba(244,63,94,0.15)",
  },
  metals: {
    accent: "text-[#10b981]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#0a1f17] text-[#10b981] border border-[#0f3324]",
    bar: "bg-[#10b981]",
    stripe: "linear-gradient(180deg,#10b981,#06b6d4)",
    glow: "rgba(16,185,129,0.15)",
  },
  agriculture: {
    accent: "text-[#f59e0b]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1c1407] text-[#f59e0b] border border-[#78350f]",
    bar: "bg-[#f59e0b]",
    stripe: "linear-gradient(180deg,#f59e0b,#34d399)",
    glow: "rgba(245,158,11,0.15)",
  },
  livestock: {
    accent: "text-[#fb7185]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1a0a0d] text-[#fb7185] border border-[#881337]",
    bar: "bg-[#fb7185]",
    stripe: "linear-gradient(180deg,#fb7185,#f43f5e)",
    glow: "rgba(251,113,133,0.15)",
  },
  other: {
    accent: "text-[#8b98b2]",
    bg: "bg-[#161b27]",
    border: "border-[#252d3d]",
    badge: "bg-[#1c2235] text-[#8b98b2] border border-[#252d3d]",
    bar: "bg-[#8b98b2]",
    stripe: "linear-gradient(180deg,#475569,#8b98b2)",
    glow: "rgba(139,152,178,0.1)",
  },
};

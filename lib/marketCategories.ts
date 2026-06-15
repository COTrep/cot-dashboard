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
  { accent: string; bg: string; border: string; badge: string; bar: string }
> = {
  equity: {
    accent: "text-amber-400",
    bg: "bg-amber-950/25",
    border: "border-amber-800/40",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    bar: "bg-amber-500",
  },
  rates: {
    accent: "text-violet-400",
    bg: "bg-violet-950/25",
    border: "border-violet-800/40",
    badge: "bg-violet-500/10 text-violet-400 border border-violet-500/30",
    bar: "bg-violet-500",
  },
  fx: {
    accent: "text-teal-400",
    bg: "bg-teal-950/25",
    border: "border-teal-800/40",
    badge: "bg-teal-500/10 text-teal-400 border border-teal-500/30",
    bar: "bg-teal-500",
  },
  energy: {
    accent: "text-orange-400",
    bg: "bg-orange-950/25",
    border: "border-orange-800/40",
    badge: "bg-orange-500/10 text-orange-400 border border-orange-500/30",
    bar: "bg-orange-500",
  },
  metals: {
    accent: "text-yellow-400",
    bg: "bg-yellow-950/25",
    border: "border-yellow-800/40",
    badge: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30",
    bar: "bg-yellow-500",
  },
  agriculture: {
    accent: "text-green-400",
    bg: "bg-green-950/25",
    border: "border-green-800/40",
    badge: "bg-green-500/10 text-green-400 border border-green-500/30",
    bar: "bg-green-500",
  },
  livestock: {
    accent: "text-lime-400",
    bg: "bg-lime-950/25",
    border: "border-lime-800/40",
    badge: "bg-lime-500/10 text-lime-400 border border-lime-500/30",
    bar: "bg-lime-500",
  },
  other: {
    accent: "text-slate-400",
    bg: "bg-slate-900/20",
    border: "border-slate-800/30",
    badge: "bg-slate-500/10 text-slate-400 border border-slate-500/30",
    bar: "bg-slate-500",
  },
};

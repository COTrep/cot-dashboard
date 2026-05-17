import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "../utils/format";
import clsx from "clsx";
import {
  getMarketSector,
  getMarketCategory,
  getCategoryLabel,
  getCategoryIcon,
  FINANCIAL_CATEGORY_ORDER,
  COMMODITY_CATEGORY_ORDER,
  type MarketCategory,
} from "../lib/marketCategories";

interface Props {
  commodities: string[];
  selected?: string;
  loading?: boolean;
}

function SidebarSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full px-3 py-1 text-xs font-mono text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
      >
        <span>{title}</span>
        <svg
          className={clsx(
            "w-3 h-3 transition-transform",
            open ? "rotate-90" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
      {open && <div className="mt-0.5">{children}</div>}
    </div>
  );
}

function CategoryGroup({
  category,
  markets,
  selected,
}: {
  category: MarketCategory;
  markets: string[];
  selected?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (markets.length === 0) return null;

  const icon = getCategoryIcon(category);
  const label = getCategoryLabel(category);
  const hasActive = markets.some((m) => m === selected);

  return (
    <div className="mb-0.5">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center justify-between w-full px-3 py-1.5 rounded-lg text-xs transition-colors",
          hasActive
            ? "text-slate-300"
            : "text-slate-500 hover:text-slate-300 hover:bg-surface-800/60"
        )}
      >
        <span className="flex items-center gap-1.5">
          <span>{icon}</span>
          <span>{label}</span>
          <span className="ml-1 opacity-40">{markets.length}</span>
        </span>
        <svg
          className={clsx(
            "w-3 h-3 transition-transform opacity-50",
            open || hasActive ? "rotate-90" : "rotate-0"
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {(open || hasActive) && (
        <div className="ml-2 space-y-0.5 mt-0.5">
          {markets.map((name) => {
            const isActive = selected === name;
            return (
              <Link
                key={name}
                href={`/commodity/${slugify(name)}`}
                title={name}
                className={clsx(
                  "flex items-center px-3 py-1.5 rounded-lg text-xs transition-colors truncate",
                  isActive
                    ? "bg-brand-600/20 text-brand-300 border border-brand-600/30"
                    : "text-slate-500 hover:text-white hover:bg-surface-800"
                )}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mr-2 shrink-0" />
                )}
                <span className="truncate">{name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({ commodities, selected, loading }: Props) {
  const router = useRouter();

  const { financialGroups, commodityGroups } = useMemo(() => {
    const fg = new Map<MarketCategory, string[]>();
    const cg = new Map<MarketCategory, string[]>();

    for (const cat of FINANCIAL_CATEGORY_ORDER) fg.set(cat, []);
    for (const cat of COMMODITY_CATEGORY_ORDER) cg.set(cat, []);

    for (const name of commodities) {
      const sector = getMarketSector(name);
      const cat = getMarketCategory(name);
      if (sector === "financials") {
        if (!fg.has(cat)) fg.set(cat, []);
        fg.get(cat)!.push(name);
      } else {
        if (!cg.has(cat)) cg.set(cat, []);
        cg.get(cat)!.push(name);
      }
    }
    return { financialGroups: fg, commodityGroups: cg };
  }, [commodities]);

  const isFinancialsPage = router.pathname === "/financials";

  return (
    <aside
      className="fixed top-0 left-0 h-full bg-surface-900 border-r border-surface-800 flex flex-col z-20"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="px-4 py-4 border-b border-slate-800/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-600/20 border border-brand-600/40 rounded flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <span className="font-mono text-sm font-bold tracking-tight text-white">
            COT<span className="text-brand-400">Analytics</span>
          </span>
        </div>
        <p className="text-[10px] font-mono text-slate-600 mt-1.5 uppercase tracking-widest">
          CFTC · Futures Positioning
        </p>
      </div>

      {/* Nav links */}
      <div className="px-3 pt-4 pb-2 shrink-0 space-y-0.5">
        <Link
          href="/"
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            router.pathname === "/" && !isFinancialsPage
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          )}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
          Commodities
        </Link>

        <Link
          href="/financials"
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isFinancialsPage
              ? "bg-violet-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          )}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Financials
        </Link>
      </div>

      {/* Markets list */}
      <div className="overflow-y-auto flex-1 px-3 pb-6 space-y-2 mt-2">
        {loading ? (
          <div className="space-y-1 px-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-8 bg-surface-800 rounded animate-pulse"
                style={{ opacity: 1 - i * 0.06 }}
              />
            ))}
          </div>
        ) : (
          <>
            <SidebarSection title="Financials" defaultOpen={isFinancialsPage}>
              {FINANCIAL_CATEGORY_ORDER.map((cat) => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  markets={financialGroups.get(cat) ?? []}
                  selected={selected}
                />
              ))}
            </SidebarSection>

            <SidebarSection title="Commodities" defaultOpen={!isFinancialsPage}>
              {COMMODITY_CATEGORY_ORDER.map((cat) => (
                <CategoryGroup
                  key={cat}
                  category={cat}
                  markets={commodityGroups.get(cat) ?? []}
                  selected={selected}
                />
              ))}
            </SidebarSection>
          </>
        )}
      </div>
    </aside>
  );
}

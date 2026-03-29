import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { slugify } from "../utils/format";
import clsx from "clsx";

interface Props {
  commodities: string[];
  selected?: string;
  loading?: boolean;
}

export default function Sidebar({ commodities, selected, loading }: Props) {
  const router = useRouter();

  return (
    <aside
      className="fixed top-0 left-0 h-full bg-surface-900 border-r border-surface-800 flex flex-col z-20"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-800 shrink-0">
        <span className="font-display text-lg font-bold tracking-tight text-white">
          COT <span className="text-brand-400">Analytics</span>
        </span>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">CFTC · Futures Positioning</p>
      </div>

      {/* Nav link to dashboard */}
      <div className="px-3 pt-4 pb-2 shrink-0">
        <Link
          href="/"
          className={clsx(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            router.pathname === "/" && !router.query.name
              ? "bg-brand-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-surface-800"
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Commodity list */}
      <div className="px-3 pb-2 shrink-0">
        <p className="text-xs font-mono text-slate-600 uppercase tracking-widest px-3 mb-1">
          Markets
        </p>
      </div>

      <div className="overflow-y-auto flex-1 px-3 pb-6 space-y-0.5">
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
          commodities.map((name) => {
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
                    : "text-slate-400 hover:text-white hover:bg-surface-800"
                )}
              >
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mr-2 shrink-0" />
                )}
                <span className="truncate">{name}</span>
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}

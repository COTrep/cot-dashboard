/** Format large numbers with K/M suffixes */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

/** Convert yyyymmdd string to a readable date */
export function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd;
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}-${m}-${d}`;
}

/** Slugify a commodity name for use in URLs */
export function slugify(name: string): string {
  return encodeURIComponent(name);
}

/** Un-slugify a URL param back to original name */
export function unslugify(slug: string): string {
  return decodeURIComponent(slug);
}

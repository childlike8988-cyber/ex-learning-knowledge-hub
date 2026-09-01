/** Deterministic presentation helpers for report renderers. */
export function formatNumber(value: string | number | undefined): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 2 }).format(numeric) : "資料待更新";
}

export function formatPercent(value: string | number | undefined): string {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? `${new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 3 }).format(numeric)}%` : "資料待更新";
}

export function formatTwdAmount(value: string | number | undefined, unit = ""): string {
  const formatted = formatNumber(value);
  return formatted === "資料待更新" ? formatted : `${formatted}${unit ? ` ${unit}` : ""}`;
}

export function formatDate(value: string | undefined): string {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.replaceAll("-", ".") : value || "資料待更新";
}

export function formatDateRange(start?: string, end?: string, label?: string): string {
  if (label) return label;
  if (start && end) return `${formatDate(start)} ～ ${formatDate(end)}`;
  return formatDate(start ?? end);
}

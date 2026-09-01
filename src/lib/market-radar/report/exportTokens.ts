/** Export contract version. Bump when the PNG/PDF layout contract changes. */
export const MARKET_RADAR_EXPORT_VERSION = "1.0.0" as const;

export const MARKET_RADAR_EXPORT_TOKENS = {
  pageBackground: "#f5efe5",
  paper: "#fffdf7",
  ink: "#30271f",
  mutedInk: "#756858",
  goldAccent: "#b58e52",
  lotusAccent: "#c5a68e",
  border: "rgba(133, 98, 56, .22)",
  live: "#688260",
  waiting: "#9b8d7c",
  png: { width: 1080, height: 1920, safeInsetX: 64, safeInsetY: 72 },
  pdf: { format: "A4", orientation: "portrait" },
} as const;

export const MARKET_RADAR_EXPORT_TYPOGRAPHY = {
  brand: "0.72rem",
  reportTitle: "2.25rem",
  keyTake: "2rem",
  sectionTitle: "0.82rem",
  metric: "1.8rem",
  body: "0.95rem",
  source: "0.68rem",
  disclaimer: "0.62rem",
} as const;

export const MARKET_RADAR_PNG_EXPORT_SPEC = {
  width: 1080,
  height: 1920,
  aspectRatio: "9:16",
  safeInsetX: 64,
  safeInsetY: 72,
  maxPrimaryCharts: 1,
} as const;

export const MARKET_RADAR_PDF_EXPORT_SPEC = {
  format: "A4",
  orientation: "portrait",
  pages: ["cover", "overview", "moi", "cbc", "signals", "sources"],
} as const;

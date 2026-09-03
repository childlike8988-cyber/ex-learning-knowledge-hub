export const MARKET_RADAR_AUTH_CALLBACK_PATH = "/market-radar/auth/callback/";
export const MARKET_RADAR_HOME_PATH = "/market-radar/";

function normalizeBasePath(basePath = ""): string {
  const trimmed = basePath.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}`;
}

/**
 * Deterministically composes a callback from the origin of the browser that
 * initiated login. It never infers a production origin while on localhost.
 */
export function buildMarketRadarAuthCallbackUrl(origin: string, basePath = ""): string {
  const normalizedOrigin = new URL(origin).origin;
  return `${normalizedOrigin}${normalizeBasePath(basePath)}${MARKET_RADAR_AUTH_CALLBACK_PATH}`;
}

export function buildMarketRadarHomePath(basePath = ""): string {
  return `${normalizeBasePath(basePath)}${MARKET_RADAR_HOME_PATH}`;
}

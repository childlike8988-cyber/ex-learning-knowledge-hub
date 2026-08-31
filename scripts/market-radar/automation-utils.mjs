import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";

export const AUTOMATION_ENABLED = false;

export const JOB_DEFINITIONS = Object.freeze({
  "moi-latest-refresh": { sourceId: "moi-real-price-sales", enabled: true, purpose: "latest" },
  "moi-history-backfill": { sourceId: "moi-real-price-sales", enabled: false, purpose: "history" },
  "cbc-monthly-refresh": { sourceId: "cbc-housing-finance", enabled: true, purpose: "monthly" },
});

export async function sha256File(filePath) {
  const contents = await readFile(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

export function createSourceVersion({ sourceId, filePath, fileHash, publishedAt, dataPeriodStart, dataPeriodEnd, retrievedAt, methodologyVersion }) {
  if (!sourceId || !publishedAt || !fileHash || !methodologyVersion) throw new Error("source version metadata is incomplete");
  const period = [dataPeriodStart ?? "", dataPeriodEnd ?? ""].join("/");
  return {
    sourceId,
    sourceVersionId: `${sourceId}:${publishedAt}:${period}:${fileHash}`,
    ...(filePath ? { fileName: basename(filePath) } : {}),
    fileHash,
    publishedAt,
    ...(dataPeriodStart ? { dataPeriodStart } : {}),
    ...(dataPeriodEnd ? { dataPeriodEnd } : {}),
    retrievedAt,
    methodologyVersion,
    status: "candidate",
  };
}

export function isCandidateNewer(candidate, current, force = false) {
  if (force) return { eligible: true, reason: "force" };
  if (current?.sourceVersionId === candidate.sourceVersionId) return { eligible: false, reason: "duplicate-source-version" };
  if (!current?.publishedAt) return { eligible: true, reason: "first-version" };
  if (Date.parse(candidate.publishedAt) <= Date.parse(current.publishedAt)) return { eligible: false, reason: "source-not-newer" };
  return { eligible: true, reason: "newer-source" };
}

export function canPublishCandidate({ metadataValid, schemaValid, qualityPassed, isNewer }) {
  return Boolean(metadataValid && schemaValid && qualityPassed && isNewer);
}

export function validateCbcAutomationQuality({ quality, liveData }) {
  const history = Array.isArray(liveData?.history) ? liveData.history : [];
  const periods = history.map((record) => record?.period);
  const sorted = periods.every((period, index) => index === 0 || periods[index - 1] < period);
  const uniquePeriods = new Set(periods).size === periods.length;
  const latest = liveData?.latest;
  const validPeriod = /^\d{4}-\d{2}$/.test(latest?.period ?? "");
  const validRate = Number.isFinite(latest?.mortgageRate) && latest.mortgageRate > 0 && latest.mortgageRate < 20;
  const validAmount = Number.isFinite(latest?.newMortgageAmount) && latest.newMortgageAmount >= 0;
  return {
    passed: Number(quality?.acceptedRows) > 0 && validPeriod && validRate && validAmount && sorted && uniquePeriods,
    checks: { acceptedRows: Number(quality?.acceptedRows) > 0, validPeriod, validRate, validAmount, historySorted: sorted, uniquePeriods },
  };
}

export function validateMoiAutomationQuality({ quality, liveData, previousQuality }) {
  const counts = liveData?.metrics?.districtTransactionCounts ?? [];
  const total = counts.reduce((sum, item) => sum + Number(item?.transactionCount ?? 0), 0);
  const acceptedRows = Number(quality?.acceptedRows) > 0;
  const rejectedRows = Number(quality?.rejectedRows ?? 0);
  const duplicateRows = Number(quality?.duplicateRows ?? 0);
  const rawRows = Number(quality?.rawRows ?? acceptedRows + rejectedRows + duplicateRows);
  const rejectionRatio = rawRows > 0 ? rejectedRows / rawRows : 1;
  const priorRaw = Number(previousQuality?.rawRows ?? 0);
  const priorRejected = Number(previousQuality?.rejectedRows ?? 0);
  const priorRatio = priorRaw > 0 ? priorRejected / priorRaw : 0;
  const rejectionNormal = rejectionRatio <= Math.max(0.1, priorRatio + 0.08);
  const metadata = liveData?.sourceId === "moi-real-price-sales" && liveData?.dataPeriodStart <= liveData?.dataPeriodEnd && liveData?.source?.isPrimarySource === true;
  return { passed: acceptedRows && Number(quality?.districtCount) > 0 && Number(liveData?.metrics?.transactionCount) > 0 && total === Number(liveData?.metrics?.transactionCount) && metadata && rejectionNormal, checks: { acceptedRows, districtCount: Number(quality?.districtCount) > 0, transactionCount: Number(liveData?.metrics?.transactionCount) > 0, districtSum: total === Number(liveData?.metrics?.transactionCount), metadata, rejectionNormal }, warnings: rejectionNormal ? [] : ["MOI rejected-row ratio is anomalous and requires review."] };
}

export async function safeJsonWrite(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporaryPath, filePath);
}

export function publicRefreshState({ sourceId, liveData, fallbackStatus = "waiting", fallbackFreshness = "aging" }) {
  if (liveData?.status === "live") {
    return {
      sourceId,
      lastSuccessfulUpdateAt: liveData.generatedAt,
      lastAttemptAt: liveData.generatedAt,
      latestSourcePublishedAt: liveData.sourcePublishedAt,
      latestDataPeriodStart: liveData.dataPeriodStart,
      latestDataPeriodEnd: liveData.dataPeriodEnd,
      status: "live",
      freshness: liveData.freshness?.status ?? "normal",
    };
  }
  return { sourceId, status: fallbackStatus, freshness: fallbackFreshness };
}

export function buildPublicUpdateStatus({ generatedAt, moiLatest, cbcLatest, moiHistoryReady }) {
  const moiLatestState = publicRefreshState({ sourceId: "moi-real-price-sales", liveData: moiLatest });
  const cbcState = publicRefreshState({ sourceId: "cbc-housing-finance", liveData: cbcLatest });
  const moiHistory = {
    sourceId: "moi-real-price-sales",
    status: moiHistoryReady ? "live" : "waiting",
    freshness: moiHistoryReady ? "normal" : "aging",
  };
  const sourcesLive = moiLatestState.status === "live" && cbcState.status === "live";
  return {
    generatedAt,
    automationEnabled: false,
    automation: {
      globalReady: true,
      jobs: { moiLatestRefresh: true, moiHistoryBackfill: false, cbcMonthlyRefresh: true },
    },
    overallStatus: sourcesLive ? "partial" : "degraded",
    safeMessage: sourcesLive && !moiHistoryReady
      ? "MOI 最新期與 CBC 資料已驗證；MOI 歷史基準仍等待可驗證的前期官方批次。"
      : "部分公開資料正在等待驗證或更新。",
    sources: { moiLatest: moiLatestState, moiHistory, cbc: cbcState },
  };
}

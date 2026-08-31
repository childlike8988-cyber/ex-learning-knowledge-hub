import type { MarketRadarFreshnessStatus } from "@/data/market-radar";

export type MarketRadarUpdateJobStatus = "idle" | "checking" | "downloading" | "validating" | "processing" | "staged" | "published" | "failed" | "skipped";
export type MarketRadarUpdateQualityStatus = "pending" | "passed" | "failed";
export type MarketRadarUpdateTrigger = "manual" | "scheduled" | "webhook";
export type MarketRadarAutomationJobId = "moi-latest-refresh" | "moi-history-backfill" | "cbc-monthly-refresh";

export type MarketRadarUpdateJob = {
  id: MarketRadarAutomationJobId;
  sourceId: string;
  status: MarketRadarUpdateJobStatus;
  startedAt?: string;
  finishedAt?: string;
  sourcePublishedAt?: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  previousVersion?: string;
  candidateVersion?: string;
  publishedVersion?: string;
  qualityStatus: MarketRadarUpdateQualityStatus;
  message?: string;
  errorCode?: "acquisition-not-configured" | "metadata-invalid" | "quality-gate-failed" | "source-not-newer" | "duplicate-source-version" | "automation-disabled";
  trigger: MarketRadarUpdateTrigger;
  dryRun: boolean;
};

export type MarketRadarSourceRefreshState = {
  sourceId: string;
  lastSuccessfulUpdateAt?: string;
  lastAttemptAt?: string;
  nextExpectedUpdateAt?: string;
  latestSourcePublishedAt?: string;
  latestDataPeriodStart?: string;
  latestDataPeriodEnd?: string;
  status: "live" | "waiting" | "updating" | "failed";
  freshness: MarketRadarFreshnessStatus;
  lastError?: string;
};

export type MarketRadarSourceVersion = {
  sourceId: string;
  sourceVersionId: string;
  fileName?: string;
  fileHash?: string;
  publishedAt: string;
  dataPeriodStart?: string;
  dataPeriodEnd?: string;
  retrievedAt: string;
  validatedAt?: string;
  methodologyVersion: string;
  status: "candidate" | "published" | "skipped" | "failed";
};

export type MarketRadarUpdateJobResult = {
  jobId: MarketRadarAutomationJobId;
  sourceId: string;
  status: MarketRadarUpdateJobStatus;
  sourceVersionId?: string;
  changed: boolean;
  published: boolean;
  qualityPassed: boolean;
  warnings: readonly string[];
  errors: readonly string[];
  previousDataPeriod?: { start?: string; end?: string };
  candidateDataPeriod?: { start?: string; end?: string };
  durationMs: number;
};

export type MarketRadarHealthStatus = {
  overall: "healthy" | "partial" | "degraded";
  sources: {
    moiLatest: MarketRadarSourceRefreshState;
    moiHistory: MarketRadarSourceRefreshState;
    cbc: MarketRadarSourceRefreshState;
  };
  analysis: "ready" | "partial" | "degraded";
  lastBuildAt: string;
};

export type MarketRadarPublicUpdateStatus = {
  generatedAt: string;
  automationEnabled: false;
  overallStatus: "healthy" | "partial" | "degraded";
  safeMessage: string;
  sources: {
    moiLatest: Pick<MarketRadarSourceRefreshState, "sourceId" | "lastSuccessfulUpdateAt" | "latestSourcePublishedAt" | "latestDataPeriodStart" | "latestDataPeriodEnd" | "status" | "freshness">;
    moiHistory: Pick<MarketRadarSourceRefreshState, "sourceId" | "status" | "freshness">;
    cbc: Pick<MarketRadarSourceRefreshState, "sourceId" | "lastSuccessfulUpdateAt" | "latestSourcePublishedAt" | "latestDataPeriodStart" | "latestDataPeriodEnd" | "status" | "freshness">;
  };
};

export type MarketRadarAutomationRunner = {
  run: (jobId: MarketRadarAutomationJobId, options: {
    dryRun: boolean;
    force?: boolean;
    sourceFile?: string;
    sourceUrl?: string;
    sourcePublishedAt?: string;
    dataPeriodStart?: string;
    dataPeriodEnd?: string;
  }) => Promise<MarketRadarUpdateJobResult>;
};

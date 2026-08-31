import fixture from "../../../public/data/market-radar/2026-08-29.json";
import {
  marketRadarFallbackReport,
  type MarketRadarAnalysis,
  type MarketRadarChart,
  type MarketRadarDetail,
  type MarketRadarDistrictHighlight,
  type MarketRadarFact,
  type MarketRadarNewsItem,
  type MarketRadarReport,
  type MarketRadarSource,
} from "@/data/market-radar";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) throw new Error(`Missing Market Radar ${field}`);
  return value;
}

function readArray(value: unknown, field: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Missing Market Radar ${field}`);
  return value;
}

function readSourceIds(value: unknown, sourceMap: Map<string, MarketRadarSource>, field: string): readonly string[] {
  const sourceIds = readArray(value, field).map((sourceId) => readString(sourceId, `${field} item`));
  if (sourceIds.length === 0 || sourceIds.some((sourceId) => !sourceMap.has(sourceId))) throw new Error(`Unknown Market Radar source reference in ${field}`);
  return sourceIds;
}

function readSource(value: unknown): MarketRadarSource {
  if (!isRecord(value)) throw new Error("Invalid Market Radar source");
  return {
    id: readString(value.id, "source.id"),
    name: readString(value.name, "source.name"),
    publisher: readString(value.publisher, "source.publisher"),
    type: readString(value.type, "source.type") as MarketRadarSource["type"],
    priority: readString(value.priority, "source.priority") as MarketRadarSource["priority"],
    ...(typeof value.url === "string" ? { url: value.url } : {}),
    ...(typeof value.publishedAt === "string" ? { publishedAt: value.publishedAt } : {}),
    ...(typeof value.dataPeriodStart === "string" ? { dataPeriodStart: value.dataPeriodStart } : {}),
    ...(typeof value.dataPeriodEnd === "string" ? { dataPeriodEnd: value.dataPeriodEnd } : {}),
    ...(typeof value.verifiedAt === "string" ? { verifiedAt: value.verifiedAt } : {}),
    ...(typeof value.retrievedAt === "string" ? { retrievedAt: value.retrievedAt } : {}),
    expectedUpdateFrequency: readString(value.expectedUpdateFrequency, "source.expectedUpdateFrequency") as MarketRadarSource["expectedUpdateFrequency"],
    ...(typeof value.notes === "string" ? { notes: value.notes } : {}),
    isPrimarySource: value.isPrimarySource === true,
    isMock: value.isMock === true,
  };
}

function readFacts(value: unknown, sourceMap: Map<string, MarketRadarSource>, field: string): readonly MarketRadarFact[] {
  return readArray(value, field).map((fact, index) => {
    if (!isRecord(fact)) throw new Error(`Invalid Market Radar ${field}[${index}]`);
    return {
      id: readString(fact.id, `${field}[${index}].id`),
      label: readString(fact.label, `${field}[${index}].label`),
      value: readString(fact.value, `${field}[${index}].value`),
      ...(typeof fact.unit === "string" ? { unit: fact.unit } : {}),
      ...(typeof fact.comparison === "string" ? { comparison: fact.comparison } : {}),
      sourceIds: readSourceIds(fact.sourceIds, sourceMap, `${field}[${index}].sourceIds`),
      dataPeriod: (fact.dataPeriod ?? {}) as MarketRadarFact["dataPeriod"],
      isEstimated: fact.isEstimated === true,
      isMock: fact.isMock === true,
    };
  });
}

function readDetail(value: unknown, sourceMap: Map<string, MarketRadarSource>): MarketRadarDetail {
  if (!isRecord(value)) throw new Error("Invalid Market Radar detail");
  const sourceIds = readSourceIds(value.sourceIds, sourceMap, "detail.sourceIds");
  const facts = readFacts(value.facts, sourceMap, "detail.facts");
  if (!isRecord(value.analysis) || !isRecord(value.freshness)) throw new Error("Missing Market Radar detail analysis or freshness");
  return {
    id: readString(value.id, "detail.id"),
    category: readString(value.category, "detail.category"),
    title: readString(value.title, "detail.title"),
    summary: readString(value.summary, "detail.summary"),
    facts,
    analysis: value.analysis as MarketRadarAnalysis,
    sources: sourceIds.map((sourceId) => sourceMap.get(sourceId)!),
    freshness: value.freshness as MarketRadarDetail["freshness"],
    isMock: value.isMock === true,
  };
}

export function parseMarketRadarFixture(value: unknown): MarketRadarReport | null {
  try {
    if (!isRecord(value)) throw new Error("Invalid Market Radar fixture");
    const sources = readArray(value.sources, "sources").map(readSource);
    const sourceMap = new Map(sources.map((source) => [source.id, source]));
    if (sourceMap.size !== sources.length) throw new Error("Duplicate Market Radar source id");

    const marketTemperature = value.marketTemperature;
    const dailyKeyTake = value.dailyKeyTake;
    if (!isRecord(marketTemperature) || !isRecord(dailyKeyTake)) throw new Error("Missing Market Radar primary sections");

    const districtHighlights = readArray(value.districtHighlights, "districtHighlights").map((item) => {
      if (!isRecord(item)) throw new Error("Invalid district highlight");
      return {
        id: readString(item.id, "district.id"),
        district: readString(item.district, "district.district"),
        headline: readString(item.headline, "district.headline"),
        summary: readString(item.summary, "district.summary"),
        signals: readArray(item.signals, "district.signals") as string[],
        facts: readFacts(item.facts, sourceMap, "district.facts"),
        sourceIds: readSourceIds(item.sourceIds, sourceMap, "district.sourceIds"),
        detail: readDetail(item.detail, sourceMap),
        isMock: item.isMock === true,
      } satisfies MarketRadarDistrictHighlight;
    });

    const newsItems = readArray(value.newsItems, "newsItems").map((item) => {
      if (!isRecord(item)) throw new Error("Invalid news item");
      return {
        id: readString(item.id, "news.id"),
        category: readString(item.category, "news.category") as MarketRadarNewsItem["category"],
        title: readString(item.title, "news.title"),
        summary: readString(item.summary, "news.summary"),
        sourceIds: readSourceIds(item.sourceIds, sourceMap, "news.sourceIds"),
        ...(typeof item.publishedAt === "string" ? { publishedAt: item.publishedAt } : {}),
        ...(typeof item.updatedAt === "string" ? { updatedAt: item.updatedAt } : {}),
        detail: readDetail(item.detail, sourceMap),
        isMock: item.isMock === true,
      } satisfies MarketRadarNewsItem;
    });

    const publicCharts = readArray(value.publicCharts, "publicCharts").map((item) => {
      if (!isRecord(item) || !Array.isArray(item.series)) throw new Error("Invalid public chart");
      return {
        id: readString(item.id, "chart.id") as MarketRadarChart["id"],
        dataStatus: item.dataStatus === "live" ? "live" : "fixture",
        title: readString(item.title, "chart.title"),
        subtitle: readString(item.subtitle, "chart.subtitle"),
        chartType: readString(item.chartType, "chart.chartType") as MarketRadarChart["chartType"],
        ...(isRecord(item.xAxis) ? { xAxis: item.xAxis as MarketRadarChart["xAxis"] } : {}),
        ...(isRecord(item.yAxis) ? { yAxis: item.yAxis as MarketRadarChart["yAxis"] } : {}),
        series: item.series as MarketRadarChart["series"],
        dataPeriod: (item.dataPeriod ?? {}) as MarketRadarChart["dataPeriod"],
        sourceIds: readSourceIds(item.sourceIds, sourceMap, "chart.sourceIds"),
        analysis: item.analysis as MarketRadarAnalysis,
        detail: readDetail(item.detail, sourceMap),
        isMock: item.isMock === true,
      } satisfies MarketRadarChart;
    });

    const report: MarketRadarReport = {
      id: readString(value.id, "report.id"),
      status: readString(value.status, "report.status") as MarketRadarReport["status"],
      isMock: value.isMock === true,
      date: readString(value.date, "report.date"),
      updatedAt: readString(value.updatedAt, "report.updatedAt"),
      updatedAtLabel: readString(value.updatedAtLabel, "report.updatedAtLabel"),
      title: readString(value.title, "report.title"),
      subtitle: readString(value.subtitle, "report.subtitle"),
      summary: readString(value.summary, "report.summary"),
      sources,
      freshness: value.freshness as MarketRadarReport["freshness"],
      marketTemperature: {
        label: readString(marketTemperature.label, "marketTemperature.label"),
        description: readString(marketTemperature.description, "marketTemperature.description"),
        indicators: readArray(marketTemperature.indicators, "marketTemperature.indicators") as MarketRadarReport["marketTemperature"]["indicators"],
        sourceIds: readSourceIds(marketTemperature.sourceIds, sourceMap, "marketTemperature.sourceIds"),
        dataPeriod: (marketTemperature.dataPeriod ?? {}) as MarketRadarReport["marketTemperature"]["dataPeriod"],
        ...(typeof marketTemperature.updatedAt === "string" ? { updatedAt: marketTemperature.updatedAt } : {}),
      },
      dailyKeyTake: {
        text: readString(dailyKeyTake.text, "dailyKeyTake.text"),
        lineCount: dailyKeyTake.lineCount as 1 | 2 | 3,
        sourceIds: readSourceIds(dailyKeyTake.sourceIds, sourceMap, "dailyKeyTake.sourceIds"),
        basisFactIds: Array.isArray(dailyKeyTake.basisFactIds) ? dailyKeyTake.basisFactIds.filter((id): id is string => typeof id === "string") : [],
        basisSignalIds: Array.isArray(dailyKeyTake.basisSignalIds) ? dailyKeyTake.basisSignalIds.filter((id): id is string => typeof id === "string") : [],
        dataStatus: dailyKeyTake.dataStatus === "live" || dailyKeyTake.dataStatus === "partial" || dailyKeyTake.dataStatus === "unavailable" ? dailyKeyTake.dataStatus : "fixture",
        analysisBasis: readString(dailyKeyTake.analysisBasis, "dailyKeyTake.analysisBasis"),
        isMock: dailyKeyTake.isMock === true,
      },
      districtHighlights,
      keyTakeaways: readArray(value.keyTakeaways, "keyTakeaways") as string[],
      newsItems,
      publicCharts,
      proContent: value.proContent as MarketRadarReport["proContent"],
      freePlan: value.freePlan as MarketRadarReport["freePlan"],
      currentQuarter: value.currentQuarter as MarketRadarReport["currentQuarter"],
      downloadBundle: value.downloadBundle as MarketRadarReport["downloadBundle"],
      downloads: value.downloads as MarketRadarReport["downloads"],
      pricing: value.pricing as MarketRadarReport["pricing"],
      access: value.access as MarketRadarReport["access"],
    };

    if (!report.isMock || report.status !== "fixture") throw new Error("Fixture must remain marked as mock");
    return report;
  } catch {
    return null;
  }
}

export function loadMarketRadarReport(): MarketRadarReport {
  const report = parseMarketRadarFixture(fixture);
  if (report) return report;
  if (process.env.NODE_ENV !== "production") console.warn("Market Radar fixture validation failed; rendering fallback report.");
  return marketRadarFallbackReport;
}

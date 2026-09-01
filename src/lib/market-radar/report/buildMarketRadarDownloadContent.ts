import type { MarketRadarReportSnapshot, MarketRadarReportDataStatus } from "./types";

export type MarketRadarShareCardId = "share-01" | "share-02" | "share-03";
export type MarketRadarShareCardRole = "market-overview" | "data-and-context" | "client-guidance";

export type MarketRadarDownloadShareCard = {
  id: MarketRadarShareCardId;
  role: MarketRadarShareCardRole;
  title: string;
  summary: string;
  sourceIds: readonly string[];
};

export type MarketRadarDownloadContent = {
  shareCards: readonly MarketRadarDownloadShareCard[];
  marketState: string;
  dataContext: readonly { label: string; text: string; status: MarketRadarReportDataStatus }[];
  buyerPoints: readonly string[];
  sellerPoints: readonly string[];
  watchNext: readonly string[];
  methodologyNote: string;
};

function liveSourceIds(snapshot: MarketRadarReportSnapshot) {
  return snapshot.sources.filter((source) => !source.isMock).map((source) => source.id);
}

/**
 * Download-only presentation context. It only derives neutral wording from the
 * immutable snapshot; no numeric facts, source status, or market direction is invented.
 */
export function buildMarketRadarDownloadContent(snapshot: MarketRadarReportSnapshot): MarketRadarDownloadContent {
  const moiFact = snapshot.moi.facts[0];
  const rateFact = snapshot.cbc.facts.find((fact) => fact.id.includes("mortgage-rate"));
  const amountFact = snapshot.cbc.facts.find((fact) => fact.id.includes("mortgage-amount"));
  const sourceIds = liveSourceIds(snapshot);
  const hasMoi = snapshot.moi.status === "live" && Boolean(moiFact);
  const hasCbc = snapshot.cbc.status === "live" && Boolean(rateFact || amountFact);
  const coverageNote = snapshot.status === "partial-live"
    ? "目前已接入內政部與中央銀行官方資料；歷史交易基準與價格動能仍待建立。"
    : "本期資料狀態依 Snapshot 顯示。";
  const dataContext = [
    ...(hasMoi ? [{ label: "MOI 本期案件", text: `高雄本期有效實價登錄買賣案件共 ${moiFact?.value} 件；案件數不等同即時買氣。`, status: "live" as const }] : []),
    ...(hasCbc && rateFact ? [{ label: "CBC 融資環境", text: `五大銀行新承做購屋貸款利率為 ${rateFact.value}${rateFact.unit ?? ""}；利率方向不能單獨推論房價。`, status: "live" as const }] : []),
    ...(hasCbc && amountFact ? [{ label: "CBC 新承做金額", text: `新承做購屋貸款金額為 ${amountFact.value} ${amountFact.unit ?? ""}；金額變動不等同房價變動。`, status: "live" as const }] : []),
    { label: "資料涵蓋", text: coverageNote, status: "waiting" as const },
  ];

  const shareCards: MarketRadarDownloadShareCard[] = [{
    id: "share-01",
    role: "market-overview",
    title: "市場總覽",
    summary: coverageNote,
    sourceIds,
  }];
  if (hasMoi || hasCbc) {
    shareCards.push({
      id: "share-02",
      role: "data-and-context",
      title: "數據與脈絡",
      summary: "本卡整理本期官方數據、區域案件分布與可確認的解讀邊界。",
      sourceIds,
    });
  }
  if (hasMoi && hasCbc) {
    shareCards.push({
      id: "share-03",
      role: "client-guidance",
      title: "客戶溝通與觀察",
      summary: "以公開資料整理買方、賣方與下一期應持續觀察的中性溝通重點。",
      sourceIds,
    });
  }

  return {
    shareCards,
    marketState: coverageNote,
    dataContext,
    buyerPoints: [
      "將購屋貸款利率與每月還款負擔一併納入物件評估，不以單月利率變化單獨判斷房價方向。",
      "實價登錄具申報與揭露時間差；可將本期案件資訊作為比較起點，而非即時成交行情。",
    ],
    sellerPoints: [
      "以同區位、同類型的已揭露實價作為價格溝通起點，避免以單期案件數宣稱需求轉強或轉弱。",
      "保留產品條件、屋況與區位差異的說明，避免把行政區案件數直接當成個別物件定價依據。",
    ],
    watchNext: [
      "下一期內政部高雄市買賣資料，以及可比較的歷史基準是否完成。",
      "下一期中央銀行月資料與房貸利率變動；此指標僅反映融資環境。",
      "價格動能仍待正式可比較價格序列建立後，才可進行趨勢判讀。",
    ],
    methodologyNote: "所有數字均保留原始官方 facts；下載層只延伸規則式脈絡、來源與限制說明。",
  };
}

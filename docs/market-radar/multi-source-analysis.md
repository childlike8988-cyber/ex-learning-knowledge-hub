# Multi-Source Analysis Foundation（Phase 2C-2）

## Purpose

此層把已驗證的官方事實轉換成可閱讀的 Market Radar Signal；它不是資料抓取器，也不是自由生成市場結論的 AI。

```text
Official Facts -> Normalized Facts -> Rule Engine -> Structured Analysis -> Optional LLM Rewrite -> Validation -> UI
```

目前所有 UI 結論由 `market-radar-analysis-v1` 的 deterministic rules 產生。

## Source separation

- MOI：內政部不動產實價登錄。負責成交活動與未來價格序列。
- CBC：中央銀行五大銀行新承做購屋貸款資料。負責融資環境。
- 同一 Drawer 中每一筆 source 仍個別顯示發布日期、資料期間、取得時間與驗證時間；不得把不同來源時間合併為一個期間。

## Fact versus Analysis

`MarketRadarFact` 只保存官方數字、單位、比較值、sourceId 與資料期間。`MarketRadarAnalysis` 只保存規則結果及其閱讀限制。每個 Signal 都保留 `factIds` 與 `sourceIds`；Analysis 不得改寫 Fact。

## Signal rules

### Transaction Activity（MOI）

- MOI unavailable：`unavailable`。
- 只有一個官方資料期：可標示 `live`，但方向與 level 都是 `unavailable`；文案必須說明「尚需歷史基準」。
- 至少兩個可比較期：以有效 record 件數變動判定方向。超過 ±2% 才標為 up/down；成交件數只代表已揭露登錄樣本，不等同即時需求。

### Financing Environment（CBC）

- 有效的五大銀行新承做購屋貸款利率：`live`。
- 月變動大於 +0.005 個百分點為利率 up；小於 -0.005 個百分點為利率 down；其餘 flat。
- 利率方向只表示融資成本方向，不能推論房價漲跌；新承做金額增加也不能推論房價必然上升。

### Price Momentum（MOI future）

在沒有正式、可比較且揭露篩選條件的價格序列前，維持 `unavailable`，不得使用 Fixture 箭頭假裝 LIVE。

## Market Temperature and Partial Live

- 沒有 LIVE signal：`unavailable`。
- 只有一個 LIVE signal：`partial`，標示「資料建立中」。
- MOI 與 CBC 都 LIVE 且交易有可比較方向時，才允許用規則給出偏冷／中性／偏熱。
- 現階段 CBC LIVE + MOI unavailable 顯示「目前融資環境已接入中央銀行資料；成交與價格趨勢仍待官方資料完成。」

## Daily Key Take

Live Key Take 需要至少兩個獨立 LIVE Signal、每個 confidence 至少 medium，並保存 `basisFactIds`、`basisSignalIds` 與 `dataStatus: live`。只有 CBC 時保留 Fixture 今日一句，另顯示 CBC LIVE OBSERVATION，不取代整體市場結論。

## Confidence, versioning and limits

- `ruleVersion`：`market-radar-analysis-v1` / `1.0.0`。
- 單月資料不能推導長期趨勢；correlation 不代表 causation。
- 實價登錄有申報與發布時間差。
- 每個分析下方都應保留：Market Radar 解讀係依公開資料整理之分析，不代表原始資料來源立場，亦不構成投資或交易建議。

## Future LLM role

LLM 只可改寫已驗證 rule result、縮短文字、提供不同閱讀層級摘要。LLM 不可修改 numeric facts、決定 signal 方向、補不存在的來源，或脫離 rule result 產生結論。

# MOI 實價登錄資料方法說明（Phase 2C-3）

## 狀態

Phase 2C-3 已匯入第一份經內政部官方 Open Data 下載流程取得的高雄市買賣 CSV。公開頁的「區域成交件數比較」現在使用此 Live slice；其餘未接入資料的區塊仍保留 Fixture／Mock 標示。

## 本次正式匯入

- 官方檔名：`E_lvr_land_A.csv`
- 檔案格式：UTF-8 CSV，高雄市專屬「不動產買賣」批次檔
- 官方下載頁：<https://plvr.land.moi.gov.tw/DownloadOpenData>
- 官方發布日：2026-08-21；官方交易實價服務網公告該日提供登記日期 2026-08-01 至 2026-08-10 的買賣案件查詢與下載
- 資料期間：登記日期 2026-08-01 ～ 2026-08-10（非交易日期）
- 取得時間：2026-08-31T04:31:23.000Z
- 驗證／產製時間：記錄於 Live JSON 與 Data Quality Report 的 `verifiedAt`／`generatedAt`
- 範圍：高雄市；交易類別：不動產買賣

官方 schema 首列為中文欄位，第二列為英文欄位說明；匯入器會明確略過第二列。必要欄位已依實際 header 驗證為：`鄉鎮市區`、`交易標的`、`交易年月日`、`總價元`、`編號`，並讀取可選的面積、單價、車位、建物型態與備註欄位。

本次品質結果：`rawRows=1040`、`acceptedRows=1040`、`rejectedRows=0`、`duplicateRows=0`、`districtCount=36`。36 個行政區件數加總為 1040，與 `transactionCount` 一致。

## 官方來源

- 資料名稱：不動產實價登錄買賣案件批次開放資料
- 來源名稱：內政部不動產實價登錄
- 發布者：內政部地政司
- 優先級：Tier 1／Official／Primary Source
- 官方下載頁：https://plvr.land.moi.gov.tw/DownloadOpenData

官方下載頁要求依其流程取得批次資料；原始 ZIP／CSV 不會納入 Git。每次匯入應在 `data/market-radar/raw/moi/source-manifest.json` 填入下載日、官方發布日、資料期間與原始檔案名稱。

## 匯入步驟

```powershell
node scripts/market-radar/import-moi-real-price.mjs "<官方 CSV 路徑>" `
  --source-published-at "<官方發布 ISO 時間>" `
  --data-period-start "<資料期間起日>" `
  --data-period-end "<資料期間迄日>"
```

若官方 CSV 不含縣市欄位，僅限在已確認為「高雄市專屬官方檔案」時，額外加上 `--county-file`。不得以地址文字模糊比對城市。

## 欄位與篩選

匯入器會先讀取 CSV header，再尋找官方欄位對應；必要欄位為行政區、交易年月日、交易標的、總價。可選欄位包括官方 record ID、建物型態、單價、建物／土地面積、車位總價與建築完成年月。

- 高雄篩選：有官方縣市欄位時，精確等於「高雄市」。
- 交易日期：民國年日期先經驗證轉為 Gregorian ISO 日期。
- 無行政區、無法解析交易日期、無效總價、無交易標的的資料會拒收並記錄於品質報告。
- 去重：優先使用官方 record ID；若來源未提供，才以可重現欄位指紋去重並留下警語。

## 第一版指標與定義

本階段只發布兩項可驗證指標：

1. `transactionCount`：通過必要欄位驗證、套用高雄篩選並去重後的官方買賣 record 數。
2. `districtTransactionCounts`：同一批已接受 record 依行政區分組後的件數。

「成交件數」代表公開登錄資料中的有效 record；如果官方 schema 對一案件有拆分規則，會以官方 record ID 與該批說明優先處理，不將 CSV 單純列數宣稱為成交件數。

本階段不發布平均房價或中位數單價。未來如納入價格指標，將明確揭露交易標的、車位與特殊交易處理、樣本條件、資料期間與統計方法；不會將所有單價做簡單平均後稱為「高雄房價」。

## Historical Baseline 與 Comparable Period Rule（Phase 2C-4）

每一個正式歷史 period 只保存正規化後的件數、行政區件數、品質摘要與來源 metadata；不把 1,000+ 筆 raw CSV 複製到 public JSON。歷史序列位於 `public/data/market-radar/live/moi-real-price-history.json`，僅會由通過 Quality Gate 的正式官方檔案產製。

比較會從本期之前，按資料期間最近到最遠尋找第一個可比較 period，不使用單純陣列倒數第二筆。兩期必須同時符合：相同 `sourceId`、高雄市範圍、買賣案件類型、`methodologyVersion`、`schemaVersion`，且兩期品質摘要皆有有效資料與行政區覆蓋。

- 天數相同：`raw-count`，比較原始有效登錄件數。
- 天數不同：`daily-normalized`，比較日均登錄件數；Drawer 同時保留兩期原始件數與天數。
- 任一條件不符：`unavailable`，不產生趨勢。
- 日均或原始件數變動絕對值小於 3%：`flat`；大於等於 +3% 為 `up`，小於等於 -3% 為 `down`。3% 是 Market Radar 產品規則，不是官方定義。
- 同天數且品質完整：高信心；天數不同但可日均標準化：中信心；品質或方法不一致：低信心／不可比較。

行政區比較沿用同一個 raw-count／daily-normalized 方法。前期為零而本期有紀錄時，標示「前期無有效登錄基準」／`newActivity`，不計算無限大百分比。

不同批次資料期間長度可能不同；若長度不同，Market Radar 以日均登錄件數進行標準化比較。成交件數仍是已揭露登錄樣本，不能單獨宣稱買氣、房價或未來漲跌。

## 特殊交易與限制

現階段不額外依自由文字備註排除特殊交易，品質報告會標記 `excludedSpecialTransactions: false`。官方揭露資料的既有篩選、申報及發布節奏，以官方說明為準。實價登錄有申報與發布時間差，並非即時成交行情；行政區件數反映已揭露登錄樣本量，不等同即時買氣。

## 時間欄位

- `report.updatedAt`：Market Radar 頁面更新時間。
- `source.publishedAt`：官方資料／報告發布時間。
- `source.dataPeriodStart`、`source.dataPeriodEnd`：實際統計期間。
- `source.retrievedAt`：本機取得原始檔時間。
- `source.verifiedAt`：Market Radar 驗證／產製時間。

這些欄位不可互相替代。

## 輸出與品質報告

原始檔永遠不修改。成功匯入後產生：

- `data/market-radar/processed/moi-real-price-normalized.json`
- `data/market-radar/processed/moi-real-price-quality.json`
- `public/data/market-radar/live/moi-real-price-latest.json`

品質報告包含 raw／accepted／rejected／duplicate rows、行政區數、日期／價格／行政區缺漏計數與警語。Live JSON 缺失或驗證失敗時，靜態頁面仍以 Fixture 正常建置，Live 區塊明確顯示「資料更新中」。

Live JSON 只有在 Quality Gate 通過後才會產製。Gate 必須同時確認：接受列數大於零、行政區數大於零、行政區非全數缺漏、資料期間有效，且官方發布／取得／驗證時間皆可解析。若 Gate 失敗，仍會留下品質報告，但不覆蓋 Live JSON。

## Live 與 Fixture 並存

完整 Fixture Report 仍位於 `public/data/market-radar/2026-08-29.json`，並持續標示 Mock Data。首個 Live slice 只覆蓋「區域成交件數比較」：Live JSON 存在且通過驗證時顯示「官方資料 · LIVE」與來源 metadata；其餘頁面內容仍可為 Mock，不會假裝整頁已變成即時資料。

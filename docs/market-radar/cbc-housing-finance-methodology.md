# CBC 房貸與購屋貸款資料方法說明（Phase 2C-1）

## 官方資料來源

- 資料名稱：五大銀行新承做放款金額與利率統計表
- 來源：中央銀行
- 資料頻率：月
- 優先級：Tier 1／Official／Primary Source
- 來源頁：https://www.cbc.gov.tw/tw/cp-302-192747-5edf4-1.html

目前匯入的官方附件為 115 年 7 月資料，中央銀行於 2026-08-21 發布。原始 XLSX 保留在被 Git 忽略的 `data/market-radar/raw/cbc/`，不會修改、提交或以新聞／第三方資料替代。

## 指標

1. `mortgageRate`：五大銀行新承做「購屋貸款」利率。數值保留為官方年息百分比率，例如 `2.290` 代表 `2.290%`，不轉成小數比例。
2. `newMortgageAmount`：五大銀行新承做「購屋貸款」金額。數值保留為官方單位「新台幣百萬元」，例如 `69109` 代表 69,109 百萬元；不默默轉換為元。

## 日期處理

官方月資料可能使用民國年月、民國年空白月、西元年月或中文年月。匯入器會將它正規化為 `YYYY-MM`，並建立該月的 `dataPeriodStart` 與 `dataPeriodEnd`。月份不是某一日成交資料；2026-07 對應 2026-07-01 至 2026-07-31。

來源發布日、資料期間、取得時間、驗證時間分開保存，不能互相替代。

## 匯入方式

```powershell
node scripts/market-radar/import-cbc-housing-finance.mjs "<官方 XLSX 路徑>" `
  --source-published-at "<中央銀行發布 ISO 時間>"
```

匯入器直接解析 XLSX worksheet 的購屋貸款金額與利率欄位，驗證月份、利率與金額，依統計月份去重，並產生：

- `data/market-radar/processed/cbc-housing-finance-normalized.json`
- `data/market-radar/processed/cbc-housing-finance-quality.json`
- `public/data/market-radar/live/cbc-housing-finance-latest.json`

## 缺值、品質與歷史

空白與無效利率／金額會拒收並寫入品質報告；同一統計月份重複時只保留第一筆有效官方列，並記錄 duplicate 計數。Live JSON 提供最新期與最近 12 個月 history。若 Live JSON 缺失或不合格，頁面顯示「房貸資料更新中」，不以 Fixture 假冒中央銀行資料。

## 解讀規則

- 利率期別變動使用**百分點**，例如 2.299% 至 2.290% 為 -0.009 個百分點，不寫為相對百分比。
- 利率反映近期購屋融資成本環境；單月變化不單獨推導房價漲跌或市場多空。
- Finance Signal 的分析是固定、可追溯模板，不使用 LLM。
- CBC numeric facts 不得被 LLM 補值、插值、修改或猜測；Fact 與 Analysis 必須分離，並各自保有 source／fact ID。

## 已知限制

五大銀行資料為全國性購屋貸款月統計，並非高雄專屬，也非即時房貸報價。它應與 MOI 高雄實價登錄等其他來源分開呈現；Phase 2C-1 不會自動混入今日一句或其他 Mock 區塊。

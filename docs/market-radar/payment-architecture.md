# E.X MARKET RADAR Payment Architecture

## MVP boundary

目前 `/market-radar/` 僅展示 UI、Mock Data 與 Free / Pro 分層；不含登入、訂單、付款、授權或實際檔案下載。

## 正式產品方案

### FREE

- Market Radar 免費內容持續瀏覽。
- 每個自然季度提供 1 次完整報告免費下載。
- 1 個 Free Full Report Credit = 同一期的 PNG 快報 + PDF 完整報告。
- 額度不累積：Q3 未使用，不會帶入 Q4。
- 自然季度：Q1 1/1–3/31、Q2 4/1–6/30、Q3 7/1–9/30、Q4 10/1–12/31。

### PRO MONTHLY

- NT$40 / 月。
- 30 天有效。
- 訂閱期間可無限下載所有目前開放的 Pro 報告、PNG、PDF、專業圖表、完整分析與歷史報告。

### PRO ANNUAL

- NT$360 / 年。
- 365 天有效。
- 訂閱期間可無限下載所有目前開放的 Pro 報告、PNG、PDF、專業圖表、完整分析與歷史報告。
- 平均 NT$30 / 月。

## Future architecture

```text
Payment Provider
  ↓ webhook
Cloudflare Worker
  ↓ entitlement record
D1 / KV
  ↓ signed download token
Cloudflare R2
```

## Access model proposal

未來下載條件：

```text
hasFreeQuarterlyCredit
OR hasActiveMonthlySubscription
OR hasActiveAnnualSubscription
```

- Pro 有效期間下載不消耗免費季度 credit。
- `hasFreeQuarterlyCredit` 代表當季使用次數小於 1。
- 免費 credit 的消耗單位是完整報告 bundle，不是單一檔案；PNG 與 PDF 不分別扣點。

## Future account and quarterly usage

季度免費額度需要可識別的使用者，未來至少採用 `userId`、verified email 或 LINE identity 其中一種。

```text
User
Subscription
QuarterlyDownloadUsage
Report
```

`QuarterlyDownloadUsage` 建議欄位：

```text
userId
quarter
reportId
usedAt
```

每一個 `userId + quarter` 最多保留一筆免費 credit 使用紀錄；新季度開始時，額度依當期規則重新提供，不做累積。

## Download token policy proposal

免費與 Pro 下載都不直接公開永久 R2 URL：

```text
Access Check
  ↓
Cloudflare Worker
  ↓
Download Token
  ↓
Temporary Download URL
```

- 免費與 Pro 的 token 建議均為 24 小時有效。
- token 最多 3 次實際檔案請求，處理網路失敗或手機重新下載。
- 3 次請求不是 3 個免費 credit；免費額度仍只消耗 1 個完整報告 credit。

## Report format plan

- Report Card → PNG
- Complete article → PDF
- Market data → `/data/market-radar/YYYY-MM-DD.json`

未來資料流程可由 JSON render，再依相同資料來源產出 PNG / PDF；MVP 不會建立自動化、支付或檔案服務。

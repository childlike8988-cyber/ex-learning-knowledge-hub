# E.X MARKET RADAR Payment Architecture

## MVP boundary

目前 `/market-radar/` 僅展示 UI、Mock Data 與 Free / Pro 分層；不含登入、訂單、付款、授權或實際檔案下載。

## 產品方案

- 單次下載：NT$30，僅解鎖該期報告。
- 年度訂閱：NT$360，365 天內可無限下載 Market Radar Pro 報告、PNG、PDF、專業圖表與歷史報告。
- 年度換算：平均 NT$30 / 月。

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

## Download policy proposal

- 單次：下載連結 24 小時有效，最多 3 次。
- 年訂閱：365 天有效，依有效會員資格發出下載連結。
- 權限條件：`hasPurchasedCurrentReport || hasActiveAnnualSubscription`。

## Report format plan

- Report Card → PNG
- Complete article → PDF
- Market data → `/data/market-radar/YYYY-MM-DD.json`

未來資料流程可由 JSON render，再依相同資料來源產出 PNG / PDF；MVP 不會建立自動化、支付或檔案服務。

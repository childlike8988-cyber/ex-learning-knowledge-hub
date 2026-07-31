# Decisions

- 使用 Next.js App Router，並以 `output: "export"` 產出 GitHub Pages 可部署的 `out/`。
- 第一階段不使用資料庫、登入、會員或付款服務。
- 首頁採深色玻璃擬態，但降低動畫以優先閱讀與行動裝置可用性。
- 生活管理使用靜態前端資料與暫存互動狀態；既有 `/health` 與新增 `/health-management` 以 client-side 相容導向保留舊連結，因 GitHub Pages 靜態輸出不提供伺服器端 redirect。

# Progress

## 2026-07-28

- 已建立 Next.js + TypeScript + Tailwind CSS + App Router 的靜態輸出骨架。
- 已完成首頁、七個分類入口、Seedance 示範文章與 GitHub Pages workflow。
- 驗證狀態：`npm install`、`npm run typecheck`、`npm run lint`、`npm run build` 全部通過；靜態產物已輸出至 `out/`。
- GitHub Pages 發布前檢查：已確認 workflow 的權限、artifact 與部署步驟；已設定 Actions 建置時自動處理 project Pages 子路徑。Next.js 已升級至 15.5.22 修補版本，並重新通過 typecheck、lint、13 頁靜態 build 與 project Pages 子路徑 build。Git repository 尚未初始化，等待建立遠端 repository 後才能 commit 與 push。

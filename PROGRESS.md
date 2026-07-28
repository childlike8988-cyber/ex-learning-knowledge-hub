# Progress

## 2026-07-28

- 已建立 Next.js + TypeScript + Tailwind CSS + App Router 的靜態輸出骨架。
- 已完成首頁、七個分類入口、Seedance 示範文章與 GitHub Pages workflow。
- 驗證狀態：`npm install`、`npm run typecheck`、`npm run lint`、`npm run build` 全部通過；靜態產物已輸出至 `out/`。
- GitHub Pages 發布前檢查：已確認 workflow 的權限、artifact 與部署步驟；已設定 Actions 建置時自動處理 project Pages 子路徑。Next.js 已升級至 15.5.22 修補版本，並重新通過 typecheck、lint、13 頁靜態 build 與 project Pages 子路徑 build。
- Git 初始化與首次提交：已建立 `main`、設定 `origin` 為 `https://github.com/childlike8988-cyber/ex-learning-knowledge-hub.git`，並建立首次靜態網站提交；等待推送後確認 GitHub Actions 與 Pages 部署結果。
- Seedance 2.0 正式教學：已接入 5 頁中英對照 PDF、完整英文 Prompt、五段分鏡、建議設定與成片檢查清單；PDF 與下載按鈕使用 GitHub Pages basePath 相容路徑。
- 驗證完成：PDF 已輸出至 `out/pdf/Seedance2.0-真人動漫分身教學.pdf`（15,605,567 bytes），且 GitHub Pages 子路徑 build 已確認文章連結正確。
- Learning Apps：已將股票、英文與日文互動學習工具接入首頁與三個分類入口頁，所有外部網址由集中式資料設定管理並以新分頁開啟。
- Learning Apps 視覺強化：已新增 STK、ENG、JP 本機預覽圖，首頁整卡與分類頁 CTA 均具明確可點擊、hover、focus 與新分頁提示。

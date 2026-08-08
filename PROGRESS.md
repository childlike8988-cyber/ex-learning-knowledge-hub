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
- 首頁 Hero 重整：Learning Apps 已上移至探索分類之前；新增 Glass Showcase 輪播導覽，提供 STK、ENG、JP 與 Seedance 教學的可點擊重點入口。
- 生活管理 v1.0：已取代原生活健康入口，建立成果展示、三級運動、居家與每週運動、情緒、早餐、合作與安全提示的純前端模組；已接入使用者提供的 YUNI 動作、週運動與早餐示意資產。
- 驗證：`typecheck`、`lint`、4 項 Node 測試與 GitHub Pages production build 均通過；新增 `/life-management`，並輸出 `/health` 與 `/health-management` 相容導向頁。
- 首頁 Creator Studio Hero：已改為深藍紫霓光、玻璃擬態的 AI 創作平台入口，新增 `E.X CREATOR STUDIO` 品牌列、桌機導覽與手機漢堡選單、創作工作室抽象主視覺、搜尋框與快速分類字串；Learning Apps 仍為 Hero 後的第一主區塊。
- 響應式驗收：已在 320、375、414、480、768、1024、1440 與 1920px 實際檢查 Hero，無水平溢出；手機選單、內部導航與既有外部 Learning Apps 連結可用，Console 無 error 或 warning。
- E.X Creator Studio Design System v1：已建立品牌方向、Deep Space Navy／Cyber Cyan／Aurora Purple 色彩 token、玻璃材質、動效、產品路徑與元件契約文件。
- Creator Studio 產品化升級：Hero 接入本機 AI 創作工作室攝影資產與 Interactive Glass Navigator；Learning Apps 更名為 E.X AI App Ecosystem，新增 Seedance Lab、Voice Studio 等未來入口；探索分類升級為 Creator Categories 圖片卡；新增訪客／會員／Creator Pass 的靜態產品入口。
- 本階段限制：登入、會員資料、點數計算、訂閱付款、AI Production Center 與 AI API 均維持未連接狀態。
- 首頁 Creator Studio Hero：已改為深藍紫霓光、玻璃擬態的 AI 創作平台入口，新增 `E.X CREATOR STUDIO` 品牌列、桌機導覽與手機漢堡選單、創作工作室抽象主視覺、搜尋框與快速分類字串；Learning Apps 仍為 Hero 後的第一主區塊。
- 響應式驗收：已在 320、375、414、480、768、1024、1440 與 1920px 實際檢查 Hero，無水平溢出；手機選單、內部導航與既有外部 Learning Apps 連結可用，Console 無 error 或 warning。

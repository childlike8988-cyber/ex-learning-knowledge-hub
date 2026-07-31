# Changelog

## Unreleased - 2026-07-31

- 首頁 Hero 升級為 E.X Creator Studio 視覺：深藍紫霓光、玻璃擬態、抽象創作工作室主視覺與低調 CSS 動態。
- 新增 Creator Studio 品牌列；桌機提供探索、課程、資源、關於導覽，手機提供可鍵盤操作的漢堡選單。
- 首頁 Hero 新增 AI CREATIVE CENTER × CREATOR ACADEMY、小標、搜尋框與快速分類字串；Learning Apps 保持為第一個後續主區塊。
- 完成 320px 至 1920px 的本機響應式驗收、外部連結安全屬性檢查與 Console 檢查。

## 0.1.0 - 2026-07-28

- 建立 E.X Learning & Knowledge Hub 靜態網站骨架。
- 新增首頁、分類頁、Seedance 示範教學與 GitHub Pages workflow。
- 完成 npm 安裝、型別檢查、lint 與靜態 production build 驗證。
- GitHub Pages 建置新增 project Pages 子路徑的自動 basePath 與 assetPrefix 支援。
- 升級 Next.js 與 eslint-config-next 至 15.5.22，並排除 lint 對 `.next`、`out` 等建置產物的掃描。
- 初始化 Git、建立 `main` 與 GitHub origin，並建立 v0.1 靜態網站首次提交。
- 將 Seedance 2.0 示範頁升級為正式教學，新增完整英文 Prompt、分鏡、設定、檢查清單與 GitHub Pages 相容的 PDF 下載。
- 新增共用 public asset path helper，確保 PDF 下載在 project Pages 子路徑下可用。
- 新增 Learning Apps 集中資料與外部連結入口，接入 STK、ENG、JP 三個互動式學習網站。
- 新增三張本機 Learning Apps 預覽圖，強化首頁入口卡與分類頁 CTA 的可點擊辨識度。
- 首頁新增 Glass Showcase 自動輪播導覽與輕量科技感動態，並調整 Learning Apps 為 Hero 後的第一主要區塊。
- 健康入口升級為生活管理 v1.0，新增純前端運動、情緒、早餐、成果展示與安全提醒模組。
- 新增生活管理資料與元件契約測試；靜態相容導向保留 `/health` 與 `/health-management` 舊路徑。
- 接入使用者提供的 YUNI 居家動作、週運動與早餐示意圖資；早餐示意保留品牌授權確認提醒。

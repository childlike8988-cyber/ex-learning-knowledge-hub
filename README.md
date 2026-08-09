# E.X Learning & Knowledge Hub

公開知識與互動學習入口網站的第一階段靜態骨架。

## 技術

Next.js、TypeScript、Tailwind CSS、App Router、靜態輸出與 GitHub Pages Actions。

## 開發

```powershell
npm.cmd install
npm.cmd run dev
```

## 驗證與建置

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run build
```

`npm.cmd run build` 會產生 `out/`，由 `.github/workflows/deploy.yml` 發佈至 GitHub Pages。推送前請在 GitHub repository 設定中將 Pages source 設為 GitHub Actions。GitHub Actions 建置時會自動識別 project Pages 的 repository 子路徑；若 repository 名稱為 `<帳號>.github.io`，則維持根網域路徑。

## E.X Realty Data Tools Integration

- Public Demo deployed: [E.X Realty Operations Hub](https://childlike8988-cyber.github.io/E.X-Realty-Operations-Hub/)
- Integration completed: E.X AI App Ecosystem 的外部展示入口，提供實價登錄查詢（展示版）與房市行情分析流程。
- Future roadmap: 正式政府資料來源、學區地圖、AI 房市分析與 Property Intelligence。

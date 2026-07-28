# Architecture

- `src/app`：App Router 路由與頁面。
- `src/components`：可重用 UI 元件。
- `src/data`：靜態內容資料。
- `src/data/learning-apps.ts`：STK、ENG、JP 外部學習工具的集中式資料來源。
- `src/components/LearningAppCard.tsx` 與 `LearningAppPage.tsx`：可重用的外部學習工具入口介面。
- `src/components/HomeShowcase.tsx`：首頁 Hero 的重點入口輪播與手動導覽模組。
- `public/images/learning-apps/`：STK、ENG、JP 由專案管理、可隨 GitHub Pages 部署的預覽圖。
- `content`：未來可擴充的文章來源。
- `public`：公開靜態素材。
- `out`：建置後的 GitHub Pages 部署產物（不納入版本控制）。

# Architecture

- `src/app`：App Router 路由與頁面。
- `src/components`：可重用 UI 元件。
- `src/data`：靜態內容資料。
- `src/data/learning-apps.ts`：STK、ENG、JP 外部學習工具的集中式資料來源。
- `src/components/LearningAppCard.tsx` 與 `LearningAppPage.tsx`：可重用的外部學習工具入口介面。
- `src/components/CreatorStudioHero.tsx`：首頁 Creator Studio Hero，提供靜態相容的品牌內容、搜尋入口與 CSS 創作工作室主視覺。
- `src/components/Header.tsx`：全站品牌列與響應式主要導覽；桌機顯示水平導覽，手機以原生 `details` 選單維持無 JavaScript 可用性。
- `src/components/HomeShowcase.tsx`：可重用的重點入口輪播與手動導覽模組，保留供後續首頁內容編排使用。
- `src/data/lifeManagement.ts`：生活管理的靜態內容、型別與預期資產路徑。
- `src/components/LifeManagement*.tsx`：生活管理區段導覽、Hero、成果、運動、情緒、早餐與安全提示元件。
- `public/images/learning-apps/`：STK、ENG、JP 由專案管理、可隨 GitHub Pages 部署的預覽圖。
- `content`：未來可擴充的文章來源。
- `public`：公開靜態素材。
- `out`：建置後的 GitHub Pages 部署產物（不納入版本控制）。

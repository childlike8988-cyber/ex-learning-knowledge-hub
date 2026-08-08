# E.X Creator Studio Design System v1

## 1. Brand Direction

E.X Creator Studio is the入口 of an AI creative platform：

- **AI Creative Center**：將 AI 工具、影音製作與創作工作流放在同一個入口。
- **Creator Academy**：以公開教學、課程與資源，陪伴使用者從靈感到作品。
- **AI Tool Gateway**：先提供可立即使用的公開工具與學習入口，為未來會員、點數與訂閱留出產品層。

首頁第一眼應讓使用者理解：這是一個 AI 創作平台，可以學習 AI 工具、探索生產工具，並逐步進入更完整的 AI Production Center。

## 2. Visual Design System

### Color System

| Token | Value | Role |
| --- | --- | --- |
| `--ex-deep-space` | `#050b1f` | 頁面底色、沉浸式背景 |
| `--ex-space-navy` | `#07132c` | Hero、工作區層次 |
| `--ex-cyber-cyan` | `#67e8f9` | 主要互動、焦點、資訊高亮 |
| `--ex-aurora-purple` | `#a78bfa` | Premium 層、訂閱與 AI 產品化入口 |
| `--ex-premium-gold` | `#f6c66a` | 重點提示與創作者成就感 |

### Glass Material

- 半透明深色底，保留背景攝影與霓光的層次。
- `backdrop-filter: blur()` 建立工作室玻璃感；內容仍需有足夠對比。
- 微光邊框使用低透明度青藍或紫色，避免卡片變成厚重面板。
- 反射、掃光與陰影只作為狀態提示，不取代資訊層級。
- 圓角以 `0.7rem`、`1rem`、`1.6rem` 三級為主，維持一致節奏。

### Typography & Layout

- Hero 使用大字級、緊密行高與青藍／紫色漸層，建立品牌記憶點。
- 內文維持清楚的繁體中文行高；小標使用少量英文 uppercase 作為導航語彙。
- 最大內容寬度為 `82rem`，手機左右留白不低於 `1rem`。
- 主要 CTA 最小觸控高度為 `44px`；互動元件必須提供 `focus-visible`。

## 3. Motion Principles

- Hero 背景光、玻璃反射與 Navigator 漂浮採慢速、低振幅動態。
- Interactive Glass Navigator 每 5.2 秒自動換頁；hover、focus 時暫停。
- `prefers-reduced-motion: reduce` 時取消漂浮、掃光與輪播視覺動畫。
- 不使用遊戲化跳動、過度粒子或會搶過標題的動畫。

## 4. Product Experience

```text
訪客 → 免費內容 → 探索 AI 工具 → 登入 → 會員功能 → 點數／訂閱 → AI Production Center
```

本階段實作為前端產品化入口：

- 訪客可使用免費資源、公開教學與免費工具。
- 會員中心、點數、訂閱與 AI Production Center 以清楚的未來入口呈現。
- 不建立真實帳號、付款、點數扣除、資料庫或 AI API。

## 5. Component Contracts

- `CreatorStudioHero`：品牌主訊息、搜尋入口、攝影工作室主視覺。
- `InteractiveGlassNavigator`：Seedance Lab、Learning Hub、Creator System、Voice Studio 的可操作輪播。
- `LearningAppCard`：STK、ENG、JP 的外部工具入口，維持新分頁與安全 rel。
- `CreatorCategoryCard`：Creator Categories 的圖片、短碼、分類說明與站內連結。
- `MembershipPreview`：訪客、會員工作區、Creator Pass 的產品化狀態展示。

## 6. Accessibility & Static Constraints

- 使用 semantic heading、`aria-label`、`aria-live`、鍵盤可達焦點狀態。
- 所有圖片使用描述性 alt；背景氛圍圖不可承載唯一重要資訊。
- 所有站內圖片透過 `publicAssetPath`，相容 GitHub Pages repository 子路徑。
- 維持 Next.js App Router、TypeScript、Tailwind CSS 與 `output: "export"`。
- 本 Design System 不引入登入、資料庫、付款或外部資料寫入。

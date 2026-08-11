import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-resources.ts", import.meta.url), "utf8");
const componentSource = await readFile(new URL("../src/components/CreatorAcademyResources.tsx", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/page.tsx", import.meta.url), "utf8");
const libraryPageSource = await readFile(new URL("../src/app/creator-academy/resources/page.tsx", import.meta.url), "utf8");
const videoPreviewSource = await readFile(new URL("../src/components/CreatorVideoPreview.tsx", import.meta.url), "utf8");

test("creator resources keep YUNI source material indexed without public source-folder exposure", () => {
  for (const item of ["yuni/Image/基本A.png", "yuni/Image/基本B.png", "Array.from({ length: 20 }", "yuni/motion/", "yuni/錄影要素.png", "source-only"]) assert.match(dataSource, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("academy resource scaffolding is Chinese-first with no authentication", () => {
  assert.match(componentSource, /YUNI 創作工具箱/);
  assert.match(componentSource, /YUNI Creator Toolkit/);
  assert.match(pageSource, /CreatorAcademyResources/);
  assert.doesNotMatch(componentSource, /signIn|login|checkout|payment/i);
});

test("resources library uses public assets and muted inline video previews", () => {
  for (const item of ["publicImagePath", "publicVideoSources", "yuni/${id}.mp4", "AI 生圖提示詞庫", "Camera Motion Library"]) assert.match(`${dataSource}\n${libraryPageSource}`, new RegExp(item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(videoPreviewSource, /autoPlay muted loop playsInline/);
  assert.match(dataSource, /video\/webm/);
});

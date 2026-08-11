import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-learning-path.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/page.tsx", import.meta.url), "utf8");
const pathSource = await readFile(new URL("../src/components/CreatorLearningPath.tsx", import.meta.url), "utf8");
const cardSource = await readFile(new URL("../src/components/CreatorPathCard.tsx", import.meta.url), "utf8");

test("learning path presents Chinese-first stage labels with English subtitles", () => {
  for (const item of ["初階創作者", "Beginner Creator", "視覺創作者", "Visual Creator", "專業創作者", "AI Creator Pro"]) assert.match(dataSource, new RegExp(item));
  for (const item of ["YUNI AI 生圖基礎", "YUNI 基礎構圖法", "YUNI AI 影片運鏡入門", "YUNI 電影感運鏡基礎"]) assert.match(dataSource, new RegExp(item));
});

test("academy homepage renders the learning path and recommendation", () => {
  assert.match(pageSource, /CreatorLearningPath/);
  assert.match(pathSource, /學習路徑/);
  for (const item of ["開始這裡", "AI 生圖", "構圖", "AI 影片", "電影感運鏡"]) assert.match(dataSource, new RegExp(item));
});

test("path cards retain free links and static member-only Pro content", () => {
  assert.match(cardSource, /course\.href/);
  assert.match(cardSource, /會員專屬內容/);
  assert.doesNotMatch(cardSource, /signIn|login|checkout|payment/i);
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-learning-path.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/page.tsx", import.meta.url), "utf8");
const pathSource = await readFile(new URL("../src/components/CreatorLearningPath.tsx", import.meta.url), "utf8");
const cardSource = await readFile(new URL("../src/components/CreatorPathCard.tsx", import.meta.url), "utf8");

test("learning path defines Starter, Creator and Pro stages", () => {
  for (const item of ["Beginner Creator", "Visual Creator", "AI Creator Pro", "STARTER", "CREATOR", "PRO"]) {
    assert.match(dataSource, new RegExp(item));
  }

  for (const item of ["AI Director Masterclass", "Commercial Video Workflow", "Advanced Prompt Library"]) {
    assert.match(dataSource, new RegExp(item));
  }
});

test("academy homepage renders the learning path and recommendation", () => {
  assert.match(pageSource, /CreatorLearningPath/);
  assert.match(pathSource, /creatorRecommendedOrder/);
  assert.match(pathSource, /推薦學習順序/);

  for (const item of ["Start Here", "AI Image", "Composition", "AI Video", "Cinematic Motion"]) {
    assert.match(dataSource, new RegExp(item));
  }
});

test("path cards retain free links and a static member-only Pro state", () => {
  assert.match(cardSource, /course\.href/);
  assert.match(cardSource, /會員專屬內容/);
  assert.doesNotMatch(cardSource, /signIn|login|checkout|payment/i);
});

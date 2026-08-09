import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-academy.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/page.tsx", import.meta.url), "utf8");
const courseCardSource = await readFile(new URL("../src/components/CreatorAcademyCourseCard.tsx", import.meta.url), "utf8");

test("creator academy defines three categories and seven initial courses", () => {
  for (const category of ["ai-visual-creation", "photography-composition", "video-production"]) {
    assert.match(dataSource, new RegExp(`id: "${category}"`));
  }
  assert.equal((dataSource.match(/access: "(?:free|pro)"/g) ?? []).length, 7);
});

test("creator academy page composes category and course cards", () => {
  assert.match(pageSource, /CreatorAcademyCategoryCard/);
  assert.match(pageSource, /CreatorAcademyCourseCard/);
  assert.match(pageSource, /YUNI Creator Academy/);
});

test("pro courses expose a locked member-only state without login behavior", () => {
  assert.match(courseCardSource, /會員專屬內容/);
  assert.match(courseCardSource, /disabled/);
  assert.doesNotMatch(courseCardSource, /signIn|login|checkout|payment/);
});

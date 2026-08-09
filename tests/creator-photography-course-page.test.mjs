import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-courses.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/photography-composition/yuni-composition-basics/page.tsx", import.meta.url), "utf8");
const academySource = await readFile(new URL("../src/data/creator-academy.ts", import.meta.url), "utf8");
const exampleSource = await readFile(new URL("../src/components/CreatorPhotographyExampleCard.tsx", import.meta.url), "utf8");

test("photography course defines five composition methods and three YUNI studies", () => {
  for (const method of ["Rule of Thirds", "Center Composition", "Leading Lines", "Frame Within Frame", "Negative Space"]) assert.match(dataSource, new RegExp(method));
  for (const example of ["YUNI 咖啡廳人像", "YUNI 戶外旅行", "YUNI 商業形象照"]) assert.match(dataSource, new RegExp(example));
});

test("photography course renders structured analysis and a static Pro preview", () => {
  assert.match(exampleSource, /example\.analysis/);
  assert.match(dataSource, /Cinematic Composition Masterclass/);
  assert.match(pageSource, /course\.proSection/);
  assert.match(pageSource, /會員專屬內容/);
  assert.doesNotMatch(pageSource, /signIn|login|checkout|payment/i);
});

test("YUNI composition card links to the new static course route", () => {
  assert.match(academySource, /photography-composition\/yuni-composition-basics/);
});

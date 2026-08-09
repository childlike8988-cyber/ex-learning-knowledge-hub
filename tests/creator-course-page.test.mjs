import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-courses.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/ai-visual-creation/yuni-ai-image-basics/page.tsx", import.meta.url), "utf8");
const cardSource = await readFile(new URL("../src/components/CreatorAcademyCourseCard.tsx", import.meta.url), "utf8");

test("YUNI image basics course exposes extensible chapters and examples", () => {
  for (const contract of ["CreatorCourseDetail", "chapters:", "promptElements:", "examples:", "YUNI 室內生活照"]) assert.match(dataSource, new RegExp(contract));
});

test("course page contains six learning sections and a non-functional Pro preview", () => {
  for (const id of ["ai-image-basics", "yuni-character", "prompt-elements", "scene-control", "camera-language", "practice"]) assert.match(pageSource, new RegExp(id));
  assert.match(pageSource, /Creator Pass 會員解鎖/);
  assert.doesNotMatch(pageSource, /signIn|login|checkout|payment/i);
});

test("available free course card links to its course page", () => {
  assert.match(cardSource, /course\.href/);
  assert.match(cardSource, /查看課程/);
});

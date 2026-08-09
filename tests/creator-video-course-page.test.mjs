import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-courses.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/ai-visual-creation/yuni-ai-video-motion-basics/page.tsx", import.meta.url), "utf8");
const promptSource = await readFile(new URL("../src/components/CreatorPromptExample.tsx", import.meta.url), "utf8");
const academySource = await readFile(new URL("../src/data/creator-academy.ts", import.meta.url), "utf8");

test("video motion course provides four chapters, motion language and three YUNI cases", () => {
  for (const term of ["Push In", "Pull Out", "Orbit", "Tracking", "Pan / Tilt"]) assert.match(dataSource, new RegExp(term.replace("/", "\\/")));
  for (const example of ["室內生活影片", "旅行場景", "商業展示"]) assert.match(dataSource, new RegExp(example));
  assert.match(dataSource, /AI Director Motion Masterclass/);
});

test("prompt example supports the requested AI video tool labels", () => {
  for (const tool of ["KLING AI", "Seedance", "LumaFlow"]) assert.match(dataSource, new RegExp(tool));
  assert.match(promptSource, /example\.tools/);
});

test("video course page is linked from Creator Academy without login behavior", () => {
  assert.match(academySource, /yuni-ai-video-motion-basics/);
  assert.match(pageSource, /會員專屬內容/);
  assert.doesNotMatch(pageSource, /signIn|login|checkout|payment/i);
});

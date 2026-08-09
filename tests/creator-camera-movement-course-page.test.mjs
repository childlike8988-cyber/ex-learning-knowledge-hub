import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dataSource = await readFile(new URL("../src/data/creator-courses.ts", import.meta.url), "utf8");
const academySource = await readFile(new URL("../src/data/creator-academy.ts", import.meta.url), "utf8");
const pageSource = await readFile(new URL("../src/app/creator-academy/video-production/yuni-camera-movement-basics/page.tsx", import.meta.url), "utf8");

test("camera movement course defines six motion techniques and three YUNI cases", () => {
  for (const term of ["Push In", "Pull Out", "Pan", "Tilt", "Tracking Shot", "Orbit Shot"]) assert.match(dataSource, new RegExp(term));
  for (const example of ["YUNI 日常生活", "YUNI 旅行影片", "YUNI 商業展示"]) assert.match(dataSource, new RegExp(example));
  assert.match(dataSource, /Creator Film Director Masterclass/);
});

test("camera movement page includes six AI motion prompt elements and static Pro preview", () => {
  for (const element of ["Subject", "Action", "Camera Movement", "Environment", "Lighting", "Duration"]) assert.match(dataSource, new RegExp(element));
  assert.match(pageSource, /course\.examples/);
  assert.match(pageSource, /會員專屬內容/);
  assert.doesNotMatch(pageSource, /signIn|login|checkout|payment/i);
});

test("video production card links to cinematic camera movement route", () => {
  assert.match(academySource, /video-production\/yuni-camera-movement-basics/);
});

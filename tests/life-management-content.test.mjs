import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const data = readFileSync("src/data/lifeManagement.ts", "utf8");
const page = readFileSync("src/components/LifeManagementPage.tsx", "utf8");
const safety = readFileSync("src/components/LifeManagementSafetyNotice.tsx", "utf8");
const nav = readFileSync("src/components/LifeManagementNav.tsx", "utf8");
const levels = readFileSync("src/components/ExerciseLevelSelector.tsx", "utf8");

test("life management data includes three exercise levels and four home movements", () => {
  assert.match(data, /Level 1｜基礎維持/);
  assert.match(data, /Level 2｜穩定進階/);
  assert.match(data, /Level 3｜強化塑形/);
  assert.match(data, /跨下提膝/);
  assert.match(data, /墊腳回春術/);
});

test("life management page composes all required front-end sections", () => {
  for (const component of ["ResultsShowcase", "ExerciseLevelSelector", "HomeExerciseLibrary", "WeeklyExerciseOptions", "EmotionalStateCards", "BreakfastManagement", "LifeManagementSafetyNotice"]) assert.match(page, new RegExp(component));
});

test("safety notice avoids treatment or guaranteed-result claims", () => {
  assert.match(safety, /不能取代醫師/);
  assert.match(safety, /不保證特定減重/);
});

test("responsive navigation and level selector retain mobile and desktop contracts", () => {
  assert.match(nav, /overflow-x-auto/);
  assert.match(levels, /aria-selected/);
  assert.match(levels, /sm:grid-cols-2/);
});

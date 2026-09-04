import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const masterDomain = "https://excreatorstudio.com/";

test("Learning Hub public brand links and metadata use the E.X master domain", () => {
  const header = read("src/components/Header.tsx");
  const layout = read("src/app/layout.tsx");

  assert.match(header, new RegExp(`EX_CREATOR_STUDIO_URL = "${masterDomain}"`));
  assert.match(header, /aria-label="前往 E\.X 主站"/);
  assert.match(layout, /metadataBase: new URL\("https:\/\/excreatorstudio\.com\/"\)/);
  assert.match(layout, /canonical: "\/"/);
  assert.match(layout, /openGraph: \{ url: "\/" \}/);
});

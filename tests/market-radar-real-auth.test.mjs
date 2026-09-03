import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const typescript = require("typescript");
const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

async function loadPureTypeScriptModule(path) {
  const source = await read(path);
  const output = typescript.transpileModule(source, { compilerOptions: { target: typescript.ScriptTarget.ES2022, module: typescript.ModuleKind.CommonJS } }).outputText;
  const runtimeModule = { exports: {} };
  new Function("exports", "module", output)(runtimeModule.exports, runtimeModule);
  return runtimeModule.exports;
}

const packageJson = JSON.parse(await read("package.json"));
const types = await read("src/lib/market-radar/auth/types.ts");
const client = await read("src/lib/market-radar/auth/supabaseClient.ts");
const callbackUrlSource = await read("src/lib/market-radar/auth/callbackUrl.ts");
const callbackUrl = await loadPureTypeScriptModule("src/lib/market-radar/auth/callbackUrl.ts");
const adapter = await read("src/lib/market-radar/auth/supabaseAdapter.ts");
const authHook = await read("src/lib/market-radar/auth/useMarketRadarAuth.ts");
const download = await read("src/components/MarketRadarDownloadSection.tsx");
const dialog = await read("src/components/MarketRadarLoginRequiredDialog.tsx");
const callback = await read("src/components/MarketRadarAuthCallback.tsx");
const callbackRoute = await read("src/app/market-radar/auth/callback/page.tsx");
const mock = await read("src/lib/market-radar/auth/mock.ts");
const envExample = await read(".env.example");
const documentation = await read("docs/market-radar/real-auth-vertical-slice.md");
const gitignore = await read(".gitignore");

test("Supabase browser SDK is a production dependency without a provider SDK sprawl", () => {
  assert.ok(packageJson.dependencies["@supabase/supabase-js"]);
  assert.equal(packageJson.dependencies.firebase, undefined);
  assert.equal(packageJson.dependencies.clerk, undefined);
  assert.equal(packageJson.dependencies.auth0, undefined);
});

test("public environment contract permits only URL plus public Supabase browser keys", () => {
  for (const term of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) assert.match(`${envExample}\n${client}`, new RegExp(term));
  assert.match(envExample, /Never add service_role keys, database passwords, OAuth client secrets/);
  assert.doesNotMatch(client, /process\.env\.(?:SUPABASE_SERVICE|DATABASE_URL|SUPABASE_DB_PASSWORD)/i);
  assert.match(gitignore, /\.env\.\*/);
});

test("production client is browser-only, config-gated and uses a static callback path", () => {
  for (const term of ["typeof window === \"undefined\"", "isSupabaseAuthConfigured", "persistSession", "detectSessionInUrl", "flowType: \"pkce\"", "/market-radar/auth/callback/", "NEXT_PUBLIC_BASE_PATH"]) assert.match(`${client}\n${callbackUrlSource}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(client, /api\/|server action|cookies|headers/i);
});

test("callback construction always uses the initiating browser origin with a trailing slash", () => {
  assert.equal(callbackUrl.buildMarketRadarAuthCallbackUrl("http://localhost:3000"), "http://localhost:3000/market-radar/auth/callback/");
  assert.equal(callbackUrl.buildMarketRadarAuthCallbackUrl("https://excreatorstudio.github.io/"), "https://excreatorstudio.github.io/market-radar/auth/callback/");
  assert.equal(callbackUrl.buildMarketRadarAuthCallbackUrl("https://legacy.example", "/ex-learning-knowledge-hub/"), "https://legacy.example/ex-learning-knowledge-hub/market-radar/auth/callback/");
  assert.doesNotMatch(callbackUrlSource, /excreatorstudio\.github\.io/);
});

test("adapter maps Supabase users into provider-neutral IdentityUser and Free account state", () => {
  for (const term of ["IdentityUser", "mapSupabaseUserToIdentityUser", "provider: \"supabase\"", "plan: session.authenticated ? \"free\" : \"guest\"", "Membership is intentionally not read from the browser"]) assert.match(`${types}\n${adapter}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(adapter, /membership.*localStorage|plan.*localStorage/i);
});

test("Google OAuth and six-digit email OTP are real SDK paths rather than mock success", () => {
  for (const term of ["signInWithOAuth", "provider: \"google\"", "signInWithOtp", "verifyOtp", "type: \"email\"", "6 位數驗證碼"]) assert.match(`${adapter}\n${dialog}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(dialog, /maxLength=\{6\}/);
  assert.doesNotMatch(adapter, /createLocalMockAccount|local-mock/);
});

test("session restore owns loading before Guest and fails closed when Auth is unavailable", () => {
  for (const term of ["MarketRadarAuthStatus", "setStatus(\"loading\")", "getAccountState", "subscribeToSupabaseAuthChanges", "setStatus(\"unavailable\")", "公開 Market Radar 內容仍可瀏覽"]) assert.match(`${types}\n${authHook}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(download, /Session restore 完成前不會顯示訪客下載 CTA/);
  assert.match(download, /isLoading \? "正在確認…"/);
});

test("account UI supplies guest, authenticated Free identity and logout while preserving mock preview overrides", () => {
  for (const term of ["訪客狀態", "Free（會員權益尚未持久化）", "登出", "auth.signOut", "accountOverride", "creditOverride"]) assert.match(download, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(mock, /DEMO \/ LOCAL AUTH STATE/);
  assert.match(mock, /本機 preview 不會建立正式登入或 session/);
  assert.match(download, /useMarketRadarAuth\(\{ enabled: !accountOverride \}\)/);
});

test("login dialog retains accessible dialog behavior and never claims an export is authorized", () => {
  for (const term of ['role="dialog"', 'aria-modal="true"', "previousFocusRef", "Escape", "使用 Google 登入", "寄送 6 位數驗證碼", "季度額度與下載授權尚未接入"]) assert.match(dialog, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(dialog, /href=.*exports|download=/i);
});

test("callback route is static/noindex, exchanges each code once and cleans URL state", () => {
  assert.match(callbackRoute, /index: false/);
  for (const term of ["exchangeCodeForSession", "getSession", "getMarketRadarHomePath", "window.location.replace", "processedRef", "window.history.replaceState", "重新登入"]) assert.match(callback, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(`${callbackRoute}\n${callback}`, /cookies|headers|server action|route\.ts/i);
});

test("documentation preserves static security and deferred product boundaries", () => {
  for (const term of ["GitHub Pages", "Google", "Email OTP", "loading", "Free", "service-role", "NOT_IMPLEMENTED / REQUIRES_BACKEND", "protected", "payment", "Storage"]) assert.match(documentation, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.doesNotMatch(documentation, /service_role\s*=|SUPABASE_SERVICE_ROLE_KEY\s*=/i);
});

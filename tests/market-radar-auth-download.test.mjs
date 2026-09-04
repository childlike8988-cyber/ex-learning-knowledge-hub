import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
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

const quarter = await loadPureTypeScriptModule("src/lib/market-radar/auth/quarter.ts");
const entitlement = await loadPureTypeScriptModule("src/lib/market-radar/auth/entitlement.ts");
const membershipRepository = await loadPureTypeScriptModule("src/lib/market-radar/auth/membershipRepository.ts");
const authTypes = await read("src/lib/market-radar/auth/types.ts");
const entitlementSource = await read("src/lib/market-radar/auth/entitlement.ts");
const mockSource = await read("src/lib/market-radar/auth/mock.ts");
const availabilitySource = await read("src/lib/market-radar/auth/reportAvailability.ts");
const downloadSource = await read("src/components/MarketRadarDownloadSection.tsx");
const dialogSource = await read("src/components/MarketRadarLoginRequiredDialog.tsx");
const entitlementHookSource = await read("src/lib/market-radar/auth/useMarketRadarEntitlement.ts");
const membershipRepositorySource = await read("src/lib/market-radar/auth/membershipRepository.ts");
const productionRouteSource = await read("src/app/market-radar/page.tsx");
const productionWebReportSource = await read("src/lib/market-radar/report/buildMarketRadarProductionWebReport.ts");
const membershipMigration = await read("supabase/migrations/202609040001_market_radar_memberships_and_unlocks.sql");
const membershipAcceptance = await read("supabase/tests/market_radar_membership_acceptance.sql");
const persistenceDoc = await read("docs/market-radar/membership-quarterly-credit-persistence.md");
const previewSource = await read("src/components/MarketRadarAuthStatePreview.tsx");
const previewRoute = await read("src/app/market-radar/account-preview/page.tsx");
const foundationDoc = await read("docs/market-radar/auth-download-foundation.md");
const marketRadarTest = await read("tests/market-radar.test.mjs");
const aiLearningTest = await read("tests/ai-learning-station.test.mjs");
const packageJson = JSON.parse(await read("package.json"));
const fixture = JSON.parse(await read("public/data/market-radar/2026-08-29.json"));

const availableReport = { reportId: "market-radar-kaohsiung-2026-09-01", reportDate: "2026-09-01", quarterKey: "2026-Q3", isAvailable: true, availableFormats: ["share-bundle", "pdf"], status: "ready-for-backend" };
const availableCredit = { quarterKey: "2026-Q3", totalCredits: 1, usedCredits: 0, remainingCredits: 1, isMock: true };
const guest = { authenticated: false, plan: "guest", session: { authenticated: false, provider: "none", isMock: true } };
const free = { authenticated: true, plan: "free", session: { authenticated: true, provider: "local-mock", isMock: true } };
const pro = { authenticated: true, plan: "pro", session: { authenticated: true, provider: "local-mock", isMock: true } };

test("auth abstraction separates plans, session, provider adapter and future credit persistence", () => {
  for (const term of ["MembershipPlan", '"guest" | "free" | "pro"', "AuthUser", "AuthSession", "AccountState", "QuarterlyDownloadCreditState", "AuthProviderAdapter", "getSession", "signIn", "signOut", "getAccountState"]) assert.match(authTypes, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(mockSource, /DEMO \/ LOCAL AUTH STATE/);
  assert.doesNotMatch(mockSource, /localStorage|sessionStorage|accessToken|refreshToken/i);
});

test("calendar quarter helpers handle every boundary and year deterministically", () => {
  const cases = [[new Date(2026, 0, 1), "2026-Q1"], [new Date(2026, 2, 31), "2026-Q1"], [new Date(2026, 3, 1), "2026-Q2"], [new Date(2026, 5, 30), "2026-Q2"], [new Date(2026, 6, 1), "2026-Q3"], [new Date(2026, 8, 30), "2026-Q3"], [new Date(2026, 9, 1), "2026-Q4"], [new Date(2026, 11, 31), "2026-Q4"], [new Date(2027, 11, 31), "2027-Q4"]];
  for (const [date, expected] of cases) assert.equal(quarter.getQuarterKey(date), expected);
  assert.deepEqual(quarter.getQuarterBounds(new Date(2026, 8, 1)), { quarterKey: "2026-Q3", start: "2026-07-01", end: "2026-09-30" });
  assert.notEqual(quarter.getQuarterKey(new Date(2026, 11, 31)), quarter.getQuarterKey(new Date(2027, 11, 31)));
});

test("guest entitlement requires login without claiming report access", () => {
  const result = entitlement.evaluateMarketRadarDownloadEntitlement({ account: guest, report: availableReport, quarterState: availableCredit });
  assert.equal(result.status, "guest-login-required");
  assert.equal(result.requiresLogin, true);
  assert.equal(result.canAccessReport, false);
  assert.equal(result.ctaLabel, "本季免費下載完整報告");
});

test("Free entitlement makes a report-level quarterly unlock available", () => {
  const result = entitlement.evaluateMarketRadarDownloadEntitlement({ account: free, report: availableReport, quarterState: availableCredit });
  assert.equal(availableCredit.usedCredits, 0);
  assert.equal(availableCredit.remainingCredits, 1);
  assert.equal(result.status, "free-credit-available");
  assert.equal(result.canUnlockFreeReport, true);
  assert.equal(result.quarterlyCreditAvailable, true);
  assert.equal(result.canDownloadUnlimited, false);
  assert.equal(result.ctaLabel, "解鎖本期報告");
  assert.equal(availableReport.availableFormats.length, 2);
});

test("a Free same-report unlock keeps PNG bundle and PDF under one credit", () => {
  const result = entitlement.evaluateMarketRadarDownloadEntitlement({ account: free, report: availableReport, quarterState: { ...availableCredit, usedCredits: 1, remainingCredits: 0, unlockedReportId: availableReport.reportId, unlockedAt: "2026-09-01T08:30:00Z" } });
  assert.equal(result.status, "free-report-unlocked");
  assert.equal(result.canAccessReport, true);
  assert.equal(result.canUnlockFreeReport, false);
  assert.match(result.reason, /PNG 分享圖文與 PDF/);
});

test("a Free different-report unlock is exhausted without inventing additional credits", () => {
  const result = entitlement.evaluateMarketRadarDownloadEntitlement({ account: free, report: availableReport, quarterState: { ...availableCredit, usedCredits: 1, remainingCredits: 0, unlockedReportId: "another-report" } });
  assert.equal(result.status, "free-credit-exhausted");
  assert.equal(result.quarterlyCreditAvailable, false);
  assert.equal(result.canAccessReport, false);
  assert.equal(result.ctaLabel, "本季免費額度已使用");
});

test("Pro has unlimited prepared-report entitlement while unavailable reports remain blocked", () => {
  const proResult = entitlement.evaluateMarketRadarDownloadEntitlement({ account: pro, report: availableReport, quarterState: availableCredit });
  assert.equal(proResult.status, "pro-ready");
  assert.equal(proResult.canDownloadUnlimited, true);
  const unavailableResult = entitlement.evaluateMarketRadarDownloadEntitlement({ account: pro, report: { ...availableReport, isAvailable: false, status: "preparing" }, quarterState: availableCredit });
  assert.equal(unavailableResult.status, "download-unavailable");
  assert.equal(unavailableResult.canAccessReport, false);
});

test("download request stays a backend-required placeholder", () => {
  const result = entitlement.requestMarketRadarDownload({ reportId: availableReport.reportId, format: "all" });
  assert.deepEqual(result, { status: "NOT_IMPLEMENTED", errorCode: "REQUIRES_BACKEND", reportId: availableReport.reportId, format: "all", safeMessage: "正式下載需由未來的安全登入、權限與受保護檔案服務處理。" });
});

test("public availability is metadata-only and never exposes local export paths", () => {
  assert.match(availabilitySource, /metadata-only/);
  assert.doesNotMatch(availabilitySource, /data\/market-radar\/exports|exports\\|readFile|readdir|absolute path/i);
  assert.match(downloadSource, /getMarketRadarReportAvailability/);
  assert.doesNotMatch(downloadSource, /data\/market-radar\/exports|href=.*exports|window\.location.*exports/i);
});

test("download card supplies Guest, Free and Pro UX with a clear no-auth production default", () => {
  for (const term of ["guest-login-required", "free-credit-available", "free-report-unlocked", "free-credit-exhausted", "pro-ready", "download-unavailable", "本季免費下載完整報告", "解鎖本期報告", "本季免費額度已使用", "下載完整報告", "accountOverride", "已使用 ${credit.usedCredits} / ${credit.totalCredits}"])
    assert.match(`${downloadSource}\n${entitlementSource}`, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(downloadSource, /createLocalMockAccount\("guest"\)/);
  assert.match(downloadSource, /PNG 提供 1–3 張/);
});

test("login-required dialog manages focus, supports Escape and keeps file delivery deferred", () => {
  for (const term of ['role="dialog"', 'aria-modal="true"', "previousFocusRef", "Escape", "使用 Google 登入", "寄送 6 位數驗證碼", "稍後再說", "安全會員資料庫", "正式檔案傳輸仍未接入"])
    assert.match(dialogSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("membership schema provisions Free safely and derives report-level quarterly credit", () => {
  for (const term of [
    "create table if not exists public.memberships",
    "create table if not exists public.report_catalog",
    "create table if not exists public.report_unlocks",
    "references auth.users(id)",
    "foreign key (report_id, quarter_key)",
    "references public.report_catalog(report_id, quarter_key)",
    "market_radar_quarter_key(report_date)",
    "on conflict (user_id) do nothing",
  ]) assert.match(membershipMigration, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  assert.match(membershipMigration, /existing authoritative rows, including Pro, are untouched/i);
  assert.doesNotMatch(membershipMigration, /used_credits\s+(?:integer|smallint|bigint)|remaining_credits\s+(?:integer|smallint|bigint)/i);
});

test("RLS and grants prevent browser self-upgrade, catalog writes and direct unlock inserts", () => {
  for (const table of ["memberships", "report_catalog", "report_unlocks"]) assert.match(membershipMigration, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
  assert.match(membershipMigration, /memberships_select_own[\s\S]*user_id = auth\.uid\(\)/i);
  assert.match(membershipMigration, /report_unlocks_select_own[\s\S]*user_id = auth\.uid\(\)/i);
  assert.match(membershipMigration, /revoke insert, update, delete on public\.memberships from anon, authenticated/i);
  assert.match(membershipMigration, /revoke insert, update, delete on public\.report_unlocks from anon, authenticated/i);
  assert.doesNotMatch(membershipRepositorySource, /\.from\(["']memberships["']\)[\s\S]*\.(?:insert|update|delete)/i);
  assert.doesNotMatch(membershipRepositorySource, /\.from\(["']report_unlocks["']\)[\s\S]*\.insert/i);
});

test("atomic unlock RPC enforces one report and one Free unlock per quarter", () => {
  assert.match(membershipMigration, /unique \(user_id, report_id\)/i);
  assert.match(membershipMigration, /unique index[\s\S]*\(user_id, quarter_key\)[\s\S]*where unlock_type = 'free_quarterly'/i);
  assert.match(membershipMigration, /unlock_market_radar_report\(p_report_id text\)/i);
  assert.doesNotMatch(membershipMigration, /unlock_market_radar_report\([^)]*user_id/i);
  assert.match(membershipMigration, /v_user_id uuid := auth\.uid\(\)/i);
  assert.match(membershipMigration, /from public\.report_catalog where report_id = p_report_id and is_active = true/i);
  assert.match(membershipMigration, /security definer[\s\S]*set search_path = ''/i);
  assert.match(membershipMigration, /on conflict do nothing[\s\S]*returning true into v_inserted/i);
  assert.match(membershipAcceptance, /exactly one `unlocked`; the other is `credit_exhausted`/i);
});

test("membership adapter maps an active Free report with no prior unlock to available", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push([name, args]);
    if (name === "ensure_market_radar_membership") return { data: { effective_plan: "free", membership_status: "active", starts_at: "2026-09-01T00:00:00Z", ends_at: null }, error: null };
    if (name === "get_market_radar_entitlement") return { data: { status: "free_credit_available", report_id: availableReport.reportId, quarter_key: "2026-Q3", effective_plan: "free", membership_status: "active", starts_at: "2026-09-01T00:00:00Z", ends_at: null, total_credits: 1, used_credits: 0, remaining_credits: 1, unlocked_report_id: null, unlocked_at: null }, error: null };
    return { data: { status: "already_unlocked", report_id: availableReport.reportId, quarter_key: "2026-Q3", remaining_credit: 0, unlimited: false }, error: null };
  } };
  const provider = membershipRepository.createMarketRadarEntitlementProvider(client);
  assert.deepEqual(await provider.getEffectiveMembership(), { plan: "free", status: "active", startsAt: "2026-09-01T00:00:00Z" });
  const persisted = await provider.getQuarterlyEntitlement(availableReport.reportId);
  assert.equal(persisted.downloadState, "free-credit-available");
  assert.equal(persisted.membership?.plan, "free");
  assert.equal(persisted.credit?.remainingCredits, 1);
  assert.equal((await provider.unlockReport(availableReport.reportId)).status, "already-unlocked");
  assert.deepEqual(calls.map(([name]) => name), ["ensure_market_radar_membership", "get_market_radar_entitlement", "unlock_market_radar_report"]);
  assert.match(downloadSource, /useMarketRadarEntitlement/);
  assert.match(entitlementHookSource, /setStatus\("unavailable"\)/);
});

test("minimal inactive-report RPC response remains fail closed without inventing Free credit", async () => {
  const client = { rpc: async () => ({ data: { status: "download_unavailable", report_id: "market-radar-kaohsiung-2026-08-29" }, error: null }) };
  const provider = membershipRepository.createMarketRadarEntitlementProvider(client);
  const result = await provider.getQuarterlyEntitlement("market-radar-kaohsiung-2026-08-29");
  assert.deepEqual(result, { reportId: "market-radar-kaohsiung-2026-08-29", downloadState: "download-unavailable" });
  assert.match(downloadSource, /entitlementUnavailable/);
  assert.doesNotMatch(membershipRepositorySource, /effective_plan["']?\s*:\s*["']free["']/i);
});

test("RPC errors remain unavailable instead of falling back to a Free entitlement", async () => {
  const client = { rpc: async () => ({ data: null, error: { message: "denied" } }) };
  const provider = membershipRepository.createMarketRadarEntitlementProvider(client);
  await assert.rejects(() => provider.getQuarterlyEntitlement(availableReport.reportId), /ENTITLEMENT_UNAVAILABLE/);
  assert.match(entitlementHookSource, /setStatus\("unavailable"\)/);
});

test("public production route uses the active 2026-09-01 snapshot and never the inactive fixture", () => {
  assert.match(productionRouteSource, /buildMarketRadarProductionReportSnapshot/);
  assert.match(productionRouteSource, /buildMarketRadarProductionWebReport/);
  assert.doesNotMatch(productionRouteSource, /loadMarketRadarReport|2026-08-29/);
  assert.match(productionWebReportSource, /reportId: snapshot\.reportId/);
  assert.match(productionWebReportSource, /date: reportDateDisplay/);
  assert.doesNotMatch(productionWebReportSource, /2026-08-29|MOCK DATA/);
  assert.equal(fixture.downloadBundle.reportId, "market-radar-kaohsiung-2026-08-29");
  assert.match(membershipMigration, /values \('market-radar-kaohsiung-2026-08-29', date '2026-08-29', false\)/i);
});

test("current canonical report is cataloged inactive until publication approval", () => {
  assert.equal(fixture.downloadBundle.reportId, "market-radar-kaohsiung-2026-08-29");
  assert.match(membershipMigration, /values \('market-radar-kaohsiung-2026-08-29', date '2026-08-29', false\)/i);
  assert.match(persistenceDoc, /development fixture[\s\S]*is_active = false/i);
});

test("persistence documentation preserves payment, delivery and live-migration boundaries", () => {
  for (const term of ["DB_MIGRATION_MANUAL_REQUIRED", "SECURITY DEFINER", "auth.uid()", "credit_exhausted", "download-unavailable", "payment", "protected delivery"])
    assert.match(persistenceDoc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
});

test("noindex local preview covers all five prototype states and remains outside navigation", () => {
  for (const term of ["guest", "free", "free-unlocked", "free-used", "pro", "記憶體中的展示資料", "沒有登入、帳戶、權限或檔案下載"])
    assert.match(previewSource, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(previewRoute, /index: false/);
  assert.doesNotMatch(previewRoute, /cookies|headers|server action|fetch\(/i);
});

test("foundation docs preserve static, security, provider, payment and protected-download boundaries", () => {
  for (const term of ["GitHub Pages", "Guest", "Free", "Pro", "reportId", "NOT_IMPLEMENTED", "REQUIRES_BACKEND", "Supabase Auth", "Firebase Auth", "Clerk", "Auth0", "payment webhooks", "localStorage", "short-lived"])
    assert.match(foundationDoc, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("existing pricing, Market Radar and AI Learning regression suites remain included", () => {
  assert.equal(fixture.pricing.monthlyPrice, 40);
  assert.equal(fixture.pricing.annualPrice, 360);
  assert.equal(fixture.freePlan.downloadsPerQuarter, 1);
  assert.equal(fixture.freePlan.creditsCarryOver, false);
  assert.match(marketRadarTest, /每個自然季度|MarketRadar/);
  assert.match(aiLearningTest, /AI Learning Station/);
  assert.match(packageJson.scripts.test, /tests\/market-radar-auth-download\.test\.mjs/);
});

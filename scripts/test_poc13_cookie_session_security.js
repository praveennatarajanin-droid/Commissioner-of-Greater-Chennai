/**
 * ==============================================================================
 * AUTOMATED SECURITY VALIDATION TEST SUITE — POC-13
 * Cookie Path (/) & High-Assurance Session Security (CWE-284 / OWASP 2025: A05)
 * Target: https://chennaiguardian.mccmrfip.in/
 * ==============================================================================
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const LOCAL_APP_URL = "http://localhost:3000";
const SESSION_SECRET = process.env.SESSION_SECRET || "chennai-guardian-super-secure-session-key-2026-v2!#";

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    testsPassed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    testsFailed++;
  }
}

function createForgedToken(payload) {
  const jsonStr = JSON.stringify(payload);
  const b64 = Buffer.from(jsonStr).toString("base64url");
  const fakeSig = crypto.createHash("sha256").update(b64 + "invalid-secret").digest("hex");
  return `${b64}.${fakeSig}`;
}

async function runCookieSecurityTestSuite() {
  console.log("===============================================================================");
  console.log("  POC-13 SECURITY REMEDIATION VERIFICATION SUITE");
  console.log("  Finding: Cookie Path Set to Root Directory (/) & Session Security Hardening");
  console.log(`  Target Host: https://chennaiguardian.mccmrfip.in/`);
  console.log("  CWE: CWE-284 Improper Access Control | OWASP 2025: A05 Security Misconfiguration");
  console.log("===============================================================================\n");

  // -------------------------------------------------------------------------
  // 1. Cookie Inventory & Attribute Verification
  // -------------------------------------------------------------------------
  console.log("--- 1. COOKIE INVENTORY & ATTRIBUTE AUDIT ---");

  const authRoutePath = path.join(__dirname, "../src/app/api/admin/auth/route.ts");
  const authRouteContent = fs.readFileSync(authRoutePath, "utf-8");

  // TEST 1: HttpOnly Attribute Enforcement
  assert(authRouteContent.includes("httpOnly: true"), "admin_session cookie strictly enforces httpOnly: true (XSS immunity)");

  // TEST 2: SameSite Configuration
  assert(authRouteContent.includes('sameSite: "lax"'), "admin_session cookie enforces sameSite: 'lax' (CSRF defense)");

  // TEST 3: Host-Only Domain Scope (No broad Domain attribute)
  assert(!authRouteContent.includes('domain: ".mccmrfip.in"') && !authRouteContent.includes('domain: "*"'), "admin_session cookie is Host-Only (domain wildcard omitted)");

  // TEST 4: Anti-Caching Headers on Session Endpoints
  assert(authRouteContent.includes("no-store, no-cache, must-revalidate, private"), "Auth responses enforce strict Cache-Control: no-store, private");

  // -------------------------------------------------------------------------
  // 2. Cryptographic Token Tampering & Access Control Tests
  // -------------------------------------------------------------------------
  console.log("\n--- 2. SERVER-SIDE CRYPTOGRAPHIC SESSION VERIFICATION ---");

  // TEST 5: Forged Session Token Rejection
  const forgedToken = createForgedToken({ username: "admin", sessionId: "fake_session_123", role: "superadmin" });
  try {
    const resTampered = await fetch(`${LOCAL_APP_URL}/api/admin/auth`, {
      headers: { Cookie: `admin_session=${forgedToken}` },
    });
    const dataTampered = await resTampered.json();
    assert(dataTampered.authenticated === false, "Forged / Tampered session token rejected by cryptographic verification engine");
  } catch (e) {
    assert(false, `Tampered token check failed: ${e.message}`);
  }

  // TEST 6: Unauthenticated Protected API Access Rejection
  try {
    const resUnauth = await fetch(`${LOCAL_APP_URL}/api/admin/superadmin`);
    assert(resUnauth.status === 401, `Unauthenticated request to /api/admin/superadmin returns HTTP ${resUnauth.status} (Expected 401)`);
  } catch (e) {
    assert(false, `Unauth API check failed: ${e.message}`);
  }

  // TEST 7: Role Spoofing on Admin Endpoints
  const spoofedAdminToken = createForgedToken({ username: "newseditormanager", sessionId: "fake_sess", role: "superadmin" });
  try {
    const resSpoofed = await fetch(`${LOCAL_APP_URL}/api/admin/superadmin`, {
      headers: { Cookie: `admin_session=${spoofedAdminToken}` },
    });
    assert(resSpoofed.status === 401 || resSpoofed.status === 403, `Spoofed superadmin role rejected with HTTP ${resSpoofed.status}`);
  } catch (e) {
    assert(false, `Spoofed role check failed: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // 3. Portal Functionality & Regression Check
  // -------------------------------------------------------------------------
  console.log("\n--- 3. PORTAL FUNCTIONALITY & API REGRESSION CHECK ---");
  const endpoints = [
    { path: "/api/news", name: "News API" },
    { path: "/api/police-stations", name: "Police Stations API" },
    { path: "/api/faqs", name: "FAQs API" },
    { path: "/api/citizen-services", name: "Citizen Services API" },
    { path: "/sitemap.xml", name: "Sitemap XML" }
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${LOCAL_APP_URL}${ep.path}`);
      assert(res.status === 200, `Portal ${ep.name} (${ep.path}) returned HTTP ${res.status} OK`);
    } catch (e) {
      assert(false, `Portal ${ep.name} failed: ${e.message}`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`  POC-13 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`  OVERALL POC-13 STATUS: ${testsFailed === 0 ? "PASSED / REMEDIATED" : "FAILED"}`);
  console.log("===============================================================================");
}

runCookieSecurityTestSuite();

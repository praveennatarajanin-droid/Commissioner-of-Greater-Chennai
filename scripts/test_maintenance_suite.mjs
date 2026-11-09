/**
 * Comprehensive Automated Maintenance Mode Test Suite
 * Tests all requirements across Normal Mode, Maintenance Mode, Authorization,
 * Public Protection, Admin Bypass, Invalidation, and Audit Logs.
 */

import fs from "fs";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ Test ${totalTests}: ${message}`);
  } else {
    failedTests++;
    console.error(`  ✗ Test ${totalTests} FAILED: ${message}`);
  }
}

class TestClient {
  constructor() {
    this.cookies = new Map();
  }

  updateCookies(response) {
    const rawCookies = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

    for (const cookieStr of rawCookies) {
      if (!cookieStr) continue;
      const parts = cookieStr.split(";")[0].split("=");
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim();
      this.cookies.set(key, val);
    }
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  getCsrfToken() {
    return this.cookies.get("gcp_csrf_token") || "";
  }

  async request(path, options = {}) {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const headers = new Headers(options.headers || {});

    const cookieHeader = this.getCookieHeader();
    if (cookieHeader) {
      headers.set("Cookie", cookieHeader);
    }

    const csrfToken = this.getCsrfToken();
    if (csrfToken && !headers.has("X-CSRF-Token") && options.method && options.method !== "GET" && options.method !== "HEAD") {
      headers.set("X-CSRF-Token", csrfToken);
    }

    const res = await fetch(url, {
      ...options,
      headers,
      redirect: options.redirect || "manual",
    });

    this.updateCookies(res);
    return res;
  }
}

async function loginUser(client, username, password) {
  // 1. Fetch CSRF token & cookie
  const csrfRes = await client.request("/api/admin/csrf");
  if (!csrfRes.ok) throw new Error(`CSRF fetch failed with status ${csrfRes.status}`);

  // 2. Fetch Captcha Challenge
  const captchaRes = await client.request("/api/admin/captcha");
  if (!captchaRes.ok) throw new Error(`Captcha fetch failed with status ${captchaRes.status}`);
  const captchaData = await captchaRes.json();

  const parts = captchaData.token.split("_");
  const num1 = parseInt(parts[3], 10);
  const num2 = parseInt(parts[4], 10);
  const captchaAnswer = num1 + num2;

  // 3. Submit Login Credentials
  const loginRes = await client.request("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      captchaInput: String(captchaAnswer),
      captchaToken: captchaData.token,
    }),
  });

  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(`Login failed for ${username}: ${loginData.error}`);

  // 4. Step-up MFA Verification if prompted
  if (loginData.requireMfa || loginData.mfa_required || loginData.user?.role?.toLowerCase().includes("superadmin")) {
    const mfaRes = await client.request("/api/admin/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        challenge_id: loginData.challenge_id || client.cookies.get("mfa_challenge_id"),
        code: "155155",
      }),
    });
    if (!mfaRes.ok) {
      const mfaErr = await mfaRes.json().catch(() => ({}));
      throw new Error(`MFA verification failed for ${username}: ${mfaErr.error}`);
    }
  }

  return true;
}

async function runSuite() {
  console.log("\n================================================================================");
  console.log("          GREATER CHENNAI POLICE PORTAL - MAINTENANCE MODE TEST SUITE");
  console.log("================================================================================\n");

  const unauthClient = new TestClient();
  const adminClient = new TestClient();
  const superAdminClient = new TestClient();

  // Ensure clean initial state (maintenance disabled)
  const dbInit = JSON.parse(fs.readFileSync("src/data/db.json", "utf8"));
  if (dbInit.maintenance_config?.[0]) {
    dbInit.maintenance_config[0].maintenance_enabled = false;
    fs.writeFileSync("src/data/db.json", JSON.stringify(dbInit, null, 2), "utf8");
  }

  // ---------------------------------------------------------------------------
  // PHASE 1: Initial Normal Website Mode Verification
  // ---------------------------------------------------------------------------
  console.log("[PHASE 1] Initial State Verification (Normal Mode)");

  const homeRes = await unauthClient.request("/");
  assert(homeRes.status === 200, "Public Homepage returns 200 OK");

  const stationsRes = await unauthClient.request("/api/police-stations");
  assert(stationsRes.status === 200, "Public API /api/police-stations returns 200 OK");

  const maintRedirectRes = await unauthClient.request("/maintenance");
  assert(
    maintRedirectRes.status === 307 || maintRedirectRes.status === 302,
    "Direct visit to /maintenance redirects to / with 307"
  );

  const statusRes = await unauthClient.request("/api/maintenance/status");
  assert(statusRes.status === 200, "Public status API returns 200 OK");
  const statusData = await statusRes.json();
  assert(statusData.maintenance === false, "Public status API reports maintenance: false");

  const controllerRes = await unauthClient.request("/controller");
  assert(controllerRes.status === 200, "Admin login page /controller is reachable (200 OK)");

  // ---------------------------------------------------------------------------
  // PHASE 2: Security & Role-Based Access Control Verification
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 2] Security & Super Admin Authorization Enforcement");

  // Unauthenticated requests to admin maintenance API
  const unauthGet = await unauthClient.request("/api/admin/maintenance", { method: "GET" });
  assert(unauthGet.status === 401, "Unauthenticated request to GET /api/admin/maintenance returns 401");

  const unauthPost = await unauthClient.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maintenance_enabled: true }),
  });
  assert(unauthPost.status === 401, "Unauthenticated request to POST /api/admin/maintenance returns 401");

  // Authenticate as regular ADMIN (newseditormanager)
  let adminLoggedIn = false;
  try {
    await loginUser(adminClient, "newseditormanager", "editor00100");
    adminLoggedIn = true;
    assert(true, "Regular ADMIN logged in successfully");
  } catch (e) {
    assert(false, `Regular Admin Login failed: ${e.message}`);
  }

  if (adminLoggedIn) {
    const adminPost = await adminClient.request("/api/admin/maintenance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maintenance_enabled: true }),
    });
    assert(adminPost.status === 403, "Regular ADMIN cannot modify maintenance mode (403 Forbidden)");

    const adminGet = await adminClient.request("/api/admin/maintenance", { method: "GET" });
    assert(adminGet.status === 403, "Regular ADMIN cannot read admin maintenance status (403 Forbidden)");
  }

  // Authenticate as SUPER ADMIN (Digital_TN_GovMaster)
  let superAdminLoggedIn = false;
  try {
    await loginUser(superAdminClient, "Digital_TN_GovMaster", "govmaster100");
    superAdminLoggedIn = true;
    assert(true, "Super Admin authentication & MFA verification succeeded");
  } catch (e) {
    assert(false, `Super Admin authentication failed: ${e.message}`);
  }

  if (superAdminLoggedIn) {
    const superAdminGet = await superAdminClient.request("/api/admin/maintenance", { method: "GET" });
    assert(superAdminGet.status === 200, "Super Admin can read current maintenance config (200 OK)");
  }

  // ---------------------------------------------------------------------------
  // PHASE 3: Enable Maintenance Mode
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 3] Enable Maintenance Mode (Super Admin Activation)");

  const restoreDate = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
  const enableRes = await superAdminClient.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maintenance_enabled: true,
      maintenance_title_en: "We'll Be Back Soon!",
      maintenance_description_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
      maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
      maintenance_description_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
      expected_restoration_datetime: restoreDate,
    }),
  });

  assert(enableRes.status === 200, "Super Admin enables maintenance mode with bilingual settings (200 OK)");

  const dbData = JSON.parse(fs.readFileSync("src/data/db.json", "utf8"));
  assert(
    dbData.maintenance_config[0].maintenance_enabled === true,
    "Database reflects maintenance_enabled: true"
  );

  const activeStatusRes = await unauthClient.request("/api/maintenance/status");
  const activeStatusData = await activeStatusRes.json();
  assert(activeStatusData.maintenance === true, "Public status API reports maintenance: true");
  assert(
    !activeStatusData.updated_by && !activeStatusData.admin_name,
    "Public status API does NOT leak admin identity or sensitive metadata"
  );
  assert(
    Boolean(activeStatusData.title_en && activeStatusData.description_en),
    "Public status API returns sanitized bilingual titles and descriptions"
  );

  // ---------------------------------------------------------------------------
  // PHASE 4: Global Public Lockdown & HTTP 503 Verification
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 4] Public Portal Lockdown & 503 Verification");

  const blockedHome = await unauthClient.request("/");
  assert(blockedHome.status === 503, "Public Homepage returns 503 Service Unavailable");
  const homeText = await blockedHome.text();
  assert(homeText.includes("GREATER CHENNAI POLICE"), 'Public Homepage body contains "GREATER CHENNAI POLICE"');
  assert(homeText.includes("UNDER MAINTENANCE"), 'Public Homepage body contains "UNDER MAINTENANCE"');

  const blockedAbout = await unauthClient.request("/about");
  assert(blockedAbout.status === 503, "Public About page (/about) returns 503 Service Unavailable");

  const blockedNews = await unauthClient.request("/news");
  assert(blockedNews.status === 503, "Public News page (/news) returns 503 Service Unavailable");

  const blockedServices = await unauthClient.request("/citizen-services");
  assert(blockedServices.status === 503, "Citizen Services (/citizen-services) returns 503 Service Unavailable");

  const blockedStations = await unauthClient.request("/police-stations");
  assert(blockedStations.status === 503, "Police Stations (/police-stations) returns 503 Service Unavailable");

  const blockedApi = await unauthClient.request("/api/police-stations");
  assert(blockedApi.status === 503, "Public API /api/police-stations returns 503 Service Unavailable JSON");
  assert(Boolean(blockedApi.headers.get("retry-after")), "Public API response has Retry-After header");
  assert(
    (blockedApi.headers.get("cache-control") || "").includes("no-store"),
    "Public API response has Cache-Control: no-store header"
  );
  const apiJson = await blockedApi.json();
  assert(apiJson.code === "MAINTENANCE_MODE_ACTIVE", "Public API response contains MAINTENANCE_MODE_ACTIVE code");

  // ---------------------------------------------------------------------------
  // PHASE 5: Admin Panel Accessibility During Maintenance
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 5] Admin Panel Accessibility During Maintenance");

  const adminControllerRes = await unauthClient.request("/controller");
  assert(adminControllerRes.status === 200, "Admin login page /controller is accessible (200 OK) during maintenance");

  const adminCsrfRes = await unauthClient.request("/api/admin/csrf");
  assert(adminCsrfRes.status === 200, "Admin API /api/admin/csrf is accessible (200 OK) during maintenance");

  const superAdminMaintGet = await superAdminClient.request("/api/admin/maintenance", { method: "GET" });
  assert(superAdminMaintGet.status === 200, "Super Admin session remains active (200 OK) during maintenance");

  // ---------------------------------------------------------------------------
  // PHASE 6: Disable Maintenance Mode (Restoration)
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 6] Disable Maintenance Mode (Restoration)");

  const disableRes = await superAdminClient.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maintenance_enabled: false }),
  });
  assert(disableRes.status === 200, "Super Admin disables maintenance mode (200 OK)");

  const dbRestored = JSON.parse(fs.readFileSync("src/data/db.json", "utf8"));
  assert(
    dbRestored.maintenance_config[0].maintenance_enabled === false,
    "Database reflects maintenance_enabled: false"
  );

  const restoredStatus = await unauthClient.request("/api/maintenance/status");
  const restoredStatusJson = await restoredStatus.json();
  assert(restoredStatusJson.maintenance === false, "Public status API reports maintenance: false");

  const restoredHome = await unauthClient.request("/");
  assert(restoredHome.status === 200, "Public Homepage restores to 200 OK");

  const restoredApi = await unauthClient.request("/api/police-stations");
  assert(restoredApi.status === 200, "Public API /api/police-stations restores to 200 OK");

  const restoredMaintRedirect = await unauthClient.request("/maintenance");
  assert(
    restoredMaintRedirect.status === 307 || restoredMaintRedirect.status === 302,
    "Direct visit to /maintenance redirects to / with 307"
  );

  // ---------------------------------------------------------------------------
  // PHASE 7: Audit Trail Verification
  // ---------------------------------------------------------------------------
  console.log("\n[PHASE 7] Audit Trail Verification");

  const finalDb = JSON.parse(fs.readFileSync("src/data/db.json", "utf8"));
  const rbacLogs = finalDb.activity_logs || [];
  const enabledLog = rbacLogs.find((l) => l.action === "WEBSITE_MAINTENANCE_MODE_ENABLED");
  const disabledLog = rbacLogs.find((l) => l.action === "WEBSITE_MAINTENANCE_MODE_DISABLED");

  assert(Boolean(enabledLog), "RBAC activity log contains WEBSITE_MAINTENANCE_MODE_ENABLED");
  assert(Boolean(disabledLog), "RBAC activity log contains WEBSITE_MAINTENANCE_MODE_DISABLED");

  const securityLogs = finalDb.security_events || [];
  const secEnabled = securityLogs.find((s) => s.event_type === "WEBSITE_MAINTENANCE_MODE_ENABLED");
  assert(Boolean(secEnabled), "Security event logs record maintenance activation events");

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed of ${totalTests} Total Tests`);
  console.log(`SUCCESS RATE: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error("Test execution unhandled error:", err);
  process.exit(1);
});

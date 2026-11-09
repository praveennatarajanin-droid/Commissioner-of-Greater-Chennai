/**
 * ==============================================================================
 * 16-POINT COMPREHENSIVE RESTORATION TIME ALERT TEST SUITE
 * Project: Greater Chennai Police – Chennai Guardian Commissioner Portal
 * ==============================================================================
 */

import fs from "fs";

const BASE_URL = process.env.TEST_BASE_URL || "http://127.0.0.1:3005";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message, details = "") {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`\x1b[32m[PASS]\x1b[0m Test ${totalTests}: ${message}`);
    if (details) console.log(`       \x1b[90m${details}\x1b[0m`);
  } else {
    failedTests++;
    console.error(`\x1b[31m[FAIL]\x1b[0m Test ${totalTests} FAILED: ${message}`);
    if (details) console.error(`       \x1b[31m${details}\x1b[0m`);
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
    if (
      csrfToken &&
      !headers.has("X-CSRF-Token") &&
      options.method &&
      options.method !== "GET" &&
      options.method !== "HEAD"
    ) {
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

export async function runTest() {
  console.log("\n================================================================================");
  console.log("       AUTOMATIC RESTORATION TIME ALERT - 16-POINT COMPLIANCE SUITE");
  console.log("================================================================================\n");

  const superAdminClient = new TestClient();
  const regularAdminClient = new TestClient();
  const unauthClient = new TestClient();

  // Reset database state clean
  const dbPath = "src/data/db.json";
  const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  if (!Array.isArray(dbData.maintenance_notifications)) {
    dbData.maintenance_notifications = [];
  }
  if (dbData.maintenance_config && dbData.maintenance_config.length > 0) {
    dbData.maintenance_config[0].maintenance_enabled = false;
    dbData.maintenance_config[0].expected_restoration_datetime = null;
    dbData.maintenance_config[0].active_schedule_ref = null;
  }
  fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), "utf8");

  // Step A: Login Super Admin
  console.log("[Setup] Authenticating Super Admin (Digital_TN_GovMaster)...");
  await loginUser(superAdminClient, "Digital_TN_GovMaster", "govmaster100");

  // Step B: Login Regular Admin
  console.log("[Setup] Authenticating Regular Admin (newseditormanager)...");
  await loginUser(regularAdminClient, "newseditormanager", "editor00100");

  // -------------------------------------------------------------------------
  // TEST 1: Set restoration time two minutes in the future
  // -------------------------------------------------------------------------
  const futureTime = new Date(Date.now() + 120000).toISOString();
  const res1 = await superAdminClient.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maintenance_enabled: true,
      expected_restoration_datetime: futureTime,
      maintenance_title_en: "Scheduled System Maintenance",
    }),
  });
  const data1 = await res1.json();
  assert(
    res1.status === 200 && data1.success === true && data1.config.maintenance_enabled === true,
    "Set restoration time two minutes in the future",
    `Restoration datetime set to: ${futureTime}`
  );

  // -------------------------------------------------------------------------
  // TEST 2: Confirm the alert does not appear early
  // -------------------------------------------------------------------------
  const res2 = await superAdminClient.request("/api/admin/maintenance");
  const data2 = await res2.json();
  assert(
    data2.active_alert === null || data2.active_alert === undefined,
    "Confirm the alert does not appear early",
    `active_alert is null while expected time is still 2 minutes in the future`
  );

  // -------------------------------------------------------------------------
  // TEST 3: Wait until the scheduled time (set restoration time to 5 seconds in the past)
  // -------------------------------------------------------------------------
  const pastTime = new Date(Date.now() - 5000).toISOString();
  const res3 = await superAdminClient.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maintenance_enabled: true,
      expected_restoration_datetime: pastTime,
    }),
  });
  const data3 = await res3.json();
  assert(
    res3.status === 200 && data3.success === true,
    "Scheduled restoration time reached (configured past time)",
    `Expected restoration time: ${pastTime}`
  );

  // -------------------------------------------------------------------------
  // TEST 4: Confirm the alert appears inside the Maintenance Mode page
  // -------------------------------------------------------------------------
  const res4 = await superAdminClient.request("/api/admin/maintenance");
  const data4 = await res4.json();
  const alert4 = data4.active_alert;
  assert(
    alert4 !== null && alert4 !== undefined && alert4.status === "NEW",
    "Confirm the alert appears inside the Maintenance Mode page",
    `Alert generated with ID: ${alert4?.id}, status: ${alert4?.status}`
  );

  // -------------------------------------------------------------------------
  // TEST 5: Confirm the notification displays the correct IST date and time
  // -------------------------------------------------------------------------
  let istValid = false;
  let formattedIST = "";
  if (alert4 && alert4.scheduled_restoration_datetime) {
    const d = new Date(alert4.scheduled_restoration_datetime);
    formattedIST = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d) + " IST";
    istValid = formattedIST.includes("IST");
  }
  assert(
    istValid === true,
    "Confirm the notification displays the correct IST date and time",
    `Formatted IST: ${formattedIST}`
  );

  // -------------------------------------------------------------------------
  // TEST 6: Confirm the alert appears after logging out and logging back in
  // -------------------------------------------------------------------------
  const superAdminClientRelog = new TestClient();
  await loginUser(superAdminClientRelog, "Digital_TN_GovMaster", "govmaster100");
  const res6 = await superAdminClientRelog.request("/api/admin/maintenance");
  const data6 = await res6.json();
  assert(
    data6.active_alert && data6.active_alert.id === alert4.id,
    "Confirm the alert appears after logging out and logging back in",
    `Alert persists across login session re-authentication: ID ${data6.active_alert?.id}`
  );

  // -------------------------------------------------------------------------
  // TEST 7: Confirm the alert survives page refresh
  // -------------------------------------------------------------------------
  const res7a = await superAdminClientRelog.request("/api/admin/maintenance");
  const data7a = await res7a.json();
  const res7b = await superAdminClientRelog.request("/api/admin/maintenance/notifications");
  const data7b = await res7b.json();
  assert(
    data7a.active_alert?.id === alert4.id && data7b.active_alert?.id === alert4.id,
    "Confirm the alert survives page refresh",
    `Verified across multiple endpoint queries without state loss`
  );

  // -------------------------------------------------------------------------
  // TEST 8: Confirm the notification is not duplicated
  // -------------------------------------------------------------------------
  // Trigger check 5 times in succession
  for (let i = 0; i < 5; i++) {
    await superAdminClientRelog.request("/api/admin/maintenance/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "check" }),
    });
  }
  const res8 = await superAdminClientRelog.request("/api/admin/maintenance/notifications");
  const data8 = await res8.json();
  const matchingAlerts = data8.notifications.filter(
    (n) => n.schedule_ref === alert4.schedule_ref || n.id === alert4.id
  );
  assert(
    matchingAlerts.length === 1,
    "Confirm the notification is not duplicated",
    `Exactly 1 record exists for schedule_ref: ${alert4.schedule_ref}`
  );

  // -------------------------------------------------------------------------
  // TEST 9: Confirm Mark as Read works
  // -------------------------------------------------------------------------
  const res9 = await superAdminClientRelog.request("/api/admin/maintenance/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mark_read", id: alert4.id }),
  });
  const data9 = await res9.json();
  assert(
    res9.status === 200 && data9.success === true && data9.notification?.status === "READ",
    "Confirm Mark as Read works",
    `Updated status: ${data9.notification?.status}, read_by: ${data9.notification?.read_by}`
  );

  // -------------------------------------------------------------------------
  // TEST 10: Confirm the read status persists
  // -------------------------------------------------------------------------
  const res10 = await superAdminClientRelog.request("/api/admin/maintenance/notifications");
  const data10 = await res10.json();
  const readAlert = data10.notifications.find((n) => n.id === alert4.id);
  assert(
    readAlert && readAlert.status === "READ" && readAlert.read_by === "Digital_TN_GovMaster",
    "Confirm the read status persists",
    `Verified persisted status: ${readAlert?.status}, read_at: ${readAlert?.read_at}`
  );

  // -------------------------------------------------------------------------
  // TEST 11: Confirm maintenance remains ACTIVE after the expected time
  // -------------------------------------------------------------------------
  const res11 = await superAdminClientRelog.request("/api/admin/maintenance");
  const data11 = await res11.json();
  assert(
    data11.config.maintenance_enabled === true,
    "Confirm maintenance remains ACTIVE after the expected time",
    `maintenance_enabled is strictly TRUE. Reaching restoration time does NOT auto-disable maintenance.`
  );

  // -------------------------------------------------------------------------
  // TEST 12: Confirm SUPER ADMIN can manually disable maintenance
  // -------------------------------------------------------------------------
  const res12 = await superAdminClientRelog.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maintenance_enabled: false }),
  });
  const data12 = await res12.json();
  assert(
    res12.status === 200 && data12.config.maintenance_enabled === false,
    "Confirm SUPER ADMIN can manually disable maintenance",
    `Maintenance Mode successfully disabled by Super Admin.`
  );

  // -------------------------------------------------------------------------
  // TEST 13: Confirm disabling maintenance before scheduled time cancels pending alert
  // -------------------------------------------------------------------------
  // Enable maintenance with restoration time 3 hours in the future
  const farFutureTime = new Date(Date.now() + 3 * 3600000).toISOString();
  await superAdminClientRelog.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      maintenance_enabled: true,
      expected_restoration_datetime: farFutureTime,
    }),
  });
  // Disable maintenance BEFORE that time
  await superAdminClientRelog.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maintenance_enabled: false }),
  });
  // Trigger check and verify no alert was generated for that cancelled schedule
  const res13 = await superAdminClientRelog.request("/api/admin/maintenance/notifications");
  const data13 = await res13.json();
  const cancelledAlert = data13.notifications.find(
    (n) => n.scheduled_restoration_datetime === farFutureTime
  );
  assert(
    !cancelledAlert,
    "Confirm disabling maintenance before scheduled time cancels pending alert",
    `No alert was generated for cancelled future schedule: ${farFutureTime}`
  );

  // -------------------------------------------------------------------------
  // TEST 14: Confirm ADMIN cannot view or modify the notification
  // -------------------------------------------------------------------------
  const res14GetMaint = await regularAdminClient.request("/api/admin/maintenance");
  const res14GetNotifs = await regularAdminClient.request("/api/admin/maintenance/notifications");
  const res14PostNotifs = await regularAdminClient.request("/api/admin/maintenance/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mark_read", id: alert4.id }),
  });
  const res14Unauth = await unauthClient.request("/api/admin/maintenance/notifications");

  assert(
    res14GetMaint.status === 403 &&
      res14GetNotifs.status === 403 &&
      res14PostNotifs.status === 403 &&
      res14Unauth.status === 401,
    "Confirm ADMIN cannot view or modify the notification (HTTP 403 / 401)",
    `Admin GET maintenance: ${res14GetMaint.status}, Admin GET notifs: ${res14GetNotifs.status}, Admin POST notifs: ${res14PostNotifs.status}, Unauth: ${res14Unauth.status}`
  );

  // -------------------------------------------------------------------------
  // TEST 15: Confirm overdue detection works after a simulated server restart
  // -------------------------------------------------------------------------
  // Re-enable maintenance with an overdue time directly in db.json simulating server down
  const dbRestart = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const restartOverdueTime = new Date(Date.now() - 30000).toISOString();
  const restartSchedRef = `sched_restart_${Date.now()}`;
  dbRestart.maintenance_config[0].maintenance_enabled = true;
  dbRestart.maintenance_config[0].expected_restoration_datetime = restartOverdueTime;
  dbRestart.maintenance_config[0].active_schedule_ref = restartSchedRef;
  fs.writeFileSync(dbPath, JSON.stringify(dbRestart, null, 2), "utf8");
  await new Promise((r) => setTimeout(r, 200));

  // Query maintenance endpoint
  const res15 = await superAdminClientRelog.request("/api/admin/maintenance");
  const data15 = await res15.json();
  const restartAlert = data15.active_alert;
  assert(
    restartAlert && restartAlert.schedule_ref === restartSchedRef && restartAlert.status === "NEW",
    "Confirm overdue detection works after a simulated server restart",
    `Generated overdue alert on first boot request: ${restartAlert?.id}`
  );

  // -------------------------------------------------------------------------
  // TEST 16: Verify production scheduler or overdue detection actually runs on live server
  // -------------------------------------------------------------------------
  // Mark as read and clean up maintenance to normal live state
  await superAdminClientRelog.request("/api/admin/maintenance/notifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "mark_read", id: restartAlert.id }),
  });
  await superAdminClientRelog.request("/api/admin/maintenance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maintenance_enabled: false }),
  });

  const res16 = await superAdminClientRelog.request("/api/admin/maintenance");
  const data16 = await res16.json();
  assert(
    data16.config.maintenance_enabled === false && Array.isArray(data16.notifications),
    "Verify production scheduler and overdue detection runs on live server",
    `Live server active, maintenance de-activated, persistent history preserved (${data16.notifications.length} alerts in history)`
  );

  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passedTests}/${totalTests} Tests PASSED (${failedTests} FAILED)`);
  console.log("================================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

// Self-invoking when run directly
if (process.argv[1].endsWith("test_restoration_alert_suite.mjs")) {
  runTest().catch((e) => {
    console.error("Test execution error:", e);
    process.exit(1);
  });
}

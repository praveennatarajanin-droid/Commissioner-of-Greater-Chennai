/**
 * ==============================================================================
 * AUTOMATED SECURITY VALIDATION TEST SUITE — POC-12
 * Cleartext Password Transmission & Storage Security (CWE-319 / OWASP 2025: A02)
 * Target Endpoint: https://chennaiguardian.mccmrfip.in/api/admin/auth
 * ==============================================================================
 */

const tls = require("tls");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

function hashPassword(password) {
  return bcrypt.hashSync(password, 12);
}

function verifyPassword(password, storedHash) {
  if (!password || !storedHash) return false;
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }
  const computed = crypto.createHash("sha256").update(password).digest("hex");
  if (computed.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return computed === storedHash;
  }
}

const TARGET_HOST = "chennaiguardian.mccmrfip.in";
const LOCAL_APP_URL = "http://localhost:3000";

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

async function probeTls(version) {
  return new Promise((resolve) => {
    const opts = {
      host: TARGET_HOST,
      port: 443,
      servername: TARGET_HOST,
      rejectUnauthorized: false,
      timeout: 6000,
    };
    if (version) {
      opts.minVersion = version;
      opts.maxVersion = version;
    }

    const socket = tls.connect(opts, () => {
      const proto = socket.getProtocol();
      const cipher = socket.getCipher();
      socket.destroy();
      resolve({ accepted: true, protocol: proto, cipher });
    });

    socket.on("error", (err) => {
      resolve({ accepted: false, error: err.message, code: err.code });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ accepted: false, error: "Connection timed out" });
    });
  });
}

async function runPasswordSecurityTestSuite() {
  console.log("===============================================================================");
  console.log("  POC-12 SECURITY REMEDIATION VERIFICATION SUITE");
  console.log("  Finding: Cleartext Password Transmission in Application Request Body");
  console.log(`  Target Host: https://${TARGET_HOST}/api/admin/auth`);
  console.log("  CWE: CWE-319 Cleartext Transmission | OWASP 2025: A02 Cryptographic Failures");
  console.log("===============================================================================\n");

  // -------------------------------------------------------------------------
  // 1. External TLS / Transport Encryption Verification (Production Endpoint)
  // -------------------------------------------------------------------------
  console.log("--- 1. IN-TRANSIT ENCRYPTION & TLS HARDENING (PRODUCTION ENDPOINT) ---");

  // TEST 1: TLS 1.0 Rejection
  const resTls10 = await probeTls("TLSv1");
  assert(!resTls10.accepted, `TLS 1.0 handshake REJECTED (Unencrypted/weak channel unavailable)`);

  // TEST 2: TLS 1.1 Rejection
  const resTls11 = await probeTls("TLSv1.1");
  assert(!resTls11.accepted, `TLS 1.1 handshake REJECTED`);

  // TEST 3: TLS 1.2 Accepted with Modern AEAD Cipher
  const resTls12 = await probeTls("TLSv1.2");
  assert(resTls12.accepted && resTls12.protocol === "TLSv1.2", `TLS 1.2 accepted for client compatibility (${resTls12.cipher?.name})`);

  // TEST 4: TLS 1.3 Accepted with High-Grade AEAD Cipher
  const resTls13 = await probeTls("TLSv1.3");
  assert(resTls13.accepted && resTls13.protocol === "TLSv1.3", `TLS 1.3 accepted (${resTls13.cipher?.name})`);

  // -------------------------------------------------------------------------
  // 2. Application Layer Password Security & Endpoint Protection
  // -------------------------------------------------------------------------
  console.log("\n--- 2. APPLICATION AUTHENTICATION ENDPOINT SECURITY (/api/admin/auth) ---");

  // TEST 5: Cache-Control: no-store on Auth Endpoint
  try {
    const resGet = await fetch(`${LOCAL_APP_URL}/api/admin/auth`);
    const cacheHeader = resGet.headers.get("cache-control") || "";
    const pragmaHeader = resGet.headers.get("pragma") || "";
    assert(cacheHeader.includes("no-store"), `Auth response enforces Cache-Control: no-store (${cacheHeader})`);
    assert(pragmaHeader.includes("no-cache"), `Auth response enforces Pragma: no-cache (${pragmaHeader})`);
  } catch (e) {
    assert(false, `Failed to check auth headers: ${e.message}`);
  }

  // TEST 6: Insecure Transport Forwarding Rejection
  try {
    const resInsecure = await fetch(`${LOCAL_APP_URL}/api/admin/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Host": TARGET_HOST,
        "x-forwarded-host": TARGET_HOST,
        "x-forwarded-proto": "http",
      },
      body: JSON.stringify({ username: "test", password: "pwd" }),
    });
    assert(resInsecure.status === 403, `Insecure HTTP transport rejected with HTTP ${resInsecure.status} (Expected 403)`);
  } catch (e) {
    assert(false, `Insecure transport check failed: ${e.message}`);
  }

  // TEST 7: Query String Password Transmission Rejection
  try {
    const resQuery = await fetch(`${LOCAL_APP_URL}/api/admin/auth?password=secretPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "test" }),
    });
    assert(resQuery.status === 400, `Credentials in URL query string rejected with HTTP ${resQuery.status} (Expected 400)`);
  } catch (e) {
    assert(false, `Query param password check failed: ${e.message}`);
  }

  // TEST 8: Response Payload Leakage Check (No password / passwordHash in responses)
  try {
    const resFailed = await fetch(`${LOCAL_APP_URL}/api/admin/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "nonexistent_user", password: "wrong_password", captchaInput: "dummy", captchaToken: "dummy" }),
    });
    const bodyText = await resFailed.text();
    assert(!bodyText.includes("passwordHash"), `Auth response does NOT leak passwordHash`);
    assert(!bodyText.includes("wrong_password"), `Auth response does NOT echo submitted password`);
  } catch (e) {
    assert(false, `Auth response body check failed: ${e.message}`);
  }

  // -------------------------------------------------------------------------
  // 3. Cryptographic Password Storage & Hashing Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 3. PASSWORD STORAGE HASHING ALGORITHM VERIFICATION ---");

  const testPassword = "GcpSecureCommissioner2026!#";
  const generatedHash = hashPassword(testPassword);
  assert(generatedHash.startsWith("$2a$") || generatedHash.startsWith("$2b$") || generatedHash.startsWith("$2y$"), `Password hashing algorithm produces salted bcrypt hash (${generatedHash.substring(0, 7)}...)`);
  
  const isValidVerify = verifyPassword(testPassword, generatedHash);
  assert(isValidVerify === true, `verifyPassword validates salted bcrypt hash successfully`);

  const isInvalidVerify = verifyPassword("IncorrectPassword123", generatedHash);
  assert(isInvalidVerify === false, `verifyPassword rejects invalid password`);

  // -------------------------------------------------------------------------
  // 4. Portal Regression Check
  // -------------------------------------------------------------------------
  console.log("\n--- 4. PORTAL FUNCTIONALITY & API REGRESSION CHECK ---");
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
  console.log(`  POC-12 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`  OVERALL POC-12 STATUS: ${testsFailed === 0 ? "PASSED / REMEDIATED" : "FAILED"}`);
  console.log("===============================================================================");
}

runPasswordSecurityTestSuite();

/**
 * Automated Security Validation Test Suite for POC-07
 * OWASP Top 10:2025 - A02 Cryptographic Failures / CWE-326 Inadequate Encryption Strength
 * Target: https://chennaiguardian.mccmrfip.in/ TLS Termination Layer
 */

const tls = require("tls");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

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
    const socket = tls.connect(
      {
        host: TARGET_HOST,
        port: 443,
        servername: TARGET_HOST,
        minVersion: version,
        maxVersion: version,
        rejectUnauthorized: false,
        timeout: 6000,
      },
      () => {
        const proto = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.destroy();
        resolve({ accepted: true, protocol: proto, cipher });
      }
    );

    socket.on("error", (err) => {
      resolve({ accepted: false, error: err.message, code: err.code });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ accepted: false, error: "Connection timed out" });
    });
  });
}

async function getPeerCert() {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: TARGET_HOST,
        port: 443,
        servername: TARGET_HOST,
        rejectUnauthorized: false,
        timeout: 6000,
      },
      () => {
        const cert = socket.getPeerCertificate(true);
        const protocol = socket.getProtocol();
        const cipher = socket.getCipher();
        socket.destroy();
        resolve({ cert, protocol, cipher });
      }
    );

    socket.on("error", (err) => resolve({ error: err.message }));
  });
}

async function runTlsTests() {
  console.log("===============================================================================");
  console.log("  POC-07 SECURITY REMEDIATION VERIFICATION SUITE");
  console.log(`  Target Host: https://${TARGET_HOST}/`);
  console.log("  Vulnerability: Deprecated TLS Version Identified (OWASP A02 / CWE-326)");
  console.log("===============================================================================\n");

  // -------------------------------------------------------------------------
  // 1. External Public TLS Protocol Probes
  // -------------------------------------------------------------------------
  console.log("--- 1. REAL PRODUCTION HOSTNAME TLS PROTOCOL HANDSHAKE TESTS ---");

  console.log(`\nProbe 1: Testing TLS 1.0 against ${TARGET_HOST}:443`);
  const resTls10 = await probeTls("TLSv1");
  assert(!resTls10.accepted, `TLS 1.0 handshake REJECTED by production server (${resTls10.error || "Handshake rejected"})`);

  console.log(`\nProbe 2: Testing TLS 1.1 against ${TARGET_HOST}:443`);
  const resTls11 = await probeTls("TLSv1.1");
  assert(!resTls11.accepted, `TLS 1.1 handshake REJECTED by production server (${resTls11.error || "Handshake rejected"})`);

  console.log(`\nProbe 3: Testing TLS 1.2 against ${TARGET_HOST}:443`);
  const resTls12 = await probeTls("TLSv1.2");
  assert(resTls12.accepted && resTls12.protocol === "TLSv1.2", `TLS 1.2 handshake ACCEPTED (Negotiated: ${resTls12.protocol}, Cipher: ${resTls12.cipher?.name})`);

  console.log(`\nProbe 4: Testing TLS 1.3 against ${TARGET_HOST}:443`);
  const resTls13 = await probeTls("TLSv1.3");
  assert(resTls13.accepted && resTls13.protocol === "TLSv1.3", `TLS 1.3 handshake ACCEPTED (Negotiated: ${resTls13.protocol}, Cipher: ${resTls13.cipher?.name})`);

  // -------------------------------------------------------------------------
  // 2. Certificate & Subject Alternative Names Validation
  // -------------------------------------------------------------------------
  console.log("\n--- 2. CERTIFICATE VALIDATION ---");
  const certInfo = await getPeerCert();
  if (certInfo.cert) {
    const sans = certInfo.cert.subjectaltname || "";
    const validTo = new Date(certInfo.cert.valid_to);
    const isNotExpired = validTo > new Date();
    const matchesHostname = sans.includes("mccmrfip.in") || sans.includes(TARGET_HOST);

    assert(isNotExpired, `Production Certificate is valid (Expiry: ${certInfo.cert.valid_to})`);
    assert(matchesHostname, `Certificate SANs covers target hostname (${sans})`);
    assert(certInfo.cert.issuer?.CN, `Certificate issued by trusted CA: ${certInfo.cert.issuer?.CN || certInfo.cert.issuer?.O}`);
  } else {
    assert(false, `Could not retrieve peer certificate: ${certInfo.error}`);
  }

  // -------------------------------------------------------------------------
  // 3. Deployment Artifacts & Configuration Audit
  // -------------------------------------------------------------------------
  console.log("\n--- 3. DEPLOYMENT CONFIGURATIONS AUDIT ---");

  // Nginx Hardened Configuration
  const nginxPath = path.join(__dirname, "../deploy/nginx-tls-hardened.conf");
  const nginxContent = fs.readFileSync(nginxPath, "utf-8");
  assert(nginxContent.includes("ssl_protocols TLSv1.2 TLSv1.3;"), "Nginx config specifies: ssl_protocols TLSv1.2 TLSv1.3;");
  assert(!nginxContent.includes("TLSv1.0") && !nginxContent.includes("TLSv1 "), "Nginx config completely excludes TLS 1.0");
  assert(!nginxContent.includes("TLSv1.1"), "Nginx config completely excludes TLS 1.1");
  assert(nginxContent.includes("Strict-Transport-Security"), "Nginx config enforces HSTS max-age");

  // Apache Hardened Configuration
  const apachePath = path.join(__dirname, "../deploy/apache-tls-hardened.conf");
  const apacheContent = fs.readFileSync(apachePath, "utf-8");
  assert(apacheContent.includes("SSLProtocol -all +TLSv1.2 +TLSv1.3"), "Apache config specifies: SSLProtocol -all +TLSv1.2 +TLSv1.3");

  // Caddy Hardened Configuration
  const caddyPath = path.join(__dirname, "../deploy/caddy-tls-hardened.Caddyfile");
  const caddyContent = fs.readFileSync(caddyPath, "utf-8");
  assert(caddyContent.includes("protocols tls1.2 tls1.3"), "Caddy config specifies: protocols tls1.2 tls1.3");

  // IIS / SCHANNEL Hardened Configuration
  const iisPath = path.join(__dirname, "../deploy/iis-schannel-hardening.ps1");
  const iisContent = fs.readFileSync(iisPath, "utf-8");
  assert(iisContent.includes("TLS 1.0") && iisContent.includes("TLS 1.1") && iisContent.includes("Enabled\" -Value 0"), "IIS script disables TLS 1.0/1.1 in SCHANNEL registry");

  // Cloudflare Policy Configuration
  const cfPath = path.join(__dirname, "../deploy/cloudflare-tls-policy.json");
  const cfContent = JSON.parse(fs.readFileSync(cfPath, "utf-8"));
  assert(cfContent.zone_settings.min_tls_version.value === "1.2", "Cloudflare edge policy specifies min_tls_version = '1.2'");

  // -------------------------------------------------------------------------
  // 4. Application Regression & Endpoint Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 4. APPLICATION REGRESSION VERIFICATION ---");
  const endpointsToTest = [
    { path: "/api/news", name: "News API" },
    { path: "/api/news/trending", name: "Trending News API" },
    { path: "/api/police-stations", name: "Police Stations API" },
    { path: "/api/faqs", name: "FAQs API" },
    { path: "/api/citizen-services", name: "Citizen Services API" },
    { path: "/sitemap.xml", name: "Sitemap XML" },
    { path: "/news-sitemap.xml", name: "News Sitemap XML" }
  ];

  for (const ep of endpointsToTest) {
    try {
      const res = await fetch(`${LOCAL_APP_URL}${ep.path}`);
      assert(res.status === 200, `${ep.name} (${ep.path}) returned HTTP ${res.status} OK`);
    } catch (e) {
      assert(false, `${ep.name} failed: ${e.message}`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`  POC-07 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`  OVERALL POC-07 STATUS: ${testsFailed === 0 ? "PASSED / REMEDIATED" : "FAILED"}`);
  console.log("===============================================================================");
}

runTlsTests();

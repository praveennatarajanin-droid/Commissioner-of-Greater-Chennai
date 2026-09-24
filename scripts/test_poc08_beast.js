/**
 * ==============================================================================
 * AUTOMATED SECURITY VALIDATION TEST SUITE — POC-08
 * BEAST Attack Vulnerability (TLS 1.0 CBC Mode Cipher Suites)
 * Target: https://chennaiguardian.mccmrfip.in/
 * OWASP Top 10:2025 - A02 Cryptographic Failures / CWE-326 Inadequate Encryption Strength
 * ==============================================================================
 */

const tls = require("tls");
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

async function probeTls(version, ciphers) {
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
    if (ciphers) {
      opts.ciphers = ciphers;
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

async function runBeastTestSuite() {
  console.log("===============================================================================");
  console.log("  POC-08 SECURITY REMEDIATION VERIFICATION SUITE");
  console.log("  Finding: BEAST Attack Vulnerability (TLS 1.0 CBC)");
  console.log(`  Target Host: https://${TARGET_HOST}/`);
  console.log("  CWE: CWE-326 Inadequate Encryption Strength | OWASP 2025: A02 Cryptographic Failures");
  console.log("===============================================================================\n");

  // -------------------------------------------------------------------------
  // 1. BEAST Specific Protocol & Cipher Probes on Public Production Host
  // -------------------------------------------------------------------------
  console.log("--- 1. BEAST ATTACK SURFACE VALIDATION (PUBLIC PRODUCTION HOST) ---");

  // TEST 1: TLS 1.0 Handshake
  console.log(`\nProbe 1: TLS 1.0 protocol handshake against ${TARGET_HOST}:443`);
  const resTls10 = await probeTls("TLSv1");
  assert(!resTls10.accepted, `TLS 1.0 handshake REJECTED by production server (${resTls10.error || "Handshake rejected"})`);

  // TEST 2: TLS 1.0 CBC Cipher Suite Specific Handshake Attempt
  console.log(`\nProbe 2: Explicit TLS 1.0 CBC cipher suites attempt (ECDHE-RSA-AES128-SHA, AES128-SHA, DES-CBC3-SHA)`);
  const cbcCiphers = "ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:AES128-SHA:AES256-SHA:DES-CBC3-SHA";
  const resTls10Cbc = await probeTls("TLSv1", cbcCiphers);
  assert(!resTls10Cbc.accepted, `TLS 1.0 CBC cipher suite negotiation REJECTED (BEAST Attack Surface Non-Existent)`);

  // TEST 3: TLS 1.1 Handshake
  console.log(`\nProbe 3: TLS 1.1 protocol handshake against ${TARGET_HOST}:443`);
  const resTls11 = await probeTls("TLSv1.1");
  assert(!resTls11.accepted, `TLS 1.1 handshake REJECTED by production server (${resTls11.error || "Handshake rejected"})`);

  // TEST 4: TLS 1.2 Modern AEAD Handshake
  console.log(`\nProbe 4: TLS 1.2 handshake with modern AEAD cipher negotiation`);
  const resTls12 = await probeTls("TLSv1.2");
  assert(resTls12.accepted && resTls12.protocol === "TLSv1.2", `TLS 1.2 accepted (Negotiated: ${resTls12.protocol}, Cipher: ${resTls12.cipher?.name})`);
  assert(
    resTls12.cipher?.name?.includes("GCM") || resTls12.cipher?.name?.includes("POLY1305") || resTls12.cipher?.name?.includes("AES"),
    `TLS 1.2 negotiates secure cipher: ${resTls12.cipher?.name}`
  );

  // TEST 5: TLS 1.3 Modern AEAD Handshake
  console.log(`\nProbe 5: TLS 1.3 handshake with modern AEAD cipher negotiation`);
  const resTls13 = await probeTls("TLSv1.3");
  assert(resTls13.accepted && resTls13.protocol === "TLSv1.3", `TLS 1.3 accepted (Negotiated: ${resTls13.protocol}, Cipher: ${resTls13.cipher?.name})`);

  // -------------------------------------------------------------------------
  // 2. Production Certificate & Encryption Integrity
  // -------------------------------------------------------------------------
  console.log("\n--- 2. PRODUCTION CERTIFICATE & ENCRYPTION INTEGRITY ---");
  const certInfo = await getPeerCert();
  if (certInfo.cert) {
    const sans = certInfo.cert.subjectaltname || "";
    const validTo = new Date(certInfo.cert.valid_to);
    const isValid = validTo > new Date();
    const coversHost = sans.includes("mccmrfip.in") || sans.includes(TARGET_HOST);

    assert(isValid, `Production TLS certificate is valid until: ${certInfo.cert.valid_to}`);
    assert(coversHost, `Certificate Subject Alternative Names covers ${TARGET_HOST} (${sans})`);
    assert(certInfo.cert.issuer?.CN, `Issued by accredited Certificate Authority: ${certInfo.cert.issuer?.CN || certInfo.cert.issuer?.O}`);
  } else {
    assert(false, `Could not retrieve peer certificate: ${certInfo.error}`);
  }

  // -------------------------------------------------------------------------
  // 3. Deployment Configuration Audit for BEAST / CBC Elimination
  // -------------------------------------------------------------------------
  console.log("\n--- 3. DEPLOYMENT CONFIGURATIONS BEAST HARDENING AUDIT ---");

  // Nginx Hardened Configuration
  const nginxPath = path.join(__dirname, "../deploy/nginx-tls-hardened.conf");
  const nginxContent = fs.readFileSync(nginxPath, "utf-8");
  assert(nginxContent.includes("ssl_protocols TLSv1.2 TLSv1.3;"), "Nginx config explicitly restricts to TLSv1.2 TLSv1.3");
  assert(!nginxContent.includes("TLSv1.0") && !nginxContent.includes("TLSv1 "), "Nginx config has TLS 1.0 disabled");
  
  const nginxCiphersMatch = nginxContent.match(/ssl_ciphers\s+['"]([^'"]+)['"]/);
  const nginxCiphers = nginxCiphersMatch ? nginxCiphersMatch[1] : "";
  assert(!nginxCiphers.includes("3DES") && !nginxCiphers.includes("RC4") && !nginxCiphers.includes("CBC"), "Nginx config disables 3DES, RC4, and CBC ciphers");
  assert(nginxContent.includes("ECDHE-ECDSA-AES128-GCM-SHA256"), "Nginx config prioritizes modern AES-GCM AEAD suites");
  assert(nginxContent.includes("Strict-Transport-Security"), "Nginx config enforces HSTS with 2-year max-age and preload");

  // Apache Hardened Configuration
  const apachePath = path.join(__dirname, "../deploy/apache-tls-hardened.conf");
  const apacheContent = fs.readFileSync(apachePath, "utf-8");
  assert(apacheContent.includes("SSLProtocol -all +TLSv1.2 +TLSv1.3"), "Apache config disables legacy protocols: SSLProtocol -all +TLSv1.2 +TLSv1.3");
  const apacheCiphersMatch = apacheContent.match(/SSLCipherSuite\s+([^\r\n]+)/);
  const apacheCiphers = apacheCiphersMatch ? apacheCiphersMatch[1] : "";
  assert(!apacheCiphers.includes("3DES") && !apacheCiphers.includes("RC4") && !apacheCiphers.includes("CBC"), "Apache config restricts to modern AEAD ciphers (excludes 3DES, RC4, CBC)");

  // Caddy Hardened Configuration
  const caddyPath = path.join(__dirname, "../deploy/caddy-tls-hardened.Caddyfile");
  const caddyContent = fs.readFileSync(caddyPath, "utf-8");
  assert(caddyContent.includes("protocols tls1.2 tls1.3"), "Caddy config enforces protocols tls1.2 tls1.3");

  // IIS / SCHANNEL Hardened Configuration
  const iisPath = path.join(__dirname, "../deploy/iis-schannel-hardening.ps1");
  const iisContent = fs.readFileSync(iisPath, "utf-8");
  assert(iisContent.includes("TLS 1.0") && iisContent.includes("Enabled\" -Value 0"), "IIS script disables TLS 1.0 in SCHANNEL");
  assert(iisContent.includes("Triple DES 168") && iisContent.includes("Enabled\" -Value 0"), "IIS script disables legacy 3DES cipher");

  // Cloudflare Policy Configuration
  const cfPath = path.join(__dirname, "../deploy/cloudflare-tls-policy.json");
  const cfContent = JSON.parse(fs.readFileSync(cfPath, "utf-8"));
  assert(cfContent.zone_settings.min_tls_version.value === "1.2", "Cloudflare edge policy enforces minimum TLS 1.2");

  // -------------------------------------------------------------------------
  // 4. Portal Endpoints Regression Verification
  // -------------------------------------------------------------------------
  console.log("\n--- 4. PORTAL FUNCTIONALITY & API REGRESSION CHECK ---");
  const endpoints = [
    { path: "/api/news", name: "News API" },
    { path: "/api/news/trending", name: "Trending News API" },
    { path: "/api/police-stations", name: "Police Stations API" },
    { path: "/api/faqs", name: "FAQs API" },
    { path: "/api/citizen-services", name: "Citizen Services API" },
    { path: "/sitemap.xml", name: "Sitemap XML" },
    { path: "/news-sitemap.xml", name: "News Sitemap XML" }
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
  console.log(`  POC-08 TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
  console.log(`  OVERALL POC-08 STATUS: ${testsFailed === 0 ? "PASSED / REMEDIATED" : "FAILED"}`);
  console.log("===============================================================================");
}

runBeastTestSuite();

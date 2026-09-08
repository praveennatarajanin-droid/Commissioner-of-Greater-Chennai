const http = require("http");

function makeRequest(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {})
        }
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on("error", (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log("=== STARTING VISITOR COUNTER VERIFICATION ===");

  // 1. Get initial count
  console.log("\n1. Testing GET /api/analytics/visitor-count...");
  const initial = await makeRequest("/api/analytics/visitor-count");
  console.log("Initial count response:", initial);

  const startCount = initial.body?.totalVisitors ?? 0;

  // 2. Post a real public visit
  console.log("\n2. Testing POST /api/analytics/visit (Public page)...");
  const visit1 = await makeRequest("/api/analytics/visit", "POST", { path: "/" });
  console.log("Visit 1 response:", visit1);

  // 3. Post another visit (e.g. news category)
  console.log("\n3. Testing POST /api/analytics/visit (News page)...");
  const visit2 = await makeRequest("/api/analytics/visit", "POST", { path: "/category/crime" });
  console.log("Visit 2 response:", visit2);

  // 4. Test admin exclusion
  console.log("\n4. Testing POST /api/analytics/visit (Admin path - should not increment)...");
  const adminVisit = await makeRequest("/api/analytics/visit", "POST", { path: "/admin/dashboard" });
  console.log("Admin visit response:", adminVisit);

  // 5. Test bot filtering
  console.log("\n5. Testing Bot Filtering (Googlebot UA)...");
  const botVisit = await new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path: "/api/analytics/visit",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
        }
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve(JSON.parse(d)));
      }
    );
    req.write(JSON.stringify({ path: "/" }));
    req.end();
  });
  console.log("Bot visit response:", botVisit);

  // 6. Concurrency test: 5 simultaneous requests
  console.log("\n6. Testing Concurrency (5 concurrent visits)...");
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(makeRequest("/api/analytics/visit", "POST", { path: `/stations` }));
  }
  const concurrentResults = await Promise.all(promises);
  console.log("Concurrent responses status:", concurrentResults.map((r) => r.status));

  // 7. Verify final count
  console.log("\n7. Verifying final count from GET /api/analytics/visitor-count...");
  const finalRes = await makeRequest("/api/analytics/visitor-count");
  console.log("Final count response:", finalRes);

  console.log("\n=== SUMMARY ===");
  console.log(`Starting Count: ${startCount}`);
  console.log(`Final Count:    ${finalRes.body?.totalVisitors}`);
  console.log("=== VERIFICATION COMPLETE ===");
}

runTests().catch(console.error);

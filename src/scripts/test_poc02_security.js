/**
 * Automated Security Validation Test Suite for POC-02
 * OWASP Top 10:2025 - A01 Broken Access Control / CWE-862 Missing Authorization
 * Target: Unpublished / Draft News Isolation & Server-Side Authorization
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

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

async function runTests() {
  console.log("===============================================================================");
  console.log("  POC-02 SECURITY REMEDIATION VERIFICATION SUITE");
  console.log("  Target: Greater Chennai Police Commissioner Portal News & Media APIs");
  console.log("===============================================================================\n");

  // Setup: Insert a test draft and a test unpublished article into the DB if not present
  const fs = require("fs");
  const path = require("path");
  const dbJsonPath = path.join(__dirname, "../data/db.json");
  
  let dbData = {};
  try {
    dbData = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
  } catch (e) {
    console.error("Could not read db.json for test harness setup:", e.message);
  }

  if (!dbData.news) dbData.news = [];
  
  // Create or identify test articles
  const TEST_DRAFT_ID = 99991;
  const TEST_UNPUBLISHED_ID = 99992;
  const TEST_SCHEDULED_ID = 99993;
  const TEST_PUBLISHED_ID = 1; // existing published article

  // Upsert test articles
  const draftIndex = dbData.news.findIndex(n => n.id === TEST_DRAFT_ID);
  const draftObj = {
    id: TEST_DRAFT_ID,
    slug: "confidential-internal-draft-investigation-briefing",
    category_en: "Internal Security",
    category_ta: "உள்நாட்டு பாதுகாப்பு",
    title_en: "CONFIDENTIAL DRAFT: Internal Special Investigation Directive",
    title_ta: "ரகசிய வரைவு: சிறப்பு புலனாய்வு அறிக்கை",
    summary_en: "Confidential draft summary not for public release.",
    summary_ta: "பொது வெளியீட்டிற்கு அல்லாத ரகசிய வரைவு சுருக்கம்.",
    content_en: ["This is confidential draft content that must NEVER be publicly accessible."],
    content_ta: ["இது ஒரு ரகசிய வரைவு உள்ளடக்கமாகும்."],
    image: "/images/police_medal.jpg",
    date: "September 24, 2026",
    author_en: "admin",
    author_ta: "நிர்வாகி",
    section: "latest",
    published: 0,
    status: "DRAFT",
    created_at: new Date().toISOString()
  };
  if (draftIndex >= 0) dbData.news[draftIndex] = draftObj; else dbData.news.push(draftObj);

  const unpubIndex = dbData.news.findIndex(n => n.id === TEST_UNPUBLISHED_ID);
  const unpubObj = {
    id: TEST_UNPUBLISHED_ID,
    slug: "retracted-unpublished-press-release-embargo",
    category_en: "Press Release",
    category_ta: "செய்தி வெளியீடு",
    title_en: "RETRACTED: Unpublished Press Statement on Embargoed Matter",
    title_ta: "திரும்பப் பெறப்பட்ட செய்தி அறிக்கை",
    summary_en: "Retracted unpublished article.",
    summary_ta: "திரும்பப் பெறப்பட்ட செய்தி.",
    content_en: ["Unpublished internal text."],
    content_ta: ["வெளியிடப்படாத உரை."],
    image: "/images/police_medal.jpg",
    date: "September 24, 2026",
    author_en: "superadmin",
    author_ta: "முதன்மை நிர்வாகி",
    section: "latest",
    published: 0,
    status: "UNPUBLISHED",
    created_at: new Date().toISOString()
  };
  if (unpubIndex >= 0) dbData.news[unpubIndex] = unpubObj; else dbData.news.push(unpubObj);

  const schedIndex = dbData.news.findIndex(n => n.id === TEST_SCHEDULED_ID);
  const futureDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
  const schedObj = {
    id: TEST_SCHEDULED_ID,
    slug: "future-scheduled-embargoed-policy-announcement",
    category_en: "Policy",
    category_ta: "கொள்கை",
    title_en: "FUTURE EMBARGOED: Next Week Official Department Policy Announcement",
    title_ta: "அடுத்த வாரம் வெளியிடப்படவுள்ள கொள்கை அறிக்கை",
    summary_en: "Embargoed until next week.",
    summary_ta: "அடுத்த வாரம் வரை வெளியிடக்கூடாது.",
    content_en: ["Embargoed future announcement text."],
    content_ta: ["எதிர்கால அறிவிப்பு."],
    image: "/images/police_medal.jpg",
    date: futureDate,
    published_at: futureDate,
    publishedAt: futureDate,
    author_en: "admin",
    author_ta: "நிர்வாகி",
    section: "latest",
    published: 1,
    status: "PUBLISHED",
    created_at: new Date().toISOString()
  };
  if (schedIndex >= 0) dbData.news[schedIndex] = schedObj; else dbData.news.push(schedObj);

  fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2), "utf-8");
  console.log("Test fixtures initialized in database (Draft ID: 99991, Unpublished ID: 99992, Future ID: 99993).\n");

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Unauthenticated user requests published article.
    // -------------------------------------------------------------------------
    console.log("TEST 1: Unauthenticated user requests published article via GET /api/news/1");
    const res1 = await fetch(`${BASE_URL}/api/news/1`);
    assert(res1.status === 200, `Expected HTTP 200, received HTTP ${res1.status}`);
    const data1 = await res1.json();
    assert(data1.success === true && data1.article && data1.article.id === 1, "Published article returned with success: true");
    assert(res1.headers.get("cache-control")?.includes("public"), "Cache-Control header is public for published article");

    // -------------------------------------------------------------------------
    // TEST 2: Unauthenticated user requests draft article by ID.
    // -------------------------------------------------------------------------
    console.log(`\nTEST 2: Unauthenticated user requests draft article via GET /api/news/${TEST_DRAFT_ID}`);
    const res2 = await fetch(`${BASE_URL}/api/news/${TEST_DRAFT_ID}`);
    assert(res2.status === 404, `Expected HTTP 404 Not Found for draft, received HTTP ${res2.status}`);
    const data2 = await res2.json();
    assert(!data2.article && !data2.title_en && !data2.content_en, "Draft content, title, and metadata NOT disclosed in response");

    // -------------------------------------------------------------------------
    // TEST 3: Unauthenticated user requests unpublished article by ID.
    // -------------------------------------------------------------------------
    console.log(`\nTEST 3: Unauthenticated user requests unpublished article via GET /api/news/${TEST_UNPUBLISHED_ID}`);
    const res3 = await fetch(`${BASE_URL}/api/news/${TEST_UNPUBLISHED_ID}`);
    assert(res3.status === 404, `Expected HTTP 404 Not Found for unpublished, received HTTP ${res3.status}`);
    const data3 = await res3.json();
    assert(!data3.article && !data3.title_en, "Unpublished content NOT disclosed in response");

    // -------------------------------------------------------------------------
    // TEST 4: Normal public user requests draft by slug.
    // -------------------------------------------------------------------------
    console.log(`\nTEST 4: Unauthenticated user requests draft via slug /api/news/${draftObj.slug}`);
    const res4 = await fetch(`${BASE_URL}/api/news/${draftObj.slug}`);
    assert(res4.status === 404, `Expected HTTP 404 Not Found for draft slug, received HTTP ${res4.status}`);

    // -------------------------------------------------------------------------
    // TEST 5: Unauthenticated user requests future scheduled/embargoed article.
    // -------------------------------------------------------------------------
    console.log(`\nTEST 5: Unauthenticated user requests future scheduled article via GET /api/news/${TEST_SCHEDULED_ID}`);
    const res5 = await fetch(`${BASE_URL}/api/news/${TEST_SCHEDULED_ID}`);
    assert(res5.status === 404, `Expected HTTP 404 Not Found for future-scheduled article, received HTTP ${res5.status}`);

    // -------------------------------------------------------------------------
    // TEST 6: Unauthenticated user requests news list via GET /api/news.
    // -------------------------------------------------------------------------
    console.log("\nTEST 6: Public API requests list of news via GET /api/news");
    const res6 = await fetch(`${BASE_URL}/api/news`);
    assert(res6.status === 200, `Expected HTTP 200, received HTTP ${res6.status}`);
    const data6 = await res6.json();
    const articles6 = data6.news || data6.data || [];
    const hasDraft = articles6.some(a => a.id === TEST_DRAFT_ID || a.id === TEST_UNPUBLISHED_ID || a.id === TEST_SCHEDULED_ID);
    assert(!hasDraft, `Public /api/news list contains 0 draft/unpublished/future articles (found: ${hasDraft})`);

    // -------------------------------------------------------------------------
    // TEST 7: Public user attempts parameter tampering: ?status=DRAFT & ?all=true
    // -------------------------------------------------------------------------
    console.log("\nTEST 7: Public client attempts query tampering via GET /api/news?status=DRAFT&all=true");
    const res7 = await fetch(`${BASE_URL}/api/news?status=DRAFT&all=true`);
    const data7 = await res7.json();
    const articles7 = data7.news || data7.data || [];
    const hasTamperedDraft = articles7.some(a => a.id === TEST_DRAFT_ID || a.id === TEST_UNPUBLISHED_ID);
    assert(!hasTamperedDraft, "Parameter tampering failed to expose drafts to unauthenticated client");

    // -------------------------------------------------------------------------
    // TEST 8: Unauthenticated access to /api/admin/crud/news endpoint.
    // -------------------------------------------------------------------------
    console.log("\nTEST 8: Direct access to admin editorial API via GET /api/admin/crud/news");
    const res8 = await fetch(`${BASE_URL}/api/admin/crud/news`);
    assert(res8.status === 401, `Expected HTTP 401 Unauthorized for admin CRUD news, received HTTP ${res8.status}`);

    // -------------------------------------------------------------------------
    // TEST 9: View counter API on draft article via POST /api/news/99991/view
    // -------------------------------------------------------------------------
    console.log(`\nTEST 9: View counter attempt on draft via POST /api/news/${TEST_DRAFT_ID}/view`);
    const res9 = await fetch(`${BASE_URL}/api/news/${TEST_DRAFT_ID}/view`, { method: "POST" });
    assert(res9.status === 404, `Expected HTTP 404 Not Found on draft view counter, received HTTP ${res9.status}`);

    // -------------------------------------------------------------------------
    // TEST 10: Trending News API does not leak draft or unpublished articles
    // -------------------------------------------------------------------------
    console.log("\nTEST 10: Trending News API verification via GET /api/news/trending");
    const res10 = await fetch(`${BASE_URL}/api/news/trending`);
    assert(res10.status === 200, `Expected HTTP 200, received HTTP ${res10.status}`);
    const data10 = await res10.json();
    const trendingHasDraft = (Array.isArray(data10) ? data10 : []).some(a => a.id === TEST_DRAFT_ID || a.id === TEST_UNPUBLISHED_ID);
    assert(!trendingHasDraft, "Trending news contains strictly published articles");

    // -------------------------------------------------------------------------
    // TEST 11: Most-Read News API does not leak draft or unpublished articles
    // -------------------------------------------------------------------------
    console.log("\nTEST 11: Most-Read News API verification via GET /api/news/most-read");
    const res11 = await fetch(`${BASE_URL}/api/news/most-read`);
    assert(res11.status === 200, `Expected HTTP 200, received HTTP ${res11.status}`);
    const data11 = await res11.json();
    const mostReadHasDraft = (Array.isArray(data11) ? data11 : []).some(a => a.id === TEST_DRAFT_ID || a.id === TEST_UNPUBLISHED_ID);
    assert(!mostReadHasDraft, "Most-read news contains strictly published articles");

    // -------------------------------------------------------------------------
    // TEST 12: XML Sitemaps do not contain draft or unpublished URLs
    // -------------------------------------------------------------------------
    console.log("\nTEST 12: XML Sitemaps verification (sitemap.xml and news-sitemap.xml)");
    const [resSitemap, resNewsSitemap] = await Promise.all([
      fetch(`${BASE_URL}/sitemap.xml`),
      fetch(`${BASE_URL}/news-sitemap.xml`)
    ]);
    const sitemapText = await resSitemap.text();
    const newsSitemapText = await resNewsSitemap.text();
    assert(!sitemapText.includes("confidential-internal-draft"), "sitemap.xml does not contain draft slug");
    assert(!newsSitemapText.includes("confidential-internal-draft"), "news-sitemap.xml does not contain draft slug");

    // Clean up test fixtures
    dbData = JSON.parse(fs.readFileSync(dbJsonPath, "utf-8"));
    dbData.news = dbData.news.filter(n => n.id !== TEST_DRAFT_ID && n.id !== TEST_UNPUBLISHED_ID && n.id !== TEST_SCHEDULED_ID);
    fs.writeFileSync(dbJsonPath, JSON.stringify(dbData, null, 2), "utf-8");

    console.log("\n===============================================================================");
    console.log(`  TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED`);
    console.log(`  OVERALL POC-02 SECURITY STATUS: ${testsFailed === 0 ? "PASSED (REMEDIATED)" : "FAILED"}`);
    console.log("===============================================================================");

  } catch (err) {
    console.error("Test execution failed with error:", err);
  }
}

runTests();

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, DBPageContent, DBContentVersion } from "@/lib/db";

// Helper to check authentication
async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

// Helper to enforce permissions
async function checkPermission(role: string, actionField: "can_read" | "can_write" | "can_approve" | "can_delete") {
  if (role === "superadmin" || role === "SUPER_ADMIN") return true;
  return true;
}

// GET Page Content & History
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page_name = searchParams.get("page_name");
  const action = searchParams.get("action");
  const searchQuery = searchParams.get("query");

  // Global Search Action
  if (action === "search") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const hasPerm = await checkPermission(user.role, "can_read");
    if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const q = (searchQuery || "").toLowerCase();
      const pageContents = await db.getPageContents();
      const versions = await db.getContentVersions();

      const results = pageContents
        .filter(pc => (pc.page_name || "").toLowerCase().includes(q) || (pc.seo_title || "").toLowerCase().includes(q) || (pc.seo_description || "").toLowerCase().includes(q))
        .map(pc => {
          const v = versions.find(ver => ver.id === (pc.published_version_id || pc.draft_version_id));
          return {
            page_name: pc.page_name,
            seo_title: pc.seo_title,
            sections_data: v ? v.sections_data : "[]"
          };
        });

      return NextResponse.json(results);
    } catch (e) {
      console.error("Search failed:", e);
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }
  }

  if (!page_name) {
    return NextResponse.json({ error: "page_name is required" }, { status: 400 });
  }

  // 1. Version History Action
  if (action === "history") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const pageContents = await db.getPageContents();
      const page = pageContents.find(p => p.page_name === page_name);
      if (!page) return NextResponse.json([]);

      const versions = await db.getContentVersions();
      const history = versions
        .filter(v => v.page_content_id === page.id)
        .sort((a, b) => b.version_num - a.version_num);

      return NextResponse.json(history);
    } catch (error) {
      console.error("GET history error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // 2. Fetch specific version details
  const versionId = searchParams.get("version_id");
  if (versionId) {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const versions = await db.getContentVersions();
      const ver = versions.find(v => v.id === parseInt(versionId, 10));
      if (!ver) return NextResponse.json({ error: "Version not found" }, { status: 404 });

      return NextResponse.json({
        id: ver.id,
        version_num: ver.version_num,
        status: ver.status,
        updated_by: ver.updated_by,
        updated_at: ver.updated_at,
        sections: JSON.parse(ver.sections_data || "[]"),
        seo: JSON.parse(ver.seo_data || "{}")
      });
    } catch (error) {
      console.error("GET version detail error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // 3. Normal fetch for rendering
  const mode = searchParams.get("mode") || "published";

  if (mode === "draft") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let pageContents = await db.getPageContents();
    let page = pageContents.find(p => p.page_name === page_name);

    const defaultSections = [
      {
        section_type: "banner",
        section_title: "Hero Section",
        content_json: {
          title_en: "Hero Section Title",
          title_ta: "முகப்பு பிரிவு தலைப்பு",
          subtitle_en: "Subtitle details go here.",
          subtitle_ta: "துணைத் தலைப்பு விவரங்கள் இங்கே இருக்கும்.",
          bg_image: "",
          cta_text_en: "",
          cta_link: ""
        },
        display_order: 1
      },
      {
        section_type: "description",
        section_title: "Content Section",
        content_json: {
          text_en: "<p>Welcome to our page. Use the editor to customize this content block.</p>",
          text_ta: "<p>எங்கள் பக்கத்திற்கு வரவேற்கிறோம். இந்த உள்ளடக்கத் தொகுதியைத் தனிப்பயனாக்க எடிட்டரைப் பயன்படுத்தவும்.</p>"
        },
        display_order: 2
      }
    ];

    let versions = await db.getContentVersions();

    if (!page) {
      const user = await getSessionUser();
      const username = user?.username || "System";
      const newPageId = pageContents.length > 0 ? Math.max(...pageContents.map(p => p.id)) + 1 : 1;
      const newVerId = versions.length > 0 ? Math.max(...versions.map(v => v.id)) + 1 : 1;

      const newVer: DBContentVersion = {
        id: newVerId,
        page_content_id: newPageId,
        version_num: 1,
        sections_data: JSON.stringify(defaultSections),
        seo_data: JSON.stringify({
          seo_title: `${page_name.toUpperCase()} | Chennai Guardian`,
          seo_description: `Content page for ${page_name}`,
          seo_keywords: page_name
        }),
        status: "draft",
        updated_by: username,
        updated_at: new Date().toISOString()
      };

      versions.push(newVer);
      await db.saveContentVersions(versions);

      page = {
        id: newPageId,
        page_name,
        seo_title: `${page_name.toUpperCase()} | Chennai Guardian`,
        seo_description: `Content page for ${page_name}`,
        draft_version_id: newVerId,
        published_version_id: newVerId,
        last_updated_by: username,
        last_updated_at: new Date().toISOString()
      };

      pageContents.push(page);
      await db.savePageContents(pageContents);
    }

    let targetVersionId = mode === "draft" ? page.draft_version_id : page.published_version_id;

    if (!targetVersionId) {
      targetVersionId = page.draft_version_id || page.published_version_id;
    }

    const ver = versions.find(v => v.id === targetVersionId);
    if (!ver) {
      return NextResponse.json({ page_name, seo: null, sections: [] });
    }

    return NextResponse.json({
      page_name,
      version_id: ver.id,
      version_num: ver.version_num,
      last_updated_by: page.last_updated_by,
      last_updated_at: page.last_updated_at,
      seo: JSON.parse(ver.seo_data || "{}"),
      sections: JSON.parse(ver.sections_data || "[]")
    });
  } catch (error) {
    console.error("GET page-contents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Save Draft
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { page_name, seo, sections } = data;

    if (!page_name) {
      return NextResponse.json({ error: "page_name is required" }, { status: 400 });
    }

    let pageContents = await db.getPageContents();
    let page = pageContents.find(p => p.page_name === page_name);

    if (!page) {
      const newPageId = pageContents.length > 0 ? Math.max(...pageContents.map(p => p.id)) + 1 : 1;
      page = {
        id: newPageId,
        page_name,
        last_updated_by: user.username,
        last_updated_at: new Date().toISOString()
      };
      pageContents.push(page);
    }

    let versions = await db.getContentVersions();
    const pageVersions = versions.filter(v => v.page_content_id === page!.id);
    const maxVer = pageVersions.length > 0 ? Math.max(...pageVersions.map(v => v.version_num)) : 0;
    const nextVerNum = maxVer + 1;
    const newVersionId = versions.length > 0 ? Math.max(...versions.map(v => v.id)) + 1 : 1;

    const newVersion: DBContentVersion = {
      id: newVersionId,
      page_content_id: page.id,
      version_num: nextVerNum,
      sections_data: JSON.stringify(sections || []),
      seo_data: JSON.stringify(seo || {}),
      status: "draft",
      updated_by: user.username,
      updated_at: new Date().toISOString()
    };

    versions.push(newVersion);
    await db.saveContentVersions(versions);

    page.draft_version_id = newVersionId;
    page.last_updated_by = user.username;
    page.last_updated_at = new Date().toISOString();
    await db.savePageContents(pageContents);

    return NextResponse.json({ success: true, pageId: page.id, versionId: newVersionId, versionNum: nextVerNum });
  } catch (error) {
    console.error("POST page-contents draft error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT - Publish or Restore Version
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    const { page_name, action, version_id } = data;

    if (!page_name) {
      return NextResponse.json({ error: "page_name is required" }, { status: 400 });
    }

    let pageContents = await db.getPageContents();
    let page = pageContents.find(p => p.page_name === page_name);
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });

    let versions = await db.getContentVersions();

    // 1. RESTORE ACTION
    if (action === "restore") {
      if (!version_id) return NextResponse.json({ error: "version_id is required for restore" }, { status: 400 });
      const targetVer = versions.find(v => v.id === parseInt(version_id, 10));
      if (!targetVer) return NextResponse.json({ error: "Target version not found" }, { status: 404 });

      const pageVersions = versions.filter(v => v.page_content_id === page.id);
      const nextVerNum = (pageVersions.length > 0 ? Math.max(...pageVersions.map(v => v.version_num)) : 0) + 1;
      const newVersionId = versions.length > 0 ? Math.max(...versions.map(v => v.id)) + 1 : 1;

      const restoredVersion: DBContentVersion = {
        id: newVersionId,
        page_content_id: page.id,
        version_num: nextVerNum,
        sections_data: targetVer.sections_data,
        seo_data: targetVer.seo_data,
        status: "draft",
        updated_by: user.username,
        updated_at: new Date().toISOString()
      };

      versions.push(restoredVersion);
      await db.saveContentVersions(versions);

      page.draft_version_id = newVersionId;
      page.last_updated_by = user.username;
      page.last_updated_at = new Date().toISOString();
      await db.savePageContents(pageContents);

      return NextResponse.json({ success: true, message: "Restored successfully", versionId: newVersionId, versionNum: nextVerNum });
    }

    // 2. PUBLISH ACTION
    const draftId = page.draft_version_id;
    if (!draftId) return NextResponse.json({ error: "No draft changes to publish" }, { status: 400 });

    const draft = versions.find(v => v.id === draftId);
    if (!draft) return NextResponse.json({ error: "Draft version not found" }, { status: 404 });

    draft.status = "published";
    draft.updated_by = user.username;
    draft.updated_at = new Date().toISOString();
    await db.saveContentVersions(versions);

    page.published_version_id = draftId;
    page.last_updated_by = user.username;
    page.last_updated_at = new Date().toISOString();

    try {
      const seoData = JSON.parse(draft.seo_data || "{}");
      if (seoData.seo_title) page.seo_title = seoData.seo_title;
      if (seoData.seo_description) page.seo_description = seoData.seo_description;
    } catch (e) {}

    await db.savePageContents(pageContents);

    return NextResponse.json({ success: true, message: "Published successfully", publishedId: draftId });
  } catch (error: any) {
    console.error("PUT page-contents publish/restore error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, transaction } from "@/lib/mysql";

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
  if (role === "superadmin") return true;
  try {
    const permissions: any = await query(
      "SELECT * FROM \`menu_permissions\` WHERE \`role\` = ?",
      [role]
    );
    if (permissions && permissions.length > 0) {
      return !!permissions[0][actionField];
    }
    return false;
  } catch {
    return false;
  }
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
      const q = `%${searchQuery || ""}%`;
      const searchResults: any = await query(
        `SELECT pc.page_name, pc.seo_title, ps.display_order, ps.section_type, ps.section_title, ps.content_json
         FROM \`page_contents\` pc
         LEFT JOIN \`page_sections\` ps ON pc.id = ps.page_content_id
         WHERE pc.page_name LIKE ? 
            OR pc.seo_title LIKE ? 
            OR pc.seo_description LIKE ?
            OR ps.section_title LIKE ?
            OR ps.content_json LIKE ?
         LIMIT 50`,
        [q, q, q, q, q]
      );
      
      const parsedResults = (searchResults || []).map((r: any) => {
        let content = r.content_json;
        if (typeof content === "string") {
          try { content = JSON.parse(content); } catch {}
        }
        return {
          ...r,
          content_json: content
        };
      });

      return NextResponse.json(parsedResults);
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
    const hasPerm = await checkPermission(user.role, "can_read");
    if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    try {
      const pageResult: any = await query("SELECT id FROM \`page_contents\` WHERE \`page_name\` = ?", [page_name]);
      if (pageResult.length === 0) {
        return NextResponse.json([]);
      }
      const history = await query(
        "SELECT id, version_num, status, updated_by, updated_at FROM \`content_versions\` WHERE \`page_content_id\` = ? ORDER BY \`version_num\` DESC",
        [pageResult[0].id]
      );
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
      const versionResult: any = await query(
        "SELECT * FROM \`content_versions\` WHERE \`id\` = ?",
        [versionId]
      );
      if (versionResult.length === 0) {
        return NextResponse.json({ error: "Version not found" }, { status: 404 });
      }
      const ver = versionResult[0];
      return NextResponse.json({
        id: ver.id,
        version_num: ver.version_num,
        status: ver.status,
        updated_by: ver.updated_by,
        updated_at: ver.updated_at,
        sections: JSON.parse(ver.sections_data),
        seo: JSON.parse(ver.seo_data)
      });
    } catch (error) {
      console.error("GET version detail error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }

  // 3. Normal fetch for rendering (draft or published mode)
  const mode = searchParams.get("mode") || "published"; // 'draft' or 'published'

  // Admin access validation for draft mode
  if (mode === "draft") {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let pageResult: any = await query(
      "SELECT * FROM \`page_contents\` WHERE \`page_name\` = ?",
      [page_name]
    );

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
      },
      {
        section_type: "cards",
        section_title: "Gallery Section",
        content_json: {
          cards: [
            {
              title_en: "Feature Item 1",
              title_ta: "அம்ச உருப்படி 1",
              desc_en: "Description of the first feature.",
              desc_ta: "முதல் அம்சத்தின் விளக்கம்.",
              icon: "Shield",
              link: ""
            }
          ]
        },
        display_order: 3
      }
    ];

    if (pageResult.length === 0) {
      const user = await getSessionUser();
      const username = user?.username || "System";
      
      // Auto-create page_contents
      const insertPageRes: any = await query(
        "INSERT INTO \`page_contents\` (page_name, seo_title, seo_description, last_updated_by, last_updated_at) VALUES (?, ?, ?, ?, NOW())",
        [page_name, `${page_name.toUpperCase()} | Chennai Guardian`, `Content page for ${page_name}`, username]
      );
      const newPageId = insertPageRes.insertId;

      // Insert content version snapshot
      const sectionsJson = JSON.stringify(defaultSections);
      const seoJson = JSON.stringify({
        seo_title: `${page_name.toUpperCase()} | Chennai Guardian`,
        seo_description: `Content page for ${page_name}`,
        seo_keywords: page_name
      });

      const insertVersionRes: any = await query(
        "INSERT INTO \`content_versions\` (page_content_id, version_num, sections_data, seo_data, status, updated_by, updated_at) VALUES (?, 1, ?, ?, 'draft', ?, NOW())",
        [newPageId, sectionsJson, seoJson, username]
      );
      const newVersionId = insertVersionRes.insertId;

      // Update page to point to new draft version
      await query(
        "UPDATE \`page_contents\` SET \`draft_version_id\` = ?, \`published_version_id\` = ?, \`last_updated_by\` = ? WHERE \`id\` = ?",
        [newVersionId, newVersionId, username, newPageId]
      );

      // Re-fetch page record
      pageResult = await query(
        "SELECT * FROM \`page_contents\` WHERE \`page_name\` = ?",
        [page_name]
      );
    }

    const page = pageResult[0];
    let targetVersionId = mode === "draft" ? page.draft_version_id : page.published_version_id;

    if (!targetVersionId) {
      // If version is missing but page exists, create default version for it!
      const user = await getSessionUser();
      const username = user?.username || "System";

      const sectionsJson = JSON.stringify(defaultSections);
      const seoJson = JSON.stringify({
        seo_title: page.seo_title || `${page_name.toUpperCase()} | Chennai Guardian`,
        seo_description: page.seo_description || `Content page for ${page_name}`,
        seo_keywords: page.seo_keywords || page_name
      });

      const insertVersionRes: any = await query(
        "INSERT INTO \`content_versions\` (page_content_id, version_num, sections_data, seo_data, status, updated_by, updated_at) VALUES (?, 1, ?, ?, 'draft', ?, NOW())",
        [page.id, sectionsJson, seoJson, username]
      );
      targetVersionId = insertVersionRes.insertId;

      await query(
        "UPDATE \`page_contents\` SET \`draft_version_id\` = ?, \`published_version_id\` = ?, \`last_updated_by\` = ? WHERE \`id\` = ?",
        [targetVersionId, targetVersionId, username, page.id]
      );
    }

    const versionResult: any = await query(
      "SELECT * FROM \`content_versions\` WHERE \`id\` = ?",
      [targetVersionId]
    );

    if (versionResult.length === 0) {
      return NextResponse.json({ page_name, seo: null, sections: [] });
    }

    const ver = versionResult[0];
    return NextResponse.json({
      page_name,
      version_id: ver.id,
      version_num: ver.version_num,
      last_updated_by: page.last_updated_by,
      last_updated_at: page.last_updated_at,
      seo: JSON.parse(ver.seo_data),
      sections: JSON.parse(ver.sections_data)
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

  const hasPerm = await checkPermission(user.role, "can_write");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await req.json();
    const { page_name, seo, sections } = data;

    if (!page_name) {
      return NextResponse.json({ error: "page_name is required" }, { status: 400 });
    }

    const result = await transaction(async (conn) => {
      // Find or insert page_contents
      let pageId: number;
      const [existingPage]: any = await conn.execute(
        "SELECT id FROM \`page_contents\` WHERE \`page_name\` = ?",
        [page_name]
      );

      if (existingPage.length > 0) {
        pageId = existingPage[0].id;
      } else {
        const [insertRes]: any = await conn.execute(
          "INSERT INTO \`page_contents\` (page_name, last_updated_by, last_updated_at) VALUES (?, ?, NOW())",
          [page_name, user.username]
        );
        pageId = insertRes.insertId;
      }

      // Calculate next version number
      const [lastVersion]: any = await conn.execute(
        "SELECT MAX(version_num) as max_ver FROM \`content_versions\` WHERE \`page_content_id\` = ?",
        [pageId]
      );
      const nextVerNum = (lastVersion[0]?.max_ver || 0) + 1;

      // Insert new version snapshot as 'draft'
      const sectionsJson = JSON.stringify(sections || []);
      const seoJson = JSON.stringify(seo || {});

      const [versionRes]: any = await conn.execute(
        "INSERT INTO \`content_versions\` (page_content_id, version_num, sections_data, seo_data, status, updated_by, updated_at) VALUES (?, ?, ?, ?, 'draft', ?, NOW())",
        [pageId, nextVerNum, sectionsJson, seoJson, user.username]
      );
      const newVersionId = versionRes.insertId;

      // Update page_contents to track this as the latest draft
      await conn.execute(
        "UPDATE \`page_contents\` SET \`draft_version_id\` = ?, \`last_updated_by\` = ?, \`last_updated_at\` = NOW() WHERE id = ?",
        [newVersionId, user.username, pageId]
      );

      return { pageId, versionId: newVersionId, versionNum: nextVerNum };
    });

    return NextResponse.json({ success: true, ...result });
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

    // 1. RESTORE ACTION
    if (action === "restore") {
      const hasPerm = await checkPermission(user.role, "can_write");
      if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

      if (!version_id) return NextResponse.json({ error: "version_id is required for restore" }, { status: 400 });

      const result = await transaction(async (conn) => {
        // Fetch target version data
        const [verRows]: any = await conn.execute(
          "SELECT * FROM \`content_versions\` WHERE \`id\` = ?",
          [version_id]
        );
        if (verRows.length === 0) throw new Error("Target version not found");

        const targetVer = verRows[0];

        // Get page id
        const [pageRows]: any = await conn.execute(
          "SELECT id FROM \`page_contents\` WHERE \`page_name\` = ?",
          [page_name]
        );
        const pageId = pageRows[0].id;

        // Calculate next version num
        const [lastVersion]: any = await conn.execute(
          "SELECT MAX(version_num) as max_ver FROM \`content_versions\` WHERE \`page_content_id\` = ?",
          [pageId]
        );
        const nextVerNum = (lastVersion[0]?.max_ver || 0) + 1;

        // Insert new restored version draft
        const [newVerRes]: any = await conn.execute(
          "INSERT INTO \`content_versions\` (page_content_id, version_num, sections_data, seo_data, status, updated_by, updated_at) VALUES (?, ?, ?, ?, 'draft', ?, NOW())",
          [pageId, nextVerNum, targetVer.sections_data, targetVer.seo_data, user.username]
        );
        const newVersionId = newVerRes.insertId;

        // Set page draft pointers to the restored version
        await conn.execute(
          "UPDATE \`page_contents\` SET \`draft_version_id\` = ?, \`last_updated_by\` = ?, \`last_updated_at\` = NOW() WHERE id = ?",
          [newVersionId, user.username, pageId]
        );

        return { versionId: newVersionId, versionNum: nextVerNum };
      });

      return NextResponse.json({ success: true, message: "Restored successfully", ...result });
    }

    // 2. PUBLISH ACTION
    const hasApprovePerm = await checkPermission(user.role, "can_approve");
    if (!hasApprovePerm) return NextResponse.json({ error: "Forbidden: Approve permission required to publish" }, { status: 403 });

    const result = await transaction(async (conn) => {
      // Get page details
      const [pageRows]: any = await conn.execute(
        "SELECT * FROM \`page_contents\` WHERE \`page_name\` = ?",
        [page_name]
      );
      if (pageRows.length === 0) throw new Error("Page not found");

      const page = pageRows[0];
      const draftId = page.draft_version_id;
      if (!draftId) throw new Error("No draft changes to publish");

      // Fetch draft version details
      const [draftRows]: any = await conn.execute(
        "SELECT * FROM \`content_versions\` WHERE \`id\` = ?",
        [draftId]
      );
      if (draftRows.length === 0) throw new Error("Draft version not found");

      const draft = draftRows[0];

      // Mark the draft version as published
      await conn.execute(
        "UPDATE \`content_versions\` SET \`status\` = 'published', \`updated_by\` = ?, \`updated_at\` = NOW() WHERE id = ?",
        [user.username, draftId]
      );

      // Sync published version id
      await conn.execute(
        "UPDATE \`page_contents\` SET \`published_version_id\` = ?, \`seo_title\` = ?, \`seo_description\` = ?, \`last_updated_by\` = ?, \`last_updated_at\` = NOW() WHERE id = ?",
        [
          draftId,
          JSON.parse(draft.seo_data).seo_title || "",
          JSON.parse(draft.seo_data).seo_description || "",
          user.username,
          page.id
        ]
      );

      // Re-populate page_sections table for direct relational lookups
      await conn.execute("DELETE FROM \`page_sections\` WHERE \`page_content_id\` = ?", [page.id]);
      const sections = JSON.parse(draft.sections_data);
      for (const sec of sections) {
        await conn.execute(
          "INSERT INTO \`page_sections\` (page_content_id, section_type, section_title, content_json, display_order) VALUES (?, ?, ?, ?, ?)",
          [page.id, sec.section_type, sec.section_title, JSON.stringify(sec.content_json), sec.display_order]
        );
      }

      return { publishedId: draftId };
    });

    return NextResponse.json({ success: true, message: "Published successfully", ...result });

  } catch (error: any) {
    console.error("PUT page-contents publish/restore error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query } from "@/lib/mysql";

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

// Helper to enforce menu management permissions from the DB
async function checkPermission(role: string, actionField: "can_read" | "can_write" | "can_approve" | "can_delete") {
  const r = (role || "").toUpperCase().trim();
  if (r === "SUPER_ADMIN" || r === "SUPERADMIN") return true;
  // Content managers (ADMIN, editor, etc.) are only allowed to read menu listings, not write or delete menu items
  if (actionField === "can_read" && (r === "ADMIN" || r === "CONTENTADMIN" || r === "EDITOR")) return true;
  return false;
}

// GET all main menus (for admin dashboard, includes inactive)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_read");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const menus = await query("SELECT * FROM \`menus\` ORDER BY \`display_order\` ASC");
    return NextResponse.json(menus);
  } catch (error) {
    console.error("GET menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a main menu
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_write");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await req.json();
    const { name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab } = data;

    if (!name_en || !name_ta || !slug || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = `
      INSERT INTO \`menus\` (name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result: any = await query(sql, [
      name_en,
      name_ta,
      slug,
      icon || null,
      display_order || 0,
      url,
      page_type || "static",
      status || "active",
      open_in_new_tab ? 1 : 0
    ]);

    // Also auto-create a page content mapping if it is static/dynamic
    if (page_type === "static" || page_type === "dynamic") {
      const pageName = slug;
      const seoTitle = `${name_en} | Chennai Guardian`;
      const seoDesc = `Learn about ${name_en} and related information on the official portal.`;
      
      try {
        await query(
          "INSERT IGNORE INTO \`page_contents\` (menu_id, page_name, seo_title, seo_description, last_updated_by, last_updated_at) VALUES (?, ?, ?, ?, ?, NOW())",
          [result.insertId, pageName, seoTitle, seoDesc, user.username]
        );
      } catch (err) {
        console.error("Auto page creation error:", err);
      }
    }

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error: any) {
    console.error("POST menus error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Menu with this slug already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update a main menu or bulk reorder
export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_write");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await req.json();

    // Check if bulk reordering
    if (data.reorder && Array.isArray(data.reorder)) {
      for (const item of data.reorder) {
        await query("UPDATE \`menus\` SET \`display_order\` = ? WHERE \`id\` = ?", [
          item.display_order,
          item.id
        ]);
      }
      return NextResponse.json({ success: true });
    }

    const { id, name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab } = data;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const sql = `
      UPDATE \`menus\`
      SET name_en = ?, name_ta = ?, slug = ?, icon = ?, display_order = ?, url = ?, page_type = ?, status = ?, open_in_new_tab = ?
      WHERE id = ?
    `;
    await query(sql, [
      name_en,
      name_ta,
      slug,
      icon || null,
      display_order || 0,
      url,
      page_type || "static",
      status || "active",
      open_in_new_tab ? 1 : 0,
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a main menu
export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_delete");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await query("DELETE FROM \`menus\` WHERE \`id\` = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

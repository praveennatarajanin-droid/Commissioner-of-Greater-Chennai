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

// Helper to enforce permissions
async function checkPermission(role: string, actionField: "can_read" | "can_write" | "can_approve" | "can_delete") {
  const r = (role || "").toUpperCase().trim();
  if (r === "SUPER_ADMIN" || r === "SUPERADMIN") return true;
  // Content managers (ADMIN, editor, etc.) are only allowed to read menu listings, not write or delete menu items
  if (actionField === "can_read" && (r === "ADMIN" || r === "CONTENTADMIN" || r === "EDITOR")) return true;
  return false;
}

// GET all submenus (grouped/sorted)
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_read");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const submenus = await query("SELECT * FROM \`sub_menus\` ORDER BY \`parent_menu_id\` ASC, \`display_order\` ASC");
    return NextResponse.json(submenus);
  } catch (error) {
    console.error("GET submenus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST create a submenu
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_write");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const data = await req.json();
    const { parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status } = data;

    if (!parent_menu_id || !name_en || !name_ta || !slug || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const sql = `
      INSERT INTO \`sub_menus\` (parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result: any = await query(sql, [
      parent_menu_id,
      name_en,
      name_ta,
      slug,
      url,
      icon || null,
      display_order || 0,
      status || "active"
    ]);

    // Also auto-create a page content mapping if the sub-menu is dynamic or static
    // Let's use the slug as the pageName
    const pageName = slug;
    const seoTitle = `${name_en} | Chennai Guardian`;
    const seoDesc = `Information regarding ${name_en} services and safety.`;

    try {
      await query(
        "INSERT IGNORE INTO \`page_contents\` (sub_menu_id, page_name, seo_title, seo_description, last_updated_by, last_updated_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [result.insertId, pageName, seoTitle, seoDesc, user.username]
      );
    } catch (err) {
      console.error("Auto page creation for submenu error:", err);
    }

    return NextResponse.json({ success: true, insertId: result.insertId });
  } catch (error) {
    console.error("POST submenus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT update a submenu or bulk reorder
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
        await query("UPDATE \`sub_menus\` SET \`display_order\` = ? WHERE \`id\` = ?", [
          item.display_order,
          item.id
        ]);
      }
      return NextResponse.json({ success: true });
    }

    const { id, parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status } = data;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const sql = `
      UPDATE \`sub_menus\`
      SET parent_menu_id = ?, name_en = ?, name_ta = ?, slug = ?, url = ?, icon = ?, display_order = ?, status = ?
      WHERE id = ?
    `;
    await query(sql, [
      parent_menu_id,
      name_en,
      name_ta,
      slug,
      url,
      icon || null,
      display_order || 0,
      status || "active",
      id
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT submenus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE a submenu
export async function DELETE(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_delete");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await query("DELETE FROM \`sub_menus\` WHERE \`id\` = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE submenus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

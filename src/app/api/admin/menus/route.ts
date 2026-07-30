import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, DBMenu } from "@/lib/db";

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

// Helper to enforce menu management permissions
async function checkPermission(role: string, actionField: "can_read" | "can_write" | "can_approve" | "can_delete") {
  const r = (role || "").toUpperCase().trim();
  if (r === "SUPER_ADMIN" || r === "SUPERADMIN") return true;
  if (actionField === "can_read" && (r === "ADMIN" || r === "CONTENTADMIN" || r === "EDITOR")) return true;
  return false;
}

// GET all main menus
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_read");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const menus = await db.getMenus();
    menus.sort((a, b) => a.display_order - b.display_order);
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

    const menus = await db.getMenus();
    if (menus.some(m => m.slug === slug)) {
      return NextResponse.json({ error: "Menu with this slug already exists" }, { status: 400 });
    }

    const newId = menus.length > 0 ? Math.max(...menus.map(m => m.id)) + 1 : 1;
    const newMenu: DBMenu = {
      id: newId,
      name_en,
      name_ta,
      slug,
      icon: icon || null,
      display_order: display_order || menus.length + 1,
      url,
      page_type: page_type || "static",
      status: status || "active",
      open_in_new_tab: open_in_new_tab ? 1 : 0
    };

    menus.push(newMenu);
    await db.saveMenus(menus);

    return NextResponse.json({ success: true, insertId: newId });
  } catch (error: any) {
    console.error("POST menus error:", error);
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
    let menus = await db.getMenus();

    if (data.reorder && Array.isArray(data.reorder)) {
      const orderMap = new Map<number, number>();
      data.reorder.forEach((item: any) => orderMap.set(item.id, item.display_order));

      menus = menus.map(m => {
        if (orderMap.has(m.id)) {
          return { ...m, display_order: orderMap.get(m.id)! };
        }
        return m;
      });
      await db.saveMenus(menus);
      return NextResponse.json({ success: true });
    }

    const { id, name_en, name_ta, slug, icon, display_order, url, page_type, status, open_in_new_tab } = data;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    menus = menus.map(m => {
      if (m.id === id) {
        return {
          ...m,
          name_en: name_en ?? m.name_en,
          name_ta: name_ta ?? m.name_ta,
          slug: slug ?? m.slug,
          icon: icon !== undefined ? icon : m.icon,
          display_order: display_order ?? m.display_order,
          url: url ?? m.url,
          page_type: page_type ?? m.page_type,
          status: status ?? m.status,
          open_in_new_tab: open_in_new_tab !== undefined ? (open_in_new_tab ? 1 : 0) : m.open_in_new_tab
        };
      }
      return m;
    });

    await db.saveMenus(menus);
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
    const idStr = searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const id = parseInt(idStr, 10);
    let menus = await db.getMenus();
    menus = menus.filter(m => m.id !== id);
    await db.saveMenus(menus);

    let subMenus = await db.getSubMenus();
    subMenus = subMenus.filter(s => s.parent_menu_id !== id);
    await db.saveSubMenus(subMenus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE menus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

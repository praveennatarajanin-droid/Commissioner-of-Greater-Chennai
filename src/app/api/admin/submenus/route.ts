import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, DBSubMenu } from "@/lib/db";

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
  if (actionField === "can_read" && (r === "ADMIN" || r === "CONTENTADMIN" || r === "EDITOR")) return true;
  return false;
}

// GET all submenus
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hasPerm = await checkPermission(user.role, "can_read");
  if (!hasPerm) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const submenus = await db.getSubMenus();
    submenus.sort((a, b) => {
      if (a.parent_menu_id !== b.parent_menu_id) return a.parent_menu_id - b.parent_menu_id;
      return a.display_order - b.display_order;
    });
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

    const submenus = await db.getSubMenus();
    const newId = submenus.length > 0 ? Math.max(...submenus.map(s => s.id)) + 1 : 1;
    const newSub: DBSubMenu = {
      id: newId,
      parent_menu_id: Number(parent_menu_id),
      name_en,
      name_ta,
      slug,
      url,
      icon: icon || null,
      display_order: display_order || submenus.length + 1,
      status: status || "active"
    };

    submenus.push(newSub);
    await db.saveSubMenus(submenus);

    return NextResponse.json({ success: true, insertId: newId });
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
    let submenus = await db.getSubMenus();

    if (data.reorder && Array.isArray(data.reorder)) {
      const orderMap = new Map<number, number>();
      data.reorder.forEach((item: any) => orderMap.set(item.id, item.display_order));

      submenus = submenus.map(s => {
        if (orderMap.has(s.id)) {
          return { ...s, display_order: orderMap.get(s.id)! };
        }
        return s;
      });
      await db.saveSubMenus(submenus);
      return NextResponse.json({ success: true });
    }

    const { id, parent_menu_id, name_en, name_ta, slug, url, icon, display_order, status } = data;
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    submenus = submenus.map(s => {
      if (s.id === id) {
        return {
          ...s,
          parent_menu_id: parent_menu_id !== undefined ? Number(parent_menu_id) : s.parent_menu_id,
          name_en: name_en ?? s.name_en,
          name_ta: name_ta ?? s.name_ta,
          slug: slug ?? s.slug,
          url: url ?? s.url,
          icon: icon !== undefined ? icon : s.icon,
          display_order: display_order ?? s.display_order,
          status: status ?? s.status
        };
      }
      return s;
    });

    await db.saveSubMenus(submenus);
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
    const idStr = searchParams.get("id");
    if (!idStr) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    const id = parseInt(idStr, 10);
    let submenus = await db.getSubMenus();
    submenus = submenus.filter(s => s.id !== id);
    await db.saveSubMenus(submenus);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE submenus error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

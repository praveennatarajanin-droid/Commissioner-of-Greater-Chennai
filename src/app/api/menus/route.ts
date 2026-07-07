import { NextResponse } from "next/server";
import { query } from "@/lib/mysql";

export async function GET() {
  try {
    const menus: any = await query("SELECT * FROM \`menus\` WHERE \`status\` = 'active' ORDER BY \`display_order\` ASC");
    const subMenus: any = await query("SELECT * FROM \`sub_menus\` WHERE \`status\` = 'active' ORDER BY \`display_order\` ASC");

    const menuMap = menus.map((menu: any) => {
      return {
        ...menu,
        subMenus: subMenus.filter((sub: any) => sub.parent_menu_id === menu.id),
      };
    });

    return NextResponse.json(menuMap);
  } catch (error: any) {
    console.error("Failed to fetch public menus:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

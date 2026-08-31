import { NextResponse } from "next/server";
import { authenticateApiRequest, authorizeRole, forbiddenResponse } from "@/lib/security";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin authorization required to view security audit events.");
    }

    const events = await db.getSecurityEvents();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Security Events GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

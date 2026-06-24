import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

// ─── Allowed file extensions (whitelist) ────────────────────────────────────
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".svg"]);

// ─── Auth helper ─────────────────────────────────────────────────────────────
async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie?.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  // 🔐 Security: require valid admin session
  const auth = await checkAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 🔐 Security: validate file extension against whitelist
    const rawExt = path.extname(file.name).toLowerCase() || ".jpg";
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), "public/uploads");

    // Ensure the uploads directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique sanitized filename
    const filename = `upload_${Date.now()}${rawExt}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl });
  } catch (e) {
    console.error("File upload error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

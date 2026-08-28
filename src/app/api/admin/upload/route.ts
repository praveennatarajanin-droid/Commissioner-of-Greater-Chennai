import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { cookies } from "next/headers";

// Shared memory cache declaration for serverless runtimes
declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

if (!globalThis.__UPLOAD_CACHE__) {
  globalThis.__UPLOAD_CACHE__ = new Map();
}

// Allowed file extensions (whitelist)
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf", ".svg", ".mp4", ".webm"]);

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

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

    const rawExt = path.extname(file.name).toLowerCase() || ".jpg";
    if (!ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        { error: `File type not allowed. Allowed types: ${[...ALLOWED_EXTENSIONS].join(", ")}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${rawExt}`;
    const mime = MIME_TYPES[rawExt] || "application/octet-stream";

    // Store in global RAM cache for fast serverless fallback
    globalThis.__UPLOAD_CACHE__.set(filename, { buffer, mime });

    // Attempt to write to public/uploads
    let written = false;
    try {
      const publicUploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(publicUploadDir)) {
        fs.mkdirSync(publicUploadDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicUploadDir, filename), buffer);
      written = true;
    } catch (e) {
      console.warn("Could not write to public/uploads (read-only filesystem?), attempting tmp directory:", e);
    }

    // Fallback write to os.tmpdir()/uploads if public is read-only
    if (!written) {
      try {
        const tmpUploadDir = path.join(os.tmpdir(), "uploads");
        if (!fs.existsSync(tmpUploadDir)) {
          fs.mkdirSync(tmpUploadDir, { recursive: true });
        }
        fs.writeFileSync(path.join(tmpUploadDir, filename), buffer);
      } catch (err) {
        console.warn("Could not write to tmp directory:", err);
      }
    }

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url: publicUrl, filename });
  } catch (e) {
    console.error("File upload error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

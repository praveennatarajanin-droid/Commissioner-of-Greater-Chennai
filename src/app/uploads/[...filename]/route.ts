import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

// Shared memory cache for serverless environments
declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

if (!globalThis.__UPLOAD_CACHE__) {
  globalThis.__UPLOAD_CACHE__ = new Map();
}

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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filenameArray = resolvedParams.filename;
    
    if (!filenameArray || filenameArray.length === 0) {
      return new NextResponse("File not specified", { status: 400 });
    }

    const filename = filenameArray.join("/");
    // Sanitize filename to prevent directory traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, "");
    const ext = path.extname(safeFilename).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    // 1. Check in-memory cache first
    const cached = globalThis.__UPLOAD_CACHE__.get(safeFilename);
    if (cached) {
      return new NextResponse(new Uint8Array(cached.buffer), {
        status: 200,
        headers: {
          "Content-Type": cached.mime || contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 2. Check public/uploads
    const publicPath = path.join(process.cwd(), "public", "uploads", safeFilename);
    if (fs.existsSync(publicPath)) {
      const buffer = fs.readFileSync(publicPath);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 3. Check os.tmpdir()/uploads (for serverless writable fallback)
    const tmpPath = path.join(os.tmpdir(), "uploads", safeFilename);
    if (fs.existsSync(tmpPath)) {
      const buffer = fs.readFileSync(tmpPath);
      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new NextResponse("File Not Found", { status: 404 });
  } catch (err) {
    console.error("Dynamic upload serving error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";

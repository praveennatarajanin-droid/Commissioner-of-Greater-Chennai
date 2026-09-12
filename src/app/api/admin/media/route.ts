import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { db } from "@/lib/db";
import { authenticateApiRequest, authorizeRole, forbiddenResponse, unauthorizedResponse } from "@/lib/security";

declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

export async function GET(req: Request) {
  // Enforce server-side authentication
  const { user, errorResponse } = await authenticateApiRequest(req);
  if (errorResponse) return errorResponse;
  if (!user) return unauthorizedResponse("Authentication required to access media management registry.");

  if (!authorizeRole(user, ["SUPER_ADMIN", "ADMIN", "CONTENTADMIN", "EDITOR"])) {
    return forbiddenResponse("Insufficient administrative privileges to view media assets.");
  }

  try {
    const publicUploadDir = path.join(process.cwd(), "public/uploads");
    const tmpUploadDir = path.join(os.tmpdir(), "uploads");

    const foundFilesMap = new Map<string, { name: string; size: number; mtime: Date }>();

    // 1. Scan public/uploads
    if (fs.existsSync(publicUploadDir)) {
      try {
        const publicFiles = fs.readdirSync(publicUploadDir);
        for (const file of publicFiles) {
          if (file === "quarantine" || file.startsWith(".")) continue;
          const filePath = path.join(publicUploadDir, file);
          try {
            const stats = fs.statSync(filePath);
            if (stats.isFile()) {
              foundFilesMap.set(file, { name: file, size: stats.size, mtime: stats.mtime });
            }
          } catch (e) {}
        }
      } catch (e) {}
    }

    // 2. Scan tmp/uploads
    if (fs.existsSync(tmpUploadDir)) {
      try {
        const tmpFiles = fs.readdirSync(tmpUploadDir);
        for (const file of tmpFiles) {
          if (file.startsWith(".")) continue;
          if (!foundFilesMap.has(file)) {
            const filePath = path.join(tmpUploadDir, file);
            try {
              const stats = fs.statSync(filePath);
              if (stats.isFile()) {
                foundFilesMap.set(file, { name: file, size: stats.size, mtime: stats.mtime });
              }
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // 3. Scan memory cache
    if (globalThis.__UPLOAD_CACHE__) {
      for (const [filename, item] of globalThis.__UPLOAD_CACHE__.entries()) {
        if (!foundFilesMap.has(filename)) {
          foundFilesMap.set(filename, { name: filename, size: item.buffer.length, mtime: new Date() });
        }
      }
    }

    // Load asset metadata from DB to merge
    const dbMetadata = await db.getAssetMetadata();
    let nextId = dbMetadata.length > 0 ? Math.max(...dbMetadata.map(i => i.id)) + 1 : 1;

    const mediaList = Array.from(foundFilesMap.values()).map(({ name: file, size, mtime }) => {
      const url = `/uploads/${file}`;
      let meta = dbMetadata.find((m: any) => m.image === url || m.url === url);

      if (!meta) {
        const baseName = path.basename(file, path.extname(file));
        const prettyTitle = baseName
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, c => c.toUpperCase());

        meta = {
          id: nextId++,
          image: url,
          title: prettyTitle,
          category: "General",
          articleId: null,
          articleSlug: null,
          createdAt: mtime.toISOString(),
        };
      }

      const safeMeta = meta as any;
      return {
        id: safeMeta.id,
        name: file,
        url: url,
        size: size,
        mime: file.endsWith(".png") ? "image/png" : file.endsWith(".webp") ? "image/webp" : file.endsWith(".pdf") ? "application/pdf" : file.endsWith(".mp4") ? "video/mp4" : "image/jpeg",
        title: safeMeta.title || file,
        category: safeMeta.category || "General",
        articleId: safeMeta.articleId || null,
        articleSlug: safeMeta.articleSlug || null,
        updatedAt: mtime.toISOString(),
      };
    });

    // Merge registered media_files DB records
    const registeredMedia = await db.getMediaFiles();

    mediaList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ success: true, files: mediaList, registered: registeredMedia });
  } catch (e) {
    console.error("Media list error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const { user, errorResponse } = await authenticateApiRequest(req);
  if (errorResponse) return errorResponse;
  if (!user || !authorizeRole(user, ["SUPER_ADMIN", "ADMIN", "CONTENTADMIN", "EDITOR"])) {
    return forbiddenResponse("Unauthorized to update media metadata.");
  }

  try {
    const data = await req.json();
    if (!data.url) {
      return NextResponse.json({ error: "Image URL required" }, { status: 400 });
    }

    const dbMetadata = await db.getAssetMetadata();
    const item = dbMetadata.find((m: any) => m.image === data.url || m.url === data.url);
    if (item) {
      if (data.title !== undefined) item.title = data.title;
      if (data.category !== undefined) item.category = data.category;
      if (data.articleId !== undefined) item.articleId = data.articleId;
      if (data.articleSlug !== undefined) item.articleSlug = data.articleSlug;
      if (data.associated_news_id !== undefined) item.articleId = data.associated_news_id;
      item.createdAt = item.createdAt || new Date().toISOString();

      await db.saveAssetMetadata(dbMetadata);
      return NextResponse.json({ success: true, item });
    } else {
      return NextResponse.json({ error: "Asset metadata not found" }, { status: 404 });
    }
  } catch (e) {
    console.error("Media metadata update error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { user, errorResponse } = await authenticateApiRequest(req);
  if (errorResponse) return errorResponse;
  if (!user || !authorizeRole(user, ["SUPER_ADMIN", "ADMIN", "CONTENTADMIN"])) {
    return forbiddenResponse("Unauthorized to delete media assets.");
  }

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("file");
    const rawId = searchParams.get("id");

    if (rawId) {
      const id = parseInt(rawId, 10);
      if (!isNaN(id)) {
        await db.deleteMediaFile(id);
        return NextResponse.json({ success: true });
      }
    }

    if (!filename) {
      return NextResponse.json({ error: "File name or ID required" }, { status: 400 });
    }

    const safeFilename = path.basename(filename);
    const publicPath = path.join(process.cwd(), "public/uploads", safeFilename);
    const tmpPath = path.join(os.tmpdir(), "uploads", safeFilename);

    if (fs.existsSync(publicPath)) {
      try { fs.unlinkSync(publicPath); } catch (e) {}
    }
    if (fs.existsSync(tmpPath)) {
      try { fs.unlinkSync(tmpPath); } catch (e) {}
    }
    if (globalThis.__UPLOAD_CACHE__) {
      globalThis.__UPLOAD_CACHE__.delete(safeFilename);
    }

    const url = `/uploads/${safeFilename}`;
    const dbMetadata = await db.getAssetMetadata();
    const filteredMetadata = dbMetadata.filter((m: any) => m.image !== url && m.url !== url);
    if (dbMetadata.length !== filteredMetadata.length) {
      await db.saveAssetMetadata(filteredMetadata);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Media delete error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

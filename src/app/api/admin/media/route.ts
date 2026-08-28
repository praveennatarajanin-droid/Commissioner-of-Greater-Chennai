import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

async function checkAuth(requiredRoles?: string[]) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const user = JSON.parse(sessionCookie.value);
    if (requiredRoles) {
      const userRole = (user.role || "").toUpperCase().replace(/[_\s]+/g, "");
      const normalizedRequired = requiredRoles.map(r => r.toUpperCase().replace(/[_\s]+/g, ""));
      if (!normalizedRequired.includes(userRole)) {
        return null;
      }
    }
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const publicUploadDir = path.join(process.cwd(), "public/uploads");
    const tmpUploadDir = path.join(os.tmpdir(), "uploads");

    const foundFilesMap = new Map<string, { name: string; size: number; mtime: Date }>();

    // 1. Scan public/uploads
    if (fs.existsSync(publicUploadDir)) {
      try {
        const publicFiles = fs.readdirSync(publicUploadDir);
        for (const file of publicFiles) {
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
    let dbMetadataModified = false;
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
          articleId: null,
          articleSlug: null,
          category: "Police Update",
          createdAt: mtime.toISOString()
        };
        dbMetadata.push(meta);
        dbMetadataModified = true;
      }

      return {
        id: meta.id,
        name: file,
        image: meta.image || url,
        url: meta.image || url,
        size: size,
        updatedAt: mtime.toISOString(),
        createdAt: meta.createdAt || mtime.toISOString(),
        title: meta.title,
        category: meta.category,
        articleId: meta.articleId || null,
        articleSlug: meta.articleSlug || null,
      };
    });

    if (dbMetadataModified) {
      await db.saveAssetMetadata(dbMetadata);
    }

    mediaList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return NextResponse.json({ success: true, files: mediaList });
  } catch (e) {
    console.error("Media list error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await checkAuth(["superadmin", "contentadmin", "editor"]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  const auth = await checkAuth(["superadmin", "contentadmin"]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("file");
    if (!filename) {
      return NextResponse.json({ error: "File name required" }, { status: 400 });
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

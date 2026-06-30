import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

async function checkAuth(requiredRoles?: string[]) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const user = JSON.parse(sessionCookie.value);
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  try {
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const files = fs.readdirSync(uploadDir);
    
    // Load asset metadata from DB to merge
    const dbMetadata = await db.getAssetMetadata();
    let dbMetadataModified = false;
    let nextId = dbMetadata.length > 0 ? Math.max(...dbMetadata.map(i => i.id)) + 1 : 1;

    const mediaList = files
      .map((file) => {
        const filePath = path.join(uploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          if (stats.isFile()) {
            const url = `/uploads/${file}`;
            let meta = dbMetadata.find((m: any) => m.image === url || m.url === url);
            
            // Auto create metadata if it doesn't exist (e.g. newly uploaded or untracked image)
            if (!meta) {
              const baseName = path.basename(file, path.extname(file));
              // Prettify title: replace underscores/hyphens with spaces, capitalize words
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
                createdAt: stats.mtime.toISOString()
              };
              dbMetadata.push(meta);
              dbMetadataModified = true;
            }

            return {
              id: meta.id,
              name: file,
              image: meta.image || url,
              url: meta.image || url, // keep for backward compatibility
              size: stats.size,
              updatedAt: stats.mtime.toISOString(),
              createdAt: meta.createdAt || stats.mtime.toISOString(),
              title: meta.title,
              category: meta.category,
              articleId: meta.articleId || null,
              articleSlug: meta.articleSlug || null,
            };
          }
        } catch (e) {
          // ignore
        }
        return null;
      })
      .filter((item): item is any => item !== null);

    if (dbMetadataModified) {
      await db.saveAssetMetadata(dbMetadata);
    }

    // Sort by updatedAt descending (newest first)
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
      // support backward-compatible updates
      if (data.associated_news_id !== undefined) item.articleId = data.associated_news_id;
      if (data.show_in_stories !== undefined) {
        // no-op, just keep compat
      }
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

    // Sanitize to prevent path traversal
    const safeFilename = path.basename(filename);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);

    // Delete sync: remove corresponding metadata entry
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

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
  // 🔐 Security: require valid admin session to list media files
  const auth = await checkAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
            let meta = dbMetadata.find((m: any) => m.url === url);
            
            // Auto create metadata if it doesn't exist (e.g. newly uploaded or untracked image)
            if (!meta) {
              const baseName = path.basename(file, path.extname(file));
              // Prettify title: replace underscores/hyphens with spaces, capitalize words
              const prettyTitle = baseName
                .replace(/[_-]+/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase());
              
              meta = {
                id: nextId++,
                filename: file,
                url: url,
                title: prettyTitle,
                category: "Police Update",
                show_in_stories: 1, // Enabled/Checked in web stories by default
                associated_news_id: null,
                created_at: stats.mtime.toISOString()
              };
              dbMetadata.push(meta);
              dbMetadataModified = true;
            }

            return {
              name: file,
              url: url,
              size: stats.size,
              updatedAt: stats.mtime.toISOString(),
              title: meta.title,
              category: meta.category,
              show_in_stories: meta.show_in_stories,
              associated_news_id: meta.associated_news_id,
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
    const item = dbMetadata.find((m: any) => m.url === data.url);
    if (item) {
      if (data.title !== undefined) item.title = data.title;
      if (data.category !== undefined) item.category = data.category;
      if (data.show_in_stories !== undefined) item.show_in_stories = data.show_in_stories;
      if (data.associated_news_id !== undefined) item.associated_news_id = data.associated_news_id;
      item.updated_at = new Date().toISOString();

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
    const filteredMetadata = dbMetadata.filter((m: any) => m.url !== url);
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

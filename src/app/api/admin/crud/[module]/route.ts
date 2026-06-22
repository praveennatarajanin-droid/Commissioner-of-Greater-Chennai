import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { cookies } from "next/headers";

// Authentication Helper
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

export async function GET(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  
  // No auth required for GET (so frontend can load them dynamically!)
  switch (module) {
    case "news":
      return NextResponse.json(await db.getNews());
    case "ticker":
      return NextResponse.json(await db.getTicker());
    case "slider":
      return NextResponse.json(await db.getSlider());
    case "profile":
      return NextResponse.json(await db.getCommissionerProfile());
    case "theme":
      return NextResponse.json(await db.getThemeSettings());
    case "menu":
      return NextResponse.json(await db.getMenuItems());
    case "contact":
      return NextResponse.json(await db.getContacts());
    case "tts":
      return NextResponse.json(await db.getTtsSettings());
    case "videos":
      return NextResponse.json(await db.getVideos());
    case "alerts":
      return NextResponse.json(await db.getAlerts());
    case "alert_settings":
      return NextResponse.json(await db.getAlertSettings());
    case "users":
      const auth = await checkAuth(["superadmin"]);
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json(await db.getUsers());
    default:
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  
  // Check auth for write actions
  const auth = await checkAuth(["superadmin", "contentadmin", "editor"]);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    switch (module) {
      case "news": {
        const items = await db.getNews();
        // Generate new ID and slug
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const slug = data.slug || data.title_en.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const newItem = { id, slug, ...data, published: data.published ?? 1 };
        items.unshift(newItem); // Add to top
        await db.saveNews(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "ticker": {
        const items = await db.getTicker();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveTicker(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "slider": {
        const items = await db.getSlider();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveSlider(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "menu": {
        const items = await db.getMenuItems();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveMenuItems(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "contact": {
        const items = await db.getContacts();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveContacts(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "videos": {
        const items = await db.getVideos();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveVideos(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "alerts": {
        if (data.action === "sync") {
          const syncRes = await db.syncAlerts(true);
          return NextResponse.json(syncRes);
        }
        const items = await db.getAlerts();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { 
          id, 
          approved: data.approved ?? 1, 
          pinned: data.pinned ?? 0, 
          removed: 0, 
          created_at: new Date().toISOString(), 
          published_at: data.published_at || new Date().toISOString(),
          ...data 
        };
        items.unshift(newItem);
        await db.saveAlerts(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "users": {
        if (auth.role !== "superadmin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        const items = await db.getUsers();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const passwordHash = hashPassword(data.password);
        const newItem = { id, username: data.username, passwordHash, role: data.role };
        items.push(newItem);
        await db.saveUsers(items);
        return NextResponse.json({ success: true, item: { id, username: newItem.username, role: newItem.role } });
      }
      default:
        return NextResponse.json({ error: "Method not supported for module" }, { status: 400 });
    }
  } catch (e) {
    console.error("CRUD POST error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const auth = await checkAuth(["superadmin", "contentadmin", "editor"]);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await req.json();

    switch (module) {
      case "news": {
        let items = await db.getNews();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveNews(items);
        return NextResponse.json({ success: true });
      }
      case "ticker": {
        let items = await db.getTicker();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveTicker(items);
        return NextResponse.json({ success: true });
      }
      case "slider": {
        let items = await db.getSlider();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveSlider(items);
        return NextResponse.json({ success: true });
      }
      case "profile": {
        await db.saveCommissionerProfile(data);
        return NextResponse.json({ success: true });
      }
      case "theme": {
        await db.saveThemeSettings(data);
        return NextResponse.json({ success: true });
      }
      case "menu": {
        let items = await db.getMenuItems();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveMenuItems(items);
        return NextResponse.json({ success: true });
      }
      case "contact": {
        let items = await db.getContacts();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveContacts(items);
        return NextResponse.json({ success: true });
      }
      case "tts": {
        await db.saveTtsSettings(data);
        return NextResponse.json({ success: true });
      }
      case "videos": {
        let items = await db.getVideos();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveVideos(items);
        return NextResponse.json({ success: true });
      }
      case "alerts": {
        let items = await db.getAlerts();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveAlerts(items);
        return NextResponse.json({ success: true });
      }
      case "alert_settings": {
        await db.saveAlertSettings(data);
        return NextResponse.json({ success: true });
      }
      case "users": {
        if (auth.role !== "superadmin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        let items = await db.getUsers();
        items = items.map((i) => {
          if (i.id === data.id) {
            const passwordHash = data.password ? hashPassword(data.password) : i.passwordHash;
            return { ...i, username: data.username, role: data.role, passwordHash };
          }
          return i;
        });
        await db.saveUsers(items);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Method not supported for module" }, { status: 400 });
    }
  } catch (e) {
    console.error("CRUD PUT error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const auth = await checkAuth(["superadmin", "contentadmin", "editor"]);
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    switch (module) {
      case "news": {
        if (auth.role === "editor") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        let items = await db.getNews();
        items = items.filter((i) => i.id !== id);
        await db.saveNews(items);
        return NextResponse.json({ success: true });
      }
      case "ticker": {
        let items = await db.getTicker();
        items = items.filter((i) => i.id !== id);
        await db.saveTicker(items);
        return NextResponse.json({ success: true });
      }
      case "slider": {
        let items = await db.getSlider();
        items = items.filter((i) => i.id !== id);
        await db.saveSlider(items);
        return NextResponse.json({ success: true });
      }
      case "menu": {
        let items = await db.getMenuItems();
        items = items.filter((i) => i.id !== id);
        await db.saveMenuItems(items);
        return NextResponse.json({ success: true });
      }
      case "contact": {
        let items = await db.getContacts();
        items = items.filter((i) => i.id !== id);
        await db.saveContacts(items);
        return NextResponse.json({ success: true });
      }
      case "videos": {
        let items = await db.getVideos();
        items = items.filter((i) => i.id !== id);
        await db.saveVideos(items);
        return NextResponse.json({ success: true });
      }
      case "alerts": {
        let items = await db.getAlerts();
        items = items.filter((i) => i.id !== id);
        await db.saveAlerts(items);
        return NextResponse.json({ success: true });
      }
      case "users": {
        if (auth.role !== "superadmin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        if (id === 1) return NextResponse.json({ error: "Cannot delete bootstrap superadmin" }, { status: 400 });
        let items = await db.getUsers();
        items = items.filter((i) => i.id !== id);
        await db.saveUsers(items);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: "Method not supported for module" }, { status: 400 });
    }
  } catch (e) {
    console.error("CRUD DELETE error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";

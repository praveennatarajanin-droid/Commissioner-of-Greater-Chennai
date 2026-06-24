import { NextResponse } from "next/server";
import { db, hashPassword, DBArticleSeo } from "@/lib/db";
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

// RBAC Permissions Enforcement Check
function hasPermission(role: string, module: string, action: "view" | "create" | "edit" | "delete" | "publish"): boolean {
  if (role === "superadmin") return true;

  switch (module) {
    case "news":
      if (role === "admin" || role === "contentadmin") return true;
      if (role === "editor") {
        if (action === "publish" || action === "delete") return false;
        return true; // Can view/create/edit own
      }
      if (role === "reporter") {
        if (action === "publish" || action === "delete") return false;
        return true; // Can view/create/edit own
      }
      if (role === "viewer") {
        return action === "view";
      }
      return false;

    case "slider":
    case "ticker":
      if (role === "admin") return true;
      if (role === "viewer") return action === "view";
      return false;

    case "videos":
      if (role === "admin" || role === "mediamanager") return true;
      if (role === "reporter") {
        return action === "view" || action === "create" || action === "edit";
      }
      if (role === "viewer") return action === "view";
      return false;

    case "media":
      if (role === "admin" || role === "contentadmin" || role === "mediamanager") return true;
      if (role === "editor" || role === "reporter") {
        return action === "view" || action === "create" || action === "edit";
      }
      if (role === "viewer") return action === "view";
      return false;

    case "alerts":
    case "alert_settings":
      if (role === "admin") return true;
      if (role === "viewer") return action === "view";
      return false;

    case "seo_settings":
    case "article_seo":
      if (role === "admin" || role === "seomanager") return true;
      if (role === "viewer") return action === "view";
      return false;

    case "users":
    case "activity_logs":
      return false; // superadmin only

    case "profile":
    case "theme":
    case "menu":
    case "contact":
    case "tts":
      return false; // superadmin only

    default:
      return false;
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
    case "seo_settings":
      return NextResponse.json(await db.getSeoSettings());
    case "article_seo":
      return NextResponse.json(await db.getArticleSeo());
    case "users": {
      const auth = await checkAuth(["superadmin"]);
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json(await db.getUsers());
    }
    case "activity_logs": {
      const auth = await checkAuth(["superadmin"]);
      if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return NextResponse.json(await db.getActivityLogs());
    }
    default:
      return NextResponse.json({ error: "Invalid module" }, { status: 400 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  
  const auth = await checkAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(auth.role, module, "create")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();
    
    switch (module) {
      case "news": {
        const items = await db.getNews();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const slug = data.slug || data.title_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/g, "");
        
        let publishedVal = data.published ?? 1;
        if (auth.role === "reporter" || auth.role === "editor") {
          publishedVal = 0; // Force draft
        }

        const newItem = { 
          id, 
          slug, 
          ...data, 
          published: publishedVal,
          author_en: data.author_en || (auth.role === "reporter" || auth.role === "editor" ? auth.username : "Greater Chennai Police Media Desk")
        };
        items.unshift(newItem); // Add to top
        await db.saveNews(items);
        await db.addActivityLog(auth.username, `Created news article: ${newItem.title_en}`);
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
        const items = await db.getUsers();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const passwordHash = hashPassword(data.password);
        const newItem = {
          id,
          username: data.username,
          email: data.email || `${data.username}@chennaiguardian.in`,
          passwordHash,
          role: data.role,
          status: data.status || "active",
          createdAt: new Date().toISOString(),
          lastLogin: null
        };
        items.push(newItem);
        await db.saveUsers(items);
        await db.addActivityLog(auth.username, `Created user account: ${newItem.username}`);
        return NextResponse.json({ success: true, item: { id, username: newItem.username, role: newItem.role, email: newItem.email } });
      }
      case "article_seo": {
        const items = await db.getArticleSeo();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem: DBArticleSeo = { id, ...data, updated_at: new Date().toISOString() };
        items.push(newItem);
        await db.saveArticleSeo(items);
        return NextResponse.json({ success: true, item: newItem });
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
  const auth = await checkAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(auth.role, module, "edit")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await req.json();

    switch (module) {
      case "news": {
        let items = await db.getNews();
        if (data.ids && Array.isArray(data.ids)) {
          if (data.published !== undefined && !hasPermission(auth.role, "news", "publish")) {
            return NextResponse.json({ error: "Forbidden: You do not have permission to publish content" }, { status: 403 });
          }

          items = items.map((i) => {
            if (data.ids.includes(i.id)) {
              if ((auth.role === "reporter" || auth.role === "editor") && i.author_en !== auth.username) {
                return i;
              }
              const updatedItem = { ...i };
              if (data.published !== undefined) updatedItem.published = data.published;
              if (data.category !== undefined) {
                updatedItem.category_en = data.category;
                updatedItem.category_ta = data.category === "Crime" ? "குற்றம்" :
                                          data.category === "Women Safety" ? "பெண்கள் பாதுகாப்பு" :
                                          data.category === "Cyber Safety" ? "சைபர் பாதுகாப்பு" :
                                          data.category === "Public Safety" ? "பொது பாதுகாப்பு" :
                                          data.category === "Community Outreach" ? "சமூக அவுட்ரீச்" :
                                          data.category === "Government Updates" ? "அரசு அறிவிப்புகள்" : data.category;
              }
              updatedItem.updated_at = new Date().toISOString();
              return updatedItem;
            }
            return i;
          });
          await db.saveNews(items);
          await db.addActivityLog(auth.username, `Bulk edited news articles: ${data.ids.join(", ")}`);
          return NextResponse.json({ success: true });
        } else {
          const existing = items.find(i => i.id === data.id);
          if (!existing) {
            return NextResponse.json({ error: "News item not found" }, { status: 404 });
          }

          if ((auth.role === "reporter" || auth.role === "editor") && existing.author_en !== auth.username) {
            return NextResponse.json({ error: "Forbidden: You can only edit your own news articles" }, { status: 403 });
          }

          if (data.published !== undefined && data.published !== existing.published) {
            if (!hasPermission(auth.role, "news", "publish")) {
              return NextResponse.json({ error: "Forbidden: You do not have permission to publish/unpublish content" }, { status: 403 });
            }
          }

          items = items.map((i) => (i.id === data.id ? { ...i, ...data, updated_at: new Date().toISOString() } : i));
          await db.saveNews(items);

          if (data.published === 1 && existing.published === 0) {
            await db.addActivityLog(auth.username, `Published news article: ${data.title_en || existing.title_en}`);
          } else {
            await db.addActivityLog(auth.username, `Edited news article: ${data.title_en || existing.title_en}`);
          }

          return NextResponse.json({ success: true });
        }
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
      case "seo_settings": {
        await db.saveSeoSettings(data);
        return NextResponse.json({ success: true });
      }
      case "article_seo": {
        let items = await db.getArticleSeo();
        const existing = items.find(i => i.id === data.id);
        if (existing) {
          items = items.map((i) => (i.id === data.id ? { ...i, ...data, updated_at: new Date().toISOString() } : i));
        } else {
          // Upsert: create if not found by article_id + content_type
          const byArticle = items.find(i => i.article_id === data.article_id && i.content_type === data.content_type);
          if (byArticle) {
            items = items.map(i => (i.article_id === data.article_id && i.content_type === data.content_type) ? { ...i, ...data, updated_at: new Date().toISOString() } : i);
          } else {
            const id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
            items.push({ id, ...data, updated_at: new Date().toISOString() });
          }
        }
        await db.saveArticleSeo(items);
        return NextResponse.json({ success: true });
      }
      case "users": {
        let items = await db.getUsers();
        const target = items.find(i => i.id === data.id);
        if (!target) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        items = items.map((i) => {
          if (i.id === data.id) {
            const passwordHash = data.password ? hashPassword(data.password) : i.passwordHash;
            return {
              ...i,
              username: data.username ?? i.username,
              role: data.role ?? i.role,
              email: data.email ?? i.email,
              status: data.status ?? i.status,
              passwordHash
            };
          }
          return i;
        });
        await db.saveUsers(items);

        if (data.password) {
          await db.addActivityLog(auth.username, `Reset password for user: ${target.username}`);
        } else if (data.status !== undefined && data.status !== target.status) {
          await db.addActivityLog(auth.username, `${data.status === "active" ? "Enabled" : "Disabled"} user account: ${target.username}`);
        } else {
          await db.addActivityLog(auth.username, `Updated user account details: ${target.username}`);
        }

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
  const auth = await checkAuth();
  if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!hasPermission(auth.role, module, "delete")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get("id") || "");
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    switch (module) {
      case "news": {
        let items = await db.getNews();
        const target = items.find((i) => i.id === id);
        if (!target) {
          return NextResponse.json({ error: "News item not found" }, { status: 404 });
        }

        if (auth.role === "admin" && (target.author_en === "admin" || target.author_en === "superadmin")) {
          return NextResponse.json({ error: "Forbidden: Admin cannot delete Super Admin content" }, { status: 403 });
        }

        if ((auth.role === "editor" || auth.role === "reporter") && target.published === 1) {
          return NextResponse.json({ error: "Forbidden: Cannot delete published news articles" }, { status: 403 });
        }

        if ((auth.role === "editor" || auth.role === "reporter") && target.author_en !== auth.username) {
          return NextResponse.json({ error: "Forbidden: You can only delete your own draft articles" }, { status: 403 });
        }

        items = items.filter((i) => i.id !== id);
        await db.saveNews(items);
        await db.addActivityLog(auth.username, `Deleted news article: ${target.title_en}`);
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
      case "article_seo": {
        let items = await db.getArticleSeo();
        items = items.filter((i) => i.id !== id);
        await db.saveArticleSeo(items);
        return NextResponse.json({ success: true });
      }
      case "users": {
        if (id === 1) return NextResponse.json({ error: "Cannot delete bootstrap superadmin" }, { status: 400 });
        let items = await db.getUsers();
        const target = items.find((i) => i.id === id);
        if (!target) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        items = items.filter((i) => i.id !== id);
        await db.saveUsers(items);
        await db.addActivityLog(auth.username, `Deleted user account: ${target.username}`);
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

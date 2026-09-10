import { NextResponse } from "next/server";
import { db, hashPassword, normalizeUsername, DBArticleSeo } from "@/lib/db";
import { cookies } from "next/headers";
import { sanitizeHtmlContent, sanitizePlainText } from "@/lib/sanitizer";

function sanitizeHtml(html: string): string {
  return sanitizeHtmlContent(html);
}

function validateExternalUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string" || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return trimmed;
  if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed)) {
    return trimmed;
  }
  return null;
}

// Authentication Helper
async function checkAuth(requiredRoles?: string[]) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const user = JSON.parse(sessionCookie.value);

    // Verify session validity in DB
    if (user.sessionId) {
      const dbSession = await db.validateSession(user.sessionId);
      if (!dbSession) return null;
      await db.touchSession(user.sessionId);
    }

    // Verify user account status
    const users = await db.getUsers();
    const uRec = users.find((u) => u.username.toLowerCase() === (user.username || "").toLowerCase());
    if (!uRec || uRec.status === "disabled" || uRec.locked === 1) {
      return null;
    }

    if (requiredRoles) {
      const userRole = (user.role || "").toUpperCase().replace(/[_\s]+/g, "");
      const normalizedRequired = requiredRoles.map((r) => r.toUpperCase().replace(/[_\s]+/g, ""));
      if (!normalizedRequired.includes(userRole)) {
        return null;
      }
    }
    return user;
  } catch {
    return null;
  }
}

// RBAC Permissions Enforcement Check
async function hasPermission(
  username: string,
  role: string,
  module: string,
  action: "view" | "create" | "edit" | "delete" | "publish"
): Promise<boolean> {
  const r = (role || "").toUpperCase().trim().replace(" ", "_");
  if (r === "SUPER_ADMIN" || r === "SUPERADMIN") return true;

  const permissions = await db.getResolvedPermissions(username, role);
  if (permissions["*"]) {
    return permissions["*"].includes(action) || permissions["*"].includes("*");
  }

  // Normalize module key mapping
  let key = module;
  if (module === "alert_settings") key = "settings";
  if (module === "seo_settings" || module === "article_seo") key = "settings";

  const modulePerms = permissions[key] || [];
  return modulePerms.includes(action);
}

export async function GET(req: Request, { params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  
  // No auth required for GET (so frontend can load them dynamically!)
  switch (module) {
    case "config":
      return NextResponse.json(await db.getSuperadminConfig());
    case "news":
      return NextResponse.json(await db.getNews());
    case "ticker":
      return NextResponse.json(await db.getTicker());
    case "slider":
      return NextResponse.json(await db.getSlider());
    case "commissioner":
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
    case "police-stations":
      return NextResponse.json(await db.getPoliceStations());
    case "emergency-contacts":
      return NextResponse.json(await db.getEmergencyContacts());
    case "department-links":
      return NextResponse.json(await db.getDepartmentLinks());
    case "web-stories":
      return NextResponse.json(await db.getWebStories());
    case "citizen-services":
      return NextResponse.json(await db.getCitizenServicesWithCategories(true));
    case "citizen-service-categories":
      return NextResponse.json(await db.getCitizenServiceCategories(true));
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

  try {
    const data = await req.json();

    if (module === "config") {
      const { key } = data;
      if (key === "footer_config") {
        if (!(await hasPermission(auth.username, auth.role, "footer", "edit"))) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else {
        if (!(await hasPermission(auth.username, auth.role, "settings", "edit"))) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    } else {
      if (!(await hasPermission(auth.username, auth.role, module, "create"))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
    
    switch (module) {
      case "config": {
        const { key, value } = data;
        if (!key) {
          return NextResponse.json({ error: "Missing config key" }, { status: 400 });
        }
        await db.saveSuperadminConfig(key, value);
        await db.addActivityLog(auth.username, `Updated configuration: ${key}`);
        return NextResponse.json({ success: true });
      }
      case "news": {
        const items = await db.getNews();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const rawTitle = (data.title_en || data.title_ta || "news-article-" + id).toString();
        const slug = data.slug || rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || ("article-" + id);
        
        let publishedVal = data.published ?? 1;
        if (auth.role === "reporter" || auth.role === "editor") {
          publishedVal = 0; // Force draft
        }

        const sanitizedContentEn = Array.isArray(data.content_en) 
          ? data.content_en.map((p: string) => sanitizeHtml(p))
          : [];
        const sanitizedContentTa = Array.isArray(data.content_ta) 
          ? data.content_ta.map((p: string) => sanitizeHtml(p))
          : [];

        const nowIso = new Date().toISOString();
        let pubAt: string | null = null;
        if (data.published_at) {
          const parsed = new Date(data.published_at);
          pubAt = !isNaN(parsed.getTime()) ? parsed.toISOString() : nowIso;
        } else if (publishedVal === 1) {
          pubAt = nowIso;
        }

        const dateObj = pubAt ? new Date(pubAt) : new Date();
        const dateStr = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

        const newItem = { 
          id, 
          slug, 
          category_en: data.category_en || data.category || "General",
          category_ta: data.category_ta || "பொது",
          title_en: data.title_en || data.title_ta || "New Article",
          title_ta: data.title_ta || data.title_en || "புதிய செய்தி",
          summary_en: data.summary_en || "",
          summary_ta: data.summary_ta || "",
          image: data.image || "/images/police_medal.jpg",
          section: data.section || "latest",
          views_count: data.views_count || 0,
          ...data, 
          content_en: sanitizedContentEn,
          content_ta: sanitizedContentTa,
          published: publishedVal,
          created_at: nowIso,
          published_at: pubAt,
          publishedAt: pubAt,
          updated_at: nowIso,
          date: dateStr,
          author_en: data.author_en || (auth.role === "reporter" || auth.role === "editor" ? auth.username : "Greater Chennai Police")
        };
        items.unshift(newItem); // Add to top
        await db.saveNews(items);
        await db.addActivityLog(auth.username, `Created news article: ${newItem.title_en}`);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "ticker": {
        const items = await db.getTicker();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const newItem = { id, text_en: data.text_en || "", text_ta: data.text_ta || "", active: data.active ?? 1, order_num: data.order_num || 1, ...data };
        items.push(newItem);
        await db.saveTicker(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "slider": {
        const items = await db.getSlider();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveSlider(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "menu": {
        const items = await db.getMenuItems();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveMenuItems(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "contact": {
        const items = await db.getContacts();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveContacts(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "videos": {
        const items = await db.getVideos();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
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
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
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
        const normUsername = normalizeUsername(data.username);
        if (!normUsername || !data.password || !data.role) {
          return NextResponse.json({ error: "Username, password, and role are required." }, { status: 400 });
        }
        if (items.some((u) => normalizeUsername(u.username) === normUsername)) {
          return NextResponse.json({ error: "Username already exists." }, { status: 400 });
        }
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const passwordHash = hashPassword(data.password);
        const newItem = {
          id,
          username: data.username.trim(),
          email: (data.email || `${normUsername}@chennaiguardian.in`).trim(),
          passwordHash,
          role: data.role.trim(),
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
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const newItem: DBArticleSeo = { id, ...data, updated_at: new Date().toISOString() };
        items.push(newItem);
        await db.saveArticleSeo(items);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "police-stations": {
        const items = await db.getPoliceStations();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id || 0)) + 1 : 1;
        const nameEn = data.name_en || data.station_name || "New Police Station";
        const rawLat = data.lat ?? data.latitude;
        const rawLon = data.lon ?? data.longitude ?? data.lng;
        const latNum = Number(rawLat);
        const lonNum = Number(rawLon);
        const finalLat = !isNaN(latNum) && rawLat !== undefined && rawLat !== "" ? latNum : (rawLat ?? 13.0827);
        const finalLon = !isNaN(lonNum) && rawLon !== undefined && rawLon !== "" ? lonNum : (rawLon ?? 80.2707);

        const newItem = { 
          id, 
          name_en: nameEn,
          station_name: nameEn,
          district: data.district || "Chennai District",
          phone_no: data.phone_no ?? data.phone ?? "",
          lat: finalLat,
          lon: finalLon,
          latitude: finalLat,
          longitude: finalLon,
          sdo: data.sdo || "Sub-Divisional Officer",
          range: data.range || data.zone_en || "Metropolitan Range",
          ps_address: data.ps_address || data.address || "Chennai, Tamil Nadu",
          pincode: data.pincode || "600001",
          status: data.status || "ACTIVE",
          ...data 
        };
        items.push(newItem);
        await db.savePoliceStations(items);
        await db.addActivityLog(auth.username, `Created police station: ${newItem.name_en}`);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "emergency-contacts": {
        const items = await db.getEmergencyContacts();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveEmergencyContacts(items);
        await db.addActivityLog(auth.username, `Created emergency contact: ${newItem.number}`);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "department-links": {
        const items = await db.getDepartmentLinks();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveDepartmentLinks(items);
        await db.addActivityLog(auth.username, `Created department link: ${newItem.name_en}`);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "web-stories": {
        const items = await db.getWebStories();
        const id = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
        const newItem = { id, ...data };
        items.push(newItem);
        await db.saveWebStories(items);
        await db.addActivityLog(auth.username, `Created web story: ${newItem.title_en}`);
        return NextResponse.json({ success: true, item: newItem });
      }
      case "citizen-services": {
        const services = await db.getCitizenServices(true);
        const id = services.length > 0 ? Math.max(...services.map((s) => s.id || 0)) + 1 : 1;
        const srvData = data.data || data;
        const validatedUrl = validateExternalUrl(srvData.external_url);
        const now = new Date().toISOString();
        const nameEn = sanitizePlainText(srvData.service_name_en || srvData.service_name || srvData.name || srvData.name_en || "");
        const nameTa = sanitizePlainText(srvData.service_name_ta || srvData.name_ta || "");
        const descEn = sanitizePlainText(srvData.description_en || srvData.description || "");
        const descTa = sanitizePlainText(srvData.description_ta || "");
        const newService = {
          id,
          category_id: parseInt(srvData.category_id, 10) || 1,
          service_name: nameEn,
          service_name_en: nameEn,
          service_name_ta: nameTa,
          description: descEn,
          description_en: descEn,
          description_ta: descTa,
          icon: sanitizePlainText(srvData.icon || "FileText"),
          external_url: validatedUrl,
          display_order: parseInt(srvData.display_order, 10) || id,
          is_active: srvData.is_active !== undefined ? (srvData.is_active ? 1 : 0) : 1,
          is_featured: srvData.is_featured !== undefined ? (srvData.is_featured ? 1 : 0) : 0,
          open_in_new_tab: srvData.open_in_new_tab !== undefined ? (srvData.open_in_new_tab ? 1 : 0) : 1,
          created_by: auth.username,
          updated_by: auth.username,
          created_at: now,
          updated_at: now,
          deleted_at: null
        };
        services.push(newService);
        await db.saveCitizenServices(services);
        await db.addActivityLog(auth.username, `Created citizen service: ${nameEn}`);
        return NextResponse.json({ success: true, item: newService });
      }
      case "citizen-service-categories": {
        const categories = await db.getCitizenServiceCategories(true);
        const id = categories.length > 0 ? Math.max(...categories.map((c) => c.id || 0)) + 1 : 1;
        const catData = data.data || data;
        const now = new Date().toISOString();
        const nameEn = sanitizePlainText(catData.name_en || catData.name || "");
        const nameTa = sanitizePlainText(catData.name_ta || "");
        const rawSlug = catData.slug || nameEn || `category-${id}`;
        const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const descEn = sanitizePlainText(catData.description_en || catData.description || "");
        const descTa = sanitizePlainText(catData.description_ta || "");
        const newCat = {
          id,
          name: nameEn,
          name_en: nameEn,
          name_ta: nameTa,
          slug,
          description: descEn,
          description_en: descEn,
          description_ta: descTa,
          display_order: parseInt(catData.display_order, 10) || id,
          is_active: catData.is_active !== undefined ? (catData.is_active ? 1 : 0) : 1,
          created_at: now,
          updated_at: now
        };
        categories.push(newCat);
        await db.saveCitizenServiceCategories(categories);
        await db.addActivityLog(auth.username, `Created citizen service category: ${nameEn}`);
        return NextResponse.json({ success: true, item: newCat });
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

  try {
    const data = await req.json();

    if (module === "config") {
      const { key } = data;
      if (key === "footer_config") {
        if (!(await hasPermission(auth.username, auth.role, "footer", "edit"))) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      } else {
        if (!(await hasPermission(auth.username, auth.role, "settings", "edit"))) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
      }
    } else {
      if (!(await hasPermission(auth.username, auth.role, module, "edit"))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    switch (module) {
      case "config": {
        const { key, value } = data;
        if (!key) {
          return NextResponse.json({ error: "Missing config key" }, { status: 400 });
        }
        await db.saveSuperadminConfig(key, value);
        await db.addActivityLog(auth.username, `Updated configuration: ${key}`);
        return NextResponse.json({ success: true });
      }
      case "news": {
        let items = await db.getNews();
        if (data.ids && Array.isArray(data.ids)) {
          if (data.published !== undefined && !(await hasPermission(auth.username, auth.role, "news", "publish"))) {
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
            if (!(await hasPermission(auth.username, auth.role, "news", "publish"))) {
              return NextResponse.json({ error: "Forbidden: You do not have permission to publish/unpublish content" }, { status: 403 });
            }
          }

          const sanitizedContentEn = Array.isArray(data.content_en) 
            ? data.content_en.map((p: string) => sanitizeHtml(p))
            : undefined;
          const sanitizedContentTa = Array.isArray(data.content_ta) 
            ? data.content_ta.map((p: string) => sanitizeHtml(p))
            : undefined;

          const updatedPayload = { ...data };
          if (sanitizedContentEn !== undefined) updatedPayload.content_en = sanitizedContentEn;
          if (sanitizedContentTa !== undefined) updatedPayload.content_ta = sanitizedContentTa;

          let finalPublishedAt = existing.published_at || existing.created_at;
          if (data.published_at !== undefined && data.published_at !== null) {
            finalPublishedAt = data.published_at;
          } else if (data.published === 1 && existing.published === 0 && !finalPublishedAt) {
            finalPublishedAt = new Date().toISOString();
          }

          items = items.map((i) => (i.id === data.id ? { 
            ...i, 
            ...updatedPayload, 
            published_at: finalPublishedAt,
            publishedAt: finalPublishedAt,
            updated_at: new Date().toISOString() 
          } : i));
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
      case "commissioner":
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

        if (data.username) {
          const norm = normalizeUsername(data.username);
          const dup = items.find((u) => u.id !== data.id && normalizeUsername(u.username) === norm);
          if (dup) {
            return NextResponse.json({ error: "Username already in use by another account." }, { status: 400 });
          }
        }

        items = items.map((i) => {
          if (i.id === data.id) {
            const passwordHash = data.password ? hashPassword(data.password) : i.passwordHash;
            return {
              ...i,
              username: data.username ? data.username.trim() : i.username,
              role: data.role ? data.role.trim() : i.role,
              email: data.email ? data.email.trim() : i.email,
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
      case "police-stations": {
        const targetId = Number(data.id || data.data?.id || 0);
        const stationObj = data.data || data;
        let items = await db.getPoliceStations();
        const targetName = (stationObj.station_name || stationObj.name_en || "").trim().toLowerCase();

        items = items.map((i) => {
          const isMatchById = targetId > 0 && Number(i.id) === targetId;
          const isMatchByName = !isMatchById && targetName && ((i.station_name || i.name_en || "").trim().toLowerCase() === targetName);

          if (isMatchById || isMatchByName) {
            return {
              ...i,
              ...stationObj,
              id: i.id || targetId,
              zone: stationObj.zone || stationObj.zone_en || i.zone || "North Zone",
              zone_en: stationObj.zone_en || stationObj.zone || i.zone_en || "North Zone",
              zone_ta: stationObj.zone_ta || i.zone_ta || "வடக்கு மண்டலம்"
            };
          }
          return i;
        });

        await db.savePoliceStations(items);
        await db.addActivityLog(auth.username, `Updated police station: ${stationObj.station_name || stationObj.name_en || targetId}`);
        return NextResponse.json({ success: true });
      }
      case "emergency-contacts": {
        let items = await db.getEmergencyContacts();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveEmergencyContacts(items);
        await db.addActivityLog(auth.username, `Updated emergency contact: ${data.number}`);
        return NextResponse.json({ success: true });
      }
      case "department-links": {
        let items = await db.getDepartmentLinks();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveDepartmentLinks(items);
        await db.addActivityLog(auth.username, `Updated department link: ${data.name_en}`);
        return NextResponse.json({ success: true });
      }
      case "web-stories": {
        let items = await db.getWebStories();
        items = items.map((i) => (i.id === data.id ? { ...i, ...data } : i));
        await db.saveWebStories(items);
        await db.addActivityLog(auth.username, `Updated web story: ${data.title_en}`);
        return NextResponse.json({ success: true });
      }
      case "citizen-services": {
        let services = await db.getCitizenServices(true);
        const srvData = data.data || data;
        const targetId = parseInt(data.id || srvData.id, 10);
        const existing = services.find((s) => s.id === targetId);
        if (!existing) {
          return NextResponse.json({ error: "Citizen service not found" }, { status: 404 });
        }
        const validatedUrl = srvData.external_url !== undefined ? validateExternalUrl(srvData.external_url) : existing.external_url;
        const now = new Date().toISOString();
        const nameEn = srvData.service_name_en !== undefined || srvData.service_name !== undefined
          ? sanitizePlainText(srvData.service_name_en || srvData.service_name || "")
          : (existing.service_name_en || existing.service_name || "");
        const nameTa = srvData.service_name_ta !== undefined
          ? sanitizePlainText(srvData.service_name_ta)
          : (existing.service_name_ta || "");
        const descEn = srvData.description_en !== undefined || srvData.description !== undefined
          ? sanitizePlainText(srvData.description_en || srvData.description || "")
          : (existing.description_en || existing.description || "");
        const descTa = srvData.description_ta !== undefined
          ? sanitizePlainText(srvData.description_ta)
          : (existing.description_ta || "");

        services = services.map((s) => {
          if (s.id === targetId) {
            return {
              ...s,
              category_id: srvData.category_id !== undefined ? (parseInt(srvData.category_id, 10) || s.category_id) : s.category_id,
              service_name: nameEn,
              service_name_en: nameEn,
              service_name_ta: nameTa,
              description: descEn,
              description_en: descEn,
              description_ta: descTa,
              icon: srvData.icon !== undefined ? sanitizePlainText(srvData.icon) : s.icon,
              external_url: validatedUrl,
              display_order: srvData.display_order !== undefined ? parseInt(srvData.display_order, 10) : s.display_order,
              is_active: srvData.is_active !== undefined ? (srvData.is_active ? 1 : 0) : s.is_active,
              is_featured: srvData.is_featured !== undefined ? (srvData.is_featured ? 1 : 0) : s.is_featured,
              open_in_new_tab: srvData.open_in_new_tab !== undefined ? (srvData.open_in_new_tab ? 1 : 0) : s.open_in_new_tab,
              updated_by: auth.username,
              updated_at: now
            };
          }
          return s;
        });
        await db.saveCitizenServices(services);
        await db.addActivityLog(auth.username, `Updated citizen service: ${nameEn}`);
        return NextResponse.json({ success: true });
      }
      case "citizen-service-categories": {
        let categories = await db.getCitizenServiceCategories(true);
        const catData = data.data || data;
        const targetId = parseInt(data.id || catData.id, 10);
        const existing = categories.find((c) => c.id === targetId);
        if (!existing) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        const now = new Date().toISOString();
        const nameEn = catData.name_en !== undefined || catData.name !== undefined
          ? sanitizePlainText(catData.name_en || catData.name || "")
          : (existing.name_en || existing.name || "");
        const nameTa = catData.name_ta !== undefined
          ? sanitizePlainText(catData.name_ta)
          : (existing.name_ta || "");
        const descEn = catData.description_en !== undefined || catData.description !== undefined
          ? sanitizePlainText(catData.description_en || catData.description || "")
          : (existing.description_en || existing.description || "");
        const descTa = catData.description_ta !== undefined
          ? sanitizePlainText(catData.description_ta)
          : (existing.description_ta || "");

        categories = categories.map((c) => {
          if (c.id === targetId) {
            return {
              ...c,
              name: nameEn,
              name_en: nameEn,
              name_ta: nameTa,
              description: descEn,
              description_en: descEn,
              description_ta: descTa,
              slug: catData.slug !== undefined ? catData.slug : c.slug,
              display_order: catData.display_order !== undefined ? parseInt(catData.display_order, 10) : c.display_order,
              is_active: catData.is_active !== undefined ? (catData.is_active ? 1 : 0) : c.is_active,
              updated_at: now
            };
          }
          return c;
        });
        await db.saveCitizenServiceCategories(categories);
        await db.addActivityLog(auth.username, `Updated citizen service category: ${nameEn}`);
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

  if (!(await hasPermission(auth.username, auth.role, module, "delete"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const rawId = searchParams.get("id");
    const id = rawId ? parseInt(rawId) : NaN;

    if (action !== "clear_all" && isNaN(id)) {
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
      case "police-stations": {
        const actionParam = action;
        if (actionParam === "clear_all" || id === -1) {
          const uRole = (auth.role || "").toLowerCase().replace(/[_\s]+/g, "");
          if (uRole !== "superadmin") {
            return NextResponse.json({ error: "Forbidden: Only Super Admin can clear all police stations" }, { status: 403 });
          }
          await db.savePoliceStations([]);
          await db.addActivityLog(auth.username, "Cleared all police stations from database");
          return NextResponse.json({ success: true, message: "All police station records deleted." });
        }
        let items = await db.getPoliceStations();
        const target = items.find((i) => i.id === id);
        if (!target) {
          return NextResponse.json({ error: "Police station record not found" }, { status: 404 });
        }
        items = items.filter((i) => i.id !== id);
        await db.savePoliceStations(items);
        await db.addActivityLog(auth.username, `Deleted police station: ${target.name_en || target.station_name}`);
        return NextResponse.json({ success: true });
      }
      case "emergency-contacts": {
        let items = await db.getEmergencyContacts();
        const target = items.find((i) => i.id === id);
        items = items.filter((i) => i.id !== id);
        await db.saveEmergencyContacts(items);
        if (target) {
          await db.addActivityLog(auth.username, `Deleted emergency contact: ${target.number}`);
        }
        return NextResponse.json({ success: true });
      }
      case "department-links": {
        let items = await db.getDepartmentLinks();
        const target = items.find((i) => i.id === id);
        items = items.filter((i) => i.id !== id);
        await db.saveDepartmentLinks(items);
        if (target) {
          await db.addActivityLog(auth.username, `Deleted department link: ${target.name_en}`);
        }
        return NextResponse.json({ success: true });
      }
      case "web-stories": {
        let items = await db.getWebStories();
        const target = items.find((i) => i.id === id);
        items = items.filter((i) => i.id !== id);
        await db.saveWebStories(items);
        if (target) {
          await db.addActivityLog(auth.username, `Deleted web story: ${target.title_en}`);
        }
        return NextResponse.json({ success: true });
      }
      case "citizen-services": {
        let services = await db.getCitizenServices(true);
        const target = services.find((s) => s.id === id);
        if (!target) {
          return NextResponse.json({ error: "Citizen service not found" }, { status: 404 });
        }
        // Soft delete
        const now = new Date().toISOString();
        services = services.map((s) => (s.id === id ? { ...s, deleted_at: now, is_active: 0, updated_by: auth.username, updated_at: now } : s));
        await db.saveCitizenServices(services);
        await db.addActivityLog(auth.username, `Soft deleted citizen service: ${target.service_name_en}`);
        return NextResponse.json({ success: true });
      }
      case "citizen-service-categories": {
        let categories = await db.getCitizenServiceCategories(true);
        const target = categories.find((c) => c.id === id);
        if (!target) {
          return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }
        categories = categories.filter((c) => c.id !== id);
        await db.saveCitizenServiceCategories(categories);
        await db.addActivityLog(auth.username, `Deleted citizen service category: ${target.name_en}`);
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

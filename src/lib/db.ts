import crypto from "crypto";
import { query, transaction, registerMutationCallback } from "./mysql";

// Cryptographic hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Database schema structures
export interface DBUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
  email: string;
  status: "active" | "disabled";
  lastLogin?: string | null;
  createdAt?: string | null;
  locked?: number | null;
  failed_logins?: number | null;
  password_expiry?: string | null;
  permissions_json?: string | null;
  mobile?: string | null;
  profile_photo?: string | null;
  force_password_change?: number | null;
}

export interface DBActivityLog {
  id: number;
  username: string;
  role?: string;
  ip_address?: string;
  action: string;
  module?: string;
  timestamp: string; // ISO date-time string
  browser?: string;
  before_val?: string;
  after_val?: string;
}

export interface DBNewsItem {
  id: number;
  slug: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  summary_en: string;
  summary_ta: string;
  content_en: string[];
  content_ta: string[];
  image: string;
  gallery?: string[];
  date: string;
  author_en: string;
  author_ta: string;
  tags_en: string[];
  tags_ta: string[];
  section: string;
  published: number; // 0 or 1
  highlights_en?: string[];
  highlights_ta?: string[];
  quote?: { text_en: string; text_ta: string; author_en: string; author_ta: string };
  timeline?: { time: string; event_en: string; event_ta: string }[];
  sourceName?: string;
  sourceUrl?: string;
  views_count?: number;
  featured?: number; // 0 or 1
  breaking?: number; // 0 or 1
  latest?: number; // 0 or 1
  homepage_visible?: number; // 0 or 1
  image_locked?: number; // 0 or 1 (Hero News image lock)
  updated_at?: string;
  created_at?: string;
  language?: string;
  meta_description?: string;
  meta_keywords?: string;
  short_caption?: string;
}

export interface DBTickerItem {
  id: number;
  text_en: string;
  text_ta: string;
  url?: string;
  order_num: number;
  active: number;
}

export interface DBSliderItem {
  id: number;
  src: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
  order_num: number;
  active: number;
}

export interface DBCommissionerProfile {
  id: number;
  name_en: string;
  name_ta: string;
  designation_en: string;
  designation_ta: string;
  bio_en1: string;
  bio_en2: string;
  bio_ta1: string;
  bio_ta2: string;
  photo: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  office_address_en?: string;
  office_address_ta?: string;
  ips_batch?: string;
  years_of_service?: string;
  motto_en?: string;
  motto_ta?: string;
  birthplace_en?: string;
  birthplace_ta?: string;
  education_en?: string;
  education_ta?: string;
  vision_en?: string;
  vision_ta?: string;
  timeline?: { year: string; event_en: string; event_ta: string }[];
  awards?: { title_en: string; title_ta: string; desc_en: string; desc_ta: string; year?: string }[];
  initiatives?: { title_en: string; title_ta: string; desc_en: string; desc_ta: string; category?: string }[];
  gallery?: string[];
}

export interface DBThemeSettings {
  id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_path: string;
  footer_logo_path: string;
  favicon_path: string;
  ticker_speed?: string;
}

export interface DBMenuItem {
  id: number;
  label_en: string;
  label_ta: string;
  href: string;
  order_num: number;
  position: string; // 'header' | 'footer'
}

export interface DBContact {
  id: number;
  name_en: string;
  name_ta: string;
  value: string;
  category: string; // 'phone' | 'email' | 'helpline' | 'emergency'
}

export interface DBTtsSettings {
  id: number;
  enabled: number;
  tamil_voice: string;
  english_voice: string;
  speed: number;
}

export interface DBVideoItem {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  order_num: number;
  active: number;
  section: "main" | "bottom";
  views_count?: number;
}

export interface DBAlertItem {
  id: number;
  title: string;
  category: string;
  source: string;
  url: string;
  published_at: string; // ISO string
  approved: number; // 0 or 1
  pinned: number; // 0 or 1
  removed: number; // 0 or 1
  created_at: string;
}

export interface DBAlertSettings {
  id: number;
  auto_fetch: number; // 0 or 1
  require_approval: number; // 0 or 1
  last_fetched_at: string; // ISO string
  live_feed_enabled?: number;
  approved_sources?: string;
  refresh_interval?: number;
}

export interface DBPoliceStation {
  id: number;
  name_en: string;
  name_ta: string;
  address_en: string;
  address_ta: string;
  phone: string;
  email?: string;
  incharge_en?: string;
  incharge_ta?: string;
  designation_en?: string;
  designation_ta?: string;
  hours_en?: string;
  hours_ta?: string;
  lat?: number;
  lng?: number;
  zone_en: string;
  zone_ta: string;
  division_en: string;
  division_ta: string;
  type: string;

  // New database fields
  station_name?: string;
  station_code?: string;
  station_type?: string;
  zone?: string;
  division?: string;
  category?: string;
  address?: string;
  landmark?: string;
  pincode?: string;
  alternate_phone?: string;
  latitude?: number;
  longitude?: number;
  inspector_name?: string;
  inspector_mobile?: string;
  station_image?: string;
  working_hours?: string;
  description?: string;
  jurisdiction_areas?: string;
  google_map_link?: string;
  is_active?: number;
  created_at?: string;
  updated_at?: string;
  area_name?: string;
  locality?: string;
}

export interface DBServiceRequest {
  id: number;
  applicantName: string;
  mobileNumber: string;
  email: string;
  address: string;
  serviceRequired: string;
  policeStation: string;
  message: string;
  receiptId: string;
  created_at: string;
}

export interface DBContactMessage {
  id: number;
  name: string;
  mobile: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export interface DBEmergencyContact {
  id: number;
  number: string;
  name_en: string;
  name_ta: string;
  desc_en: string;
  desc_ta: string;
}

export interface DBDepartmentLink {
  id: number;
  name_en: string;
  name_ta: string;
  url: string;
  desc_en: string;
  desc_ta: string;
}

export interface DBSeoSettings {
  id: number;
  site_title: string;
  site_description: string;
  default_keywords: string;
  organization_name: string;
  organization_logo: string;
  contact_number: string;
  address: string;
  site_url: string;
  social_facebook: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  google_analytics_id: string;
  google_tag_manager_id: string;
  google_search_console: string;
  bing_verification: string;
  default_robots: string;
  default_og_image: string;
  publisher_name: string;
  publisher_logo: string;
}

export interface DBAssetMetadata {
  id: number;
  image: string;
  title: string;
  articleId: number | null;
  articleSlug: string | null;
  category: string;
  createdAt: string;
}

export interface DBArticleSeo {
  id: number;
  article_id: number;
  content_type: string; // 'news' | 'slider' | 'video' | 'alert' | 'profile' | 'category' | 'homepage'
  seo_title: string;
  meta_description: string;
  meta_keywords: string;
  seo_slug: string;
  canonical_url: string;
  focus_keyword: string;
  secondary_keywords: string;
  article_tags: string;
  robots: string;
  og_title: string;
  og_description: string;
  og_image: string;
  og_url: string;
  og_type: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  twitter_card: string;
  image_alt: string;
  image_caption: string;
  image_title: string;
  image_description: string;
  news_category: string;
  author_name: string;
  schema_json: string;
  hreflang_en: string;
  hreflang_ta: string;
  seo_score: number;
  updated_at: string;
}

interface DecodeResult {
  status: boolean;
  decodedUrl?: string;
  message?: string;
}

async function getBase64Str(sourceUrl: string): Promise<{ status: boolean; base64Str?: string; message?: string }> {
  try {
    const url = new URL(sourceUrl);
    const path = url.pathname.split('/');
    if (
      url.hostname === 'news.google.com' &&
      path.length > 1 &&
      ['articles', 'read'].includes(path[path.length - 2])
    ) {
      return { status: true, base64Str: path[path.length - 1] };
    }
    return { status: false, message: 'Invalid Google News URL format.' };
  } catch (e: any) {
    return { status: false, message: `Error in getBase64Str: ${e.message}` };
  }
}

async function getDecodingParams(base64Str: string): Promise<{ status: boolean; signature?: string; timestamp?: string; base64Str?: string; message?: string }> {
  try {
    let url = `https://news.google.com/articles/${base64Str}`;
    let res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      url = `https://news.google.com/rss/articles/${base64Str}`;
      res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        }
      });
    }
    if (!res.ok) {
      return { status: false, message: `Failed to fetch data attributes: status ${res.status}` };
    }
    const html = await res.text();
    const sgMatch = html.match(/data-n-a-sg="([^"]+)"/);
    const tsMatch = html.match(/data-n-a-ts="([^"]+)"/);
    if (!sgMatch || !tsMatch) {
      return { status: false, message: 'Failed to fetch signature or timestamp from HTML.' };
    }
    return {
      status: true,
      signature: sgMatch[1],
      timestamp: tsMatch[1],
      base64Str
    };
  } catch (e: any) {
    return { status: false, message: `Error in getDecodingParams: ${e.message}` };
  }
}

async function decodeUrl(signature: string, timestamp: string, base64Str: string): Promise<DecodeResult> {
  try {
    const url = 'https://news.google.com/_/DotsSplashUi/data/batchexecute';
    const gartUrlReq = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${base64Str}",${timestamp},"${signature}"]`;
    const payload = [['Fbv4je', gartUrlReq]];
    const reqBody = `f.req=${encodeURIComponent(JSON.stringify([payload]))}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      },
      body: reqBody
    });
    if (!res.ok) {
      return { status: false, message: `Batch execute request failed: status ${res.status}` };
    }
    const text = await res.text();
    const parts = text.split('\n\n');
    if (parts.length < 2) {
      return { status: false, message: 'Invalid response format from batchexecute' };
    }
    const cleanText = parts[1].replace(/^\)\]\}'\s*/, '');
    const parsedData = JSON.parse(cleanText);
    const jsonStr = parsedData[0][2];
    const decodedUrl = JSON.parse(jsonStr)[1];
    return { status: true, decodedUrl };
  } catch (e: any) {
    return { status: false, message: `Error in decodeUrl: ${e.message}` };
  }
}

async function decodeGoogleNewsUrl(sourceUrl: string): Promise<DecodeResult> {
  if (!sourceUrl.includes('news.google.com')) {
    return { status: true, decodedUrl: sourceUrl };
  }
  const base64Res = await getBase64Str(sourceUrl);
  if (!base64Res.status || !base64Res.base64Str) return { status: false, message: base64Res.message };
  const paramsRes = await getDecodingParams(base64Res.base64Str);
  if (!paramsRes.status || !paramsRes.signature || !paramsRes.timestamp) return { status: false, message: paramsRes.message };
  return decodeUrl(paramsRes.signature || '', paramsRes.timestamp || '', paramsRes.base64Str || '');
}

class ChennaiGuardianDatabase {
  private dbType: "mysql" = "mysql";
  private cache: Record<string, any> = {};

  constructor() {
    this.initDatabaseSchema();
    registerMutationCallback(() => {
      this.clearCache();
    });
  }

  public clearCache() {
    this.cache = {};
  }

  private async initDatabaseSchema() {
    try {
      // Create superadmin_config table if not exists
      await query(`
        CREATE TABLE IF NOT EXISTS \`superadmin_config\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`config_key\` VARCHAR(255) UNIQUE NOT NULL,
          \`config_value\` LONGTEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Create custom_roles table if not exists
      await query(`
        CREATE TABLE IF NOT EXISTS \`custom_roles\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`role_name\` VARCHAR(255) UNIQUE NOT NULL,
          \`permissions_json\` LONGTEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      // Add missing columns to users table
      await Promise.all([
        query("ALTER TABLE \`users\` ADD COLUMN \`locked\` TINYINT DEFAULT 0").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`failed_logins\` INT DEFAULT 0").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`password_expiry\` VARCHAR(255) NULL").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`permissions_json\` LONGTEXT NULL").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`mobile\` VARCHAR(255) NULL").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`profile_photo\` LONGTEXT NULL").catch(() => {}),
        query("ALTER TABLE \`users\` ADD COLUMN \`force_password_change\` TINYINT DEFAULT 0").catch(() => {})
      ]);

      // Add missing columns to activity_logs table
      await query(`
        ALTER TABLE \`activity_logs\`
        ADD COLUMN IF NOT EXISTS \`role\` VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS \`ip_address\` VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS \`module\` VARCHAR(255) NULL
      `).catch(() => {
        // Fallback for older MySQL engines that do not support ADD COLUMN IF NOT EXISTS
        return Promise.all([
          query("ALTER TABLE \`activity_logs\` ADD COLUMN \`role\` VARCHAR(255) NULL").catch(() => {}),
          query("ALTER TABLE \`activity_logs\` ADD COLUMN \`ip_address\` VARCHAR(255) NULL").catch(() => {}),
          query("ALTER TABLE \`activity_logs\` ADD COLUMN \`module\` VARCHAR(255) NULL").catch(() => {})
        ]);
      });

      await Promise.all([
        query("ALTER TABLE \`activity_logs\` ADD COLUMN \`browser\` VARCHAR(255) NULL").catch(() => {}),
        query("ALTER TABLE \`activity_logs\` ADD COLUMN \`before_val\` LONGTEXT NULL").catch(() => {}),
        query("ALTER TABLE \`activity_logs\` ADD COLUMN \`after_val\` LONGTEXT NULL").catch(() => {})
      ]);

      // Seed default SUPER_ADMIN and ADMIN users if not already seeded
      const users: any = await query("SELECT * FROM \`users\`");
      if (users && users.length === 0) {
        await query(
          "INSERT INTO \`users\` (username, passwordHash, role, email, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW()), (?, ?, ?, ?, ?, NOW())",
          [
            "superadmin",
            hashPassword("admin123"),
            "SUPER_ADMIN",
            "superadmin@chennaiguardian.in",
            "active",
            "admin",
            hashPassword("admin123"),
            "ADMIN",
            "admin@chennaiguardian.in",
            "active"
          ]
        );
        console.log("Seeded default SUPER_ADMIN and ADMIN user accounts.");
      } else {
        // Ensure standard SUPER_ADMIN and ADMIN roles map correctly
        const hasSuperadmin = users.some((u: any) => u.username === "superadmin");
        if (!hasSuperadmin) {
          await query(
            "INSERT INTO \`users\` (username, passwordHash, role, email, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
            ["superadmin", hashPassword("admin123"), "SUPER_ADMIN", "superadmin@chennaiguardian.in", "active"]
          );
        }
        const hasAdmin = users.some((u: any) => u.username === "admin");
        if (!hasAdmin) {
          await query(
            "INSERT INTO \`users\` (username, passwordHash, role, email, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
            ["admin", hashPassword("admin123"), "ADMIN", "admin@chennaiguardian.in", "active"]
          );
        } else {
          // Force existing admin username to role ADMIN if it was previously superadmin, to conform to standard test roles
          await query(
            "UPDATE \`users\` SET \`role\` = 'ADMIN' WHERE \`username\` = 'admin'"
          );
        }

        // Add indexes to frequently searched columns
        await query("ALTER TABLE \`police_stations\` ADD INDEX \`idx_ps_zone\` (\`zone\`)").catch(() => {});
        await query("ALTER TABLE \`police_stations\` ADD INDEX \`idx_ps_division\` (\`division\`)").catch(() => {});
        await query("ALTER TABLE \`police_stations\` ADD INDEX \`idx_ps_type\` (\`type\`)").catch(() => {});
        await query("ALTER TABLE \`news\` ADD INDEX \`idx_news_published\` (\`published\`)").catch(() => {});

        // Seed default footer_config if not exists
        const existingConfig: any = await query("SELECT * FROM \`superadmin_config\` WHERE \`config_key\` = 'footer_config'");
        if (!existingConfig || existingConfig.length === 0) {
          const defaultFooter = {
            logo: "/images/gcp_logo.png",
            website_name_en: "CHENNAI GUARDIAN NEWS",
            website_name_ta: "சென்னை கார்டியன் செய்திகள்",
            description_en: "Official news platform of Chennai Guardian News, providing 24/7 updates on public safety, cyber alerts, and community-centered policing initiatives.",
            description_ta: "சென்னையின் முன்னணி சட்டம் ஒழுங்கு, குற்றப் புலனாய்வு மற்றும் மக்கள் விழிப்புணர்வு செய்திகளை உடனுக்குடன் வழங்கும் அதிகாரப்பூர்வ செய்தி ஊடகம்.",
            copyright_text_en: "© 2026 Chennai Guardian. All Rights Reserved.",
            copyright_text_ta: "© 2026 சென்னை கார்டியன். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
            developer_credit_en: "MCC MRF Innovation Park",
            developer_credit_ta: "எம்சிசி எம்ஆர்எஃப் கண்டுபிடிப்பு பூங்கா",
            address_en: "Commissioner Office, Greater Chennai Police, Vepery, Chennai - 600007",
            address_ta: "ஆணையர் அலுவலகம், சென்னை பெருநகர காவல், வேப்பேரி, சென்னை - 600007",
            phone: "044-23452300 (Office)",
            email: "cop@gcp.tn.gov.in",
            google_map_link: "https://maps.google.com/?q=Greater+Chennai+Police+Commissioner+Office+Vepery",
            social_facebook: "",
            social_twitter: "",
            social_youtube: "",
            social_instagram: "",
            background_image: "/images/gcp_headquarters.png",
            background_color: "#1e293b",
            text_color: "#ffffff",
            footer_visible: true,
            quick_links: [
              { id: "1", label_en: "Home", label_ta: "முகப்பு", url: "/", target_blank: false, active: true, order_index: 1 },
              { id: "2", label_en: "Crime News", label_ta: "குற்றம்", url: "/category/crime", target_blank: false, active: true, order_index: 2 },
              { id: "3", label_en: "Cyber Safety", label_ta: "இணைய பாதுகாப்பு", url: "/category/cyber-safety", target_blank: false, active: true, order_index: 3 },
              { id: "4", label_en: "Women Safety", label_ta: "பெண்கள் பாதுகாப்பு", url: "/category/women-safety", target_blank: false, active: true, order_index: 4 },
              { id: "5", label_en: "About Us", label_ta: "எங்களைப் பற்றி", url: "/about", target_blank: false, active: true, order_index: 5 },
              { id: "6", label_en: "Achievements", label_ta: "சாதனைகள்", url: "/achievements", target_blank: false, active: true, order_index: 6 },
              { id: "7", label_en: "Police Stations", label_ta: "காவல் நிலையங்கள்", url: "/stations", target_blank: false, active: true, order_index: 7 },
              { id: "8", label_en: "Grievance Form", label_ta: "மனு சமர்ப்பிப்பு", url: "/citizen-outreach", target_blank: false, active: true, order_index: 8 }
            ],
            government_links: [
              { id: "1", label_en: "TN Police", label_ta: "தமிழ்நாடு காவல்துறை", url: "https://www.tnpolice.gov.in", target_blank: true, active: true, order_index: 1 },
              { id: "2", label_en: "Gov of TN", label_ta: "தமிழ்நாடு அரசு", url: "https://www.tn.gov.in", target_blank: true, active: true, order_index: 2 },
              { id: "3", label_en: "Cyber Portal", label_ta: "சைபர் போர்டல்", url: "https://www.cybercrime.gov.in", target_blank: true, active: true, order_index: 3 }
            ]
          };
          await query(
            "INSERT INTO \`superadmin_config\` (config_key, config_value) VALUES (?, ?)",
            ["footer_config", JSON.stringify(defaultFooter)]
          );
          console.log("Seeded default footer_config in superadmin_config.");
        }
      }
    } catch (err) {
      console.error("Error in initDatabaseSchema:", err);
    }
  }

  // Helper for generic table queries
  private async getTable(tableName: string, jsonFields: string[] = []): Promise<any[]> {
    if (this.cache[tableName]) {
      return this.cache[tableName];
    }
    try {
      const rows: any = await query(`SELECT * FROM \`${tableName}\` ORDER BY id ASC`);
      if (!Array.isArray(rows)) return [];
      
      const result = rows.map(row => {
        const item = { ...row };
        for (const field of jsonFields) {
          if (item[field] && typeof item[field] === "string") {
            try {
              item[field] = JSON.parse(item[field]);
            } catch (e) {
              // Ignore parse error
            }
          }
        }
        return item;
      });
      this.cache[tableName] = result;
      return result;
    } catch (e) {
      console.error(`Error fetching table ${tableName}:`, e);
      return [];
    }
  }

  private async saveTable(tableName: string, items: any[]) {
    try {
      if (!items || !Array.isArray(items)) return;
      
      await transaction(async (connection) => {
        // Clear existing table records
        await connection.execute(`DELETE FROM \`${tableName}\``);
        
        if (items.length === 0) return;
        
        // Fetch valid columns for this table
        const [columnsInfo]: any = await connection.execute(`DESCRIBE \`${tableName}\``);
        const validColumns = new Set(columnsInfo.map((col: any) => col.Field));
        
        for (const item of items) {
          const keys = Object.keys(item).filter(k => validColumns.has(k));
          if (keys.length === 0) continue;
          
          const columns = keys.map(k => `\`${k}\``).join(", ");
          const placeholders = keys.map(() => "?").join(", ");
          
          const values = keys.map(k => {
            const val = item[k];
            if (val !== null && val !== undefined && typeof val === "object") {
              return JSON.stringify(val);
            }
            return val === undefined ? null : val;
          });
          
          const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
          await connection.execute(sql, values);
        }
      });
    } catch (e) {
      console.error(`Error saving table ${tableName}:`, e);
      throw e;
    }
  }

  // 1. Users Module
  public async getUsers(): Promise<DBUser[]> {
    return this.getTable("users") as Promise<DBUser[]>;
  }

  public async saveUsers(users: DBUser[]) {
    await this.saveTable("users", users);
  }

  // Custom Roles Module
  public async getCustomRoles(): Promise<any[]> {
    return this.getTable("custom_roles", ["permissions_json"]);
  }

  public async saveCustomRoles(roles: any[]) {
    await this.saveTable("custom_roles", roles);
  }

  // 2. News Module
  public async getNews(): Promise<DBNewsItem[]> {
    const jsonFields = ['content_en', 'content_ta', 'gallery', 'tags_en', 'tags_ta', 'highlights_en', 'highlights_ta', 'quote', 'timeline'];
    return this.getTable("news", jsonFields) as Promise<DBNewsItem[]>;
  }

  public async saveNews(news: DBNewsItem[]) {
    await this.saveTable("news", news);
  }

  // 3. Ticker Module
  public async getTicker(): Promise<DBTickerItem[]> {
    return this.getTable("ticker") as Promise<DBTickerItem[]>;
  }

  public async saveTicker(ticker: DBTickerItem[]) {
    await this.saveTable("ticker", ticker);
  }

  // 4. Slider Module
  public async getSlider(): Promise<DBSliderItem[]> {
    return this.getTable("slider") as Promise<DBSliderItem[]>;
  }

  public async saveSlider(slider: DBSliderItem[]) {
    await this.saveTable("slider", slider);
  }

  // 5. Profile Module
  public async getCommissionerProfile(): Promise<DBCommissionerProfile> {
    const jsonFields = ['timeline', 'awards', 'initiatives', 'gallery'];
    const list = await this.getTable("commissioner_profile", jsonFields);
    return (list[0] || {}) as DBCommissionerProfile;
  }

  public async saveCommissionerProfile(profile: DBCommissionerProfile) {
    await this.saveTable("commissioner_profile", [profile]);
  }

  // 6. Theme Settings
  public async getThemeSettings(): Promise<DBThemeSettings> {
    const list = await this.getTable("theme_settings");
    return (list[0] || {}) as DBThemeSettings;
  }

  public async saveThemeSettings(settings: DBThemeSettings) {
    await this.saveTable("theme_settings", [settings]);
  }

  // 7. Menu Items
  public async getMenuItems(): Promise<DBMenuItem[]> {
    return this.getTable("menu_items") as Promise<DBMenuItem[]>;
  }

  public async saveMenuItems(items: DBMenuItem[]) {
    await this.saveTable("menu_items", items);
  }

  // 8. Contacts Module
  public async getContacts(): Promise<DBContact[]> {
    return this.getTable("contacts") as Promise<DBContact[]>;
  }

  public async saveContacts(contacts: DBContact[]) {
    await this.saveTable("contacts", contacts);
  }

  // 9. TTS Settings
  public async getTtsSettings(): Promise<DBTtsSettings> {
    const list = await this.getTable("tts_settings");
    return (list[0] || {}) as DBTtsSettings;
  }

  public async saveTtsSettings(settings: DBTtsSettings) {
    await this.saveTable("tts_settings", [settings]);
  }

  // 10. Videos Module
  public async getVideos(): Promise<DBVideoItem[]> {
    return this.getTable("videos") as Promise<DBVideoItem[]>;
  }

  public async saveVideos(videos: DBVideoItem[]) {
    await this.saveTable("videos", videos);
  }

  // 11. Alerts Real-Time Synchronization & Moderation
  public async getAlerts(): Promise<DBAlertItem[]> {
    return this.getTable("alerts") as Promise<DBAlertItem[]>;
  }

  public async saveAlerts(alerts: DBAlertItem[]) {
    await this.saveTable("alerts", alerts);
  }

  public async getAlertSettings(): Promise<DBAlertSettings> {
    const list = await this.getTable("alert_settings");
    return (list[0] || {}) as DBAlertSettings;
  }

  public async saveAlertSettings(settings: DBAlertSettings) {
    await this.saveTable("alert_settings", [settings]);
  }

  // 12. SEO Settings Module
  public async getSeoSettings(): Promise<DBSeoSettings> {
    const list = await this.getTable("seo_settings");
    return (list[0] || {}) as DBSeoSettings;
  }

  public async saveSeoSettings(settings: DBSeoSettings) {
    await this.saveTable("seo_settings", [settings]);
  }

  // 13. Article SEO Module
  public async getArticleSeo(): Promise<DBArticleSeo[]> {
    return this.getTable("article_seo") as Promise<DBArticleSeo[]>;
  }

  public async saveArticleSeo(items: DBArticleSeo[]) {
    await this.saveTable("article_seo", items);
  }

  // 14. Asset Metadata Module
  public async getAssetMetadata(): Promise<DBAssetMetadata[]> {
    return this.getTable("asset_metadata") as Promise<DBAssetMetadata[]>;
  }

  public async saveAssetMetadata(items: DBAssetMetadata[]) {
    await this.saveTable("asset_metadata", items);
  }

  // 15. Police Stations Module
  public async getPoliceStations(): Promise<DBPoliceStation[]> {
    return this.getTable("police_stations") as Promise<DBPoliceStation[]>;
  }

  public async savePoliceStations(stations: DBPoliceStation[]) {
    await this.saveTable("police_stations", stations);
  }

  // 16. Emergency Contacts Module
  public async getEmergencyContacts(): Promise<DBEmergencyContact[]> {
    return this.getTable("emergency_contacts") as Promise<DBEmergencyContact[]>;
  }

  public async saveEmergencyContacts(contacts: DBEmergencyContact[]) {
    await this.saveTable("emergency_contacts", contacts);
  }

  // 17. Department Links Module
  public async getDepartmentLinks(): Promise<DBDepartmentLink[]> {
    return this.getTable("department_links") as Promise<DBDepartmentLink[]>;
  }

  public async saveDepartmentLinks(links: DBDepartmentLink[]) {
    await this.saveTable("department_links", links);
  }

  // 18. Service Requests Module
  public async getServiceRequests(): Promise<DBServiceRequest[]> {
    return this.getTable("service_requests") as Promise<DBServiceRequest[]>;
  }

  public async saveServiceRequests(requests: DBServiceRequest[]) {
    await this.saveTable("service_requests", requests);
  }

  // 19. Contact Messages Module
  public async getContactMessages(): Promise<DBContactMessage[]> {
    return this.getTable("contact_messages") as Promise<DBContactMessage[]>;
  }

  public async saveContactMessages(messages: DBContactMessage[]) {
    await this.saveTable("contact_messages", messages);
  }

  // 20. Activity Logs Module
  public async getActivityLogs(): Promise<DBActivityLog[]> {
    return this.getTable("activity_logs") as Promise<DBActivityLog[]>;
  }

  public async saveActivityLogs(logs: DBActivityLog[]) {
    await this.saveTable("activity_logs", logs);
  }

  public async addActivityLog(username: string, action: string) {
    try {
      const logs = await this.getActivityLogs();
      const id = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
      logs.unshift({
        id,
        username,
        action,
        timestamp: new Date().toISOString()
      });
      if (logs.length > 500) {
        logs.splice(500);
      }
      await this.saveActivityLogs(logs);
    } catch (e) {
      console.error("Error adding activity log:", e);
    }
  }

  public async getSuperadminConfig(): Promise<Record<string, any>> {
    try {
      const rows: any = await query("SELECT * FROM \`superadmin_config\`");
      const config: Record<string, any> = {};
      (rows || []).forEach((row: any) => {
        try {
          config[row.config_key] = JSON.parse(row.config_value);
        } catch {
          config[row.config_key] = row.config_value;
        }
      });
      return config;
    } catch (e) {
      console.error("Failed to get config:", e);
      return {};
    }
  }

  public async saveSuperadminConfig(key: string, value: any) {
    try {
      const serialized = typeof value === "string" ? value : JSON.stringify(value);
      await query(
        "INSERT INTO \`superadmin_config\` (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE \`config_value\` = ?",
        [key, serialized, serialized]
      );
    } catch (e) {
      console.error("Failed to save config:", e);
      throw e;
    }
  }

  public async addRbacAuditLog(
    username: string,
    role: string,
    ip: string,
    action: string,
    module: string,
    browser?: string,
    beforeVal?: string,
    afterVal?: string
  ) {
    try {
      const logs = await this.getActivityLogs();
      const id = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
      const newLog: DBActivityLog = {
        id,
        username,
        role,
        ip_address: ip,
        action,
        module,
        timestamp: new Date().toISOString(),
        browser,
        before_val: beforeVal,
        after_val: afterVal
      };
      logs.unshift(newLog);
      if (logs.length > 500) {
        logs.splice(500);
      }
      await this.saveActivityLogs(logs);
    } catch (e) {
      console.error("Error adding RBAC audit log:", e);
    }
  }

  public async backupDatabase(): Promise<string> {
    try {
      const tableNames = [
        "users", "news", "ticker", "slider", "commissioner_profile",
        "theme_settings", "menu_items", "contacts", "tts_settings", "videos",
        "alert_settings", "alerts", "seo_settings", "article_seo", "asset_metadata",
        "activity_logs", "police_stations", "emergency_contacts", "department_links",
        "service_requests", "contact_messages", "page_contents", "page_sections", "content_versions", "superadmin_config"
      ];
      const backupData: Record<string, any[]> = {};
      for (const name of tableNames) {
        const rows: any = await query(`SELECT * FROM \`${name}\` ORDER BY id ASC`);
        backupData[name] = rows || [];
      }
      return JSON.stringify(backupData, null, 2);
    } catch (e) {
      console.error("Backup failed:", e);
      throw e;
    }
  }

  public async restoreDatabase(backupJson: string): Promise<boolean> {
    try {
      const backupData = JSON.parse(backupJson);
      for (const [name, records] of Object.entries(backupData)) {
        if (Array.isArray(records)) {
          await this.saveTable(name, records);
        }
      }
      return true;
    } catch (e) {
      console.error("Restore failed:", e);
      return false;
    }
  }

  public async syncAlerts(force: boolean = false): Promise<{ success: boolean; newCount: number }> {
    try {
      const settings = await this.getAlertSettings();
      const enabled = settings.live_feed_enabled !== undefined ? settings.live_feed_enabled : settings.auto_fetch;
      if (!enabled && !force) {
        return { success: false, newCount: 0 };
      }

      const now = new Date();
      const intervalMinutes = settings.refresh_interval !== undefined ? settings.refresh_interval : 15;
      if (settings.last_fetched_at && !force) {
        const lastFetch = new Date(settings.last_fetched_at);
        const timeDiff = now.getTime() - lastFetch.getTime();
        if (timeDiff < intervalMinutes * 60 * 1000) {
          return { success: true, newCount: 0 };
        }
      }

      const approvedList = settings.approved_sources
        ? settings.approved_sources.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
        : ["tnpolice.gov.in", "gcp.tn.gov.in", "greaterchennaipolice.in", "tn.gov.in", "pib.gov.in"];

      const siteFilter = approvedList.map(site => `site:${site}`).join(" OR ");
      const feedUrl = `https://news.google.com/rss/search?q=Tamil+Nadu+Police+OR+Greater+Chennai+Police+(${encodeURIComponent(siteFilter)})&hl=en-IN&gl=IN&ceid=IN:en`;
      
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        next: { revalidate: 0 } 
      });

      if (!res.ok) {
        console.error("Failed to fetch RSS alerts feed:", res.statusText);
        return { success: false, newCount: 0 };
      }

      const xml = await res.text();
      
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>([\s\S]*?)<\/title>/i;
      const linkRegex = /<link>([\s\S]*?)<\/link>/i;
      const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;
      const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/i;

      const rawItems: any[] = [];
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        
        const titleMatch = itemXml.match(titleRegex);
        const linkMatch = itemXml.match(linkRegex);
        const pubDateMatch = itemXml.match(pubDateRegex);
        const sourceMatch = itemXml.match(sourceRegex);

        if (titleMatch && linkMatch) {
          const rawTitle = titleMatch[1].trim();
          const link = linkMatch[1].trim();
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
          const source = sourceMatch ? sourceMatch[1].trim() : "News Source";

          let title = rawTitle;
          const sourceSuffixIndex = title.lastIndexOf(` - ${source}`);
          if (sourceSuffixIndex !== -1) {
            title = title.substring(0, sourceSuffixIndex).trim();
          }

          rawItems.push({ title, link, pubDate, source });
        }
      }

      const itemsToProcess = rawItems.slice(0, 10);
      
      const resolvedItems = await Promise.all(
        itemsToProcess.map(async (item) => {
          try {
            const decodeRes = await decodeGoogleNewsUrl(item.link);
            if (decodeRes.status && decodeRes.decodedUrl) {
              return { ...item, resolvedUrl: decodeRes.decodedUrl };
            }
          } catch (err) {
            console.error("Error decoding URL:", item.link, err);
          }
          return null;
        })
      );

      const existingAlerts = await this.getAlerts();
      let addedCount = 0;
      let nextId = existingAlerts.length > 0 ? Math.max(...existingAlerts.map(a => a.id)) + 1 : 1;

      const newAlertItems: DBAlertItem[] = [];

      for (const item of resolvedItems) {
        if (!item || !item.resolvedUrl) continue;

        let isApprovedDomain = false;
        try {
          const urlObj = new URL(item.resolvedUrl);
          const hostname = urlObj.hostname.toLowerCase();
          isApprovedDomain = approvedList.some(domain => hostname.includes(domain));
        } catch (e) {
          isApprovedDomain = false;
        }

        if (!isApprovedDomain) {
          continue;
        }

        const isDuplicate = existingAlerts.some(
          a => a.url === item.resolvedUrl || a.title.toLowerCase() === item.title.toLowerCase()
        );

        if (!isDuplicate) {
          let category = "LAW & ORDER";
          const titleLower = item.title.toLowerCase();
          if (titleLower.includes("traffic") || titleLower.includes("road") || titleLower.includes("speed") || titleLower.includes("highway")) {
            category = "TRAFFIC UPDATE";
          } else if (titleLower.includes("cyber") || titleLower.includes("online") || titleLower.includes("scam") || titleLower.includes("whatsapp") || titleLower.includes("hacker") || titleLower.includes("fraud")) {
            category = "CYBER CRIME";
          } else if (titleLower.includes("safety") || titleLower.includes("advisory") || titleLower.includes("beware") || titleLower.includes("guideline") || titleLower.includes("warn")) {
            category = "SAFETY ADVISORY";
          } else if (titleLower.includes("award") || titleLower.includes("medal") || titleLower.includes("commend") || titleLower.includes("felicitat")) {
            category = "AWARDS & DECORATIONS";
          } else if (titleLower.includes("women") || titleLower.includes("girl") || titleLower.includes("singappen") || titleLower.includes("child")) {
            category = "WOMEN & CHILD SAFETY";
          }

          const publishedDate = new Date(item.pubDate);
          const publishedISO = isNaN(publishedDate.getTime()) ? new Date().toISOString() : publishedDate.toISOString();

          newAlertItems.push({
            id: nextId++,
            title: item.title,
            category,
            source: item.source,
            url: item.resolvedUrl,
            published_at: publishedISO,
            approved: settings.require_approval ? 0 : 1,
            pinned: 0,
            removed: 0,
            created_at: new Date().toISOString()
          });
          addedCount++;
        }
      }

      if (newAlertItems.length > 0) {
        const mergedAlerts = [...newAlertItems, ...existingAlerts];
        await this.saveAlerts(mergedAlerts);
      }

      settings.last_fetched_at = now.toISOString();
      await this.saveAlertSettings(settings);

      return { success: true, newCount: addedCount };
    } catch (e) {
      console.error("Alert sync failed with error:", e);
      return { success: false, newCount: 0 };
    }
  }

  public async getPageContent(pageName: string): Promise<{ seo: any; sections: any[] } | null> {
    const cacheKey = `page_content_${pageName}`;
    if (this.cache[cacheKey]) {
      return this.cache[cacheKey];
    }
    try {
      const pageRows: any = await query(
        "SELECT * FROM \`page_contents\` WHERE \`page_name\` = ?",
        [pageName]
      );
      if (!pageRows || pageRows.length === 0) return null;
      const page = pageRows[0];
      const targetVersionId = page.published_version_id;
      if (!targetVersionId) {
        const sections: any = await query(
          "SELECT * FROM \`page_sections\` WHERE \`page_content_id\` = ? ORDER BY \`display_order\` ASC",
          [page.id]
        );
        const result = {
          seo: {
            seo_title: page.seo_title,
            seo_description: page.seo_description,
            seo_keywords: page.seo_keywords
          },
          sections: (sections || []).map((s: any) => {
            let parsed = s.content_json;
            if (typeof parsed === "string") {
              try { parsed = JSON.parse(parsed); } catch {}
            }
            return { ...s, content_json: parsed };
          })
        };
        this.cache[cacheKey] = result;
        return result;
      }

      const versionResult: any = await query(
        "SELECT * FROM \`content_versions\` WHERE \`id\` = ?",
        [targetVersionId]
      );
      if (!versionResult || versionResult.length === 0) return null;
      const ver = versionResult[0];
      
      let parsedSeo = ver.seo_data;
      if (typeof parsedSeo === "string") {
        try { parsedSeo = JSON.parse(parsedSeo); } catch {}
      }
      let parsedSections = ver.sections_data;
      if (typeof parsedSections === "string") {
        try { parsedSections = JSON.parse(parsedSections); } catch {}
      }

      const result = {
        seo: parsedSeo,
        sections: parsedSections
      };
      this.cache[cacheKey] = result;
      return result;
    } catch (e) {
      console.error("Error in getPageContent:", e);
      return null;
    }
  }

  public async getResolvedPermissions(username: string, roleName: string): Promise<Record<string, string[]>> {
    const r = (roleName || "").toUpperCase().trim().replace(" ", "_");
    if (r === "SUPER_ADMIN" || r === "SUPERADMIN") {
      return DEFAULT_ROLE_PERMISSIONS["SUPER_ADMIN"];
    }

    const users = await this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user && user.permissions_json) {
      try {
        return JSON.parse(user.permissions_json);
      } catch {}
    }

    // Check custom roles table
    const customRoles = await this.getCustomRoles();
    const customRole = customRoles.find(cr => cr.role_name.toUpperCase().replace(" ", "_") === r);
    if (customRole && customRole.permissions_json) {
      try {
        return JSON.parse(customRole.permissions_json);
      } catch {}
    }

    // Fallback to default roles
    return DEFAULT_ROLE_PERMISSIONS[r] || DEFAULT_ROLE_PERMISSIONS["VIEWER"];
  }
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  "SUPER_ADMIN": {
    "*": ["view", "create", "edit", "delete", "publish", "approve", "upload", "download", "export", "import", "settings", "ai_generate", "preview"]
  },
  "ADMINISTRATOR": {
    "dashboard": ["view", "preview"],
    "menu-management": ["view", "edit", "publish"],
    "news": ["view", "create", "edit", "delete", "publish", "approve", "upload", "preview"],
    "media": ["view", "create", "edit", "delete", "upload"],
    "ticker": ["view", "create", "edit", "delete", "publish"],
    "slider": ["view", "create", "edit", "delete", "publish"],
    "videos": ["view", "create", "edit", "delete", "publish"],
    "alerts": ["view", "create", "edit", "delete", "publish"],
    "police-stations": ["view", "create", "edit", "delete", "publish"],
    "emergency-contacts": ["view", "create", "edit", "delete", "publish"],
    "department-links": ["view", "create", "edit", "delete", "publish"],
    "profile": ["view", "edit"],
    "theme": ["view", "edit"],
    "footer": ["view", "edit"],
    "settings": ["view", "edit"]
  },
  "CONTENT_MANAGER": {
    "dashboard": ["view"],
    "news": ["view", "create", "edit", "delete", "publish", "upload", "preview"],
    "media": ["view", "create", "upload"],
    "ticker": ["view", "create", "edit", "publish"],
    "slider": ["view", "create", "edit", "publish"],
    "videos": ["view", "create", "edit", "publish"],
    "alerts": ["view", "create", "edit", "publish"],
    "police-stations": ["view", "edit"],
    "profile": ["view", "edit"]
  },
  "NEWS_EDITOR": {
    "dashboard": ["view"],
    "news": ["view", "create", "edit", "publish", "upload", "preview"],
    "media": ["view", "create", "upload"],
    "profile": ["view", "edit"]
  },
  "STATION_MANAGER": {
    "dashboard": ["view"],
    "police-stations": ["view", "create", "edit", "publish"],
    "profile": ["view", "edit"]
  },
  "MEDIA_MANAGER": {
    "dashboard": ["view"],
    "media": ["view", "create", "edit", "delete", "upload"],
    "profile": ["view", "edit"]
  },
  "VIEWER": {
    "dashboard": ["view"],
    "news": ["view"],
    "police-stations": ["view"],
    "emergency-contacts": ["view"],
    "department-links": ["view"],
    "profile": ["view"]
  }
};

export const db = new ChennaiGuardianDatabase();

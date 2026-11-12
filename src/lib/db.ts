import crypto from "crypto";
import bcrypt from "bcryptjs";
import { query as mysqlQuery, transaction as mysqlTransaction } from "@/lib/mysql";
import { isArticlePubliclyVisible } from "@/lib/dateUtils";
import { setFastMaintenanceCache } from "@/lib/maintenanceFast";

// Username normalization policy
export function normalizeUsername(username: string | null | undefined): string {
  if (!username) return "";
  return username.trim().toLowerCase();
}

// Cryptographic hashing helper (enforcing salted bcrypt with work factor 12)
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 12);
}

export function legacyHashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Password verification helper (supports salted bcrypt hashes and constant-time legacy checks)
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch {
      return false;
    }
  }
  const computed = legacyHashPassword(password);
  if (computed.length !== storedHash.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(storedHash));
  } catch {
    return computed === storedHash;
  }
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

export interface DBSession {
  id: number;
  user_id?: number;
  username: string;
  session_id: string;
  created_at: string;
  last_activity: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
  revoked_at?: string | null;
  status: "active" | "expired" | "revoked";
}

export interface DBSecurityEvent {
  id: number;
  user_id?: number;
  username: string;
  event_type: string;
  severity: "info" | "warning" | "high" | "critical";
  ip_address?: string;
  user_agent?: string;
  details?: string;
  created_at: string;
}

export interface DBMaintenanceConfig {
  id: number;
  maintenance_enabled: boolean;
  maintenance_title_en: string;
  maintenance_description_en: string;
  maintenance_title_ta: string;
  maintenance_description_ta: string;
  expected_restoration_datetime: string | null;
  expected_restore_at?: string | null;
  maintenance_message_en?: string;
  maintenance_message_ta?: string;
  active_schedule_ref?: string | null;
  updated_by: string;
  updated_at: string;
}

export interface DBMaintenanceNotification {
  id: string;
  schedule_ref: string;
  scheduled_restoration_datetime: string;
  generated_at: string;
  status: "NEW" | "READ";
  read_by?: string | null;
  read_at?: string | null;
  created_at: string;
  maintenance_status_at_trigger: "ACTIVE" | "INACTIVE";
}

export interface DBSecurityConfig {
  admin_console_path: string;
  session_timeout_minutes: number;
  login_rate_limit: number;
  max_failed_logins: number;
  lockout_duration_minutes: number;
  captcha_enabled: boolean;
  mfa_policy: string;
  maintenance_mode: boolean;
}

export interface DBMediaFileRecord {
  id: number;
  uuid: string;
  original_name: string;
  stored_name: string;
  mime_type: string;
  detected_mime: string;
  extension: string;
  file_size: number;
  sha256_hash: string;
  storage_path: string;
  status: "QUARANTINED" | "APPROVED" | "REJECTED" | "DELETED";
  scan_status: "CLEAN" | "UNSCANNED" | "THREAT_DETECTED";
  uploaded_by: string;
  created_at: string;
}

export interface DBBackupRecord {
  id: string;
  backup_name: string;
  backup_type: "full" | "database" | "media" | "config";
  file_path: string;
  file_size: number;
  db_size: number;
  media_size: number;
  file_count: number;
  sha256_checksum: string;
  created_by: string;
  status: "CREATING" | "COMPLETED" | "VERIFIED" | "FAILED" | "CORRUPTED" | "RESTORING" | "RESTORED" | "DELETED";
  verification_status: "VERIFIED" | "UNVERIFIED" | "FAILED_VERIFICATION" | "CORRUPTED";
  created_at: string;
}

export interface DBSecurityFinding {
  id: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  title: string;
  endpoint: string;
  description: string;
  risk: string;
  remediation: string;
  status: "OPEN" | "IN_REVIEW" | "FIXED" | "ACCEPTED_RISK" | "FALSE_POSITIVE";
  detected_at: string;
}

export interface DBSecurityAssessmentRecord {
  id: string;
  assessment_date: string;
  created_by: string;
  score: number;
  status: "COMPLETED" | "RUNNING" | "FAILED";
  total_checks: number;
  passed_checks: number;
  findings_critical: number;
  findings_high: number;
  findings_medium: number;
  findings_low: number;
  findings_info: number;
  findings: DBSecurityFinding[];
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
  status?: "PUBLISHED" | "DRAFT" | "UNPUBLISHED" | "ARCHIVED" | string;
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
  published_at?: string;
  publishedAt?: string;
  updated_at?: string;
  created_at?: string;
  language?: string;
}

/**
 * Public Response Serializer / DTO Sanitizer.
 * Ensures internal editorial, administrative, or draft metadata is never leaked to public consumers.
 */
export function sanitizePublicNewsItem(item: DBNewsItem): DBNewsItem {
  return {
    id: item.id,
    slug: item.slug,
    category_en: item.category_en,
    category_ta: item.category_ta,
    title_en: item.title_en,
    title_ta: item.title_ta,
    summary_en: item.summary_en,
    summary_ta: item.summary_ta,
    content_en: item.content_en || [],
    content_ta: item.content_ta || [],
    image: item.image,
    gallery: item.gallery,
    date: item.date,
    author_en: item.author_en,
    author_ta: item.author_ta,
    tags_en: item.tags_en || [],
    tags_ta: item.tags_ta || [],
    section: item.section,
    published: 1,
    status: "PUBLISHED",
    highlights_en: item.highlights_en,
    highlights_ta: item.highlights_ta,
    quote: item.quote,
    timeline: item.timeline,
    sourceName: item.sourceName,
    sourceUrl: item.sourceUrl,
    views_count: item.views_count || 0,
    featured: item.featured,
    breaking: item.breaking,
    latest: item.latest,
    homepage_visible: item.homepage_visible,
    image_locked: item.image_locked,
    published_at: item.published_at || item.publishedAt,
    publishedAt: item.published_at || item.publishedAt,
    updated_at: item.updated_at,
    created_at: item.created_at,
    language: item.language,
  };
}

export interface DBFaq {
  id: number;
  question: string;
  question_ta?: string;
  answer: string;
  answer_ta?: string;
  category: string;
  display_order: number;
  status: "ACTIVE" | "INACTIVE";
  created_at: string;
  updated_at: string;
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

export interface DBMenu {
  id: number;
  name_en: string;
  name_ta: string;
  slug: string;
  icon?: string | null;
  display_order: number;
  url: string;
  page_type: string;
  status: "active" | "inactive";
  open_in_new_tab: number;
  subMenus?: DBSubMenu[];
}

export interface DBSubMenu {
  id: number;
  parent_menu_id: number;
  parent_sub_id?: number | null;
  name_en: string;
  name_ta: string;
  slug: string;
  url: string;
  icon?: string | null;
  display_order: number;
  status: "active" | "inactive";
  open_in_new_tab?: number;
  subMenus?: DBSubMenu[];
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
  source: string; // "THE HINDU" | "THE NEW INDIAN EXPRESS"
  source_name?: string;
  source_url?: string;
  url: string;
  article_url?: string;
  summary?: string;
  image_url?: string;
  published_at: string; // ISO string
  fetched_at?: string;
  external_id?: string;
  language?: string;
  status?: string;
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
  name_en?: string;
  name_ta?: string;
  address_en?: string;
  address_ta?: string;
  phone?: string;
  phone_no?: string;
  email?: string;
  incharge_en?: string;
  incharge_ta?: string;
  designation_en?: string;
  designation_ta?: string;
  hours_en?: string;
  hours_ta?: string;
  lat?: number;
  lng?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
  zone_en?: string;
  zone_ta?: string;
  division_en?: string;
  division_ta?: string;
  type?: string;
  station_name?: string;
  station_name_ta?: string;
  station_code?: string;
  address?: string;
  ps_address?: string;
  district?: string;
  sdo?: string;
  range?: string;
  range_name?: string;
  pincode?: string;
  inspector_name?: string;
  inspector_mobile?: string;
  landmark?: string;
  jurisdiction_areas?: string;
  working_hours?: string;
  google_map_link?: string;
  alternate_phone?: string;
  zone?: string;
  division?: string;
  category?: string;
  station_type?: string;
  status?: string;
  is_active?: number;
  deleted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  locality?: string;
  area_name?: string;
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

export interface DBWebStory {
  id: number;
  title_en: string;
  title_ta: string;
  cover_image: string;
  slides_json: string; // JSON array of slides
  category_en?: string;
  category_ta?: string;
  status?: "active" | "inactive";
  active?: number;
  views_count?: number;
  created_at?: string;
  news_slug?: string;
}

export interface DBCustomRole {
  id: number;
  role_name: string;
  permissions_json: string;
}

export interface DBPageContent {
  id: number;
  menu_id?: number | null;
  sub_menu_id?: number | null;
  page_name: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  draft_version_id?: number | null;
  published_version_id?: number | null;
  last_updated_by?: string;
  last_updated_at?: string;
}

export interface DBContentVersion {
  id: number;
  page_content_id: number;
  version_num: number;
  sections_data: string; // JSON string
  seo_data: string;      // JSON string
  status: "draft" | "published";
  updated_by: string;
  updated_at: string;
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

export interface DBContactMessage {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
  status?: string;
  created_at?: string;
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
  include_in_sitemap?: boolean;
  sitemap_priority?: string | number;
  sitemap_changefreq?: string;
  robots_indexing?: string;
  robots_following?: string;
}

export interface DBUserMfa {
  id: number;
  user_id?: number;
  username: string;
  secret_encrypted: string;
  method: "TOTP";
  enabled: number; // 0 or 1
  verified_at?: string | null;
  created_at: string;
}

export interface DBMfaChallenge {
  id: number;
  challenge_id: string;
  username: string;
  expires_at: string;
  attempt_count: number;
  verified: number; // 0 or 1
  created_at: string;
}

export interface DBMfaRecoveryCode {
  id: number;
  username: string;
  code_hash: string;
  used_at?: string | null;
  created_at: string;
}

export interface DBTrustedDevice {
  id: number;
  username: string;
  token_hash: string;
  device_name: string;
  user_agent_summary: string;
  created_at: string;
  last_used_at: string;
  expires_at: string;
  revoked_at?: string | null;
}

export interface DBServiceRequest {
  id: number;
  name?: string;
  mobile?: string;
  email?: string;
  subject?: string;
  category?: string;
  message?: string;
  status?: string;
  created_at?: string;
  applicantName?: string;
  mobileNumber?: string;
  address?: string;
  serviceRequired?: string;
  policeStation?: string;
}

export interface DBCitizenServiceCategory {
  id: number;
  name?: string;
  name_en: string;
  name_ta: string;
  slug: string;
  description?: string;
  description_en?: string;
  description_ta?: string;
  display_order: number;
  is_active: number; // 1 or 0
  created_at: string;
  updated_at: string;
}

export interface DBCitizenService {
  id: number;
  category_id: number;
  service_name?: string;
  service_name_en: string;
  service_name_ta: string;
  description?: string;
  description_en: string;
  description_ta: string;
  icon: string;
  external_url: string | null;
  display_order: number;
  is_active: number; // 1 or 0
  is_featured: number; // 1 or 0
  open_in_new_tab: number; // 1 or 0
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface DBVisitorStats {
  id: number;
  total_page_views: number;
  created_at: string;
  updated_at: string;
}

export interface DBDailyVisits {
  id: number;
  visit_date: string;
  page_views: number;
  created_at: string;
  updated_at: string;
}

// Pure in-memory offline fallback store (used only when MySQL is unavailable; zero db.json disk I/O)
class InMemoryStore {
  private data: Record<string, any> = {};

  public getTable<T = any>(name: string): T {
    return (this.data[name] ?? []) as T;
  }

  public updateCacheOnly(name: string, items: any) {
    this.data[name] = items;
  }

  public setTable(name: string, items: any) {
    this.data[name] = items;
  }
}

interface TableSchemaMeta {
  createSql?: string;
  ensureColumns?: Array<[string, string]>;
  modifyIdVarchar?: boolean;
  jsonColumns?: string[];
  defaultOrderBy?: string;
  revalidateLayout?: boolean;
  revalidatePaths?: string[];
}

const MYSQL_TABLE_META: Record<string, TableSchemaMeta> = {
  users: {
    createSql: `CREATE TABLE IF NOT EXISTS \`users\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(255) NOT NULL,
      \`passwordHash\` VARCHAR(255) NOT NULL,
      \`role\` VARCHAR(100) NULL,
      \`email\` VARCHAR(255) NULL,
      \`status\` VARCHAR(50) NULL,
      \`permissions_json\` LONGTEXT NULL,
      \`mfa_enabled\` DOUBLE NULL,
      \`mfa_secret\` VARCHAR(255) NULL,
      \`createdAt\` VARCHAR(64) NULL,
      \`lastLogin\` VARCHAR(64) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  },
  custom_roles: {
    createSql: `CREATE TABLE IF NOT EXISTS \`custom_roles\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`role_name\` VARCHAR(255) NULL,
      \`description\` LONGTEXT NULL,
      \`permissions_json\` LONGTEXT NULL,
      \`created_at\` VARCHAR(64) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ensureColumns: [
      ["role_name", "VARCHAR(255) NULL"],
      ["description", "LONGTEXT NULL"],
      ["permissions_json", "LONGTEXT NULL"],
      ["created_at", "VARCHAR(64) NULL"],
    ],
  },
  activity_logs: {
    createSql: `CREATE TABLE IF NOT EXISTS \`activity_logs\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`username\` VARCHAR(255) NULL,
      \`action\` LONGTEXT NULL,
      \`timestamp\` VARCHAR(64) NULL,
      \`role\` VARCHAR(100) NULL,
      \`ip_address\` VARCHAR(100) NULL,
      \`module\` VARCHAR(150) NULL,
      \`browser\` LONGTEXT NULL,
      \`before_val\` LONGTEXT NULL,
      \`after_val\` LONGTEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    defaultOrderBy: "`id` DESC",
  },
  news: {
    ensureColumns: [
      ["status", "VARCHAR(50) NULL"],
      ["image_locked", "DOUBLE NULL"],
      ["scheduled_at", "VARCHAR(64) NULL"],
      ["published_at", "VARCHAR(64) NULL"],
      ["publishedAt", "VARCHAR(64) NULL"],
    ],
    jsonColumns: [
      "content_en",
      "content_ta",
      "gallery",
      "tags_en",
      "tags_ta",
      "highlights_en",
      "highlights_ta",
      "quote",
      "timeline",
    ],
    revalidatePaths: ["/", "/news"],
  },
  ticker: {
    ensureColumns: [["url", "VARCHAR(500) NULL"]],
    defaultOrderBy: "`order_num` ASC, `id` ASC",
    revalidateLayout: true,
  },
  slider: {
    ensureColumns: [
      ["desc_en", "MEDIUMTEXT NULL"],
      ["desc_ta", "MEDIUMTEXT NULL"],
      ["title_en", "TEXT NULL"],
      ["title_ta", "TEXT NULL"],
      ["src", "LONGTEXT NULL"],
      ["slug", "VARCHAR(255) NULL"],
      ["url", "TEXT NULL"],
    ],
    defaultOrderBy: "`order_num` ASC, `id` ASC",
    revalidateLayout: true,
    revalidatePaths: ["/"],
  },
  commissioner_profile: {
    ensureColumns: [
      ["motto_en", "LONGTEXT NULL"],
      ["motto_ta", "LONGTEXT NULL"],
      ["birthplace_en", "LONGTEXT NULL"],
      ["birthplace_ta", "LONGTEXT NULL"],
      ["education_en", "LONGTEXT NULL"],
      ["education_ta", "LONGTEXT NULL"],
      ["vision_en", "LONGTEXT NULL"],
      ["vision_ta", "LONGTEXT NULL"],
    ],
    jsonColumns: ["gallery", "initiatives", "awards", "timeline"],
    revalidatePaths: ["/", "/about", "/commissioner"],
  },
  theme_settings: {
    revalidateLayout: true,
  },
  menu_items: {
    defaultOrderBy: "`order_num` ASC, `id` ASC",
    revalidateLayout: true,
  },
  menus: {
    defaultOrderBy: "`display_order` ASC, `id` ASC",
    revalidateLayout: true,
  },
  sub_menus: {
    ensureColumns: [["open_in_new_tab", "DOUBLE NULL"]],
    defaultOrderBy: "`display_order` ASC, `id` ASC",
    revalidateLayout: true,
  },
  contacts: {},
  tts_settings: {},
  videos: {
    revalidatePaths: ["/", "/videos"],
  },
  alerts: {
    defaultOrderBy: "`id` DESC",
  },
  alert_settings: {
    jsonColumns: ["approved_sources"],
  },
  seo_settings: {
    revalidateLayout: true,
  },
  article_seo: {},
  asset_metadata: {},
  police_stations: {
    defaultOrderBy: "`id` ASC",
    revalidatePaths: ["/", "/stations"],
  },
  emergency_contacts: {
    defaultOrderBy: "`display_order` ASC, `id` ASC",
    revalidateLayout: true,
  },
  department_links: {
    defaultOrderBy: "`display_order` ASC, `id` ASC",
    revalidateLayout: true,
  },
  web_stories: {
    defaultOrderBy: "`id` ASC",
    revalidatePaths: ["/"],
  },
  contact_messages: {
    createSql: `CREATE TABLE IF NOT EXISTS \`contact_messages\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`name\` VARCHAR(255) NULL,
      \`mobile\` VARCHAR(255) NULL,
      \`email\` VARCHAR(255) NULL,
      \`subject\` VARCHAR(255) NULL,
      \`category\` VARCHAR(255) NULL,
      \`message\` LONGTEXT NULL,
      \`status\` VARCHAR(255) NULL,
      \`created_at\` VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  },
  service_requests: {},
  page_contents: {
    revalidateLayout: true,
  },
  content_versions: {},
  media_files: {
    createSql: `CREATE TABLE IF NOT EXISTS \`media_files\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`uuid\` VARCHAR(255) NULL,
      \`original_name\` VARCHAR(255) NULL,
      \`stored_name\` VARCHAR(255) NULL,
      \`mime_type\` VARCHAR(255) NULL,
      \`detected_mime\` VARCHAR(255) NULL,
      \`extension\` VARCHAR(255) NULL,
      \`file_size\` DOUBLE NULL,
      \`sha256_hash\` LONGTEXT NULL,
      \`storage_path\` LONGTEXT NULL,
      \`status\` VARCHAR(255) NULL,
      \`scan_status\` VARCHAR(255) NULL,
      \`uploaded_by\` VARCHAR(255) NULL,
      \`created_at\` VARCHAR(255) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ensureColumns: [
      ["uuid", "VARCHAR(255) NULL"],
      ["original_name", "VARCHAR(255) NULL"],
      ["stored_name", "VARCHAR(255) NULL"],
      ["mime_type", "VARCHAR(255) NULL"],
      ["detected_mime", "VARCHAR(255) NULL"],
      ["extension", "VARCHAR(255) NULL"],
      ["file_size", "DOUBLE NULL"],
      ["sha256_hash", "LONGTEXT NULL"],
      ["storage_path", "LONGTEXT NULL"],
      ["status", "VARCHAR(255) NULL"],
      ["scan_status", "VARCHAR(255) NULL"],
      ["uploaded_by", "VARCHAR(255) NULL"],
      ["created_at", "VARCHAR(255) NULL"],
    ],
    defaultOrderBy: "`id` DESC",
  },
  backups: {
    modifyIdVarchar: true,
    createSql: `CREATE TABLE IF NOT EXISTS \`backups\` (
      \`id\` VARCHAR(128) NOT NULL PRIMARY KEY,
      \`backup_name\` VARCHAR(255) NULL,
      \`backup_type\` VARCHAR(64) NULL,
      \`file_path\` VARCHAR(500) NULL,
      \`file_size\` DOUBLE NULL,
      \`db_size\` DOUBLE NULL,
      \`media_size\` DOUBLE NULL,
      \`file_count\` DOUBLE NULL,
      \`sha256_checksum\` VARCHAR(255) NULL,
      \`created_by\` VARCHAR(255) NULL,
      \`status\` VARCHAR(64) NULL,
      \`verification_status\` VARCHAR(64) NULL,
      \`created_at\` VARCHAR(64) NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ensureColumns: [
      ["backup_name", "VARCHAR(255) NULL"],
      ["backup_type", "VARCHAR(64) NULL"],
      ["file_path", "VARCHAR(500) NULL"],
      ["file_size", "DOUBLE NULL"],
      ["db_size", "DOUBLE NULL"],
      ["media_size", "DOUBLE NULL"],
      ["file_count", "DOUBLE NULL"],
      ["sha256_checksum", "VARCHAR(255) NULL"],
      ["created_by", "VARCHAR(255) NULL"],
      ["status", "VARCHAR(64) NULL"],
      ["verification_status", "VARCHAR(64) NULL"],
      ["created_at", "VARCHAR(64) NULL"],
    ],
    defaultOrderBy: "`created_at` DESC",
  },
  security_assessments: {
    modifyIdVarchar: true,
    createSql: `CREATE TABLE IF NOT EXISTS \`security_assessments\` (
      \`id\` VARCHAR(128) NOT NULL PRIMARY KEY,
      \`assessment_date\` VARCHAR(64) NULL,
      \`created_by\` VARCHAR(255) NULL,
      \`score\` DOUBLE NULL,
      \`status\` VARCHAR(64) NULL,
      \`total_checks\` DOUBLE NULL,
      \`passed_checks\` DOUBLE NULL,
      \`findings_critical\` DOUBLE NULL,
      \`findings_high\` DOUBLE NULL,
      \`findings_medium\` DOUBLE NULL,
      \`findings_low\` DOUBLE NULL,
      \`findings_info\` DOUBLE NULL,
      \`findings\` LONGTEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ensureColumns: [
      ["assessment_date", "VARCHAR(64) NULL"],
      ["created_by", "VARCHAR(255) NULL"],
      ["score", "DOUBLE NULL"],
      ["status", "VARCHAR(64) NULL"],
      ["total_checks", "DOUBLE NULL"],
      ["passed_checks", "DOUBLE NULL"],
      ["findings_critical", "DOUBLE NULL"],
      ["findings_high", "DOUBLE NULL"],
      ["findings_medium", "DOUBLE NULL"],
      ["findings_low", "DOUBLE NULL"],
      ["findings_info", "DOUBLE NULL"],
      ["findings", "LONGTEXT NULL"],
    ],
    jsonColumns: ["findings"],
    defaultOrderBy: "`assessment_date` DESC",
  },
  superadmin_config: {
    createSql: `CREATE TABLE IF NOT EXISTS \`superadmin_config\` (
      \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      \`footer_config\` LONGTEXT NULL,
      \`config_json\` LONGTEXT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ensureColumns: [["config_json", "LONGTEXT NULL"]],
    jsonColumns: ["footer_config", "config_json"],
    revalidateLayout: true,
  },
  security_events: {
    ensureColumns: [["user_id", "DOUBLE NULL"]],
    defaultOrderBy: "`id` DESC",
  },
  security_config: {},
  sessions: {
    ensureColumns: [["user_id", "DOUBLE NULL"]],
  },
  user_mfa: {},
  mfa_challenges: {},
  mfa_recovery_codes: {},
  trusted_devices: {},
  faqs: {
    defaultOrderBy: "`display_order` ASC, `id` ASC",
    revalidatePaths: ["/", "/faq"],
  },
};

function safeParseJsonField(val: any): any {
  if (typeof val !== "string") return val;
  const trimmed = val.trim();
  if (!trimmed) return val;
  if (
    (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
    (trimmed.startsWith("{") && trimmed.endsWith("}"))
  ) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return val;
    }
  }
  return val;
}

export async function syncTableToMySQL(tableName: string, items: any): Promise<void> {
  const list = Array.isArray(items) ? items : [items];
  await db.persistTableToMySQL(tableName, list);
}

const globalWithDb = globalThis as typeof globalThis & {
  _chennaiGuardianMemoryDb?: InMemoryStore;
  _chennaiGuardianDb?: ChennaiGuardianDatabase;
};

let memoryDb: InMemoryStore;
if (globalWithDb._chennaiGuardianMemoryDb) {
  memoryDb = globalWithDb._chennaiGuardianMemoryDb;
} else {
  memoryDb = new InMemoryStore();
  globalWithDb._chennaiGuardianMemoryDb = memoryDb;
}

// Dynamic Database Interface (100% MySQL `chennaiguardian` backed)
class ChennaiGuardianDatabase {
  private readyTables = new Set<string>();
  private tableColumns = new Map<string, Set<string>>();

  private async ensureMySqlTable(tableName: string): Promise<Set<string>> {
    if (!this.readyTables) {
      this.readyTables = new Set<string>();
    }
    if (!this.tableColumns) {
      this.tableColumns = new Map<string, Set<string>>();
    }
    if (this.readyTables.has(tableName) && this.tableColumns.has(tableName)) {
      return this.tableColumns.get(tableName)!;
    }

    const meta = MYSQL_TABLE_META[tableName];
    if (meta?.createSql) {
      await mysqlQuery(meta.createSql);
    }

    let colRows = (await mysqlQuery(`SHOW COLUMNS FROM \`${tableName}\``)) as Array<{ Field: string; Type: string }>;
    if (meta?.modifyIdVarchar) {
      const idCol = colRows.find((r) => r.Field === "id");
      if (idCol && /^(int|bigint|smallint|tinyint|mediumint)/i.test(idCol.Type || "")) {
        try {
          await mysqlQuery(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`id\` VARCHAR(128) NOT NULL`);
        } catch {}
      }
    }

    let colSet = new Set(colRows.map((r) => r.Field));
    if (meta?.ensureColumns && meta.ensureColumns.length > 0) {
      let altered = false;
      for (const [col, def] of meta.ensureColumns) {
        if (!colSet.has(col)) {
          try {
            await mysqlQuery(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${col}\` ${def}`);
            altered = true;
          } catch {}
        } else if (def.toUpperCase().includes("TEXT")) {
          try {
            await mysqlQuery(`ALTER TABLE \`${tableName}\` MODIFY COLUMN \`${col}\` ${def}`);
          } catch {}
        }
      }
      if (altered) {
        colRows = (await mysqlQuery(`SHOW COLUMNS FROM \`${tableName}\``)) as Array<{ Field: string; Type: string }>;
        colSet = new Set(colRows.map((r) => r.Field));
      }
    }

    this.tableColumns.set(tableName, colSet);
    this.readyTables.add(tableName);
    return colSet;
  }

  private revalidateAppPaths(tableName: string) {
    const meta = MYSQL_TABLE_META[tableName];
    if (!meta?.revalidateLayout && (!meta?.revalidatePaths || meta.revalidatePaths.length === 0)) {
      return;
    }
    try {
      const { revalidatePath } = require("next/cache");
      if (meta.revalidateLayout) {
        revalidatePath("/", "layout");
      }
      if (meta.revalidatePaths) {
        for (const p of meta.revalidatePaths) {
          revalidatePath(p);
        }
      }
    } catch {
      // Ignore outside Next.js server request context
    }
  }

  private async mysqlReadTable<T = any>(tableName: string, orderByOverride?: string): Promise<T[]> {
    try {
      const cols = await this.ensureMySqlTable(tableName);
      const colsLower = new Set([...cols].map((c) => c.toLowerCase()));
      const meta = MYSQL_TABLE_META[tableName];
      const rawOrderBy = orderByOverride ?? meta?.defaultOrderBy ?? "`id` ASC";
      const safeOrderBy = rawOrderBy
        .split(",")
        .map((part) => part.trim())
        .filter((part) => {
          const colMatch = part.match(/^`?([a-zA-Z0-9_]+)`?/);
          return colMatch ? colsLower.has(colMatch[1].toLowerCase()) : false;
        })
        .join(", ");
      const orderBy = safeOrderBy || (colsLower.has("id") ? "`id` ASC" : "");
      const sql = orderBy ? `SELECT * FROM \`${tableName}\` ORDER BY ${orderBy}` : `SELECT * FROM \`${tableName}\``;
      const rows = (await mysqlQuery(sql)) as any[];
      const jsonCols = meta?.jsonColumns;
      const normalized = (rows || []).map((row) => {
        if (!jsonCols || jsonCols.length === 0) return row;
        const copy = { ...row };
        for (const col of jsonCols) {
          if (copy[col] !== undefined && copy[col] !== null) {
            copy[col] = safeParseJsonField(copy[col]);
          }
        }
        return copy;
      });
      memoryDb.updateCacheOnly(tableName, normalized);
      return normalized as T[];
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        return memoryDb.getTable<T[]>(tableName) || [];
      }
      console.warn(`[MySQL] Read table ${tableName} warning:`, err?.message || err);
      return memoryDb.getTable<T[]>(tableName) || [];
    }
  }

  public async persistTableToMySQL(tableName: string, items: any[]): Promise<void> {
    const records = (Array.isArray(items) ? items : [items]).filter((r) => r && typeof r === "object");
    memoryDb.updateCacheOnly(tableName, records);
    try {
      const cols = await this.ensureMySqlTable(tableName);
      const hasIdCol = cols.has("id");

      await mysqlTransaction(async (conn) => {
        if (records.length === 0) {
          await conn.execute(`DELETE FROM \`${tableName}\``);
          return;
        }

        if (hasIdCol) {
          const [existingRows] = (await conn.execute(`SELECT \`id\` FROM \`${tableName}\``)) as [Array<{ id: any }>, any];
          const incomingIdSet = new Set(
            records
              .map((r) => (r as any).id)
              .filter((id) => id !== undefined && id !== null && id !== "")
              .map((id) => String(id))
          );
          const toDelete = (existingRows || [])
            .map((r) => r.id)
            .filter((id) => !incomingIdSet.has(String(id)));

          for (let i = 0; i < toDelete.length; i += 200) {
            const batchIds = toDelete.slice(i, i + 200);
            const placeholders = batchIds.map(() => "?").join(", ");
            await conn.execute(`DELETE FROM \`${tableName}\` WHERE \`id\` IN (${placeholders})`, batchIds);
          }
        } else {
          await conn.execute(`DELETE FROM \`${tableName}\``);
        }

        await this.upsertRowsInMySQL(tableName, records, cols, conn);
      });

      this.revalidateAppPaths(tableName);
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        console.warn(`[MySQL Persistence] persistTableToMySQL(${tableName}) skipped (MySQL unavailable):`, err?.message || err);
        return;
      }
      console.error(`[MySQL Persistence] persistTableToMySQL(${tableName}) failed:`, err);
      throw err;
    }
  }
  // Users
  public async getUsers(): Promise<DBUser[]> {
    return this.mysqlReadTable<DBUser>("users");
  }
  public async saveUsers(users: DBUser[]) {
    await this.persistTableToMySQL("users", users);
  }
  public async getUserById(id: number): Promise<DBUser | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  }
  public async getUserByUsername(username: string): Promise<DBUser | undefined> {
    const users = await this.getUsers();
    const target = normalizeUsername(username);
    return users.find((u) => normalizeUsername(u.username) === target);
  }

  // Roles & Logs
  public async getCustomRoles(): Promise<DBCustomRole[]> {
    return this.mysqlReadTable<DBCustomRole>("custom_roles");
  }
  public async saveCustomRoles(roles: DBCustomRole[]) {
    await this.persistTableToMySQL("custom_roles", roles);
  }

  public async getActivityLogs(): Promise<DBActivityLog[]> {
    return this.mysqlReadTable<DBActivityLog>("activity_logs", "`id` DESC");
  }
  public async saveActivityLogs(logs: DBActivityLog[]) {
    await this.persistTableToMySQL("activity_logs", logs);
  }
  private async insertActivityLogRow(entry: Omit<DBActivityLog, "id">) {
    try {
      const cols = await this.ensureMySqlTable("activity_logs");
      const allowedKeys = Object.keys(entry).filter((k) => cols.has(k) && (entry as any)[k] !== undefined);
      if (allowedKeys.length > 0) {
        const escaped = allowedKeys.map((k) => `\`${k}\``).join(", ");
        const placeholders = allowedKeys.map(() => "?").join(", ");
        const vals = allowedKeys.map((k) => (entry as any)[k]);
        await mysqlQuery(`INSERT INTO \`activity_logs\` (${escaped}) VALUES (${placeholders})`, vals);
        // Keep table bounded to latest 500 entries
        await mysqlQuery(
          "DELETE FROM `activity_logs` WHERE `id` NOT IN (SELECT id FROM (SELECT `id` FROM `activity_logs` ORDER BY `id` DESC LIMIT 500) AS recent)"
        );
      }
      memoryDb.updateCacheOnly("activity_logs", [
        { id: Date.now(), ...entry },
        ...(memoryDb.getTable<DBActivityLog[]>("activity_logs") || []).slice(0, 499),
      ]);
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const logs = [...(memoryDb.getTable<DBActivityLog[]>("activity_logs") || [])];
        const id = logs.length > 0 ? Math.max(...logs.map((l) => l.id || 0)) + 1 : 1;
        logs.unshift({ id, ...entry });
        if (logs.length > 500) logs.splice(500);
        memoryDb.updateCacheOnly("activity_logs", logs);
        return;
      }
      console.warn("[MySQL] insertActivityLogRow warning:", err?.message || err);
    }
  }
  public async addActivityLog(username: string, action: string) {
    await this.insertActivityLogRow({
      username,
      action,
      timestamp: new Date().toISOString(),
    });
  }
  public async addRbacAuditLog(username: string, role: string, ip: string, action: string, moduleName: string, browser?: string, beforeVal?: string, afterVal?: string) {
    await this.insertActivityLogRow({
      username,
      role,
      ip_address: ip,
      action,
      module: moduleName,
      timestamp: new Date().toISOString(),
      browser,
      before_val: beforeVal,
      after_val: afterVal,
    });
  }

  public async getResolvedPermissions(username: string, roleName: string): Promise<Record<string, string[]>> {
    const r = (roleName || "").toUpperCase().trim().replace(" ", "_");
    if (r === "SUPER_ADMIN" || r === "SUPERADMIN") {
      return DEFAULT_ROLE_PERMISSIONS["SUPER_ADMIN"];
    }
    const user = await this.getUserByUsername(username);
    if (user && user.permissions_json) {
      try {
        const customObj = JSON.parse(user.permissions_json);
        if (customObj && Object.keys(customObj).length > 0) {
          return customObj;
        }
      } catch (e) { }
    }
    const roles = await this.getCustomRoles();
    const matchedRole = roles.find((cr) => cr.role_name.toUpperCase().trim().replace(" ", "_") === r);
    if (matchedRole && matchedRole.permissions_json) {
      try {
        return JSON.parse(matchedRole.permissions_json);
      } catch (e) { }
    }
    return DEFAULT_ROLE_PERMISSIONS[r] || DEFAULT_ROLE_PERMISSIONS["CONTENTADMIN"] || {};
  }

  // News
  public async getNews(): Promise<DBNewsItem[]> {
    const raw = await this.mysqlReadTable<DBNewsItem>("news", "`id` DESC");

    const normalized = raw.map((item) => {
      let pubAt = item.published_at || item.publishedAt;
      if (!pubAt) {
        if (item.date) {
          const parsed = Date.parse(item.date);
          if (!isNaN(parsed) && parsed > 0) {
            pubAt = new Date(parsed).toISOString();
          }
        }
        if (!pubAt && item.created_at) {
          pubAt = item.created_at;
        }
        if (!pubAt && item.updated_at) {
          pubAt = item.updated_at;
        }
      }
      return {
        ...item,
        published_at: pubAt,
        publishedAt: pubAt,
      };
    });

    return normalized.sort((a, b) => {
      const timeA = a.published_at ? new Date(a.published_at).getTime() : 0;
      const timeB = b.published_at ? new Date(b.published_at).getTime() : 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });
  }
  public async getAllRawNews(): Promise<DBNewsItem[]> {
    return this.mysqlReadTable<DBNewsItem>("news", "`id` DESC");
  }
  public async saveNews(news: DBNewsItem[]) {
    await this.persistTableToMySQL("news", news);
  }

  /**
   * Authoritative Public Query: Returns ONLY published articles where schedule time <= current time.
   * Eliminates draft/unpublished data leaks at the data access layer.
   */
  public async getPublishedNews(): Promise<DBNewsItem[]> {
    const all = await this.getNews();
    return all.filter(isArticlePubliclyVisible);
  }

  /**
   * Retrieve a single public news article by ID. Returns undefined if non-existent or unpublished.
   */
  public async getPublishedNewsById(id: number | string): Promise<DBNewsItem | undefined> {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (isNaN(numId)) return undefined;
    const all = await this.getPublishedNews();
    return all.find((n) => n.id === numId);
  }

  /**
   * Retrieve a single public news article by slug. Returns undefined if non-existent or unpublished.
   */
  public async getPublishedNewsBySlug(slug: string): Promise<DBNewsItem | undefined> {
    if (!slug) return undefined;
    const all = await this.getPublishedNews();
    return all.find((n) => n.slug === slug);
  }

  /**
   * Server-authoritative editorial query: Returns articles filtered by role permissions.
   * Super Admin & Admin view all articles; Editors and Reporters view published items plus their own drafts.
   */
  public async getAuthorizedEditorialNews(role?: string, username?: string): Promise<DBNewsItem[]> {
    const all = await this.getNews();
    const normalizedRole = (role || "").toUpperCase().trim().replace(/[_\s]+/g, "");
    if (
      normalizedRole === "SUPERADMIN" ||
      normalizedRole === "SUPER_ADMIN" ||
      normalizedRole === "ADMIN" ||
      normalizedRole === "ADMINISTRATOR"
    ) {
      return all;
    }
    if (
      normalizedRole === "EDITOR" ||
      normalizedRole === "REPORTER" ||
      normalizedRole === "CONTENTADMIN" ||
      normalizedRole === "CONTENT_MANAGER"
    ) {
      return all.filter(
        (n) => isArticlePubliclyVisible(n) || (username && n.author_en?.toLowerCase() === username.toLowerCase())
      );
    }
    // Deny-by-default for non-editorial or unauthenticated callers
    return all.filter(isArticlePubliclyVisible);
  }

  public async getNewsBySlug(slug: string): Promise<DBNewsItem | undefined> {
    const news = await this.getNews();
    return news.find((n) => n.slug === slug);
  }
  public async incrementViews(id: number) {
    try {
      await this.ensureMySqlTable("news");
      await mysqlQuery("UPDATE `news` SET `views_count` = COALESCE(`views_count`, 0) + 1 WHERE `id` = ?", [id]);
    } catch (err: any) {
      if (!this.isMySqlUnavailableError(err)) {
        console.warn("[MySQL] incrementViews warning:", err?.message || err);
      }
    }
  }

  // Ticker
  public async getTicker(): Promise<DBTickerItem[]> {
    return this.mysqlReadTable<DBTickerItem>("ticker", "`order_num` ASC, `id` ASC");
  }
  public async saveTicker(ticker: DBTickerItem[]) {
    await this.persistTableToMySQL("ticker", ticker);
  }

  // Slider
  public async getSlider(): Promise<DBSliderItem[]> {
    return this.mysqlReadTable<DBSliderItem>("slider", "`order_num` ASC, `id` ASC");
  }
  public async saveSlider(slider: DBSliderItem[]) {
    await this.persistTableToMySQL("slider", slider);
  }

  // Profile
  public async getCommissionerProfile(): Promise<DBCommissionerProfile> {
    const list = await this.mysqlReadTable<DBCommissionerProfile>("commissioner_profile");
    if (list && list.length > 0) return list[0];
    return {
      id: 1,
      name_en: "Dr. A. Amalraj IPS",
      name_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ்",
      designation_en: "Commissioner of Police, Greater Chennai",
      designation_ta: "காவல் ஆணையர், சென்னை பெருநகரம்",
      bio_en1: "",
      bio_en2: "",
      bio_ta1: "",
      bio_ta2: "",
      photo: "/images/amalraj_portrait.png"
    };
  }
  public async saveCommissionerProfile(profile: DBCommissionerProfile) {
    await this.persistTableToMySQL("commissioner_profile", [profile]);
  }

  // Theme
  public async getThemeSettings(): Promise<DBThemeSettings> {
    const list = await this.mysqlReadTable<DBThemeSettings>("theme_settings");
    if (list && list.length > 0) return list[0];
    return {
      id: 1,
      primary_color: "#ed1b24",
      secondary_color: "#2e3192",
      accent_color: "#c5a059",
      logo_path: "/images/gcp_logo.png",
      footer_logo_path: "/images/gcp_logo.png",
      favicon_path: "/favicon.ico"
    };
  }
  public async saveThemeSettings(theme: DBThemeSettings) {
    await this.persistTableToMySQL("theme_settings", [theme]);
  }

  // Menus
  public async getMenuItems(): Promise<DBMenuItem[]> {
    const publicMenus = await this.getPublicMenus();
    if (publicMenus && publicMenus.length > 0) {
      return publicMenus.map((m, idx) => ({
        id: m.id,
        label_en: m.name_en,
        label_ta: m.name_ta,
        href: m.url,
        order_num: m.display_order || (idx + 1),
        position: "header"
      }));
    }
    return this.mysqlReadTable<DBMenuItem>("menu_items", "`order_num` ASC, `id` ASC");
  }
  public async saveMenuItems(menu: DBMenuItem[]) {
    await this.persistTableToMySQL("menu_items", menu);
  }

  public async getMenus(): Promise<DBMenu[]> {
    const list = await this.mysqlReadTable<DBMenu>("menus", "`display_order` ASC, `id` ASC");
    return Array.isArray(list) ? list : [];
  }
  public async saveMenus(menus: DBMenu[]) {
    await this.persistTableToMySQL("menus", menus);
  }
  public async getSubMenus(): Promise<DBSubMenu[]> {
    const list = await this.mysqlReadTable<DBSubMenu>("sub_menus", "`display_order` ASC, `id` ASC");
    return Array.isArray(list) ? list : [];
  }
  public async saveSubMenus(subMenus: DBSubMenu[]) {
    await this.persistTableToMySQL("sub_menus", subMenus);
  }

  public async getPublicMenus(): Promise<DBMenu[]> {
    const rawMenus = await this.getMenus();
    const rawSubMenus = await this.getSubMenus();
    const menus = (rawMenus || []).filter(m => m && m.status === "active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const subMenus = (rawSubMenus || []).filter(s => s && s.status === "active").sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    if (menus.length === 0) {
      return [
        { id: 1, name_en: "Home", name_ta: "முகப்பு", slug: "home", display_order: 1, url: "/", page_type: "static", status: "active", open_in_new_tab: 0, subMenus: [] },
        { id: 2, name_en: "About Us", name_ta: "எங்களைப் பற்றி", slug: "about", display_order: 2, url: "/about", page_type: "static", status: "active", open_in_new_tab: 0, subMenus: [] },
        {
          id: 3, name_en: "Citizen Services", name_ta: "குடிமக்கள் சேவைகள்", slug: "citizen-services", display_order: 3, url: "/citizen-services", page_type: "static", status: "active", open_in_new_tab: 0,
          subMenus: [
            {
              id: 1, parent_menu_id: 3, name_en: "Crime News", name_ta: "குற்றச் செய்திகள்", slug: "crime", url: "/category/crime", display_order: 1, status: "active",
              subMenus: []
            },
            {
              id: 2, parent_menu_id: 3, name_en: "Cyber Safety", name_ta: "இணைய பாதுகாப்பு", slug: "cyber-safety", url: "/category/cyber-safety", display_order: 2, status: "active",
              subMenus: []
            },
            {
              id: 3, parent_menu_id: 3, name_en: "Women Safety", name_ta: "பெண்கள் பாதுகாப்பு", slug: "women-safety", url: "/category/women-safety", display_order: 3, status: "active",
              subMenus: []
            },
            { id: 4, parent_menu_id: 3, name_en: "Public Safety", name_ta: "பொது பாதுகாப்பு", slug: "public-safety", url: "/category/public-safety", display_order: 4, status: "active", subMenus: [] },
            { id: 5, parent_menu_id: 3, name_en: "Community Outreach", name_ta: "சமூக உதவி", slug: "outreach", url: "/category/outreach", display_order: 5, status: "active", subMenus: [] },
            {
              id: 13, parent_menu_id: 3, name_en: "Emergency Alerts", name_ta: "அவசர எச்சரிக்கைகள்", slug: "emergency-alerts", url: "/category/emergency-alerts", display_order: 6, status: "active",
              subMenus: [
                { id: 14, parent_menu_id: 3, parent_sub_id: 13, name_en: "Police Official News", name_ta: "காவல்துறை அதிகாரப்பூர்வ செய்தி", slug: "police-official-news", url: "/category/police-official-news", display_order: 1, status: "active" },
                { id: 15, parent_menu_id: 3, parent_sub_id: 13, name_en: "Public Warnings & Alerts", name_ta: "பொது எச்சரிக்கைகள் & விழிப்பூட்டல்கள்", slug: "public-warnings", url: "/category/public-warnings", display_order: 2, status: "active" },
                { id: 16, parent_menu_id: 3, parent_sub_id: 13, name_en: "Public Announcements", name_ta: "பொது அறிவிப்புகள்", slug: "public-announcements", url: "/category/public-announcements", display_order: 3, status: "active" },
              ] as any
            },
          ] as any
        },
        { id: 4, name_en: "Traffic", name_ta: "போக்குவரத்து", slug: "traffic", display_order: 4, url: "https://gctp.in/chennai-home", page_type: "external", status: "active", open_in_new_tab: 1, subMenus: [] },
        { id: 5, name_en: "Stations", name_ta: "காவல் நிலையங்கள்", slug: "stations", display_order: 5, url: "/stations", page_type: "static", status: "active", open_in_new_tab: 0, subMenus: [] },
        { id: 6, name_en: "Media Service", name_ta: "வீடியோக்கள்", slug: "videos", display_order: 6, url: "/videos", page_type: "static", status: "active", open_in_new_tab: 0, subMenus: [] },
        { id: 7, name_en: "Contact Us", name_ta: "தொடர்பு", slug: "contact-us", display_order: 7, url: "/contact-us", page_type: "static", status: "active", open_in_new_tab: 0, subMenus: [] }
      ];
    }

    return menus.map(m => {
      // Find direct level 1 submenus (parent_menu_id matches and parent_sub_id is null/undefined)
      const parentSubMenus = subMenus.filter(s => s.parent_menu_id === m.id && !s.parent_sub_id);
      
      return {
        ...m,
        subMenus: parentSubMenus.map(sub => ({
          ...sub,
          // Find nested level 2 submenus under this sub_menu
          subMenus: subMenus.filter(child => child.parent_sub_id === sub.id)
        }))
      };
    });
  }

  // Contacts & TTS
  public async getContacts(): Promise<DBContact[]> {
    return this.mysqlReadTable<DBContact>("contacts");
  }
  public async saveContacts(contacts: DBContact[]) {
    await this.persistTableToMySQL("contacts", contacts);
  }
  public async getTtsSettings(): Promise<DBTtsSettings> {
    const list = await this.mysqlReadTable<DBTtsSettings>("tts_settings");
    if (list && list.length > 0) return list[0];
    return { id: 1, enabled: 1, tamil_voice: "ta-IN-PallaviNeural", english_voice: "en-IN-NeerjaNeural", speed: 1.0 };
  }
  public async saveTtsSettings(tts: DBTtsSettings) {
    await this.persistTableToMySQL("tts_settings", [tts]);
  }

  // Videos
  public async getVideos(): Promise<DBVideoItem[]> {
    return this.mysqlReadTable<DBVideoItem>("videos");
  }
  public async saveVideos(videos: DBVideoItem[]) {
    await this.persistTableToMySQL("videos", videos);
  }
  public async incrementVideoViews(id: number | string) {
    try {
      await this.ensureMySqlTable("videos");
      await mysqlQuery(
        "UPDATE `videos` SET `views_count` = COALESCE(`views_count`, 0) + 1 WHERE `id` = ? OR `youtube_id` = ?",
        [id, String(id)]
      );
    } catch (err: any) {
      if (!this.isMySqlUnavailableError(err)) {
        console.warn("[MySQL] incrementVideoViews warning:", err?.message || err);
      }
    }
  }

  // Alerts
  public async getAlerts(): Promise<DBAlertItem[]> {
    return this.mysqlReadTable<DBAlertItem>("alerts", "`id` DESC");
  }
  public async saveAlerts(alerts: DBAlertItem[]) {
    await this.persistTableToMySQL("alerts", alerts);
  }
  public async getAlertSettings(): Promise<DBAlertSettings> {
    const list = await this.mysqlReadTable<DBAlertSettings>("alert_settings");
    if (list && list.length > 0) return list[0];
    return { id: 1, auto_fetch: 1, require_approval: 1, last_fetched_at: "" };
  }
  public async saveAlertSettings(settings: DBAlertSettings) {
    await this.persistTableToMySQL("alert_settings", [settings]);
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

      let addedCount = 0;
      const rawExistingAlerts = await this.getAlerts();
      const APPROVED_SOURCES = [
        "THE HINDU",
        "THE NEW INDIAN EXPRESS",
        "TAMIL NADU POLICE",
        "GREATER CHENNAI POLICE",
        "GOVERNMENT OF TAMIL NADU",
        "PIB"
      ];
      // Keep only approved sources
      const existingAlerts = rawExistingAlerts.filter(
        a => APPROVED_SOURCES.includes(a.source)
      );

      // Helper: Normalize & validate channel name strictly for approved sources
      const normalizeChannel = (src: string | undefined, defaultSrc: string): { name: string; url: string } | null => {
        const combined = `${src || ""} ${defaultSrc || ""}`.toUpperCase();
        
        // Official Police & Government Sources
        if (combined.includes("GREATER CHENNAI POLICE") || combined.includes("GCP.TN.GOV") || combined.includes("GREATERCHENNAIPOLICE")) {
          return { name: "GREATER CHENNAI POLICE", url: "https://gcp.tn.gov.in/" };
        }
        if (combined.includes("TAMIL NADU POLICE") || combined.includes("TNPOLICE") || combined.includes("TN POLICE")) {
          return { name: "TAMIL NADU POLICE", url: "https://tnpolice.gov.in/" };
        }
        if (combined.includes("PIB") || combined.includes("PRESS INFORMATION BUREAU")) {
          return { name: "PIB", url: "https://pib.gov.in/" };
        }
        if (combined.includes("TN.GOV.IN") || combined.includes("GOVERNMENT OF TAMIL NADU") || combined.includes("TAMIL NADU GOVERNMENT") || combined.includes("DIPR")) {
          return { name: "GOVERNMENT OF TAMIL NADU", url: "https://www.tn.gov.in/" };
        }

        // Approved External Newspapers
        if (combined.includes("NEW INDIAN EXPRESS") || combined.includes("NEWINDIANEXPRESS")) {
          return { name: "THE NEW INDIAN EXPRESS", url: "https://www.newindianexpress.com/" };
        }
        if (combined.includes("THE HINDU") || combined.includes("THEHINDU")) {
          return { name: "THE HINDU", url: "https://www.thehindu.com/" };
        }
        
        return null;
      };

      const normalizeTitleTokens = (t: string) => {
        return (t || "")
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, "")
          .split(/\s+/)
          .filter(w => w.length > 2 && !["the", "and", "for", "with", "from", "after", "was", "were", "been", "has", "have", "police"].includes(w));
      };

      const areDuplicateStories = (t1: string, t2: string) => {
        const tok1 = new Set(normalizeTitleTokens(t1));
        const tok2 = new Set(normalizeTitleTokens(t2));
        if (tok1.size === 0 || tok2.size === 0) return false;
        let inter = 0;
        for (const w of tok1) {
          if (tok2.has(w)) inter++;
        }
        return (2 * inter) / (tok1.size + tok2.size) >= 0.6;
      };

      try {
        const feedEndpoints = [
          // The Hindu Feeds (Via Google News RSS for high reliability & zero Cloudflare timeouts)
          { url: "https://news.google.com/rss/search?q=site:thehindu.com+(Chennai+OR+%22Greater+Chennai%22+OR+%22Tamil+Nadu%22)+(Police+OR+Crime+OR+Traffic+OR+Safety+OR+Accident+OR+Arrest+OR+Court+OR+Cyber)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "THE HINDU" },
          { url: "https://news.google.com/rss/search?q=site:thehindu.com+(Chennai+OR+%22Greater+Chennai+Police%22+OR+%22Commissioner+Amalraj%22)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "THE HINDU" },
          
          // The New Indian Express Feeds
          { url: "https://news.google.com/rss/search?q=site:newindianexpress.com+(Chennai+OR+%22Greater+Chennai%22+OR+%22Tamil+Nadu%22)+(Police+OR+Crime+OR+Traffic+OR+Safety+OR+Accident+OR+Arrest+OR+Court+OR+Cyber)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "THE NEW INDIAN EXPRESS" },
          { url: "https://news.google.com/rss/search?q=site:newindianexpress.com+(Chennai+OR+%22Greater+Chennai%22)+Police&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "THE NEW INDIAN EXPRESS" },

          // Official Tamil Nadu Police (tnpolice.gov.in)
          { url: "https://news.google.com/rss/search?q=site:tnpolice.gov.in+OR+(%22Tamil+Nadu+Police%22+press+release)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "TAMIL NADU POLICE" },

          // Official Greater Chennai Police (gcp.tn.gov.in / greaterchennaipolice.in)
          { url: "https://news.google.com/rss/search?q=site:gcp.tn.gov.in+OR+site:greaterchennaipolice.in+OR+(%22Greater+Chennai+Police%22+press+release)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "GREATER CHENNAI POLICE" },

          // Official Government of Tamil Nadu (tn.gov.in)
          { url: "https://news.google.com/rss/search?q=site:tn.gov.in+(Police+OR+Home+OR+Traffic+OR+Transport+OR+Safety+OR+Chennai)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "GOVERNMENT OF TAMIL NADU" },

          // Press Information Bureau (pib.gov.in)
          { url: "https://news.google.com/rss/search?q=site:pib.gov.in+(Chennai+OR+%22Tamil+Nadu%22+OR+Police+OR+Home+Affairs+OR+Security)&hl=en-IN&gl=IN&ceid=IN:en", defaultSource: "PIB" }
        ];

        const rawItems: { title: string; link: string; pubDate: string; summary?: string; sourceInfo: { name: string; url: string } }[] = [];

        for (const feed of feedEndpoints) {
          try {
            const res = await fetch(feed.url, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" },
              signal: AbortSignal.timeout(10000),
              next: { revalidate: 0 }
            });

            if (res.ok) {
              const xml = await res.text();
              const itemRegex = /<item>([\s\S]*?)<\/item>/g;
              const titleRegex = /<title>([\s\S]*?)<\/title>/i;
              const linkRegex = /<link>([\s\S]*?)<\/link>/i;
              const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;
              const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/i;
              const descRegex = /<description>([\s\S]*?)<\/description>/i;

              let match;
              while ((match = itemRegex.exec(xml)) !== null) {
                const itemXml = match[1];
                const titleMatch = itemXml.match(titleRegex);
                const linkMatch = itemXml.match(linkRegex);
                const pubDateMatch = itemXml.match(pubDateRegex);
                const sourceMatch = itemXml.match(sourceRegex);
                const descMatch = itemXml.match(descRegex);

                if (titleMatch && linkMatch) {
                  let rawTitle = titleMatch[1].trim()
                    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
                    .replace(/&amp;/g, "&")
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/<[^>]+>/g, "")
                    .trim();
                  
                  const link = linkMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
                  const pubDate = pubDateMatch ? pubDateMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1") : new Date().toUTCString();
                  const rawSource = sourceMatch ? sourceMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1") : feed.defaultSource;

                  const sourceInfo = normalizeChannel(rawSource, feed.defaultSource);
                  if (!sourceInfo) continue;

                  let title = rawTitle;
                  const sourceSuffixIndex = title.lastIndexOf(` - ${rawSource}`);
                  if (sourceSuffixIndex !== -1) {
                    title = title.substring(0, sourceSuffixIndex).trim();
                  }
                  title = title
                    .replace(/\s*-\s*The Hindu$/i, "")
                    .replace(/\s*-\s*The New Indian Express$/i, "")
                    .replace(/\s*-\s*PIB$/i, "")
                    .replace(/\s*\|\s*The Hindu$/i, "")
                    .replace(/\s*\|\s*The New Indian Express$/i, "")
                    .replace(/\s*\|\s*CMWSSB$/i, "")
                    .trim();

                  let summary = "";
                  if (descMatch) {
                    summary = descMatch[1].trim()
                      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
                      .replace(/&amp;/g, "&")
                      .replace(/&quot;/g, '"')
                      .replace(/&#39;/g, "'")
                      .replace(/&lt;/g, "<")
                      .replace(/&gt;/g, ">")
                      .replace(/<[^>]+>/g, "")
                      .trim();
                    if (summary.includes("<a") || summary.includes("href=") || summary.length < 10) {
                      summary = "";
                    }
                  }

                  if (title.length > 8 && !/^(untitled|home|bc|welcome|r~|·)/i.test(title)) {
                    rawItems.push({ title, link, pubDate, summary, sourceInfo });
                  }
                }
              }
            }
          } catch (feedErr: any) {
            const isTimeout = feedErr?.name === "TimeoutError" || feedErr?.code === 23 || feedErr?.message?.includes("timeout") || feedErr?.name === "AbortError";
            if (isTimeout) {
              console.warn(`[RSS Feed Sync] Network timeout fetching ${feed.url} (skipped gracefully)`);
            } else {
              console.warn(`[RSS Feed Sync] Feed fetch error for ${feed.url}:`, feedErr?.message || feedErr);
            }
          }
        }

        let nextId = existingAlerts.length > 0 ? Math.max(...existingAlerts.map(a => a.id)) + 1 : 1;
        const newAlertItems: DBAlertItem[] = [];

        for (const item of rawItems) {
          if (!item || !item.title) continue;

          const isDuplicate = existingAlerts.some(
            a => areDuplicateStories(a.title, item.title) || (a.url && a.url === item.link) || (a.external_id && a.external_id === item.link)
          );
          const isAlreadyQueued = newAlertItems.some(
            a => areDuplicateStories(a.title, item.title) || (a.url && a.url === item.link) || (a.external_id && a.external_id === item.link)
          );

          if (!isDuplicate && !isAlreadyQueued) {
            let category = "LAW & ORDER";
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes("traffic") || titleLower.includes("road") || titleLower.includes("speed") || titleLower.includes("highway") || titleLower.includes("ecr")) {
              category = "TRAFFIC UPDATE";
            } else if (titleLower.includes("cyber") || titleLower.includes("online") || titleLower.includes("scam") || titleLower.includes("whatsapp") || titleLower.includes("fraud") || titleLower.includes("1930")) {
              category = "CYBER CRIME";
            } else if (titleLower.includes("safety") || titleLower.includes("advisory") || titleLower.includes("beware") || titleLower.includes("guideline") || titleLower.includes("warn") || titleLower.includes("karangal")) {
              category = "SAFETY ADVISORY";
            } else if (titleLower.includes("award") || titleLower.includes("medal") || titleLower.includes("commend") || titleLower.includes("felicitat")) {
              category = "AWARDS & DECORATIONS";
            } else if (titleLower.includes("women") || titleLower.includes("girl") || titleLower.includes("singappen") || titleLower.includes("child") || titleLower.includes("pocso")) {
              category = "WOMEN & CHILD SAFETY";
            } else if (titleLower.includes("arrest") || titleLower.includes("police") || titleLower.includes("court") || titleLower.includes("crime")) {
              category = "POLICE & LAW";
            }

            const publishedDate = new Date(item.pubDate);
            const publishedISO = isNaN(publishedDate.getTime()) ? new Date().toISOString() : publishedDate.toISOString();

            newAlertItems.push({
              id: nextId++,
              title: item.title,
              summary: item.summary || "",
              category,
              source: item.sourceInfo.name,
              source_name: item.sourceInfo.name,
              source_url: item.sourceInfo.url,
              url: item.link,
              article_url: item.link,
              published_at: publishedISO,
              fetched_at: now.toISOString(),
              external_id: item.link,
              language: "en",
              status: "active",
              approved: 1,
              pinned: 0,
              removed: 0,
              created_at: new Date().toISOString()
            });
            addedCount++;
          }
        }

        // Merge existing approved-source alerts and newly fetched alerts
        const mergedAlerts = [...newAlertItems, ...existingAlerts];
        // Sort descending by actual published_at date
        mergedAlerts.sort((a, b) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());
        await this.saveAlerts(mergedAlerts);
      } catch (rssErr) {
        console.warn("RSS alert fetch warning:", rssErr);
      }

      settings.last_fetched_at = now.toISOString();
      await this.saveAlertSettings(settings);

      return { success: true, newCount: addedCount };
    } catch (e: any) {
      console.error("Alert sync error:", e);
      return { success: false, newCount: 0 };
    }
  }

  // SEO
  public async getSeoSettings(): Promise<DBSeoSettings> {
    const list = await this.mysqlReadTable<DBSeoSettings>("seo_settings");
    const liveSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://chennaiguardian.mccmrfip.in";
    if (list && list.length > 0) {
      const item = { ...list[0] };
      if (!item.site_url || item.site_url === "https://chennaiguardian.in") {
        item.site_url = liveSiteUrl;
      }
      return item;
    }
    return {
      id: 1,
      site_title: "Chennai Guardian | Greater Chennai Police",
      site_description: "Official portal of Greater Chennai Police",
      default_keywords: "Chennai Police, Public Safety, Citizen Services, Emergency Contacts",
      organization_name: "Greater Chennai Police",
      organization_logo: "/images/gcp_logo.png",
      contact_number: "044-23452300",
      address: "Commissioner Office, Vepery, Chennai",
      site_url: liveSiteUrl,
      social_facebook: "",
      social_twitter: "",
      social_instagram: "",
      social_youtube: "",
      google_analytics_id: "",
      google_tag_manager_id: "",
      google_search_console: "",
      bing_verification: "",
      default_robots: "index, follow",
      default_og_image: "/images/gcp_logo.png",
      publisher_name: "Greater Chennai Police",
      publisher_logo: "/images/gcp_logo.png"
    };
  }
  public async saveSeoSettings(seo: DBSeoSettings) {
    await this.persistTableToMySQL("seo_settings", [seo]);
  }
  public async getArticleSeo(): Promise<DBArticleSeo[]> {
    return this.mysqlReadTable<DBArticleSeo>("article_seo");
  }
  public async saveArticleSeo(articleSeo: DBArticleSeo[]) {
    await this.persistTableToMySQL("article_seo", articleSeo);
  }

  // Asset Metadata
  public async getAssetMetadata(): Promise<DBAssetMetadata[]> {
    return this.mysqlReadTable<DBAssetMetadata>("asset_metadata");
  }
  public async saveAssetMetadata(items: DBAssetMetadata[]) {
    await this.persistTableToMySQL("asset_metadata", items);
  }

  // Contact Messages
  public async getContactMessages(): Promise<DBContactMessage[]> {
    return this.mysqlReadTable<DBContactMessage>("contact_messages", "`id` DESC");
  }
  public async saveContactMessages(items: DBContactMessage[]) {
    await this.persistTableToMySQL("contact_messages", items);
  }

  // Police Stations (Master Stations stored strictly in MySQL)
  public async getPoliceStations(): Promise<DBPoliceStation[]> {
    const stations = await this.mysqlReadTable<DBPoliceStation>("police_stations", "`id` ASC");

    // Return all valid stations mapped with consistent fields
    return (stations || []).map((s, index) => {
      const nameEn = (s.station_name || s.name_en || `Police Station ${s.id || index + 1}`).replace(/"/g, "").trim();
      const address = (s.address || s.ps_address || s.address_en || "Chennai, Tamil Nadu").replace(/\\n/g, "").replace(/"/g, "").trim();
      const lat = typeof s.latitude === "number" ? s.latitude : (typeof s.lat === "number" ? s.lat : (parseFloat(String(s.latitude || s.lat || "13.0827")) || 13.0827));
      const lng = typeof s.longitude === "number" ? s.longitude : (typeof s.lng === "number" ? s.lng : (typeof s.lon === "number" ? s.lon : (parseFloat(String(s.longitude || s.lng || s.lon || "80.2707")) || 80.2707)));

      return {
        ...s,
        id: s.id || index + 1,
        station_name: nameEn,
        name_en: s.name_en || nameEn,
        station_name_ta: s.station_name_ta || s.name_ta || `காவல் நிலையம் - ${nameEn}`,
        name_ta: s.name_ta || `காவல் நிலையம் - ${nameEn}`,
        phone: s.phone || s.phone_no || "044-23452300",
        phone_no: s.phone_no || s.phone || "044-23452300",
        lat: lat,
        lng: lng,
        lon: lng,
        latitude: lat,
        longitude: lng,
        address: address,
        ps_address: address,
        address_en: s.address_en || address,
        pincode: s.pincode || (address.match(/\b6\d{5}\b/)?.[0] ?? "600001"),
        status: s.status || (s.is_active === 0 ? "INACTIVE" : "ACTIVE"),
        is_active: s.is_active !== undefined ? s.is_active : 1
      };
    });
  }
  public async savePoliceStations(stations: DBPoliceStation[]) {
    await this.persistTableToMySQL("police_stations", stations);
  }

  // Emergency Contacts
  public async getEmergencyContacts(): Promise<DBEmergencyContact[]> {
    return this.mysqlReadTable<DBEmergencyContact>("emergency_contacts", "`display_order` ASC, `id` ASC");
  }
  public async saveEmergencyContacts(contacts: DBEmergencyContact[]) {
    await this.persistTableToMySQL("emergency_contacts", contacts);
  }

  // Department Links
  public async getDepartmentLinks(): Promise<DBDepartmentLink[]> {
    return this.mysqlReadTable<DBDepartmentLink>("department_links", "`display_order` ASC, `id` ASC");
  }
  public async saveDepartmentLinks(links: DBDepartmentLink[]) {
    await this.persistTableToMySQL("department_links", links);
  }

  // Web Stories
  public async getWebStories(): Promise<DBWebStory[]> {
    return this.mysqlReadTable<DBWebStory>("web_stories", "`id` ASC");
  }
  public async saveWebStories(stories: DBWebStory[]) {
    await this.persistTableToMySQL("web_stories", stories);
  }

  // Service Requests
  public async getServiceRequests(): Promise<DBServiceRequest[]> {
    return this.mysqlReadTable<DBServiceRequest>("service_requests", "`id` DESC");
  }
  public async saveServiceRequests(requests: DBServiceRequest[]) {
    await this.persistTableToMySQL("service_requests", requests);
  }

  // Page Contents
  public async getPageContents(): Promise<DBPageContent[]> {
    return this.mysqlReadTable<DBPageContent>("page_contents");
  }
  public async savePageContents(pages: DBPageContent[]) {
    await this.persistTableToMySQL("page_contents", pages);
  }
  public async getContentVersions(): Promise<DBContentVersion[]> {
    return this.mysqlReadTable<DBContentVersion>("content_versions");
  }
  public async saveContentVersions(versions: DBContentVersion[]) {
    await this.persistTableToMySQL("content_versions", versions);
  }
  public async getPageContent(page_name: string) {
    return this.getPageContentByName(page_name);
  }
  public async getPageContentByName(page_name: string) {
    const pages = await this.getPageContents();
    const p = pages.find(item => item.page_name === page_name);
    if (!p) return null;
    const versions = await this.getContentVersions();
    const v = versions.find(ver => ver.id === (p.published_version_id || p.draft_version_id));
    return {
      ...p,
      sections: v ? JSON.parse(v.sections_data || "[]") : [],
      seo: v ? JSON.parse(v.seo_data || "{}") : {}
    };
  }

  private citizenTablesReady = false;
  private citizenTablesPromise: Promise<void> | null = null;
  private citizenServiceColumns: Set<string> | null = null;
  private citizenCategoryColumns: Set<string> | null = null;

  private isMySqlUnavailableError(err: any): boolean {
    const code = err?.code || "";
    return (
      code === "ECONNREFUSED" ||
      code === "ER_BAD_DB_ERROR" ||
      code === "ENOTFOUND" ||
      code === "ETIMEDOUT" ||
      code === "EHOSTUNREACH"
    );
  }

  private async ensureCitizenServiceTables(): Promise<void> {
    if (this.citizenTablesReady && this.citizenServiceColumns && this.citizenCategoryColumns) {
      return;
    }
    if (this.citizenTablesPromise) {
      return this.citizenTablesPromise;
    }

    this.citizenTablesPromise = (async () => {
      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS \`citizen_service_categories\` (
          \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(255) NULL,
          \`name_en\` VARCHAR(255) NULL,
          \`name_ta\` VARCHAR(255) NULL,
          \`slug\` VARCHAR(255) NULL,
          \`description\` LONGTEXT NULL,
          \`description_en\` LONGTEXT NULL,
          \`description_ta\` LONGTEXT NULL,
          \`display_order\` DOUBLE NULL,
          \`is_active\` DOUBLE NULL,
          \`created_at\` VARCHAR(64) NULL,
          \`updated_at\` VARCHAR(64) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS \`citizen_services\` (
          \`id\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
          \`category_id\` DOUBLE NULL,
          \`service_name\` VARCHAR(255) NULL,
          \`service_name_en\` VARCHAR(255) NULL,
          \`service_name_ta\` VARCHAR(255) NULL,
          \`description\` LONGTEXT NULL,
          \`description_en\` LONGTEXT NULL,
          \`description_ta\` LONGTEXT NULL,
          \`icon\` VARCHAR(255) NULL,
          \`external_url\` LONGTEXT NULL,
          \`display_order\` DOUBLE NULL,
          \`is_active\` DOUBLE NULL,
          \`is_featured\` DOUBLE NULL,
          \`open_in_new_tab\` DOUBLE NULL,
          \`created_by\` VARCHAR(255) NULL,
          \`updated_by\` VARCHAR(255) NULL,
          \`created_at\` VARCHAR(64) NULL,
          \`updated_at\` VARCHAR(64) NULL,
          \`deleted_at\` VARCHAR(64) NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);

      const loadCols = async (table: string): Promise<Set<string>> => {
        const rows = (await mysqlQuery(`SHOW COLUMNS FROM \`${table}\``)) as Array<Record<string, any>>;
        return new Set(rows.map((r) => String(r.Field ?? r.field ?? Object.values(r)[0] ?? "")));
      };

      let catCols = await loadCols("citizen_service_categories");
      let catColsLower = new Set([...catCols].map((c) => c.toLowerCase()));
      for (const [col, def] of [
        ["created_at", "VARCHAR(64) NULL"],
        ["updated_at", "VARCHAR(64) NULL"],
      ] as const) {
        if (!catColsLower.has(col.toLowerCase())) {
          try {
            await mysqlQuery(`ALTER TABLE \`citizen_service_categories\` ADD COLUMN \`${col}\` ${def}`);
          } catch {}
        }
      }
      catCols = await loadCols("citizen_service_categories");

      let srvCols = await loadCols("citizen_services");
      let srvColsLower = new Set([...srvCols].map((c) => c.toLowerCase()));
      for (const [col, def] of [
        ["created_by", "VARCHAR(255) NULL"],
        ["created_at", "VARCHAR(64) NULL"],
        ["deleted_at", "VARCHAR(64) NULL"],
      ] as const) {
        if (!srvColsLower.has(col.toLowerCase())) {
          try {
            await mysqlQuery(`ALTER TABLE \`citizen_services\` ADD COLUMN \`${col}\` ${def}`);
          } catch {}
        }
      }
      srvCols = await loadCols("citizen_services");

      this.citizenCategoryColumns = catCols;
      this.citizenServiceColumns = srvCols;
      this.citizenTablesReady = true;
    })();

    try {
      await this.citizenTablesPromise;
    } finally {
      this.citizenTablesPromise = null;
    }
  }

  private async upsertRowsInMySQL(
    tableName: string,
    records: Record<string, any>[],
    allowedCols: Set<string>,
    conn?: { execute: (sql: string, params?: any[]) => Promise<any> }
  ): Promise<void> {
    if (!records || records.length === 0) return;

    const keySet = new Set<string>();
    for (const r of records) {
      for (const k of Object.keys(r)) {
        if (allowedCols.has(k)) keySet.add(k);
      }
    }
    const cols = Array.from(keySet);
    if (cols.length === 0) return;

    const exec = conn ? conn.execute.bind(conn) : mysqlQuery;
    const escapedCols = cols.map((c) => `\`${c}\``).join(", ");
    const updateClause = cols
      .filter((c) => c !== "id")
      .map((c) => `\`${c}\` = VALUES(\`${c}\`)`)
      .join(", ");

    for (let i = 0; i < records.length; i += 50) {
      const batch = records.slice(i, i + 50);
      const placeholders = batch.map(() => `(${cols.map(() => "?").join(", ")})`).join(", ");
      const values: any[] = [];
      for (const r of batch) {
        for (const col of cols) {
          const val = r[col];
          if (val !== null && typeof val === "object") {
            values.push(JSON.stringify(val));
          } else if (typeof val === "boolean") {
            values.push(val ? 1 : 0);
          } else if (val === undefined) {
            values.push(null);
          } else {
            values.push(val);
          }
        }
      }
      const sql = updateClause
        ? `INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${placeholders} ON DUPLICATE KEY UPDATE ${updateClause}`
        : `INSERT INTO \`${tableName}\` (${escapedCols}) VALUES ${placeholders}`;
      await exec(sql, values);
    }
  }

  private revalidateCitizenServicePaths() {
    try {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/citizen-services");
      revalidatePath("/");
    } catch {
      // Ignore outside Next.js server request context
    }
  }

  // Citizen Service Categories
  public async getCitizenServiceCategories(includeInactive: boolean = false): Promise<DBCitizenServiceCategory[]> {
    try {
      await this.ensureCitizenServiceTables();
      const rows = (await mysqlQuery(
        "SELECT * FROM `citizen_service_categories` ORDER BY `display_order` ASC, `id` ASC"
      )) as any[];
      const normalized: DBCitizenServiceCategory[] = (rows || []).map((c) => ({
        ...c,
        id: Number(c.id),
        name: c.name || c.name_en || "",
        name_en: c.name_en || c.name || "",
        name_ta: c.name_ta || "",
        slug: c.slug || "",
        description: c.description || c.description_en || "",
        description_en: c.description_en || c.description || "",
        description_ta: c.description_ta || "",
        display_order: Number(c.display_order ?? 0),
        is_active: Number(c.is_active ?? 1),
        created_at: c.created_at || "",
        updated_at: c.updated_at || "",
      }));
      memoryDb.updateCacheOnly("citizen_service_categories", normalized);
      return includeInactive ? normalized : normalized.filter((c) => c.is_active === 1);
    } catch (err: any) {
      console.warn("[MySQL] getCitizenServiceCategories fallback:", err?.message || err);
      const list = (memoryDb.getTable("citizen_service_categories") || []) as DBCitizenServiceCategory[];
      if (includeInactive) {
        return [...list].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
      }
      return list.filter((c) => c.is_active === 1).sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
  }

  public async saveCitizenServiceCategories(categories: DBCitizenServiceCategory[]) {
    memoryDb.updateCacheOnly("citizen_service_categories", categories);
    try {
      await this.ensureCitizenServiceTables();
      const cols = this.citizenCategoryColumns!;
      await mysqlTransaction(async (conn) => {
        const ids = categories.map((c) => Number(c.id)).filter((id) => Number.isFinite(id) && id > 0);
        if (ids.length === 0) {
          await conn.execute("DELETE FROM `citizen_service_categories`");
        } else {
          const placeholders = ids.map(() => "?").join(", ");
          await conn.execute(`DELETE FROM \`citizen_service_categories\` WHERE \`id\` NOT IN (${placeholders})`, ids);
          await this.upsertRowsInMySQL("citizen_service_categories", categories, cols, conn);
        }
      });
      this.revalidateCitizenServicePaths();
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        console.warn("[MySQL Persistence] saveCitizenServiceCategories skipped (MySQL unavailable):", err?.message || err);
        return;
      }
      console.error("[MySQL Persistence] saveCitizenServiceCategories failed:", err);
      throw err;
    }
  }

  // Citizen Services
  public async getCitizenServices(includeInactive: boolean = false): Promise<DBCitizenService[]> {
    try {
      await this.ensureCitizenServiceTables();
      const rows = (await mysqlQuery(
        "SELECT * FROM `citizen_services` ORDER BY `display_order` ASC, `id` ASC"
      )) as any[];
      const normalized: DBCitizenService[] = (rows || []).map((s) => ({
        ...s,
        id: Number(s.id),
        category_id: Number(s.category_id ?? 1),
        service_name: s.service_name || s.service_name_en || "",
        service_name_en: s.service_name_en || s.service_name || "",
        service_name_ta: s.service_name_ta || "",
        description: s.description || s.description_en || "",
        description_en: s.description_en || s.description || "",
        description_ta: s.description_ta || "",
        icon: s.icon || "FileText",
        external_url: s.external_url ?? null,
        display_order: Number(s.display_order ?? 0),
        is_active: Number(s.is_active ?? 1),
        is_featured: Number(s.is_featured ?? 0),
        open_in_new_tab: s.open_in_new_tab !== undefined && s.open_in_new_tab !== null ? Number(s.open_in_new_tab) : 1,
        created_by: s.created_by ?? null,
        updated_by: s.updated_by ?? null,
        created_at: s.created_at || "",
        updated_at: s.updated_at || "",
        deleted_at: s.deleted_at ?? null,
      }));
      memoryDb.updateCacheOnly("citizen_services", normalized);
      let filtered = normalized.filter((s) => !s.deleted_at);
      if (!includeInactive) {
        filtered = filtered.filter((s) => s.is_active === 1);
      }
      return filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    } catch (err: any) {
      console.warn("[MySQL] getCitizenServices fallback:", err?.message || err);
      const list = (memoryDb.getTable("citizen_services") || []) as DBCitizenService[];
      let filtered = list.filter((s) => !s.deleted_at);
      if (!includeInactive) {
        filtered = filtered.filter((s) => s.is_active === 1);
      }
      return filtered.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    }
  }

  public async saveCitizenServices(services: DBCitizenService[]) {
    memoryDb.updateCacheOnly("citizen_services", services);
    try {
      await this.ensureCitizenServiceTables();
      const cols = this.citizenServiceColumns!;
      const recordsToPersist = cols.has("deleted_at") ? services : services.filter((s) => !s.deleted_at);

      await mysqlTransaction(async (conn) => {
        const ids = recordsToPersist.map((s) => Number(s.id)).filter((id) => Number.isFinite(id) && id > 0);
        if (ids.length === 0) {
          if (cols.has("deleted_at")) {
            await conn.execute("DELETE FROM `citizen_services` WHERE `deleted_at` IS NULL");
          } else {
            await conn.execute("DELETE FROM `citizen_services`");
          }
        } else {
          const placeholders = ids.map(() => "?").join(", ");
          const deleteSql = cols.has("deleted_at")
            ? `DELETE FROM \`citizen_services\` WHERE \`deleted_at\` IS NULL AND \`id\` NOT IN (${placeholders})`
            : `DELETE FROM \`citizen_services\` WHERE \`id\` NOT IN (${placeholders})`;
          await conn.execute(deleteSql, ids);
          await this.upsertRowsInMySQL("citizen_services", recordsToPersist, cols, conn);
        }
      });
      this.revalidateCitizenServicePaths();
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        console.warn("[MySQL Persistence] saveCitizenServices skipped (MySQL unavailable):", err?.message || err);
        return;
      }
      console.error("[MySQL Persistence] saveCitizenServices failed:", err);
      throw err;
    }
  }

  public async getCitizenServicesWithCategories(includeInactive: boolean = false): Promise<any[]> {
    const [services, categories] = await Promise.all([
      this.getCitizenServices(includeInactive),
      this.getCitizenServiceCategories(includeInactive)
    ]);
    const catMap = new Map<number, DBCitizenServiceCategory>();
    categories.forEach(c => catMap.set(c.id, c));

    return services.map(s => {
      const cat = catMap.get(s.category_id);
      return {
        ...s,
        category_name_en: cat?.name_en || "Other Services",
        category_name_ta: cat?.name_ta || "இதர சேவைகள்",
        category_slug: cat?.slug || "other"
      };
    });
  }

  // Superadmin Config
  private buildDefaultFooterConfig() {
    return {
      logo: "/images/gcp_logo.png",
      website_name_en: "Greater Chennai Police",
      website_name_ta: "சென்னை பெருநகர காவல்",
      description_en: "Official news platform of Greater Chennai Police, providing 24/7 updates on public safety, cyber alerts, and community-centered policing initiatives.",
      description_ta: "சென்னையின் முன்னணி சட்டம் ஒழுங்கு, குற்றப் புலனாய்வு மற்றும் மக்கள் விழிப்புணர்வு செய்திகளை உடனுக்குடன் வழங்கும் அதிகாரப்பூர்வ செய்தி ஊடகம்.",
      copyright_text_en: "© 2026 Greater Chennai Police. All rights reserved.",
      copyright_text_ta: "© 2026 சென்னை பெருநகர காவல். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
      developer_credit_en: "Developed by GCP Media Team",
      developer_credit_ta: "சென்னை பெருநகர காவல் ஊடகக் குழுவால் உருவாக்கப்பட்டது",
      address_en: "Commissioner Office, Greater Chennai Police, Vepery, Chennai - 600007",
      address_ta: "காவல் ஆணையர் அலுவலகம், சென்னை பெருநகர காவல், வேப்பேரி, சென்னை - 600007",
      phone: "044-23452300",
      email: "cop@gcp.tn.gov.in",
      google_map_link: "https://maps.google.com/?q=Commissioner+Office+Greater+Chennai+Police+Vepery",
      social_facebook: "https://facebook.com",
      social_twitter: "https://twitter.com",
      social_youtube: "https://youtube.com",
      social_instagram: "https://instagram.com",
      background_image: "",
      background_color: "#1e40af",
      text_color: "#ffffff",
      footer_visible: true,
      quick_links: [
        { id: "ql1", label_en: "Home", label_ta: "முகப்பு", url: "/", target_blank: false, active: true, order_index: 1 },
        { id: "ql2", label_en: "Citizen Services", label_ta: "குடிமக்கள் சேவைகள்", url: "/citizen-services", target_blank: false, active: true, order_index: 2 },
        { id: "ql3", label_en: "Police Stations", label_ta: "காவல் நிலையங்கள்", url: "/stations", target_blank: false, active: true, order_index: 3 }
      ],
      government_links: [
        { id: "gl1", label_en: "Tamil Nadu Government", label_ta: "தமிழ்நாடு அரசு", url: "https://www.tn.gov.in", target_blank: true, active: true, order_index: 1 }
      ]
    };
  }

  public async getSuperadminConfig(): Promise<Record<string, any>> {
    try {
      const cols = await this.ensureMySqlTable("superadmin_config");
      const rows = await this.mysqlReadTable<Record<string, any>>("superadmin_config");

      if (cols.has("config_key") && cols.has("config_value")) {
        const cfg: Record<string, any> = {};
        for (const r of rows) {
          if (r.config_key) {
            cfg[String(r.config_key)] = safeParseJsonField(r.config_value);
          }
        }
        const defaults = this.buildDefaultFooterConfig();
        const existingFooter =
          cfg.footer_config && typeof cfg.footer_config === "object" ? cfg.footer_config : {};
        cfg.footer_config = { ...defaults, ...existingFooter };

        if (!rows.some((r) => String(r.config_key) === "footer_config")) {
          await mysqlQuery(
            "INSERT INTO `superadmin_config` (`config_key`, `config_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`)",
            ["footer_config", JSON.stringify(cfg.footer_config)]
          );
        }
        return cfg;
      }

      const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
      const extra = row && row.config_json && typeof row.config_json === "object" ? row.config_json : {};
      const cfg: Record<string, any> = {
        ...extra,
        ...(row?.footer_config ? { footer_config: row.footer_config } : {}),
      };
      if (!cfg.footer_config || typeof cfg.footer_config !== "object") {
        cfg.footer_config = this.buildDefaultFooterConfig();
        const { footer_config, ...rest } = cfg;
        await this.persistTableToMySQL("superadmin_config", [
          { id: 1, footer_config, config_json: rest },
        ]);
      }
      return cfg;
    } catch (err: any) {
      if (!this.isMySqlUnavailableError(err)) {
        console.warn("[MySQL] getSuperadminConfig fallback:", err?.message || err);
      }
      const cached = memoryDb.getTable<any[]>("superadmin_config");
      const row = Array.isArray(cached) && cached.length > 0 ? cached[0] : null;
      return {
        footer_config: this.buildDefaultFooterConfig(),
        ...(row && typeof row === "object" ? row : {}),
      };
    }
  }
  public async saveSuperadminConfig(key: string, value: any) {
    try {
      const cols = await this.ensureMySqlTable("superadmin_config");
      if (cols.has("config_key") && cols.has("config_value")) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        await mysqlQuery(
          "INSERT INTO `superadmin_config` (`config_key`, `config_value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `config_value` = VALUES(`config_value`)",
          [key, serialized]
        );
        this.revalidateAppPaths("superadmin_config");
        return;
      }

      const cfg = await this.getSuperadminConfig();
      cfg[key] = value;
      const { footer_config, ...rest } = cfg;
      await this.persistTableToMySQL("superadmin_config", [
        { id: 1, footer_config: footer_config || this.buildDefaultFooterConfig(), config_json: rest },
      ]);
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const cached = memoryDb.getTable<any[]>("superadmin_config") || [{}];
        const current = { ...(cached[0] || {}), [key]: value };
        memoryDb.updateCacheOnly("superadmin_config", [current]);
        return;
      }
      throw err;
    }
  }
  public async getSuperAdminConfig(): Promise<Record<string, any>> {
    return this.getSuperadminConfig();
  }

  // Backup & Restore
  public async backupDatabase(): Promise<string> {
    return JSON.stringify({
      users: await this.getUsers(),
      news: await this.getNews(),
      ticker: await this.getTicker(),
      slider: await this.getSlider(),
      commissioner_profile: await this.getCommissionerProfile(),
      theme_settings: await this.getThemeSettings(),
      menus: await this.getMenus(),
      sub_menus: await this.getSubMenus(),
      contacts: await this.getContacts(),
      videos: await this.getVideos(),
      alerts: await this.getAlerts(),
      police_stations: await this.getPoliceStations(),
      emergency_contacts: await this.getEmergencyContacts(),
      department_links: await this.getDepartmentLinks(),
      web_stories: await this.getWebStories()
    }, null, 2);
  }

  public async restoreDatabase(backupJson: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.users) await this.saveUsers(parsed.users);
      if (parsed.news) await this.saveNews(parsed.news);
      if (parsed.ticker) await this.saveTicker(parsed.ticker);
      if (parsed.slider) await this.saveSlider(parsed.slider);
      if (parsed.commissioner_profile) await this.saveCommissionerProfile(parsed.commissioner_profile);
      if (parsed.theme_settings) await this.saveThemeSettings(parsed.theme_settings);
      if (parsed.menus) await this.saveMenus(parsed.menus);
      if (parsed.sub_menus) await this.saveSubMenus(parsed.sub_menus);
      if (parsed.contacts) await this.saveContacts(parsed.contacts);
      if (parsed.videos) await this.saveVideos(parsed.videos);
      if (parsed.alerts) await this.saveAlerts(parsed.alerts);
      if (parsed.police_stations) await this.savePoliceStations(parsed.police_stations);
      if (parsed.emergency_contacts) await this.saveEmergencyContacts(parsed.emergency_contacts);
      if (parsed.department_links) await this.saveDepartmentLinks(parsed.department_links);
      if (parsed.web_stories) await this.saveWebStories(parsed.web_stories);
      return true;
    } catch (e) {
      console.error("Failed to restore DB:", e);
      return false;
    }
  }

  // ── SESSIONS MANAGEMENT ──
  public async getSessions(): Promise<DBSession[]> {
    return this.mysqlReadTable<DBSession>("sessions");
  }

  public async saveSessions(sessions: DBSession[]): Promise<void> {
    await this.persistTableToMySQL("sessions", sessions);
  }

  public async createSession(username: string, role: string, ip?: string, userAgent?: string, durationMinutes: number = 30): Promise<{ session_id: string; expires_at: string }> {
    const sessionId = crypto.randomBytes(24).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    const nowIso = now.toISOString();
    const ipAddr = ip || "127.0.0.1";
    const ua = userAgent || "Unknown";

    try {
      const cols = await this.ensureMySqlTable("sessions");
      const row: Record<string, any> = {
        username,
        session_id: sessionId,
        created_at: nowIso,
        last_activity: nowIso,
        expires_at: expiresAt,
        ip_address: ipAddr,
        user_agent: ua,
        revoked_at: null,
        status: "active",
      };
      const keys = Object.keys(row).filter((k) => cols.has(k));
      const escaped = keys.map((k) => `\`${k}\``).join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      await mysqlQuery(
        `INSERT INTO \`sessions\` (${escaped}) VALUES (${placeholders})`,
        keys.map((k) => row[k])
      );
      return { session_id: sessionId, expires_at: expiresAt };
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const sessions = [...(memoryDb.getTable<DBSession[]>("sessions") || [])];
        sessions.push({
          id: sessions.length > 0 ? Math.max(...sessions.map((s) => s.id || 0)) + 1 : 1,
          username,
          session_id: sessionId,
          created_at: nowIso,
          last_activity: nowIso,
          expires_at: expiresAt,
          ip_address: ipAddr,
          user_agent: ua,
          revoked_at: null,
          status: "active",
        });
        memoryDb.updateCacheOnly("sessions", sessions);
        return { session_id: sessionId, expires_at: expiresAt };
      }
      throw err;
    }
  }

  public async validateSession(sessionId: string): Promise<DBSession | null> {
    let session: DBSession | undefined;
    try {
      await this.ensureMySqlTable("sessions");
      const rows = (await mysqlQuery(
        "SELECT * FROM `sessions` WHERE `session_id` = ? AND `status` = 'active' LIMIT 1",
        [sessionId]
      )) as DBSession[];
      session = rows && rows.length > 0 ? rows[0] : undefined;
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const sessions = memoryDb.getTable<DBSession[]>("sessions") || [];
        session = sessions.find((s) => s.session_id === sessionId && s.status === "active");
      } else {
        throw err;
      }
    }

    if (!session) return null;

    const now = new Date();
    const expiresAt = new Date(session.expires_at);

    // Provide a 15-minute sliding grace period so active administrators are not abruptly logged out
    const GRACE_PERIOD_MS = 15 * 60 * 1000;
    if (now.getTime() > expiresAt.getTime() + GRACE_PERIOD_MS) {
      session.status = "expired";
      try {
        await mysqlQuery("UPDATE `sessions` SET `status` = 'expired' WHERE `session_id` = ?", [sessionId]);
      } catch {}
      return null;
    }

    // If within grace window, revive and extend the active session
    if (now > expiresAt) {
      session.last_activity = now.toISOString();
      session.expires_at = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
      try {
        await mysqlQuery(
          "UPDATE `sessions` SET `last_activity` = ?, `expires_at` = ? WHERE `session_id` = ?",
          [session.last_activity, session.expires_at, sessionId]
        );
      } catch {}
    }

    return session;
  }

  public async touchSession(sessionId: string, durationMinutes: number = 30): Promise<void> {
    const now = new Date();
    const lastActivity = now.toISOString();
    const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();
    try {
      await this.ensureMySqlTable("sessions");
      await mysqlQuery(
        "UPDATE `sessions` SET `last_activity` = ?, `expires_at` = ? WHERE `session_id` = ? AND `status` = 'active'",
        [lastActivity, expiresAt, sessionId]
      );
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const sessions = memoryDb.getTable<DBSession[]>("sessions") || [];
        const session = sessions.find((s) => s.session_id === sessionId && s.status === "active");
        if (session) {
          session.last_activity = lastActivity;
          session.expires_at = expiresAt;
          memoryDb.updateCacheOnly("sessions", sessions);
        }
      }
    }
  }

  public async revokeSession(sessionId: string): Promise<boolean> {
    const nowIso = new Date().toISOString();
    try {
      await this.ensureMySqlTable("sessions");
      const res: any = await mysqlQuery(
        "UPDATE `sessions` SET `status` = 'revoked', `revoked_at` = ? WHERE `session_id` = ?",
        [nowIso, sessionId]
      );
      return Number(res?.affectedRows || 0) > 0;
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const sessions = memoryDb.getTable<DBSession[]>("sessions") || [];
        const session = sessions.find((s) => s.session_id === sessionId);
        if (session) {
          session.status = "revoked";
          session.revoked_at = nowIso;
          memoryDb.updateCacheOnly("sessions", sessions);
          return true;
        }
        return false;
      }
      throw err;
    }
  }

  public async revokeAllUserSessions(username: string): Promise<boolean> {
    const nowIso = new Date().toISOString();
    try {
      await this.ensureMySqlTable("sessions");
      const res: any = await mysqlQuery(
        "UPDATE `sessions` SET `status` = 'revoked', `revoked_at` = ? WHERE LOWER(`username`) = LOWER(?) AND `status` = 'active'",
        [nowIso, username]
      );
      return Number(res?.affectedRows || 0) > 0;
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const sessions = memoryDb.getTable<DBSession[]>("sessions") || [];
        let count = 0;
        for (const s of sessions) {
          if (s.username.toLowerCase() === username.toLowerCase() && s.status === "active") {
            s.status = "revoked";
            s.revoked_at = nowIso;
            count++;
          }
        }
        memoryDb.updateCacheOnly("sessions", sessions);
        return count > 0;
      }
      throw err;
    }
  }

  public async getActiveSessions(): Promise<DBSession[]> {
    const sessions = await this.getSessions();
    const now = new Date();
    return sessions.filter((s) => s.status === "active" && new Date(s.expires_at) > now);
  }

  // ── SECURITY EVENTS ──
  public async getSecurityEvents(): Promise<DBSecurityEvent[]> {
    const raw = await this.mysqlReadTable<DBSecurityEvent>("security_events", "`id` DESC");
    return raw.sort((a: DBSecurityEvent, b: DBSecurityEvent) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public async logSecurityEvent(
    username: string,
    eventType: string,
    severity: "info" | "warning" | "high" | "critical" = "info",
    ip?: string,
    userAgent?: string,
    details?: string
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const entry: Record<string, any> = {
      username,
      event_type: eventType,
      severity,
      ip_address: ip || "127.0.0.1",
      user_agent: userAgent || "Unknown",
      details: details || "",
      created_at: nowIso,
    };
    try {
      const cols = await this.ensureMySqlTable("security_events");
      const keys = Object.keys(entry).filter((k) => cols.has(k));
      const escaped = keys.map((k) => `\`${k}\``).join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      await mysqlQuery(
        `INSERT INTO \`security_events\` (${escaped}) VALUES (${placeholders})`,
        keys.map((k) => entry[k])
      );
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const events = [...(memoryDb.getTable<DBSecurityEvent[]>("security_events") || [])];
        events.push({
          id: events.length > 0 ? Math.max(...events.map((e) => e.id || 0)) + 1 : 1,
          ...(entry as Omit<DBSecurityEvent, "id">),
        });
        memoryDb.updateCacheOnly("security_events", events);
        return;
      }
      console.warn("[MySQL] logSecurityEvent warning:", err?.message || err);
    }
  }

  public async addSecurityEvent(event: { username?: string; event_type?: string; severity?: "info" | "warning" | "high" | "critical" | "low" | "medium"; ip_address?: string; browser?: string; details?: string }): Promise<void> {
    const sevMap: Record<string, "info" | "warning" | "high" | "critical"> = {
      low: "info",
      medium: "warning",
      high: "high",
      critical: "critical",
      info: "info",
      warning: "warning"
    };
    const sev = (event.severity && sevMap[event.severity]) || "info";
    return this.logSecurityEvent(
      event.username || "SYSTEM",
      event.event_type || "SECURITY_EVENT",
      sev,
      event.ip_address || "127.0.0.1",
      event.browser,
      event.details
    );
  }


  // ── SECURITY CONFIGURATION ──
  public async getSecurityPolicyConfig(): Promise<DBSecurityConfig> {
    const rows = await this.mysqlReadTable<any>("security_config");
    const row = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
    if (!row) {
      const defaultConfig: DBSecurityConfig = {
        admin_console_path: process.env.ADMIN_CONSOLE_PATH || "/control-center",
        session_timeout_minutes: 30,
        login_rate_limit: 5,
        max_failed_logins: 5,
        lockout_duration_minutes: 30,
        captcha_enabled: true,
        mfa_policy: "optional",
        maintenance_mode: false,
      };
      await this.persistTableToMySQL("security_config", [{ id: 1, ...defaultConfig }]);
      return defaultConfig;
    }
    return {
      admin_console_path: row.admin_console_path || process.env.ADMIN_CONSOLE_PATH || "/control-center",
      session_timeout_minutes: Number(row.session_timeout_minutes ?? 30),
      login_rate_limit: Number(row.login_rate_limit ?? 5),
      max_failed_logins: Number(row.max_failed_logins ?? 5),
      lockout_duration_minutes: Number(row.lockout_duration_minutes ?? 30),
      captcha_enabled: Boolean(row.captcha_enabled),
      mfa_policy: row.mfa_policy || "optional",
      maintenance_mode: Boolean(row.maintenance_mode),
    };
  }

  public async saveSecurityPolicyConfig(newConfig: Partial<DBSecurityConfig>): Promise<DBSecurityConfig> {
    const current = await this.getSecurityPolicyConfig();
    const updated: DBSecurityConfig = { ...current, ...newConfig };
    await this.persistTableToMySQL("security_config", [{ id: 1, ...updated }]);
    return updated;
  }

  public async getMaintenanceConfig(): Promise<DBMaintenanceConfig> {
    // 1. Query MySQL Database first
    try {
      const rows: any = await mysqlQuery("SELECT * FROM maintenance_config WHERE id = 1 LIMIT 1");
      if (Array.isArray(rows) && rows.length > 0) {
        const cfg = rows[0];
        const descEn = cfg.maintenance_description_en || cfg.maintenance_message_en || "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.";
        const descTa = cfg.maintenance_description_ta || cfg.maintenance_message_ta || "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.";
        const restoreIso = cfg.expected_restoration_datetime || cfg.expected_restore_at || null;
        const result: DBMaintenanceConfig = {
          id: 1,
          maintenance_enabled: Boolean(cfg.maintenance_enabled),
          maintenance_title_en: cfg.maintenance_title_en || "We'll Be Back Soon!",
          maintenance_description_en: descEn,
          maintenance_title_ta: cfg.maintenance_title_ta || "இணையதளம் பராமரிப்பில் உள்ளது",
          maintenance_description_ta: descTa,
          expected_restoration_datetime: restoreIso,
          expected_restore_at: restoreIso,
          maintenance_message_en: descEn,
          maintenance_message_ta: descTa,
          active_schedule_ref: cfg.active_schedule_ref || null,
          updated_by: cfg.updated_by || "System",
          updated_at: cfg.updated_at ? new Date(cfg.updated_at).toISOString() : new Date().toISOString()
        };
        memoryDb.updateCacheOnly("maintenance_config", [result]);
        try {
          setFastMaintenanceCache({
            maintenance_enabled: result.maintenance_enabled,
            maintenance_title_en: result.maintenance_title_en,
            maintenance_description_en: result.maintenance_description_en,
            maintenance_title_ta: result.maintenance_title_ta,
            maintenance_description_ta: result.maintenance_description_ta,
            expected_restoration_datetime: result.expected_restoration_datetime ?? null,
            expected_restore_at: result.expected_restore_at ?? null,
            maintenance_message_en: result.maintenance_message_en || result.maintenance_description_en,
            maintenance_message_ta: result.maintenance_message_ta || result.maintenance_description_ta,
            updated_by: result.updated_by,
            updated_at: result.updated_at,
          });
        } catch {}
        return result;
      }
    } catch {
      // Fallback strictly to in-memory cache when MySQL is unavailable
    }

    const raw = memoryDb.getTable<DBMaintenanceConfig[]>("maintenance_config");
    if (Array.isArray(raw) && raw.length > 0) {
      const cfg = raw[0];
      return {
        id: 1,
        maintenance_enabled: Boolean(cfg.maintenance_enabled),
        maintenance_title_en: cfg.maintenance_title_en || "We'll Be Back Soon!",
        maintenance_description_en: cfg.maintenance_description_en || cfg.maintenance_message_en || "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
        maintenance_title_ta: cfg.maintenance_title_ta || "இணையதளம் பராமரிப்பில் உள்ளது",
        maintenance_description_ta: cfg.maintenance_description_ta || cfg.maintenance_message_ta || "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
        expected_restoration_datetime: cfg.expected_restoration_datetime || cfg.expected_restore_at || null,
        expected_restore_at: cfg.expected_restoration_datetime || cfg.expected_restore_at || null,
        maintenance_message_en: cfg.maintenance_description_en || cfg.maintenance_message_en || "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
        maintenance_message_ta: cfg.maintenance_description_ta || cfg.maintenance_message_ta || "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
        active_schedule_ref: cfg.active_schedule_ref || null,
        updated_by: cfg.updated_by || "System",
        updated_at: cfg.updated_at || new Date().toISOString()
      };
    }
    const defaultConfig: DBMaintenanceConfig = {
      id: 1,
      maintenance_enabled: false,
      maintenance_title_en: "We'll Be Back Soon!",
      maintenance_description_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
      maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
      maintenance_description_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
      expected_restoration_datetime: null,
      expected_restore_at: null,
      maintenance_message_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
      maintenance_message_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
      active_schedule_ref: null,
      updated_by: "System",
      updated_at: new Date().toISOString()
    };
    memoryDb.updateCacheOnly("maintenance_config", [defaultConfig]);
    return defaultConfig;
  }

  public async updateMaintenanceConfig(partial: Partial<DBMaintenanceConfig>, updatedBy: string = "System"): Promise<DBMaintenanceConfig> {
    const current = await this.getMaintenanceConfig();
    const updated: DBMaintenanceConfig = {
      ...current,
      ...partial,
      id: 1,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    };
    if (partial.maintenance_description_en && !partial.maintenance_message_en) {
      updated.maintenance_message_en = partial.maintenance_description_en;
    }
    if (partial.maintenance_message_en && !partial.maintenance_description_en) {
      updated.maintenance_description_en = partial.maintenance_message_en;
    }
    if (partial.maintenance_description_ta && !partial.maintenance_message_ta) {
      updated.maintenance_message_ta = partial.maintenance_description_ta;
    }
    if (partial.maintenance_message_ta && !partial.maintenance_description_ta) {
      updated.maintenance_description_ta = partial.maintenance_message_ta;
    }
    if (partial.expected_restoration_datetime !== undefined) {
      updated.expected_restore_at = partial.expected_restoration_datetime;
    } else if (partial.expected_restore_at !== undefined) {
      updated.expected_restoration_datetime = partial.expected_restore_at;
    }
    if (partial.active_schedule_ref !== undefined) {
      updated.active_schedule_ref = partial.active_schedule_ref;
    }

    // 1. Update MySQL database
    try {
      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS maintenance_config (
          id INT PRIMARY KEY AUTO_INCREMENT,
          maintenance_enabled TINYINT(1) NOT NULL DEFAULT 0,
          maintenance_title_en VARCHAR(255) NULL,
          maintenance_description_en LONGTEXT NULL,
          maintenance_title_ta VARCHAR(255) NULL,
          maintenance_description_ta LONGTEXT NULL,
          expected_restoration_datetime VARCHAR(64) NULL,
          expected_restore_at VARCHAR(64) NULL,
          maintenance_message_en LONGTEXT NULL,
          maintenance_message_ta LONGTEXT NULL,
          active_schedule_ref VARCHAR(128) NULL,
          updated_by VARCHAR(128) NOT NULL DEFAULT 'System',
          updated_at VARCHAR(64) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await mysqlQuery(`
        INSERT INTO maintenance_config (
          id, maintenance_enabled, maintenance_title_en, maintenance_description_en,
          maintenance_title_ta, maintenance_description_ta, expected_restoration_datetime,
          expected_restore_at, maintenance_message_en, maintenance_message_ta,
          active_schedule_ref, updated_by, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          maintenance_enabled = VALUES(maintenance_enabled),
          maintenance_title_en = VALUES(maintenance_title_en),
          maintenance_description_en = VALUES(maintenance_description_en),
          maintenance_title_ta = VALUES(maintenance_title_ta),
          maintenance_description_ta = VALUES(maintenance_description_ta),
          expected_restoration_datetime = VALUES(expected_restoration_datetime),
          expected_restore_at = VALUES(expected_restore_at),
          maintenance_message_en = VALUES(maintenance_message_en),
          maintenance_message_ta = VALUES(maintenance_message_ta),
          active_schedule_ref = VALUES(active_schedule_ref),
          updated_by = VALUES(updated_by),
          updated_at = VALUES(updated_at);
      `, [
        updated.maintenance_enabled ? 1 : 0,
        updated.maintenance_title_en,
        updated.maintenance_description_en,
        updated.maintenance_title_ta,
        updated.maintenance_description_ta,
        updated.expected_restoration_datetime,
        updated.expected_restore_at,
        updated.maintenance_message_en,
        updated.maintenance_message_ta,
        updated.active_schedule_ref,
        updated.updated_by,
        updated.updated_at
      ]);
    } catch (err: any) {
      if (!this.isMySqlUnavailableError(err)) {
        console.error("[MySQL Persistence] updateMaintenanceConfig failed:", err);
        throw err;
      }
    }

    // Synchronize fast in-memory cache for middleware/proxy immediately
    try {
      setFastMaintenanceCache({
        maintenance_enabled: updated.maintenance_enabled,
        maintenance_title_en: updated.maintenance_title_en,
        maintenance_description_en: updated.maintenance_description_en,
        maintenance_title_ta: updated.maintenance_title_ta,
        maintenance_description_ta: updated.maintenance_description_ta,
        expected_restoration_datetime: updated.expected_restoration_datetime ?? null,
        expected_restore_at: updated.expected_restore_at ?? null,
        maintenance_message_en: updated.maintenance_message_en || updated.maintenance_description_en,
        maintenance_message_ta: updated.maintenance_message_ta || updated.maintenance_description_ta,
        updated_by: updated.updated_by,
        updated_at: updated.updated_at,
      });
    } catch {}

    memoryDb.updateCacheOnly("maintenance_config", [updated]);

    try {
      const sec = await this.getSecurityPolicyConfig();
      if (sec.maintenance_mode !== updated.maintenance_enabled) {
        await this.saveSecurityPolicyConfig({ maintenance_mode: updated.maintenance_enabled });
      }
    } catch {}

    return updated;
  }

  // Maintenance Notifications
  public async getMaintenanceNotifications(): Promise<DBMaintenanceNotification[]> {
    // 1. Query MySQL Database directly
    try {
      const rows: any = await mysqlQuery("SELECT * FROM maintenance_notifications ORDER BY created_at DESC");
      if (Array.isArray(rows)) {
        const mapped: DBMaintenanceNotification[] = rows.map((r: any) => ({
          id: String(r.id),
          schedule_ref: String(r.schedule_ref),
          scheduled_restoration_datetime: String(r.scheduled_restoration_datetime),
          generated_at: String(r.generated_at),
          status: r.status === "READ" ? "READ" : "NEW",
          read_by: r.read_by || null,
          read_at: r.read_at || null,
          created_at: String(r.created_at),
          maintenance_status_at_trigger: r.maintenance_status_at_trigger === "INACTIVE" ? "INACTIVE" : "ACTIVE"
        }));
        memoryDb.updateCacheOnly("maintenance_notifications", mapped);
        return mapped;
      }
    } catch {}

    const raw = memoryDb.getTable<DBMaintenanceNotification[]>("maintenance_notifications");
    return Array.isArray(raw) ? raw : [];
  }

  public async saveMaintenanceNotifications(notifications: DBMaintenanceNotification[]): Promise<void> {
    await this.persistTableToMySQL("maintenance_notifications", notifications);
  }

  public async addMaintenanceNotification(notification: DBMaintenanceNotification): Promise<DBMaintenanceNotification> {
    try {
      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS maintenance_notifications (
          id VARCHAR(128) PRIMARY KEY,
          schedule_ref VARCHAR(128) NOT NULL,
          scheduled_restoration_datetime VARCHAR(64) NOT NULL,
          generated_at VARCHAR(64) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'NEW',
          read_by VARCHAR(128) NULL,
          read_at VARCHAR(64) NULL,
          created_at VARCHAR(64) NOT NULL,
          maintenance_status_at_trigger VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
          INDEX idx_maint_schedule_ref (schedule_ref),
          INDEX idx_maint_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      const existing: any = await mysqlQuery(
        "SELECT * FROM maintenance_notifications WHERE schedule_ref = ? LIMIT 1",
        [notification.schedule_ref]
      );
      if (Array.isArray(existing) && existing.length > 0) {
        return existing[0] as DBMaintenanceNotification;
      }
      await mysqlQuery(`
        INSERT INTO maintenance_notifications (
          id, schedule_ref, scheduled_restoration_datetime, generated_at,
          status, read_by, read_at, created_at, maintenance_status_at_trigger
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE status = VALUES(status);
      `, [
        notification.id,
        notification.schedule_ref,
        notification.scheduled_restoration_datetime,
        notification.generated_at,
        notification.status,
        notification.read_by || null,
        notification.read_at || null,
        notification.created_at,
        notification.maintenance_status_at_trigger
      ]);
      const cached = [...(memoryDb.getTable<DBMaintenanceNotification[]>("maintenance_notifications") || [])];
      cached.unshift(notification);
      memoryDb.updateCacheOnly("maintenance_notifications", cached);
      return notification;
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const notifications = [...(memoryDb.getTable<DBMaintenanceNotification[]>("maintenance_notifications") || [])];
        const existingIndex = notifications.findIndex((n) => n.schedule_ref === notification.schedule_ref);
        if (existingIndex >= 0) return notifications[existingIndex];
        notifications.unshift(notification);
        memoryDb.updateCacheOnly("maintenance_notifications", notifications);
        return notification;
      }
      throw err;
    }
  }

  public async markMaintenanceNotificationRead(id: string, readBy: string): Promise<DBMaintenanceNotification | null> {
    const nowIso = new Date().toISOString();
    try {
      await mysqlQuery(
        "UPDATE maintenance_notifications SET status = 'READ', read_by = ?, read_at = ? WHERE id = ?",
        [readBy, nowIso, id]
      );
      const rows: any = await mysqlQuery("SELECT * FROM maintenance_notifications WHERE id = ? LIMIT 1", [id]);
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        return {
          id: String(r.id),
          schedule_ref: String(r.schedule_ref),
          scheduled_restoration_datetime: String(r.scheduled_restoration_datetime),
          generated_at: String(r.generated_at),
          status: r.status === "READ" ? "READ" : "NEW",
          read_by: r.read_by || null,
          read_at: r.read_at || null,
          created_at: String(r.created_at),
          maintenance_status_at_trigger: r.maintenance_status_at_trigger === "INACTIVE" ? "INACTIVE" : "ACTIVE"
        };
      }
      return null;
    } catch (err: any) {
      if (this.isMySqlUnavailableError(err)) {
        const notifications = memoryDb.getTable<DBMaintenanceNotification[]>("maintenance_notifications") || [];
        const target = notifications.find((n) => n.id === id);
        if (!target) return null;
        target.status = "READ";
        target.read_by = readBy;
        target.read_at = nowIso;
        memoryDb.updateCacheOnly("maintenance_notifications", notifications);
        return target;
      }
      throw err;
    }
  }

  public async getSecurityConfig(): Promise<DBSecurityConfig> {
    return this.getSecurityPolicyConfig();
  }

  public async updateSecurityConfig(newConfig: Partial<DBSecurityConfig>): Promise<DBSecurityConfig> {
    return this.saveSecurityPolicyConfig(newConfig);
  }

  public async getNewsArticles(): Promise<DBNewsItem[]> {
    return this.getNews();
  }

  public async getAdminUsers(): Promise<DBUser[]> {
    return this.getUsers();
  }

  // ── MFA & TRUSTED DEVICES SYSTEM ──
  public async getUserMfa(username: string): Promise<DBUserMfa | null> {
    const list = await this.mysqlReadTable<DBUserMfa>("user_mfa");
    return list.find((m) => m.username.toLowerCase() === username.toLowerCase() && Number(m.enabled) === 1) || null;
  }

  public async saveUserMfa(username: string, secretEncrypted: string, enabled = 1): Promise<DBUserMfa> {
    const list = [...(await this.mysqlReadTable<DBUserMfa>("user_mfa"))];
    const idx = list.findIndex((m) => m.username.toLowerCase() === username.toLowerCase());
    const now = new Date().toISOString();

    const record: DBUserMfa = {
      id: idx >= 0 ? list[idx].id : (list.length > 0 ? Math.max(...list.map((m) => Number(m.id) || 0)) + 1 : 1),
      username,
      secret_encrypted: secretEncrypted,
      method: "TOTP",
      enabled,
      verified_at: enabled ? now : null,
      created_at: idx >= 0 ? list[idx].created_at : now,
    };

    if (idx >= 0) {
      list[idx] = record;
    } else {
      list.push(record);
    }
    await this.persistTableToMySQL("user_mfa", list);
    return record;
  }

  public async disableUserMfa(username: string): Promise<void> {
    const list = await this.mysqlReadTable<DBUserMfa>("user_mfa");
    const updated = list.map((m) => (m.username.toLowerCase() === username.toLowerCase() ? { ...m, enabled: 0 } : m));
    await this.persistTableToMySQL("user_mfa", updated);
  }

  public async createMfaChallenge(username: string): Promise<DBMfaChallenge> {
    const challenges = [...(await this.mysqlReadTable<DBMfaChallenge>("mfa_challenges"))];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 min expiry
    const challengeId = `mfa_ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newChallenge: DBMfaChallenge = {
      id: challenges.length > 0 ? Math.max(...challenges.map((c) => Number(c.id) || 0)) + 1 : 1,
      challenge_id: challengeId,
      username,
      expires_at: expiresAt,
      attempt_count: 0,
      verified: 0,
      created_at: now.toISOString(),
    };

    challenges.push(newChallenge);
    await this.persistTableToMySQL("mfa_challenges", challenges);
    return newChallenge;
  }

  public async validateMfaChallenge(challengeId: string, username: string): Promise<DBMfaChallenge | null> {
    const challenges = await this.mysqlReadTable<DBMfaChallenge>("mfa_challenges");
    const ch = challenges.find(
      (c) => c.challenge_id === challengeId && c.username.toLowerCase() === username.toLowerCase() && Number(c.verified) === 0
    );
    if (!ch) return null;

    if (new Date(ch.expires_at).getTime() < Date.now()) {
      return null;
    }
    return ch;
  }

  public async incrementMfaChallengeAttempt(challengeId: string): Promise<number> {
    const challenges = [...(await this.mysqlReadTable<DBMfaChallenge>("mfa_challenges"))];
    const idx = challenges.findIndex((c) => c.challenge_id === challengeId);
    if (idx >= 0) {
      challenges[idx] = { ...challenges[idx], attempt_count: Number(challenges[idx].attempt_count || 0) + 1 };
      await this.persistTableToMySQL("mfa_challenges", challenges);
      return challenges[idx].attempt_count;
    }
    return 0;
  }

  public async markMfaChallengeVerified(challengeId: string): Promise<void> {
    const challenges = [...(await this.mysqlReadTable<DBMfaChallenge>("mfa_challenges"))];
    const idx = challenges.findIndex((c) => c.challenge_id === challengeId);
    if (idx >= 0) {
      challenges[idx] = { ...challenges[idx], verified: 1 };
      await this.persistTableToMySQL("mfa_challenges", challenges);
    }
  }

  public async saveRecoveryCodes(username: string, hashedCodes: string[]): Promise<void> {
    const list = await this.mysqlReadTable<DBMfaRecoveryCode>("mfa_recovery_codes");
    const filtered = list.filter((r) => r.username.toLowerCase() !== username.toLowerCase());
    const now = new Date().toISOString();
    let nextId = filtered.length > 0 ? Math.max(...filtered.map((r) => Number(r.id) || 0)) + 1 : 1;

    hashedCodes.forEach((hash) => {
      filtered.push({
        id: nextId++,
        username,
        code_hash: hash,
        used_at: null,
        created_at: now,
      });
    });

    await this.persistTableToMySQL("mfa_recovery_codes", filtered);
  }

  public async verifyAndConsumeRecoveryCode(username: string, plainCode: string): Promise<boolean> {
    const crypto = await import("crypto");
    const cleanCode = plainCode.replace(/[^A-Z0-9]/gi, "").toUpperCase();
    const hash = crypto.createHash("sha256").update(cleanCode).digest("hex");

    const list = [...(await this.mysqlReadTable<DBMfaRecoveryCode>("mfa_recovery_codes"))];
    const idx = list.findIndex((r) => r.username.toLowerCase() === username.toLowerCase() && r.code_hash === hash && !r.used_at);

    if (idx >= 0) {
      list[idx] = { ...list[idx], used_at: new Date().toISOString() };
      await this.persistTableToMySQL("mfa_recovery_codes", list);
      return true;
    }
    return false;
  }

  public async createTrustedDevice(username: string, tokenHash: string, deviceName: string, userAgentSummary: string): Promise<DBTrustedDevice> {
    const devices = [...(await this.mysqlReadTable<DBTrustedDevice>("trusted_devices"))];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const record: DBTrustedDevice = {
      id: devices.length > 0 ? Math.max(...devices.map((d) => Number(d.id) || 0)) + 1 : 1,
      username,
      token_hash: tokenHash,
      device_name: deviceName,
      user_agent_summary: userAgentSummary,
      created_at: now.toISOString(),
      last_used_at: now.toISOString(),
      expires_at: expiresAt,
      revoked_at: null,
    };

    devices.push(record);
    await this.persistTableToMySQL("trusted_devices", devices);
    return record;
  }

  public async validateTrustedDevice(username: string, tokenHash: string): Promise<boolean> {
    const devices = [...(await this.mysqlReadTable<DBTrustedDevice>("trusted_devices"))];
    const idx = devices.findIndex((d) => d.username.toLowerCase() === username.toLowerCase() && d.token_hash === tokenHash && !d.revoked_at);
    if (idx < 0) return false;

    if (new Date(devices[idx].expires_at).getTime() < Date.now()) return false;
    devices[idx] = { ...devices[idx], last_used_at: new Date().toISOString() };
    await this.persistTableToMySQL("trusted_devices", devices);
    return true;
  }

  public async getUserTrustedDevices(username: string): Promise<DBTrustedDevice[]> {
    const devices = await this.mysqlReadTable<DBTrustedDevice>("trusted_devices");
    return devices.filter((d) => d.username.toLowerCase() === username.toLowerCase() && !d.revoked_at);
  }

  public async revokeTrustedDevice(id: number, username: string): Promise<void> {
    const devices = await this.mysqlReadTable<DBTrustedDevice>("trusted_devices");
    const updated = devices.map((d) =>
      Number(d.id) === Number(id) && d.username.toLowerCase() === username.toLowerCase()
        ? { ...d, revoked_at: new Date().toISOString() }
        : d
    );
    await this.persistTableToMySQL("trusted_devices", updated);
  }

  public async revokeAllTrustedDevices(username: string): Promise<void> {
    const devices = await this.mysqlReadTable<DBTrustedDevice>("trusted_devices");
    const updated = devices.map((d) =>
      d.username.toLowerCase() === username.toLowerCase()
        ? { ...d, revoked_at: new Date().toISOString() }
        : d
    );
    await this.persistTableToMySQL("trusted_devices", updated);
  }

  // ── Media Files Security Registry ──
  public async getMediaFiles(): Promise<DBMediaFileRecord[]> {
    const files = await this.mysqlReadTable<DBMediaFileRecord>("media_files", "`id` DESC");
    return files.filter((f) => f.status !== "DELETED");
  }

  public async saveMediaFileRecord(recordData: Omit<DBMediaFileRecord, "id">): Promise<DBMediaFileRecord> {
    const files = [...(await this.mysqlReadTable<DBMediaFileRecord>("media_files", "`id` DESC"))];
    const id = files.length > 0 ? Math.max(...files.map((f) => Number(f.id) || 0)) + 1 : 1;
    const newRecord: DBMediaFileRecord = { id, ...recordData };
    files.unshift(newRecord);
    await this.persistTableToMySQL("media_files", files);
    return newRecord;
  }

  public async updateMediaFileStatus(id: number, status: "QUARANTINED" | "APPROVED" | "REJECTED" | "DELETED"): Promise<void> {
    const files = await this.mysqlReadTable<DBMediaFileRecord>("media_files", "`id` DESC");
    const updated = files.map((f) => (Number(f.id) === Number(id) ? { ...f, status } : f));
    await this.persistTableToMySQL("media_files", updated);
  }

  public async deleteMediaFile(id: number): Promise<void> {
    await this.updateMediaFileStatus(id, "DELETED");
  }

  // ── Disaster Recovery & Backup Registry ──
  public async getBackups(): Promise<DBBackupRecord[]> {
    const backups = await this.mysqlReadTable<DBBackupRecord>("backups", "`created_at` DESC");
    return backups.filter((b) => b.status !== "DELETED");
  }

  public async getBackupById(id: string): Promise<DBBackupRecord | null> {
    const backups = await this.mysqlReadTable<DBBackupRecord>("backups", "`created_at` DESC");
    return backups.find((b) => String(b.id) === String(id)) || null;
  }

  public async saveBackupRecord(record: DBBackupRecord): Promise<DBBackupRecord> {
    const backups = [...(await this.mysqlReadTable<DBBackupRecord>("backups", "`created_at` DESC"))];
    const existingIndex = backups.findIndex((b) => String(b.id) === String(record.id));
    if (existingIndex >= 0) {
      backups[existingIndex] = record;
    } else {
      backups.unshift(record);
    }
    await this.persistTableToMySQL("backups", backups);
    return record;
  }

  public async updateBackupStatus(
    id: string,
    status: DBBackupRecord["status"],
    verification_status?: DBBackupRecord["verification_status"]
  ): Promise<void> {
    const backups = await this.mysqlReadTable<DBBackupRecord>("backups", "`created_at` DESC");
    const updated = backups.map((b) => {
      if (String(b.id) === String(id)) {
        return {
          ...b,
          status,
          verification_status: verification_status || b.verification_status
        };
      }
      return b;
    });
    await this.persistTableToMySQL("backups", updated);
  }

  public async deleteBackupRecord(id: string): Promise<void> {
    await this.updateBackupStatus(id, "DELETED");
  }

  // ── Security Assessment & Audit Registry ──
  public async getSecurityAssessments(): Promise<DBSecurityAssessmentRecord[]> {
    const assessments = await this.mysqlReadTable<DBSecurityAssessmentRecord>("security_assessments", "`assessment_date` DESC");
    return assessments.map((a) => ({
      ...a,
      findings: Array.isArray(a.findings) ? a.findings : [],
    }));
  }

  public async saveSecurityAssessment(record: DBSecurityAssessmentRecord): Promise<DBSecurityAssessmentRecord> {
    const assessments = [...(await this.getSecurityAssessments())];
    assessments.unshift(record);
    await this.persistTableToMySQL("security_assessments", assessments);
    return record;
  }

  public async updateFindingStatus(findingId: string, status: DBSecurityFinding["status"]): Promise<void> {
    const assessments = await this.getSecurityAssessments();
    const updated = assessments.map((a) => {
      const findingExists = Array.isArray(a.findings) && a.findings.some((f) => f.id === findingId);
      if (findingExists) {
        return {
          ...a,
          findings: a.findings.map((f) => (f.id === findingId ? { ...f, status } : f))
        };
      }
      return a;
    });
    await this.persistTableToMySQL("security_assessments", updated);
  }

  // ================= VISITOR ANALYTICS =================
  public async getVisitorStats(): Promise<{ totalVisitors: number; todayVisitors: number }> {
    let totalVisitors = 0;
    let todayVisitors = 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    try {
      const statsRes: any = await mysqlQuery("SELECT total_page_views FROM portal_visitor_stats WHERE id = 1 LIMIT 1");
      if (Array.isArray(statsRes) && statsRes.length > 0) {
        totalVisitors = Number(statsRes[0].total_page_views || 0);
        memoryDb.updateCacheOnly("portal_visitor_stats", [
          { id: 1, total_page_views: totalVisitors, created_at: nowIso, updated_at: nowIso },
        ]);
      }
      const dailyRes: any = await mysqlQuery("SELECT page_views FROM portal_daily_visits WHERE visit_date = CURDATE() LIMIT 1");
      if (Array.isArray(dailyRes) && dailyRes.length > 0) {
        todayVisitors = Number(dailyRes[0].page_views || 0);
        memoryDb.updateCacheOnly("portal_daily_visits", [
          { id: 1, visit_date: todayStr, page_views: todayVisitors, created_at: nowIso, updated_at: nowIso },
        ]);
      }
    } catch {
      const stats: DBVisitorStats[] = memoryDb.getTable("portal_visitor_stats") || [];
      if (stats.length > 0) {
        totalVisitors = Number(stats[0].total_page_views || 0);
      }
      const daily: DBDailyVisits[] = memoryDb.getTable("portal_daily_visits") || [];
      const todayEntry = daily.find((d) => d.visit_date === todayStr);
      if (todayEntry) {
        todayVisitors = Number(todayEntry.page_views || 0);
      }
    }

    return { totalVisitors, todayVisitors };
  }

  public async incrementVisitorCount(): Promise<{ totalVisitors: number; todayVisitors: number }> {
    let totalVisitors = 0;
    let todayVisitors = 0;
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    // 1. MySQL Atomic Increment
    try {
      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS portal_visitor_stats (
          id INT PRIMARY KEY,
          total_page_views BIGINT NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      await mysqlQuery(`
        CREATE TABLE IF NOT EXISTS portal_daily_visits (
          id INT PRIMARY KEY AUTO_INCREMENT,
          visit_date DATE NOT NULL UNIQUE,
          page_views BIGINT NOT NULL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await mysqlQuery(`
        INSERT INTO portal_visitor_stats (id, total_page_views, created_at, updated_at)
        VALUES (1, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE total_page_views = total_page_views + 1, updated_at = NOW();
      `);

      await mysqlQuery(`
        INSERT INTO portal_daily_visits (visit_date, page_views, created_at, updated_at)
        VALUES (CURDATE(), 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE page_views = page_views + 1, updated_at = NOW();
      `);

      const statsRes: any = await mysqlQuery("SELECT total_page_views FROM portal_visitor_stats WHERE id = 1 LIMIT 1");
      if (Array.isArray(statsRes) && statsRes.length > 0) {
        totalVisitors = Number(statsRes[0].total_page_views || 0);
      }
      const dailyRes: any = await mysqlQuery("SELECT page_views FROM portal_daily_visits WHERE visit_date = CURDATE() LIMIT 1");
      if (Array.isArray(dailyRes) && dailyRes.length > 0) {
        todayVisitors = Number(dailyRes[0].page_views || 0);
      }

      memoryDb.updateCacheOnly("portal_visitor_stats", [
        { id: 1, total_page_views: totalVisitors, created_at: nowIso, updated_at: nowIso },
      ]);
      memoryDb.updateCacheOnly("portal_daily_visits", [
        { id: 1, visit_date: todayStr, page_views: todayVisitors, created_at: nowIso, updated_at: nowIso },
      ]);
    } catch (mysqlErr) {
      if (!this.isMySqlUnavailableError(mysqlErr)) {
        console.warn("MySQL visitor counter increment warning:", mysqlErr);
      }
      const stats: DBVisitorStats[] = [...(memoryDb.getTable<DBVisitorStats[]>("portal_visitor_stats") || [])];
      if (stats.length === 0) {
        totalVisitors = 1;
        stats.push({ id: 1, total_page_views: 1, created_at: nowIso, updated_at: nowIso });
      } else {
        totalVisitors = Number(stats[0].total_page_views || 0) + 1;
        stats[0] = { ...stats[0], total_page_views: totalVisitors, updated_at: nowIso };
      }
      memoryDb.updateCacheOnly("portal_visitor_stats", stats);

      const daily: DBDailyVisits[] = [...(memoryDb.getTable<DBDailyVisits[]>("portal_daily_visits") || [])];
      const existingTodayIdx = daily.findIndex((d) => d.visit_date === todayStr);
      if (existingTodayIdx >= 0) {
        todayVisitors = Number(daily[existingTodayIdx].page_views || 0) + 1;
        daily[existingTodayIdx] = { ...daily[existingTodayIdx], page_views: todayVisitors, updated_at: nowIso };
      } else {
        todayVisitors = 1;
        const newId = daily.length > 0 ? Math.max(...daily.map((d) => Number(d.id) || 0)) + 1 : 1;
        daily.push({ id: newId, visit_date: todayStr, page_views: 1, created_at: nowIso, updated_at: nowIso });
      }
      memoryDb.updateCacheOnly("portal_daily_visits", daily);
    }

    return { totalVisitors, todayVisitors };
  }

  // ── FAQ Management Operations ──
  async getFaqs(status?: string): Promise<DBFaq[]> {
    try {
      let faqs = await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC");
      if (status) {
        faqs = faqs.filter((f) => f.status === status);
      }
      return faqs.sort((a, b) => (Number(a.display_order) || 0) - (Number(b.display_order) || 0));
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      return [];
    }
  }

  async getFaqById(id: number): Promise<DBFaq | null> {
    try {
      const faqs = await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC");
      return faqs.find((f) => Number(f.id) === Number(id)) || null;
    } catch (err) {
      console.error("Error fetching FAQ by ID:", err);
      return null;
    }
  }

  async createFaq(data: Partial<DBFaq>): Promise<DBFaq> {
    const faqs = [...(await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC"))];
    const maxId = faqs.length > 0 ? Math.max(...faqs.map((f) => Number(f.id) || 0)) : 0;
    const maxOrder = faqs.length > 0 ? Math.max(...faqs.map((f) => Number(f.display_order) || 0)) : 0;
    const now = new Date().toISOString();

    const newFaq: DBFaq = {
      id: maxId + 1,
      question: data.question?.trim() || "",
      question_ta: data.question_ta?.trim() || "",
      answer: data.answer?.trim() || "",
      answer_ta: data.answer_ta?.trim() || "",
      category: data.category?.trim() || "General",
      display_order: typeof data.display_order === "number" ? data.display_order : maxOrder + 1,
      status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
      created_at: now,
      updated_at: now,
    };

    faqs.push(newFaq);
    await this.persistTableToMySQL("faqs", faqs);
    return newFaq;
  }

  async updateFaq(id: number, data: Partial<DBFaq>): Promise<DBFaq | null> {
    const faqs = [...(await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC"))];
    const index = faqs.findIndex((f) => Number(f.id) === Number(id));
    if (index === -1) return null;

    const existing = faqs[index];
    const updated: DBFaq = {
      ...existing,
      ...data,
      id: existing.id,
      updated_at: new Date().toISOString(),
    };

    faqs[index] = updated;
    await this.persistTableToMySQL("faqs", faqs);
    return updated;
  }

  async deleteFaq(id: number): Promise<boolean> {
    const faqs = await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC");
    const filtered = faqs.filter((f) => Number(f.id) !== Number(id));
    if (filtered.length === faqs.length) return false;
    await this.persistTableToMySQL("faqs", filtered);
    return true;
  }

  async reorderFaqs(items: { id: number; display_order: number }[]): Promise<boolean> {
    const faqs = [...(await this.mysqlReadTable<DBFaq>("faqs", "`display_order` ASC, `id` ASC"))];
    const orderMap = new Map<number, number>(items.map((item) => [Number(item.id), item.display_order]));
    const now = new Date().toISOString();

    const updated = faqs.map((faq) => {
      if (orderMap.has(Number(faq.id))) {
        return {
          ...faq,
          display_order: orderMap.get(Number(faq.id))!,
          updated_at: now,
        };
      }
      return faq;
    });

    await this.persistTableToMySQL("faqs", updated);
    return true;
  }
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  "SUPER_ADMIN": {
    "*": ["view", "create", "edit", "delete", "publish", "approve", "upload", "download", "export", "import", "settings", "ai_generate", "preview"]
  },
  "ADMIN": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "delete", "publish", "approve", "upload", "preview"],
    "citizen-services": ["view", "create", "edit", "delete", "publish"],
    "police-stations": ["view", "create", "edit", "delete", "publish"],
    "emergency-contacts": ["view", "create", "edit", "delete", "publish"],
    "department-links": ["view", "create", "edit", "delete", "publish"],
    "faqs": ["view", "create", "edit", "delete", "publish"],
    "profile": ["view", "edit"]
  },

  "ADMINISTRATOR": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "delete", "publish", "approve", "upload", "preview"],
    "citizen-services": ["view", "create", "edit", "delete", "publish"],
    "police-stations": ["view", "create", "edit", "delete", "publish"],
    "emergency-contacts": ["view", "create", "edit", "delete", "publish"],
    "department-links": ["view", "create", "edit", "delete", "publish"],
    "faqs": ["view", "create", "edit", "delete", "publish"],
    "profile": ["view", "edit"]
  },
  "EDITOR": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "upload", "preview"],
    "citizen-services": ["view", "edit"],
    "police-stations": ["view", "edit"],
    "web-stories": ["view", "create", "edit"]
  },
  "CONTENTADMIN": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "upload", "preview"],
    "citizen-services": ["view", "create", "edit"],
    "police-stations": ["view", "create", "edit"],
    "emergency-contacts": ["view", "create", "edit"],
    "department-links": ["view", "create", "edit"],
    "web-stories": ["view", "create", "edit"]
  },
  "REPORTER": {
    "dashboard": ["view"],
    "news": ["view", "create", "edit", "upload"]
  }
};

let dbInstance: ChennaiGuardianDatabase;
if (globalWithDb._chennaiGuardianDb) {
  // Turbopack / Next.js Dev Server Hot-Reload Support:
  // Re-link prototype so newly added methods and state maps immediately exist on the cached singleton!
  Object.setPrototypeOf(globalWithDb._chennaiGuardianDb, ChennaiGuardianDatabase.prototype);
  dbInstance = globalWithDb._chennaiGuardianDb;
  if (!(dbInstance as any).readyTables) {
    (dbInstance as any).readyTables = new Set<string>();
  }
  if (!(dbInstance as any).tableColumns) {
    (dbInstance as any).tableColumns = new Map<string, Set<string>>();
  }
} else {
  dbInstance = new ChennaiGuardianDatabase();
  globalWithDb._chennaiGuardianDb = dbInstance;
}

// Fail-safe direct method attachment on both dbInstance and global singleton:
if (typeof (dbInstance as any).getMaintenanceConfig !== "function") {
  (dbInstance as any).getMaintenanceConfig = ChennaiGuardianDatabase.prototype.getMaintenanceConfig.bind(dbInstance);
}
if (typeof (dbInstance as any).updateMaintenanceConfig !== "function") {
  (dbInstance as any).updateMaintenanceConfig = ChennaiGuardianDatabase.prototype.updateMaintenanceConfig.bind(dbInstance);
}
if (typeof (dbInstance as any).getMaintenanceNotifications !== "function") {
  (dbInstance as any).getMaintenanceNotifications = ChennaiGuardianDatabase.prototype.getMaintenanceNotifications.bind(dbInstance);
}
if (typeof (dbInstance as any).addMaintenanceNotification !== "function") {
  (dbInstance as any).addMaintenanceNotification = ChennaiGuardianDatabase.prototype.addMaintenanceNotification.bind(dbInstance);
}
if (typeof (dbInstance as any).markMaintenanceNotificationRead !== "function") {
  (dbInstance as any).markMaintenanceNotificationRead = ChennaiGuardianDatabase.prototype.markMaintenanceNotificationRead.bind(dbInstance);
}
if (globalWithDb._chennaiGuardianDb) {
  (globalWithDb._chennaiGuardianDb as any).getMaintenanceConfig = ChennaiGuardianDatabase.prototype.getMaintenanceConfig.bind(globalWithDb._chennaiGuardianDb);
  (globalWithDb._chennaiGuardianDb as any).updateMaintenanceConfig = ChennaiGuardianDatabase.prototype.updateMaintenanceConfig.bind(globalWithDb._chennaiGuardianDb);
  (globalWithDb._chennaiGuardianDb as any).getMaintenanceNotifications = ChennaiGuardianDatabase.prototype.getMaintenanceNotifications.bind(globalWithDb._chennaiGuardianDb);
  (globalWithDb._chennaiGuardianDb as any).addMaintenanceNotification = ChennaiGuardianDatabase.prototype.addMaintenanceNotification.bind(globalWithDb._chennaiGuardianDb);
  (globalWithDb._chennaiGuardianDb as any).markMaintenanceNotificationRead = ChennaiGuardianDatabase.prototype.markMaintenanceNotificationRead.bind(globalWithDb._chennaiGuardianDb);
}

export const db = dbInstance;

export async function getMaintenanceConfig(): Promise<DBMaintenanceConfig> {
  if (typeof (db as any)?.getMaintenanceConfig === "function") {
    return (db as any).getMaintenanceConfig();
  }
  return ChennaiGuardianDatabase.prototype.getMaintenanceConfig.call(db);
}

export async function updateMaintenanceConfig(partial: Partial<DBMaintenanceConfig>, updatedBy?: string): Promise<DBMaintenanceConfig> {
  if (typeof (db as any)?.updateMaintenanceConfig === "function") {
    return (db as any).updateMaintenanceConfig(partial, updatedBy);
  }
  return ChennaiGuardianDatabase.prototype.updateMaintenanceConfig.call(db, partial, updatedBy);
}

export async function getMaintenanceNotifications(): Promise<DBMaintenanceNotification[]> {
  if (typeof (db as any)?.getMaintenanceNotifications === "function") {
    return (db as any).getMaintenanceNotifications();
  }
  return ChennaiGuardianDatabase.prototype.getMaintenanceNotifications.call(db);
}

export async function addMaintenanceNotification(notification: DBMaintenanceNotification): Promise<DBMaintenanceNotification> {
  if (typeof (db as any)?.addMaintenanceNotification === "function") {
    return (db as any).addMaintenanceNotification(notification);
  }
  return ChennaiGuardianDatabase.prototype.addMaintenanceNotification.call(db, notification);
}

export async function markMaintenanceNotificationRead(id: string, readBy: string): Promise<DBMaintenanceNotification | null> {
  if (typeof (db as any)?.markMaintenanceNotificationRead === "function") {
    return (db as any).markMaintenanceNotificationRead(id, readBy);
  }
  return ChennaiGuardianDatabase.prototype.markMaintenanceNotificationRead.call(db, id, readBy);
}

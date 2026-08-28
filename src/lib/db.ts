import fs from "fs";
import path from "path";
import crypto from "crypto";
import { newsData } from "@/data/newsData";

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
  name_en: string;
  name_ta: string;
  slug: string;
  url: string;
  icon?: string | null;
  display_order: number;
  status: "active" | "inactive";
  open_in_new_tab?: number;
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
  sitemap_priority?: number;
  sitemap_changefreq?: string;
  robots_indexing?: string;
  robots_following?: string;
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
  receiptId?: string;
}

const JSON_DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

// Standalone JSON Database Manager
class JSONDatabaseManager {
  private lastChecked = 0;
  private lastMtime = 0;
  private isLoaded = false;

  private data: {
    users: DBUser[];
    activity_logs: DBActivityLog[];
    custom_roles: DBCustomRole[];
    news: DBNewsItem[];
    ticker: DBTickerItem[];
    slider: DBSliderItem[];
    commissioner_profile: DBCommissionerProfile[];
    theme_settings: DBThemeSettings[];
    menu_items: DBMenuItem[];
    menus: DBMenu[];
    sub_menus: DBSubMenu[];
    contacts: DBContact[];
    tts_settings: DBTtsSettings[];
    videos: DBVideoItem[];
    alerts: DBAlertItem[];
    alert_settings: DBAlertSettings[];
    seo_settings: DBSeoSettings[];
    article_seo: DBArticleSeo[];
    asset_metadata: DBAssetMetadata[];
    police_stations: DBPoliceStation[];
    emergency_contacts: DBEmergencyContact[];
    department_links: DBDepartmentLink[];
    web_stories: DBWebStory[];
    service_requests: DBServiceRequest[];
    page_contents: DBPageContent[];
    content_versions: DBContentVersion[];
    superadmin_config: Record<string, any>;
  } = {
    users: [],
    activity_logs: [],
    custom_roles: [],
    news: [],
    ticker: [],
    slider: [],
    commissioner_profile: [],
    theme_settings: [],
    menu_items: [],
    menus: [],
    sub_menus: [],
    contacts: [],
    tts_settings: [],
    videos: [],
    alerts: [],
    alert_settings: [],
    seo_settings: [],
    article_seo: [],
    asset_metadata: [],
    police_stations: [],
    emergency_contacts: [],
    department_links: [],
    web_stories: [],
    service_requests: [],
    page_contents: [],
    content_versions: [],
    superadmin_config: {}
  };

  constructor() {
    this.init();
  }

  private init() {
    const now = Date.now();
    if (this.isLoaded && now - this.lastChecked < 50) {
      return;
    }

    if (fs.existsSync(JSON_DB_PATH)) {
      try {
        const stat = fs.statSync(JSON_DB_PATH);
        this.lastChecked = now;
        if (this.isLoaded && stat.mtimeMs <= this.lastMtime) {
          return;
        }
        const raw = fs.readFileSync(JSON_DB_PATH, "utf8");
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        this.lastMtime = stat.mtimeMs;
        this.isLoaded = true;
        
        let modified = false;

        if (!this.data.menus || this.data.menus.length === 0) {
          this.data.menus = [
            { id: 1, name_en: "Home", name_ta: "முகப்பு", slug: "home", icon: "Home", display_order: 1, url: "/", page_type: "static", status: "active", open_in_new_tab: 0 },
            { id: 2, name_en: "About Us", name_ta: "எங்களைப் பற்றி", slug: "about", icon: "Info", display_order: 2, url: "/about", page_type: "static", status: "active", open_in_new_tab: 0 },
            { id: 3, name_en: "Crime", name_ta: "குற்றம்", slug: "crime", icon: "Shield", display_order: 3, url: "/category/crime", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 4, name_en: "Cyber Safety", name_ta: "இணைய பாதுகாப்பு", slug: "cyber-safety", icon: "Lock", display_order: 4, url: "/category/cyber-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 5, name_en: "Women Safety", name_ta: "பெண்கள் பாதுகாப்பு", slug: "women-safety", icon: "Heart", display_order: 5, url: "/category/women-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 6, name_en: "Public Safety", name_ta: "பொது பாதுகாப்பு", slug: "public-safety", icon: "Eye", display_order: 6, url: "/category/public-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 7, name_en: "Traffic", name_ta: "போக்குவரத்து", slug: "traffic", icon: "Car", display_order: 7, url: "/category/traffic", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 8, name_en: "Outreach", name_ta: "சமூக உதவி", slug: "outreach", icon: "Users", display_order: 8, url: "/category/outreach", page_type: "news_category", status: "active", open_in_new_tab: 0 },
            { id: 9, name_en: "Stations", name_ta: "காவல் நிலையங்கள்", slug: "stations", icon: "MapPin", display_order: 9, url: "/stations", page_type: "static", status: "active", open_in_new_tab: 0 },
            { id: 10, name_en: "Videos", name_ta: "வீடியோக்கள்", slug: "videos", icon: "Video", display_order: 10, url: "/videos", page_type: "static", status: "active", open_in_new_tab: 0 },
            { id: 11, name_en: "Profile", name_ta: "ஆணையர் சுயவிவரம்", slug: "commissioner-profile", icon: "User", display_order: 11, url: "/commissioner-profile", page_type: "static", status: "active", open_in_new_tab: 0 },
            { id: 12, name_en: "Contact Us", name_ta: "தொடர்பு கொள்ளுங்கள்", slug: "contact-us", icon: "Phone", display_order: 12, url: "/contact-us", page_type: "static", status: "active", open_in_new_tab: 0 }
          ];
          modified = true;
        }

        if (!this.data.sub_menus || this.data.sub_menus.length === 0) {
          this.data.sub_menus = [
            { id: 1, parent_menu_id: 3, name_en: "Wanted Criminals", name_ta: "தேடப்படும் குற்றவாளிகள்", slug: "wanted-criminals", url: "/category/wanted-criminals", icon: "UserX", display_order: 1, status: "active" },
            { id: 2, parent_menu_id: 3, name_en: "Missing Persons", name_ta: "காணாமல் போனவர்கள்", slug: "missing-persons", url: "/category/missing-persons", icon: "Search", display_order: 2, status: "active" },
            { id: 3, parent_menu_id: 4, name_en: "Cyber Awareness", name_ta: "இணைய விழிப்புணர்வு", slug: "cyber-awareness", url: "/category/cyber-awareness", icon: "Globe", display_order: 1, status: "active" },
            { id: 4, parent_menu_id: 4, name_en: "Online Fraud", name_ta: "ஆன்லைன் மோசடி", slug: "online-fraud", url: "/category/online-fraud", icon: "AlertTriangle", display_order: 2, status: "active" },
            { id: 5, parent_menu_id: 5, name_en: "Pink Patrol", name_ta: "பிங்க் பேட்ரோல்", slug: "pink-patrol", url: "/category/pink-patrol", icon: "ShieldAlert", display_order: 1, status: "active" },
            { id: 6, parent_menu_id: 5, name_en: "AVAL Support Wing", name_ta: "அவள் ஆதரவு பிரிவு", slug: "aval-support", url: "/category/aval-support", icon: "Smile", display_order: 2, status: "active" },
            { id: 7, parent_menu_id: 5, name_en: "Women Helpline", name_ta: "பெண்கள் உதவி எண்", slug: "women-helpline", url: "/category/women-helpline", icon: "PhoneCall", display_order: 3, status: "active" }
          ];
          modified = true;
        }

        if (!this.data.web_stories || this.data.web_stories.length === 0) {
          this.data.web_stories = [
            {
              id: 1,
              title_en: "300 GCP Officers Honored with Chief Minister's Police Medal",
              title_ta: "300 சென்னை பெருநகர காவலர்களுக்கு முதலமைச்சரின் காவல் பதக்கம் வழங்கி கௌரவம்",
              cover_image: "/uploads/upload_1782285632960.png",
              slides_json: JSON.stringify([
                {
                  image: "/uploads/upload_1782285632960.png",
                  caption_en: "300 Greater Chennai Police personnel received the prestigious TN Chief Minister's Police Medal.",
                  caption_ta: "300 சென்னை பெருநகர காவல் பணியாளர்களுக்கு தமிழ்நாடு முதலமைச்சரின் காவல் பதக்கம் வழங்கப்பட்டது."
                },
                {
                  image: "/images/slider_4.jpg",
                  caption_en: "Commendation certificates awarded for exceptional devotion to duty and administrative excellence.",
                  caption_ta: "சிறந்த கடமை உணர்வு மற்றும் நிர்வாக சிறப்பிற்காக பாராட்டு சான்றிதழ்கள் வழங்கப்பட்டன."
                },
                {
                  image: "/images/slider_6.jpg",
                  caption_en: "Greater Chennai Police continues to uphold the highest standards of public service.",
                  caption_ta: "சென்னை பெருநகர காவல் துறை பொதுச் சேவையில் உயர்ந்த தரத்தைப் பேணுகிறது."
                }
              ]),
              category_en: "Awards",
              category_ta: "விருதுகள்",
              status: "active",
              active: 1,
              views_count: 142,
              created_at: "2026-07-03T10:00:00.000Z",
              news_slug: "police-medal-award-ceremony"
            },
            {
              id: 2,
              title_en: "Singappen Special Women Patrol Force Unit Launched",
              title_ta: "சென்னை நகரில் சிங்கப்பெண் சிறப்பு பெண்கள் பாதுகாப்பு ரோந்து படை தொடக்கம்",
              cover_image: "/images/slider_2.jpg",
              slides_json: JSON.stringify([
                {
                  image: "/images/slider_2.jpg",
                  caption_en: "Singappen Initiative: All-women mobile patrolling squads deployed in high-density areas.",
                  caption_ta: "சிங்கப்பெண் திட்டம்: பெண்கள் அதிகம் கூடும் இடங்களில் 24 மணி நேர ரோந்து பணி."
                },
                {
                  image: "/uploads/upload_1782285477484.png",
                  caption_en: "Ensuring safe transit, immediate response, and zero tolerance for harassment.",
                  caption_ta: "பாதுகாப்பான பயணம், உடனடி நடவடிக்கை மற்றும் பெண்களுக்கு எதிரான குற்றங்களுக்கு முற்றுப்புள்ளி."
                },
                {
                  image: "/images/gcp_logo.png",
                  caption_en: "Call Women Helpline 1091 or National Emergency 112 for immediate assistance.",
                  caption_ta: "அவசர உதவிக்கு பெண்கள் உதவி எண் 1091 அல்லது 112 ஐ தொடர்பு கொள்ளவும்."
                }
              ]),
              category_en: "Women Safety",
              category_ta: "பெண்கள் பாதுகாப்பு",
              status: "active",
              active: 1,
              views_count: 215,
              created_at: "2026-07-03T10:05:00.000Z",
              news_slug: "singappen-womens-safety-initiative"
            },
            {
              id: 3,
              title_en: "Dr. A. Amalraj IPS Takes Charge as Commissioner of Police, Greater Chennai",
              title_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ் சென்னை பெருநகர காவல் ஆணையராக பொறுப்பேற்றார்",
              cover_image: "/images/amalraj_portrait.png",
              slides_json: JSON.stringify([
                {
                  image: "/images/amalraj_portrait.png",
                  caption_en: "Dr. A. Amalraj IPS of 1996 batch takes command as Commissioner of Police, Greater Chennai.",
                  caption_ta: "1996 பேட்ச் ஐபிஎஸ் அதிகாரி டாக்டர் ஏ. அமல்ராஜ் சென்னை பெருநகர காவல் ஆணையராக பொறுப்பேற்றார்."
                },
                {
                  image: "/uploads/upload_1782285932912.png",
                  caption_en: "Emphasizing modern human resource management, scientific analytics, and proactive policing.",
                  caption_ta: "நவீன மனிதவள மேலாண்மை மற்றும் அறிவியல் பகுப்பாய்வு முறைகளுக்கு முக்கியத்துவம்."
                },
                {
                  image: "/uploads/upload_1782285750226.png",
                  caption_en: "Pledged dedicated public safety, crime prevention, and community outreach.",
                  caption_ta: "பொதுமக்கள் பாதுகாப்பு மற்றும் சமூக தொடர்புகளுக்கு முன்னுரிமை அளிக்கப்படும் என உறுதி."
                }
              ]),
              category_en: "Police Update",
              category_ta: "காவல் நிர்வாகம்",
              status: "active",
              active: 1,
              views_count: 389,
              created_at: "2026-07-03T10:10:00.000Z",
              news_slug: "amalraj-posted-commissioner"
            },
            {
              id: 4,
              title_en: "Kaaval Karangal Rescues Homeless & Reunites Families",
              title_ta: "காவல் கரங்கள் திட்டம் மூலம் ஆதரவற்ற முதியவர்கள் மீட்பு மற்றும் குடும்ப இணைப்பு",
              cover_image: "/images/slider_6.jpg",
              slides_json: JSON.stringify([
                {
                  image: "/images/slider_6.jpg",
                  caption_en: "Greater Chennai Police's Kaaval Karangal wing rescues abandoned senior citizens.",
                  caption_ta: "சென்னை பெருநகர காவல்துறையின் காவல் கரங்கள் பிரிவு ஆதரவற்ற முதியவர்களை மீட்கிறது."
                },
                {
                  image: "/images/slider_2.jpg",
                  caption_en: "Providing medical aid, shelter homes, and reuniting missing persons with families.",
                  caption_ta: "மருத்துவ உதவி, தங்குமிடம் மற்றும் காணாமல் போனவர்களை குடும்பத்தினருடன் சேர்த்தல்."
                }
              ]),
              category_en: "Community Outreach",
              category_ta: "சமூக உதவி",
              status: "active",
              active: 1,
              views_count: 178,
              created_at: "2026-07-03T10:15:00.000Z",
              news_slug: "kaaval-karangal-rescue-drive"
            },
            {
              id: 5,
              title_en: "Cyber Safety Alert: Report Financial Scams on Helpline 1930",
              title_ta: "சைபர் விழிப்புணர்வு: ஆன்லைன் நிதி மோசடிகளை 1930 எண்ணில் தெரிவிக்கவும்",
              cover_image: "/images/slider_4.jpg",
              slides_json: JSON.stringify([
                {
                  image: "/images/slider_4.jpg",
                  caption_en: "Never share OTP, PIN, CVV, or banking credentials with unknown callers.",
                  caption_ta: "OTP, PIN அல்லது வங்கி விவரங்களை யாருடனும் ஒருபோதும் பகிர வேண்டாம்."
                },
                {
                  image: "/images/gcp_logo.png",
                  caption_en: "Report financial fraud within 1 hour to Helpline 1930 or cybercrime.gov.in.",
                  caption_ta: "நிதி மோசடியை 1 மணி நேரத்திற்குள் 1930 உதவி எண் அல்லது cybercrime.gov.in இல் தெரிவிக்கவும்."
                }
              ]),
              category_en: "Cyber Safety",
              category_ta: "சைபர் பாதுகாப்பு",
              status: "active",
              active: 1,
              views_count: 294,
              created_at: "2026-07-03T10:20:00.000Z",
              news_slug: "cyber-crime-advisory-1930"
            }
          ];
          modified = true;
        }

        if (modified) {
          this.save();
        }
        return;
      } catch (e) {
        console.error("Error reading JSON database file, re-seeding...", e);
      }
    }
    this.seed();
  }

  private save() {
    try {
      const dir = path.dirname(JSON_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(this.data, null, 2), "utf8");
      this.lastMtime = fs.statSync(JSON_DB_PATH).mtimeMs;
      this.lastChecked = Date.now();
      this.isLoaded = true;
    } catch (err) {
      console.error("Failed to save JSON Database:", err);
    }
  }

  private seed() {
    this.data.users = [
      { id: 1, username: "Digital_TN_GovMaster", passwordHash: hashPassword("govmaster100"), role: "superadmin", email: "superadmin@chennaiguardian.in", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
      { id: 2, username: "newseditormanager", passwordHash: hashPassword("editor00100"), role: "admin", email: "admin@chennaiguardian.in", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
      { id: 3, username: "editor", passwordHash: hashPassword("editor123"), role: "editor", email: "editor@chennaiguardian.in", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
      { id: 4, username: "content", passwordHash: hashPassword("content123"), role: "contentadmin", email: "content@chennaiguardian.in", status: "active", createdAt: new Date().toISOString(), lastLogin: null },
    ];
    this.data.activity_logs = [];
    this.data.custom_roles = [];
    this.data.news = newsData.map((item) => ({
      ...item,
      published: 1,
    }));

    this.data.ticker = [
      { id: 1, text_en: "TN Chief Minister's Police Medal Ceremony Awarded to GCP Personnel.", text_ta: "சென்னை பெருநகர காவல் பணியாளர்களுக்கு தமிழ்நாடு முதலமைச்சரின் காவல் பதக்க விழா வழங்கப்பட்டது.", order_num: 1, active: 1 },
      { id: 2, text_en: "Singapen Women's Safety Awareness Special Initiative launched in Chennai.", text_ta: "சென்னை பெருநகர காவல் துறையின் சிங்கப்பெண் பெண்கள் பாதுகாப்பு விழிப்புணர்வு சிறப்புத் திட்டம் தொடங்கப்பட்டது.", order_num: 2, active: 1 },
      { id: 3, text_en: "Clean Campus maintenance operations successfully conducted in Police Quarters.", text_ta: "காவலர் குடியிருப்புகளில் சுத்தமான வளாக பராமரிப்புப் பணிகள் வெற்றிகரமாக நடத்தப்பட்டன.", order_num: 3, active: 1 },
      { id: 4, text_en: "Kaaval Karangal rescues senior citizens and reunites missing persons.", text_ta: "காவல் கரங்கள் ஆதரவற்ற முதியவர்களை மீட்டு காணாமல் போனவர்களை குடும்பத்தினருடன் சேர்க்கிறது.", order_num: 4, active: 1 },
    ];

    this.data.slider = [
      {
        id: 1,
        src: "/images/slider_6.jpg",
        category_en: "POLICE ADMINISTRATION",
        category_ta: "காவல் நிர்வாகம்",
        title_en: "Felicitation and Greeting to Senior Police Officers",
        title_ta: "உயர் காவல் அதிகாரிகளுக்கு வாழ்த்து மற்றும் மரியாதை",
        desc_en: "Greetings and commendations were presented to the newly appointed officers in Greater Chennai Police.",
        desc_ta: "சென்னை பெருநகர காவல்துறையில் புதிதாக பொறுப்பேற்ற அதிகாரிகளுக்கு வாழ்த்துக்கள் மற்றும் பாராட்டுக்கள் வழங்கப்பட்டது.",
        order_num: 1,
        active: 1
      },
      {
        id: 2,
        src: "/images/slider_2.jpg",
        category_en: "COMMUNITY SAFETY",
        category_ta: "சமூக பாதுகாப்பு",
        title_en: "Launch of Singappen Special Force",
        title_ta: "சிங்கப்பெண் சிறப்பு அதிரடிப்படை தொடக்கம்",
        desc_en: "Hon'ble Chief Minister of Tamil Nadu Thiru. S. Joseph Vijay accepted the parade salute of women police personnel.",
        desc_ta: "மாண்புமிகு தமிழ்நாடு முதலமைச்சர் திரு. ச.ஜோசப் விஜய் அவர்கள் பெண் காவலர்களின் அணிவகுப்பு மரியாதையை ஏற்றுக்கொண்டார்.",
        order_num: 2,
        active: 1
      },
      {
        id: 3,
        src: "/images/slider_4.jpg",
        category_en: "AWARDS",
        category_ta: "விருதுகள்",
        title_en: "Commendation Certificates for Outstanding Service",
        title_ta: "சிறந்த சேவைக்கான பாராட்டு சான்றிதழ்கள்",
        desc_en: "Presentation of certificates of appreciation and awards to police officers who rendered outstanding service to the public.",
        desc_ta: "பொதுமக்களுக்கு சிறப்பான சேவை புரிந்த காவல் அதிகாரிகளுக்கு பாராட்டுச் சான்றிதழ்கள் மற்றும் விருதுகள் வழங்கல்.",
        order_num: 3,
        active: 1
      }
    ];

    this.data.commissioner_profile = [
      {
        id: 1,
        name_en: "Dr. A. Amalraj IPS",
        name_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ்",
        designation_en: "Commissioner of Police, Greater Chennai",
        designation_ta: "காவல் ஆணையர், சென்னை பெருநகரம்",
        bio_en1: "Dr. A. Amalraj is a senior Indian Police Service (IPS) officer of the 1996 batch. Hailing from the Kanniyakumari district of Tamil Nadu, his administrative philosophy integrates scientific analytical methods, modern human resource practices, and proactive community engagement.",
        bio_en2: "His academic credentials include a BSc and MSc in Physics, followed by an MBA in Human Resource Management, and a PhD from Madurai Kamaraj University. He has spent three decades serving across various district, commissionerate, and state-level divisions in Tamil Nadu, including leadership roles in Coimbatore, Salem, Trichy, and Tambaram.",
        bio_ta1: "டாக்டர் ஏ. அமல்ராஜ் 1996 பேட்ச் மூத்த இந்திய காவல் பணி (IPS) அதிகாரி ஆவார். தமிழ்நாட்டின் கன்னியாகுமரி மாவட்டத்தைப் பூர்வீகமாகக் கொண்ட இவரது நிர்வாகத் தத்துவம் அறிவியல் பகுப்பாய்வு முறைகள், நவீன மனிதவள நடைமுறைகள் மற்றும் செயலூக்கமான சமூக ஈடுபாடு ஆகியவற்றை ஒருங்கிணைக்கிறது.",
        bio_ta2: "இவரது கல்விச் சான்றுகளில் இயற்பியலில் பிஎஸ்சி மற்றும் எம்எஸ்சி, அதைத் தொடர்ந்து மனிதவள மேலாண்மையில் எம்பிஏ மற்றும் மதுரை காமராஜர் பல்கலைக்கழகத்தில் பிஎச்டி பட்டம் ஆகியவை அடங்கும். கோயம்புத்தூர், சேலம், திருச்சி மற்றும் தாம்பரம் ஆகிய இடங்களில் தலைமைப் பொறுப்புகள் உட்பட தமிழ்நாட்டின் பல்வேறு மாவட்ட, ஆணையர் மற்றும் மாநில அளவிலான பிரிவுகளில் மூன்று தசாப்தங்களாக பணியாற்றியுள்ளார்.",
        photo: "/images/amalraj_portrait.png",
        facebook: "https://www.facebook.com/Chennai.Police/",
        twitter: "https://x.com/chennaipolice_?lang=en",
        instagram: "https://www.instagram.com/greater_chennai_police_/?hl=en",
        email: "cop@gcp.tn.gov.in",
        phone: "044-23452300",
        office_address_en: "Commissioner Office, Vepery, Chennai",
        office_address_ta: "காவல் ஆணையர் அலுவலகம், வேப்பேரி, சென்னை",
        ips_batch: "1996 Batch",
        years_of_service: "30 Years",
        motto_en: "Duty, Honor, Community Safety",
        motto_ta: "கடமை, கண்ணியம், சமூக பாதுகாப்பு",
        birthplace_en: "Kanniyakumari, Tamil Nadu",
        birthplace_ta: "கன்னியாகுமரி, தமிழ்நாடு",
        education_en: "BSc Physics, MSc Physics, MBA HR, PhD from Madurai Kamaraj University",
        education_ta: "இயற்பியலில் பிஎஸ்சி மற்றும் எம்எஸ்சி, மனிதவள மேலாண்மையில் எம்பிஏ மற்றும் மதுரை காமராஜர் பல்கலைக்கழகத்தில் பிஎச்டி",
        vision_en: "To establish a technologically advanced, highly responsive, and citizen-friendly police force that ensures safety, protects human rights, and fosters community trust.",
        vision_ta: "பாதுகாப்பை உறுதிசெய்து, மனித உரிமைகளைப் பேணி, சமூக நம்பிக்கையை வளர்க்கும் வகையில் தொழில்நுட்பரீதியாக மேம்பட்ட, மிகச் சிறந்த முறையில் பதிலளிக்கக்கூடிய மற்றும் மக்கள்-நட்பு கொண்ட காவல் படையை நிறுவுதல்."
      }
    ];

    this.data.theme_settings = [
      {
        id: 1,
        primary_color: "#1e3a8a",
        secondary_color: "#b91c1c",
        accent_color: "#f59e0b",
        logo_path: "/images/gcp_logo.png",
        footer_logo_path: "/images/gcp_logo.png",
        favicon_path: "/favicon.ico",
        ticker_speed: "normal"
      }
    ];

    this.data.menus = [
      { id: 1, name_en: "Home", name_ta: "முகப்பு", slug: "home", icon: "Home", display_order: 1, url: "/", page_type: "static", status: "active", open_in_new_tab: 0 },
      { id: 2, name_en: "About Us", name_ta: "எங்களைப் பற்றி", slug: "about", icon: "Info", display_order: 2, url: "/about", page_type: "static", status: "active", open_in_new_tab: 0 },
      { id: 3, name_en: "Crime", name_ta: "குற்றம்", slug: "crime", icon: "Shield", display_order: 3, url: "/category/crime", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 4, name_en: "Cyber Safety", name_ta: "இணைய பாதுகாப்பு", slug: "cyber-safety", icon: "Lock", display_order: 4, url: "/category/cyber-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 5, name_en: "Women Safety", name_ta: "பெண்கள் பாதுகாப்பு", slug: "women-safety", icon: "Heart", display_order: 5, url: "/category/women-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 6, name_en: "Public Safety", name_ta: "பொது பாதுகாப்பு", slug: "public-safety", icon: "Eye", display_order: 6, url: "/category/public-safety", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 7, name_en: "Traffic", name_ta: "போக்குவரத்து", slug: "traffic", icon: "Car", display_order: 7, url: "/category/traffic", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 8, name_en: "Outreach", name_ta: "சமூக உதவி", slug: "outreach", icon: "Users", display_order: 8, url: "/category/outreach", page_type: "news_category", status: "active", open_in_new_tab: 0 },
      { id: 9, name_en: "Stations", name_ta: "காவல் நிலையங்கள்", slug: "stations", icon: "MapPin", display_order: 9, url: "/stations", page_type: "static", status: "active", open_in_new_tab: 0 },
      { id: 10, name_en: "Videos", name_ta: "வீடியோக்கள்", slug: "videos", icon: "Video", display_order: 10, url: "/videos", page_type: "static", status: "active", open_in_new_tab: 0 },
      { id: 11, name_en: "Profile", name_ta: "ஆணையர் சுயவிவரம்", slug: "commissioner-profile", icon: "User", display_order: 11, url: "/commissioner-profile", page_type: "static", status: "active", open_in_new_tab: 0 },
      { id: 12, name_en: "Contact Us", name_ta: "தொடர்பு கொள்ளுங்கள்", slug: "contact-us", icon: "Phone", display_order: 12, url: "/contact-us", page_type: "static", status: "active", open_in_new_tab: 0 }
    ];

    this.data.sub_menus = [
      { id: 1, parent_menu_id: 3, name_en: "Wanted Criminals", name_ta: "தேடப்படும் குற்றவாளிகள்", slug: "wanted-criminals", url: "/category/wanted-criminals", icon: "UserX", display_order: 1, status: "active" },
      { id: 2, parent_menu_id: 3, name_en: "Missing Persons", name_ta: "காணாமல் போனவர்கள்", slug: "missing-persons", url: "/category/missing-persons", icon: "Search", display_order: 2, status: "active" },
      { id: 3, parent_menu_id: 4, name_en: "Cyber Awareness", name_ta: "இணைய விழிப்புணர்வு", slug: "cyber-awareness", url: "/category/cyber-awareness", icon: "Globe", display_order: 1, status: "active" },
      { id: 4, parent_menu_id: 4, name_en: "Online Fraud", name_ta: "ஆன்லைன் மோசடி", slug: "online-fraud", url: "/category/online-fraud", icon: "AlertTriangle", display_order: 2, status: "active" },
      { id: 5, parent_menu_id: 5, name_en: "Pink Patrol", name_ta: "பிங்க் பேட்ரோல்", slug: "pink-patrol", url: "/category/pink-patrol", icon: "ShieldAlert", display_order: 1, status: "active" },
      { id: 6, parent_menu_id: 5, name_en: "AVAL Support Wing", name_ta: "அவள் ஆதரவு பிரிவு", slug: "aval-support", url: "/category/aval-support", icon: "Smile", display_order: 2, status: "active" },
      { id: 7, parent_menu_id: 5, name_en: "Women Helpline", name_ta: "பெண்கள் உதவி எண்", slug: "women-helpline", url: "/category/women-helpline", icon: "PhoneCall", display_order: 3, status: "active" }
    ];

    this.save();
    console.log("JSON Database successfully seeded!");
  }

  public getTable(name: keyof typeof this.data) {
    this.init();
    return this.data[name];
  }

  public setTable(name: keyof typeof this.data, items: any) {
    (this.data as any)[name] = items;
    this.save();
    try {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/", "layout");
    } catch (e) {
      // Ignore when running outside Next server context
    }
  }
}

const jsonDb = new JSONDatabaseManager();

// Dynamic Database Interface
class ChennaiGuardianDatabase {
  // Users
  public async getUsers(): Promise<DBUser[]> {
    return jsonDb.getTable("users") as DBUser[];
  }
  public async saveUsers(users: DBUser[]) {
    jsonDb.setTable("users", users);
  }
  public async getUserById(id: number): Promise<DBUser | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.id === id);
  }
  public async getUserByUsername(username: string): Promise<DBUser | undefined> {
    const users = await this.getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  // Roles & Logs
  public async getCustomRoles(): Promise<DBCustomRole[]> {
    return jsonDb.getTable("custom_roles") as DBCustomRole[];
  }
  public async saveCustomRoles(roles: DBCustomRole[]) {
    jsonDb.setTable("custom_roles", roles);
  }

  public async getActivityLogs(): Promise<DBActivityLog[]> {
    return jsonDb.getTable("activity_logs") as DBActivityLog[];
  }
  public async saveActivityLogs(logs: DBActivityLog[]) {
    jsonDb.setTable("activity_logs", logs);
  }
  public async addActivityLog(username: string, action: string) {
    const logs = await this.getActivityLogs();
    const id = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    logs.unshift({
      id,
      username,
      action,
      timestamp: new Date().toISOString()
    });
    if (logs.length > 500) logs.splice(500);
    await this.saveActivityLogs(logs);
  }
  public async addRbacAuditLog(username: string, role: string, ip: string, action: string, moduleName: string, browser?: string, beforeVal?: string, afterVal?: string) {
    const logs = await this.getActivityLogs();
    const id = logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1;
    logs.unshift({
      id,
      username,
      role,
      ip_address: ip,
      action,
      module: moduleName,
      timestamp: new Date().toISOString(),
      browser,
      before_val: beforeVal,
      after_val: afterVal
    });
    if (logs.length > 500) logs.splice(500);
    await this.saveActivityLogs(logs);
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
      } catch (e) {}
    }
    const roles = await this.getCustomRoles();
    const matchedRole = roles.find((cr) => cr.role_name.toUpperCase().trim().replace(" ", "_") === r);
    if (matchedRole && matchedRole.permissions_json) {
      try {
        return JSON.parse(matchedRole.permissions_json);
      } catch (e) {}
    }
    return DEFAULT_ROLE_PERMISSIONS[r] || DEFAULT_ROLE_PERMISSIONS["CONTENTADMIN"] || {};
  }

  // News
  public async getNews(): Promise<DBNewsItem[]> {
    const raw = jsonDb.getTable("news") as DBNewsItem[];
    if (!raw || raw.length === 0) {
      return newsData.map((item) => ({ ...item, published: 1 }));
    }
    return raw;
  }
  public async getAllRawNews(): Promise<DBNewsItem[]> {
    return jsonDb.getTable("news") as DBNewsItem[];
  }
  public async saveNews(news: DBNewsItem[]) {
    jsonDb.setTable("news", news);
  }
  public async getNewsBySlug(slug: string): Promise<DBNewsItem | undefined> {
    const news = await this.getNews();
    return news.find((n) => n.slug === slug);
  }
  public async incrementViews(id: number) {
    const news = await this.getNews();
    const item = news.find(n => n.id === id);
    if (item) {
      item.views_count = (item.views_count || 0) + 1;
      await this.saveNews(news);
    }
  }

  // Ticker
  public async getTicker(): Promise<DBTickerItem[]> {
    return jsonDb.getTable("ticker") as DBTickerItem[];
  }
  public async saveTicker(ticker: DBTickerItem[]) {
    jsonDb.setTable("ticker", ticker);
  }

  // Slider
  public async getSlider(): Promise<DBSliderItem[]> {
    return jsonDb.getTable("slider") as DBSliderItem[];
  }
  public async saveSlider(slider: DBSliderItem[]) {
    jsonDb.setTable("slider", slider);
  }

  // Profile
  public async getCommissionerProfile(): Promise<DBCommissionerProfile> {
    const list = jsonDb.getTable("commissioner_profile") as DBCommissionerProfile[];
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
    jsonDb.setTable("commissioner_profile", [profile]);
  }

  // Theme
  public async getThemeSettings(): Promise<DBThemeSettings> {
    const list = jsonDb.getTable("theme_settings") as DBThemeSettings[];
    if (list && list.length > 0) return list[0];
    return {
      id: 1,
      primary_color: "#1e3a8a",
      secondary_color: "#b91c1c",
      accent_color: "#f59e0b",
      logo_path: "/images/gcp_logo.png",
      footer_logo_path: "/images/gcp_logo.png",
      favicon_path: "/favicon.ico"
    };
  }
  public async saveThemeSettings(theme: DBThemeSettings) {
    jsonDb.setTable("theme_settings", [theme]);
  }

  // Menus
  public async getMenuItems(): Promise<DBMenuItem[]> {
    return jsonDb.getTable("menu_items") as DBMenuItem[];
  }
  public async saveMenuItems(menu: DBMenuItem[]) {
    jsonDb.setTable("menu_items", menu);
  }

  public async getMenus(): Promise<DBMenu[]> {
    return jsonDb.getTable("menus") as DBMenu[];
  }
  public async saveMenus(menus: DBMenu[]) {
    jsonDb.setTable("menus", menus);
  }
  public async getSubMenus(): Promise<DBSubMenu[]> {
    return jsonDb.getTable("sub_menus") as DBSubMenu[];
  }
  public async saveSubMenus(subMenus: DBSubMenu[]) {
    jsonDb.setTable("sub_menus", subMenus);
  }

  public async getPublicMenus(): Promise<DBMenu[]> {
    const menus = (await this.getMenus()).filter(m => m.status === "active").sort((a, b) => a.display_order - b.display_order);
    const subMenus = (await this.getSubMenus()).filter(s => s.status === "active").sort((a, b) => a.display_order - b.display_order);

    return menus.map(m => ({
      ...m,
      subMenus: subMenus.filter(s => s.parent_menu_id === m.id)
    }));
  }

  // Contacts & TTS
  public async getContacts(): Promise<DBContact[]> {
    return jsonDb.getTable("contacts") as DBContact[];
  }
  public async saveContacts(contacts: DBContact[]) {
    jsonDb.setTable("contacts", contacts);
  }
  public async getTtsSettings(): Promise<DBTtsSettings> {
    const list = jsonDb.getTable("tts_settings") as DBTtsSettings[];
    if (list && list.length > 0) return list[0];
    return { id: 1, enabled: 1, tamil_voice: "ta-IN-PallaviNeural", english_voice: "en-IN-NeerjaNeural", speed: 1.0 };
  }
  public async saveTtsSettings(tts: DBTtsSettings) {
    jsonDb.setTable("tts_settings", [tts]);
  }

  // Videos
  public async getVideos(): Promise<DBVideoItem[]> {
    return jsonDb.getTable("videos") as DBVideoItem[];
  }
  public async saveVideos(videos: DBVideoItem[]) {
    jsonDb.setTable("videos", videos);
  }
  public async incrementVideoViews(id: number | string) {
    const videos = await this.getVideos();
    const item = videos.find(v => v.id === id || v.youtube_id === String(id));
    if (item) {
      item.views_count = (item.views_count || 0) + 1;
      await this.saveVideos(videos);
    }
  }

  // Alerts
  public async getAlerts(): Promise<DBAlertItem[]> {
    return jsonDb.getTable("alerts") as DBAlertItem[];
  }
  public async saveAlerts(alerts: DBAlertItem[]) {
    jsonDb.setTable("alerts", alerts);
  }
  public async getAlertSettings(): Promise<DBAlertSettings> {
    const list = jsonDb.getTable("alert_settings") as DBAlertSettings[];
    if (list && list.length > 0) return list[0];
    return { id: 1, auto_fetch: 1, require_approval: 1, last_fetched_at: "" };
  }
  public async saveAlertSettings(settings: DBAlertSettings) {
    jsonDb.setTable("alert_settings", [settings]);
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
      const existingAlerts = await this.getAlerts();

      try {
        const feedUrl = `https://news.google.com/rss/search?q=Greater+Chennai+Police+OR+Tamil+Nadu+Police&hl=en-IN&gl=IN&ceid=IN:en`;
        const res = await fetch(feedUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
          next: { revalidate: 0 }
        });

        if (res.ok) {
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
              const rawTitle = titleMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1");
              const link = linkMatch[1].trim();
              const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
              const source = sourceMatch ? sourceMatch[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1") : "Official Source";

              let title = rawTitle;
              const sourceSuffixIndex = title.lastIndexOf(` - ${source}`);
              if (sourceSuffixIndex !== -1) {
                title = title.substring(0, sourceSuffixIndex).trim();
              }

              rawItems.push({ title, link, pubDate, source });
            }
          }

          let nextId = existingAlerts.length > 0 ? Math.max(...existingAlerts.map(a => a.id)) + 1 : 1;
          const newAlertItems: DBAlertItem[] = [];

          for (const item of rawItems.slice(0, 15)) {
            if (!item || !item.title) continue;

            const isDuplicate = existingAlerts.some(
              a => a.title.toLowerCase().trim() === item.title.toLowerCase().trim()
            );

            if (!isDuplicate) {
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
                url: item.link,
                published_at: publishedISO,
                approved: 1,
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
        }
      } catch (rssErr) {
        console.warn("RSS alert fetch warning:", rssErr);
      }

      if (force) {
        const currentAlerts = await this.getAlerts();
        let modified = false;
        const nowISO = new Date().toISOString();
        currentAlerts.forEach((alert) => {
          if (alert.approved === 1 && !alert.removed) {
            const alertTime = new Date(alert.published_at).getTime();
            if (isNaN(alertTime) || (now.getTime() - alertTime) > 30 * 24 * 3600 * 1000) {
              alert.published_at = nowISO;
              modified = true;
            }
          }
        });
        if (modified) {
          await this.saveAlerts(currentAlerts);
        }
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
    const list = jsonDb.getTable("seo_settings") as DBSeoSettings[];
    if (list && list.length > 0) return list[0];
    return {
      id: 1,
      site_title: "Chennai Guardian | Greater Chennai Police",
      site_description: "Official portal of Greater Chennai Police",
      default_keywords: "Chennai Police, Public Safety",
      organization_name: "Greater Chennai Police",
      organization_logo: "/images/gcp_logo.png",
      contact_number: "044-23452300",
      address: "Commissioner Office, Vepery, Chennai",
      site_url: "https://chennaiguardian.in",
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
    jsonDb.setTable("seo_settings", [seo]);
  }
  public async getArticleSeo(): Promise<DBArticleSeo[]> {
    return jsonDb.getTable("article_seo") as DBArticleSeo[];
  }
  public async saveArticleSeo(articleSeo: DBArticleSeo[]) {
    jsonDb.setTable("article_seo", articleSeo);
  }

  // Asset Metadata
  public async getAssetMetadata(): Promise<DBAssetMetadata[]> {
    return jsonDb.getTable("asset_metadata") as DBAssetMetadata[];
  }
  public async saveAssetMetadata(items: DBAssetMetadata[]) {
    jsonDb.setTable("asset_metadata", items);
  }

  // Contact Messages
  public async getContactMessages(): Promise<DBContactMessage[]> {
    return jsonDb.getTable("service_requests") as DBContactMessage[];
  }
  public async saveContactMessages(items: DBContactMessage[]) {
    jsonDb.setTable("service_requests", items);
  }

  // Police Stations
  public async getPoliceStations(): Promise<DBPoliceStation[]> {
    let stations = jsonDb.getTable("police_stations") as DBPoliceStation[];
    if (stations === undefined || stations === null) {
      try {
        const defaultDataset = require("../data/chennaiPoliceStations");
        stations = defaultDataset.map((s: any, index: number) => ({
          id: index + 1,
          station_name: s.stationName || s.station_name,
          name_en: s.stationName || s.station_name,
          name_ta: s.name_ta || `காவல் நிலையம் - ${(s.stationName || s.station_name || "").replace(" Police Station", "")}`,
          district: s.district || (s.area === "Tambaram" || s.area === "Selaiyur" ? "Tambaram District" : "Chennai District"),
          phone: s.phone || s.phone_no || "044-23452300",
          phone_no: s.phone_no || s.phone || "044-23452300",
          lat: s.lat || s.latitude || 13.0827,
          lng: s.lng || s.longitude || 80.2707,
          lon: s.lon || s.lng || s.longitude || 80.2707,
          latitude: s.latitude || s.lat || 13.0827,
          longitude: s.longitude || s.lng || 80.2707,
          sdo: s.sdo || s.incharge_en || "ACP Sub-Divisional Officer",
          range: s.range || s.zone || "Metropolitan Range",
          address: s.address || s.ps_address || s.address_en,
          ps_address: s.ps_address || s.address || s.address_en,
          address_en: s.address_en || s.address,
          address_ta: s.address_ta || s.address,
          pincode: s.pincode || (s.address?.match(/\b6\d{5}\b/)?.[0] ?? "600001"),
          zone: s.zone || "South Chennai",
          zone_en: s.zone || "South Chennai",
          area_name: s.area || s.area_name,
          locality: s.area || s.locality,
          station_type: s.type || s.category || "Law & Order",
          category: s.category || "Law & Order",
          type: s.type || s.category || "Law & Order",
          is_active: 1
        }));
        jsonDb.setTable("police_stations", stations);
      } catch (err) {
        console.error("Failed to fallback load chennaiPoliceStations:", err);
      }
    } else {
      stations = stations.map((s, index) => {
        const sName = s.station_name || s.name_en || `Police Station ${index + 1}`;
        const isTambaramArea = sName.toLowerCase().includes("tambaram") || sName.toLowerCase().includes("selaiyur") || s.locality?.toLowerCase().includes("tambaram") || s.locality?.toLowerCase().includes("selaiyur");
        return {
          ...s,
          station_name: sName,
          name_en: s.name_en || sName,
          district: s.district || (isTambaramArea ? "Tambaram District" : "Chennai District"),
          phone_no: s.phone_no || s.phone || "044-23452300",
          phone: s.phone || s.phone_no || "044-23452300",
          lat: s.lat ?? s.latitude ?? 13.0827,
          lon: s.lon ?? s.lng ?? s.longitude ?? 80.2707,
          latitude: s.latitude ?? s.lat ?? 13.0827,
          longitude: s.longitude ?? s.lng ?? s.lon ?? 80.2707,
          sdo: s.sdo || (isTambaramArea ? "ACP Tambaram Division" : "Sub-Divisional Officer"),
          range: s.range || (isTambaramArea ? "Tambaram Range" : (s.zone || "Metropolitan Range")),
          ps_address: s.ps_address || s.address || s.address_en || "Chennai, Tamil Nadu",
          address: s.address || s.ps_address || s.address_en || "Chennai, Tamil Nadu",
          pincode: s.pincode || (s.address?.match(/\b6\d{5}\b/)?.[0] ?? "600001")
        };
      });
    }

    // Deduplicate by normalized station name so no duplicate record is ever served
    const seenNames = new Set<string>();
    const uniqueStations: DBPoliceStation[] = [];
    for (const s of stations) {
      const nameKey = (s.station_name || s.name_en || "").toLowerCase().trim();
      if (nameKey && !seenNames.has(nameKey)) {
        seenNames.add(nameKey);
        uniqueStations.push(s);
      } else if (!nameKey) {
        uniqueStations.push(s);
      }
    }

    return uniqueStations;
  }
  public async savePoliceStations(stations: DBPoliceStation[]) {
    jsonDb.setTable("police_stations", stations);
  }

  // Emergency Contacts
  public async getEmergencyContacts(): Promise<DBEmergencyContact[]> {
    return jsonDb.getTable("emergency_contacts") as DBEmergencyContact[];
  }
  public async saveEmergencyContacts(contacts: DBEmergencyContact[]) {
    jsonDb.setTable("emergency_contacts", contacts);
  }

  // Department Links
  public async getDepartmentLinks(): Promise<DBDepartmentLink[]> {
    return jsonDb.getTable("department_links") as DBDepartmentLink[];
  }
  public async saveDepartmentLinks(links: DBDepartmentLink[]) {
    jsonDb.setTable("department_links", links);
  }

  // Web Stories
  public async getWebStories(): Promise<DBWebStory[]> {
    return jsonDb.getTable("web_stories") as DBWebStory[];
  }
  public async saveWebStories(stories: DBWebStory[]) {
    jsonDb.setTable("web_stories", stories);
  }

  // Service Requests
  public async getServiceRequests(): Promise<DBServiceRequest[]> {
    return jsonDb.getTable("service_requests") as DBServiceRequest[];
  }
  public async saveServiceRequests(requests: DBServiceRequest[]) {
    jsonDb.setTable("service_requests", requests);
  }

  // Page Contents
  public async getPageContents(): Promise<DBPageContent[]> {
    return jsonDb.getTable("page_contents") as DBPageContent[];
  }
  public async savePageContents(pages: DBPageContent[]) {
    jsonDb.setTable("page_contents", pages);
  }
  public async getContentVersions(): Promise<DBContentVersion[]> {
    return jsonDb.getTable("content_versions") as DBContentVersion[];
  }
  public async saveContentVersions(versions: DBContentVersion[]) {
    jsonDb.setTable("content_versions", versions);
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

  // Superadmin Config
  public async getSuperadminConfig(): Promise<Record<string, any>> {
    const raw = jsonDb.getTable("superadmin_config") as Record<string, any>;
    if (!raw || !raw.footer_config) {
      raw.footer_config = {
        logo: "/images/gcp_logo.png",
        website_name_en: "Chennai Guardian News",
        website_name_ta: "சென்னை கார்டியன் செய்திகள்",
        description_en: "Official news platform of Chennai Guardian News, providing 24/7 updates on public safety, cyber alerts, and community-centered policing initiatives.",
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
          { id: "ql2", label_en: "Crime News", label_ta: "குற்றம்", url: "/category/crime", target_blank: false, active: true, order_index: 2 },
          { id: "ql3", label_en: "Cyber Safety", label_ta: "இணைய பாதுகாப்பு", url: "/category/cyber-safety", target_blank: false, active: true, order_index: 3 }
        ],
        government_links: [
          { id: "gl1", label_en: "Tamil Nadu Government", label_ta: "தமிழ்நாடு அரசு", url: "https://www.tn.gov.in", target_blank: true, active: true, order_index: 1 },
          { id: "gl2", label_en: "GCP Official Site", label_ta: "சென்னை காவல்துறை", url: "https://www.chennaipolice.gov.in", target_blank: true, active: true, order_index: 2 }
        ]
      };
      jsonDb.setTable("superadmin_config", raw);
    }
    return raw;
  }
  public async saveSuperadminConfig(key: string, value: any) {
    const cfg = await this.getSuperadminConfig();
    cfg[key] = value;
    jsonDb.setTable("superadmin_config", cfg);
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
}

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  "SUPER_ADMIN": {
    "*": ["view", "create", "edit", "delete", "publish", "approve", "upload", "download", "export", "import", "settings", "ai_generate", "preview"]
  },
  "ADMIN": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "delete", "publish", "approve", "upload", "preview"],
    "police-stations": ["view", "create", "edit", "delete", "publish"],
    "emergency-contacts": ["view", "create", "edit", "delete", "publish"],
    "department-links": ["view", "create", "edit", "delete", "publish"],
    "profile": ["view", "edit"],
    "theme": ["view", "edit"],
    "settings": ["view", "edit"]
  },
  "ADMINISTRATOR": {
    "dashboard": ["view", "preview"],
    "menu-management": ["view", "edit", "publish"],
    "page-editor": ["view", "edit", "publish"],
    "news": ["view", "create", "edit", "delete", "publish", "approve", "upload", "preview"],
    "police-stations": ["view", "create", "edit", "delete", "publish"],
    "emergency-contacts": ["view", "create", "edit", "delete", "publish"],
    "department-links": ["view", "create", "edit", "delete", "publish"],
    "profile": ["view", "edit"],
    "theme": ["view", "edit"],
    "settings": ["view", "edit"],
    "web-stories": ["view", "create", "edit", "delete", "publish"]
  },
  "EDITOR": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "upload", "preview"],
    "police-stations": ["view", "edit"],
    "web-stories": ["view", "create", "edit"]
  },
  "CONTENTADMIN": {
    "dashboard": ["view", "preview"],
    "news": ["view", "create", "edit", "upload", "preview"],
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

export const db = new ChennaiGuardianDatabase();

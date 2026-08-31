# Greater Chennai Police - Commissioner Portal (Chennai Guardian)

> **Official Web Portal & Content Management System for the Greater Chennai Police (GCP)**  
> Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, MySQL Data Layer, and Google Generative AI.

---

## 📋 System Architecture & Structure

### Technical Stack

| Layer | Technology / Library | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router) | Server Components, Client Components, Dynamic API Routes, Proxy Middleware |
| **Frontend Core** | React 19.2, TypeScript 5 | Modern component architecture, type-safe interfaces & strict hooks |
| **Styling & UI** | Tailwind CSS v4, Lucide React, Framer Motion | Modern responsive UI, glassmorphism, dark/light theme, custom animations |
| **Database** | MySQL 8.0+ (`mysql2/promise`) | High-performance relational database with connection pooling & transaction helpers |
| **Security Layer** | Custom HMAC SVG CAPTCHA, RBAC, Proxy Obfuscation | Zero-dependency CAPTCHA, Honeypot path protection, Audit logging, Content anti-scraping |
| **AI Integration** | Google Generative AI (`@google/generative-ai`) | Automated news generation, SEO metadata extraction, summary creation |
| **Media / Editor** | React Quill (`react-quill-new`), Nodemailer | Dynamic HTML rich text editing, automated email dispatch for service requests |

---

### High-Level Architecture

```mermaid
flowchart TD
    subgraph Client Layer
        PublicUser["Public User (Browser)"]
        AdminUser["Admin / Officer (Browser)"]
    end

    subgraph Security & Proxy Layer
        ProxyMiddleware["Proxy Middleware (src/proxy.ts)\n* Rewrites Honeypot paths (/admin) to /404"]
        ContentProtect["Content Protection (ContentProtection.tsx)\n* Anti-Scraping, Copy/DevTools Lock"]
        AuthModule["Auth Guard & Session Cookie\n* HttpOnly Session, 5-Attempt Lockout"]
        CaptchaEngine["HMAC SVG CAPTCHA Engine\n* Single-use token, expiry & noise overlay"]
    end

    subgraph Application Router (Next.js 16 App Router)
        PublicPages["Public Pages\n* Homepage, Newsroom, Traffic\n* Precincts Directory (/stations)\n* Category & Media Center"]
        AdminPortal["Admin Control Center (/controller)\n* News & Menu CMS\n* Dynamic Page Builder\n* SEO & Web Stories Manager"]
        SuperConsole["SuperAdmin Console\n* User & RBAC Management\n* Live Security Audit Log Viewer"]
    end

    subgraph Business Logic & API Layer
        APIRoutes["Next.js API Routes (/api/*)\n* /api/admin/auth\n* /api/police-stations/search\n* /api/traffic/sync\n* /api/admin/generate-seo"]
        SearchEngine["Levenshtein Typo-Tolerant Search"]
        TrafficSync["Background Traffic Feeds Sync"]
        AIEngine["Gemini AI Content Engine"]
    end

    subgraph Database Layer
        MySQLPool["MySQL Connection Pool (src/lib/mysql.ts)\n* Connection Leak Protection\n* Auto Invalidation Callbacks"]
        MySQLTables[("MySQL Database (chennai_guardian)\n* police_stations (103 Precincts)\n* news, alerts, users\n* activity_logs, article_seo")]
    end

    PublicUser --> ContentProtect --> PublicPages --> APIRoutes
    AdminUser --> ProxyMiddleware --> CaptchaEngine --> AuthModule --> AdminPortal & SuperConsole --> APIRoutes
    APIRoutes --> SearchEngine & TrafficSync & AIEngine
    APIRoutes --> MySQLPool --> MySQLTables
```

---

### Directory Layout

```
├── locales/                      # Bilingual Translation Dictionaries
│   ├── en/common.json            # English translations
│   └── ta/common.json            # Tamil translations
├── public/                       # Static Assets (Images, Icons, Uploaded Media)
├── src/
│   ├── app/                      # Next.js 16 App Router Pages & API Routes
│   │   ├── (public pages)/       # Homepage, /about, /stations, /traffic, /news, /videos
│   │   ├── controller/           # Protected Admin Controller Portal
│   │   ├── api/                  # RESTful API Endpoints (Admin, News, Stations, Traffic, Auth)
│   │   ├── layout.tsx            # Root Layout with Theme & Language Context
│   │   └── globals.css           # Global Styles, CSS Custom Variables & Animations
│   ├── components/               # React UI Components
│   │   ├── admin/                # CMS Components (Dashboard, MenuManagement, PageEditor, SuperAdminConsole)
│   │   ├── layout/               # Global Header (Navbar), Footer, NewsTicker
│   │   ├── sections/             # Sectional Blocks (Hero, PoliceStationDirectory, VideoGallery, etc.)
│   │   ├── security/             # Security Components (ContentProtection.tsx)
│   │   └── ui/                   # Reusable UI Primitives (Buttons, Badges, Modals)
│   ├── context/                  # Global React Contexts (LanguageContext.tsx, ThemeProvider.tsx)
│   ├── lib/                      # Core Business Logic & Infrastructure
│   │   ├── mysql.ts              # MySQL Connection Pool & Transaction Helper
│   │   ├── db.ts                 # Database Abstraction Layer & Queries
│   │   ├── auth.ts               # Session Utilities, IP Extraction, Role Helpers
│   │   ├── captcha.ts            # Zero-Dependency HMAC SVG CAPTCHA Generator & Verifier
│   │   ├── trafficSync.ts        # Official Traffic News Auto-Sync Module
│   │   └── seoHelper.ts          # Metadata & Schema.org JSON-LD Generator
│   ├── proxy.ts                  # Edge Proxy Middleware (Stealth Path Rewriting)
│   └── scripts/                  # Database Migration & Seeding Scripts
│       ├── migrate.js            # Automated MySQL Schema Migration Script
│       └── seed_police_stations.js # 103 Chennai Precinct Dataset Seeder
├── package.json                  # Dependencies & Script Definitions
└── tsconfig.json                 # TypeScript Compiler Options
```

---

### MySQL Database Schema (`chennai_guardian`)

The portal utilizes a MySQL relational database managed via `src/lib/mysql.ts` with connection leak protection and automatic transaction commit/rollback handling. Key database tables include:

| Table Name | Description | Key Columns / Fields |
| :--- | :--- | :--- |
| `police_stations` | Precinct directory (103 Chennai stations) | `id`, `station_name`, `zone`, `locality`, `address`, `phone_no`, `google_map_link`, `jurisdiction_areas` |
| `users` | Administrative user records & RBAC credentials | `id`, `username`, `passwordHash`, `role`, `failed_logins`, `locked`, `status`, `force_password_change` |
| `activity_logs` | Comprehensive security audit trail | `id`, `username`, `userRole`, `ipAddress`, `action`, `module`, `userAgent`, `created_at` |
| `news` | News articles, advisories, and press releases | `id`, `title_en`, `title_ta`, `content_en`, `content_ta`, `category`, `views`, `is_breaking` |
| `alerts` | Emergency alerts & traffic advisories | `id`, `title`, `description`, `severity`, `category`, `source_url`, `created_at` |
| `menu_items` | Dynamic primary navigation menu structure | `id`, `title_en`, `title_ta`, `href`, `order_index`, `is_active` |
| `submenus` | Dynamic secondary dropdown menu items | `id`, `menu_id`, `title_en`, `title_ta`, `href`, `order_index` |
| `article_seo` | Extended SEO parameters per published article | `id`, `article_id`, `seo_title`, `meta_description`, `focus_keyword`, `schema_json`, `seo_score` |
| `service_requests` | Online citizen application logs | `id`, `applicantName`, `mobileNumber`, `serviceRequired`, `policeStation`, `receiptId` |
| `contact_messages` | Citizen grievance and inquiry submissions | `id`, `name`, `mobile`, `email`, `subject`, `category`, `message`, `status` |

---

## 🧩 System Modules

### 1. Public Portal & Newsroom System
- **Spotlight Hero & Breaking News Banner**: High-priority alert banner and main story carousel highlighting urgent press releases.
- **Dynamic Category Filtering**: News categorized under Crime, Public Safety, Outreach, Traffic Advisories, and Special Announcements.
- **Video News Center**: Dedicated video portal with embedded media players, category tagging, and real-time view counters (`/videos`).
- **Web Stories**: Interactive visual story cards optimized for mobile viewports.
- **Document Center**: Downloadable PDFs, citizen safety guidelines, circulars, and official gazette notifications.

### 2. Police Station Directory & Locality Precinct Finder
- **103 Precinct Dataset**: Complete database covering all precincts across Greater Chennai Police jurisdiction (Adyar, Anna Nagar, Egmore, T. Nagar, Tambaram, Chromepet, Avadi, Poonamallee, Guindy, Velachery, etc.).
- **Typo-Tolerant Search**: Custom Levenshtein fuzzy search algorithm matching user input even with missing characters or spelling errors.
- **Dedicated Precinct Page Routing**: Individual detail pages accessible via `/stations/[slug]` rendering address, direct phone lines, helpline contacts, landmark directions, and interactive Google Maps links.

### 3. Emergency & Traffic Advisory Synchronization System
- **Live Traffic Updates**: Dedicated `/traffic` advisory portal rendering real-time road closures, accident alerts, VIP route diversions, and weather warnings.
- **Automated Background Sync**: Module (`trafficSync.ts`) continuously fetches, parses, and deduplicates official Tamil Nadu Traffic advisories without manual intervention.
- **Homepage Traffic Feed**: Real-time traffic widget integrated directly into the newsroom homepage.

### 4. Admin CMS & Content Control Center (`/controller`)
- **Rich Text News Editor**: WYSIWYG article creation (`react-quill-new`) supporting bilingual titles (`title_en`, `title_ta`), multi-language body content, image uploads, and breaking news toggles.
- **Drag-and-Drop Menu Builder**: Full dynamic control over header navigation menus, ordering index, submenus, and external/internal routing.
- **Custom Page Editor**: Dynamic content renderer supporting standalone pages (`/page/[slug]`).
- **Web Stories & Media Manager**: Visual story builder and media upload repository.
- **Precinct Manager**: Admin tools for updating station Inspector contact details, phone numbers, map links, and jurisdiction boundaries.

### 5. SuperAdmin & Security Control Console
- **User Management**: Creation and modification of administrative user accounts with assigned roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
- **Account Lockout & Unlock Console**: Ability for SuperAdmins to view locked user accounts, inspect failed login counts, and manually unlock accounts.
- **Granular Permission Matrix**: Module-level access rights management for content, menus, SEO tools, and system logs.
- **Live Security Audit Log Viewer**: Interactive table rendering system-wide activity logs filtered by user, IP address, severity, and module.

### 6. Bilingual Localization Engine (`LanguageContext`)
- **Instant Language Switching**: Seamless toggle between English (`en`) and Tamil (`ta`).
- **State & Cookie Persistence**: Automatically remembers user language preference via `LocalStorage` and HTTP cookies (`preferred-language`).
- **Dynamic UI Dictionary**: Deep JSON key lookup with graceful fallbacks.

---

## 🔒 Security Features & Controls

```
+-----------------------------------------------------------------------------------+
|                            GCP PORTAL SECURITY LAYER                              |
+-----------------------------------------------------------------------------------+
|  [Honeypot Obfuscation] ---> Rewrites /admin, /dashboard, /backend to /404         |
|  [HMAC SVG CAPTCHA]     ---> 6-Char distorted SVG image with HMAC-SHA256 signature  |
|  [Account Lockout]      ---> Auto-locks account after 5 consecutive failed logins   |
|  [Content Protection]   ---> Blocks DevTools, Right-Click, Cut/Copy, PrintScreen     |
|  [SQL Injection Guard]  ---> Parameterized queries & MySQL transaction rollback    |
|  [RBAC Audit Logging]   ---> Logs Username, Role, IP, User-Agent, Action & Time     |
+-----------------------------------------------------------------------------------+
```

### 1. Honeypot URL Obfuscation & Stealth Path Rewriting
- Implemented in Edge Proxy Middleware [`src/proxy.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/proxy.ts).
- Standard automated scanner paths (`/admin`, `/administrator`, `/backend`, `/dashboard`, `/login/admin`) are stealthily rewritten to `/404`, returning a standard "Page Not Found" response.
- The actual administrative interface is hidden under a custom protected controller route (`/controller`).

### 2. Zero-Dependency Dynamic SVG HMAC CAPTCHA Engine
- Built-in challenge generator [`src/lib/captcha.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/lib/captcha.ts).
- Generates 6-character distorted SVG images dynamically with background noise dots, cross-hatching lines, quadratic curves, and randomized character font sizes & rotation (-22° to +22°).
- Uses HMAC-SHA256 signatures derived from a secret key and expiration timestamp (5-minute TTL).
- Maintains a single-use token consumption registry (`usedTokens`) to completely prevent replay attacks.

### 3. Brute-Force & Account Lockout Defense
- Implemented in authentication handler [`src/app/api/admin/auth/route.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/app/api/admin/auth/route.ts).
- Tracks failed login attempts per user account.
- **Automatic Lockout**: Locks the account immediately upon reaching **5 failed login attempts** (`user.locked = 1`).
- **Mandatory Password Expiry**: Enforces mandatory password rotation after 90 days (`force_password_change`).

### 4. Client-Side Anti-Scraping & Content Protection
- Controlled by [`ContentProtection.tsx`](file:///d:/commissioner/Commissioner%20Amalraj/src/components/security/ContentProtection.tsx).
- Prevents context menu right-clicking (`contextmenu`).
- Disables text copying, cutting, and dragging (`copy`, `cut`, `dragstart`, `selectstart`).
- Blocks browser DevTools and inspection keyboard shortcuts:
  - `F12` key
  - `Ctrl + Shift + I` / `J` / `C` (DevTools)
  - `Ctrl + U` (View Page Source)
  - `Ctrl + S` (Save Page)
  - `Ctrl + P` (Print Page)
  - `PrintScreen` (Automatically clears clipboard buffer `navigator.clipboard.writeText("")`)
- **Admin Bypass**: Automatically deactivates protection on `/controller` routes so authorized admins can select, copy, and edit text seamlessly.

### 5. Role-Based Access Control (RBAC)
- Enforces user hierarchy (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
- Evaluates resolved permissions (`db.getResolvedPermissions`) before granting access to sensitive API endpoints and CMS modules.

### 6. SQL Injection Prevention & Connection Safety
- Utilizes `mysql2/promise` parameterized statements across all queries.
- Prevents SQL injection vulnerabilities by separating query structures from user input parameters.
- Wraps multi-step database mutations inside strict database transactions with automatic rollback on error (`mysql.ts`).

### 7. Comprehensive RBAC Security Audit Logging
- Every administrative action (login attempts, failed logins, menu modifications, user creation, content deletion) is recorded in the `activity_logs` database table.
- Logs capture: `username`, `userRole`, `ipAddress` (extracted via `x-forwarded-for`), `userAgent` header, `action` description, `module`, and `created_at` timestamp.

### 8. Session Security & Cookie Hardening
- Authenticated sessions are stored in HttpOnly cookies (`admin_session`).
- Cookie flags enforced: `HttpOnly: true`, `SameSite: Strict/Lax`, `Secure` in production environments, with a 7-day expiration limit.

---

## ⚡ Core Functionality & Technical Capabilities

### 🤖 AI-Powered Content & SEO Generation
- Integrated with Google Generative AI (`@google/generative-ai`).
- Endpoints [`/api/admin/generate-news`](file:///d:/commissioner/Commissioner%20Amalraj/src/app/api/admin/generate-news/route.ts) and [`/api/admin/generate-seo`](file:///d:/commissioner/Commissioner%20Amalraj/src/app/api/admin/generate-seo/route.ts) provide automated draft generation, meta title optimization, summary extraction, and focus keyword suggestions.

### 🔍 Typo-Tolerant Search Engine
- Implemented Levenshtein distance string matching in [`/api/police-stations/search/route.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/app/api/police-stations/search/route.ts).
- Allows citizens to find police stations even when typing names with minor typos (e.g. typing `"Meenambakam"` or `"Adyar"` matches accurately).

### 📰 Real-Time News Ticker & Controls
- Scrolling marquee news banner [`NewsTicker.tsx`](file:///d:/commissioner/Commissioner%20Amalraj/src/components/layout/NewsTicker.tsx) displaying urgent announcements.
- Supports pause-on-hover, dynamic speed adjustment, and direct links to breaking news articles.

### 🚔 Cinematic Patrolling Police Vehicle Login Screen
- Custom admin login portal [`AdminLogin.tsx`](file:///d:/commissioner/Commissioner%20Amalraj/src/components/admin/AdminLogin.tsx).
- Features a patrolling Tamil Nadu Police SUV moving along a static highway backdrop.
- Includes physics-based suspension bobbing, rotating alloy wheels, soft ground shadow, and animated red/blue LED emergency beacons.

### 📄 Automated Sitemaps & Search Engine Optimization
- Built-in sitemap generators:
  - `sitemap.xml`: General site page hierarchy.
  - `news-sitemap.xml`: Google News compliant sitemap format.
  - `video-sitemap.xml`: Schema.org video object indexing.
  - `robots.txt`: Search engine crawling rules.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MySQL Database**: v8.0+ (or MariaDB / Laragon)

### Environment Configuration (`.env.local`)
Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chennai_guardian

# Security & CAPTCHA Secret
CAPTCHA_SECRET=GCP_COMMISSIONER_PORTAL_CAPTCHA_SECRET_2026

# Google AI Key (Optional for AI generation)
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation & Database Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Database Migration & Seeding**:
   ```bash
   npm run migrate:mysql
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Access Protected Admin Controller**:
   Navigate to `/controller` to access the admin login interface.

---

## 🛡️ Verification & Verification Tools

- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```
- **Production Build**:
  ```bash
  npm run build
  ```

---

*Greater Chennai Police - Serving & Protecting with Honor and Innovation.*

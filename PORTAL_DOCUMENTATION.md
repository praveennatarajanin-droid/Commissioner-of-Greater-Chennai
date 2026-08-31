# Greater Chennai Police - Commissioner Portal (Chennai Guardian)
## Complete Technical Specification & Portal Documentation

> **Official Web Portal & Content Management System for the Greater Chennai Police (GCP)**  
> Technical specification covering system architecture, database design, modules, security controls, and core functionalities.

---

## 📑 Table of Contents
1. [System Architecture & Data Flow](#-system-architecture--data-flow)
2. [Database Schema & Data Models](#-database-schema--data-models)
3. [System Modules](#-system-modules)
   - [Public Portal & Newsroom System](#1-public-portal--newsroom-system)
   - [Police Station Directory & Locality Precinct Finder](#2-police-station-directory--locality-precinct-finder)
   - [Emergency & Traffic Advisory Synchronization System](#3-emergency--traffic-advisory-synchronization-system)
   - [Admin CMS & Content Control Center (`/controller`)](#4-admin-cms--content-control-center-controller)
   - [SuperAdmin Console & Security Management](#5-superadmin-console--security-management)
   - [Bilingual Localization Engine](#6-bilingual-localization-engine)
4. [Enterprise Security Architecture & 28-Layer Defense-In-Depth](#-enterprise-security-architecture--28-layer-defense-in-depth)
   - [Honeypot URL Obfuscation & Stealth Entry Point](#1-honeypot-url-obfuscation--stealth-entry-point)
   - [Server-Side Single-Use CAPTCHA Engine](#2-server-side-single-use-captcha-engine)
   - [Brute-Force & Progressive Throttling](#3-brute-force--progressive-throttling)
   - [RFC 6238 TOTP MFA Engine & Step-Up Verification](#4-rfc-6238-totp-mfa-engine--step-up-verification)
   - [Centralized API Security Pipeline & Payload Allowlisting](#5-centralized-api-security-pipeline--payload-allowlisting)
   - [File Upload Magic Bytes & SHA-256 Quarantine Staging](#6-file-upload-magic-bytes--sha-256-quarantine-staging)
   - [Cryptographic Double-Submit CSRF Token Engine](#7-cryptographic-double-submit-csrf-token-engine)
   - [Isomorphic XSS Sanitization & Tamil UTF-8 Preservation](#8-isomorphic-xss-sanitization--tamil-utf-8-preservation)
   - [Categorized Sliding-Window Rate Limiting](#9-categorized-sliding-window-rate-limiting)
   - [Disaster Recovery & SHA-256 Verified Backups](#10-disaster-recovery--sha-256-verified-backups)
   - [Non-Destructive Penetration Testing Audit Module](#11-non-destructive-penetration-testing-audit-module)
   - [28-Layer Defense-In-Depth System Security Center](#12-28-layer-defense-in-depth-system-security-center)
5. [Core Functionalities & Technical Capabilities](#-core-functionalities--technical-capabilities)
6. [Getting Started & Local Deployment](#-getting-started--local-deployment)

---

## 🏗 System Architecture & Data Flow

The portal is constructed on Next.js 16 (App Router) with React 19, TypeScript, Tailwind CSS v4, and a MySQL relational backend.

### Architecture Overview Diagram

```mermaid
flowchart TD
    subgraph Client Access Layer
        PublicUser["Public Citizen / Visitor"]
        AdminUser["Police Officer / Admin"]
    end

    subgraph Edge Security & Proxy (src/proxy.ts)
        HoneypotRewriter["Honeypot Rewriter\n* Scanners hitting /admin or /dashboard are rewritten to /404"]
        ContentProtection["Content Protection Guard\n* Disables Right-Click, Selection, Copy/Cut, DevTools & PrintScreen"]
    end

    subgraph Auth & Verification System
        CaptchaGen["HMAC SVG CAPTCHA Engine (src/lib/captcha.ts)\n* Distorted SVG, SHA-256 Signature, Expiry & Single-Use Registry"]
        SessionManager["HttpOnly Cookie Session Auth (src/lib/auth.ts)\n* 5-Attempt Lockout, 90-Day Password Expiry Enforcement"]
    end

    subgraph Application & CMS Controllers
        PublicApp["Public View Controllers\n* Newsroom, Traffic (/traffic), Stations Directory (/stations)\n* Video Gallery (/videos), Custom Dynamic Pages (/page/[slug])"]
        AdminCMS["Admin CMS Control Panel (/controller)\n* News & Media Editor, Menu Drag & Drop Builder\n* Page Editor, Web Stories, Precinct Manager"]
        SuperAdmin["SuperAdmin Console\n* User Provisioning, Lockout Unlocking, Audit Log Viewer"]
    end

    subgraph Services & Processing Engine
        SearchService["Levenshtein Typo-Tolerant Search Engine"]
        SyncService["Background Traffic Feed Synchronization"]
        AIService["Google Generative AI (Gemini) SEO & Summary Generator"]
    end

    subgraph Database Layer
        MySQLPool["MySQL Connection Pool (src/lib/mysql.ts)\n* Connection Leak Protection, Transaction Helpers"]
        MySQLTables[("MySQL Database (chennai_guardian)\n* police_stations (103 Precincts)\n* news, alerts, users, activity_logs, menu_items")]
    end

    PublicUser --> ContentProtection --> PublicApp
    AdminUser --> HoneypotRewriter --> CaptchaGen --> SessionManager --> AdminCMS & SuperAdmin
    PublicApp --> SearchService & SyncService --> MySQLPool
    AdminCMS --> AIService & MySQLPool
    SuperAdmin --> MySQLPool
    MySQLPool --> MySQLTables
```

---

## 🗄 Database Schema & Data Models

Database persistence is managed via `mysql2/promise` with automatic transaction management.

### Key Data Entities

1. **`police_stations`** (Precinct Directory):
   - Stores precinct metadata for 103 police stations across Greater Chennai.
   - Fields: `id`, `station_name`, `zone`, `locality`, `address`, `phone_no`, `google_map_link`, `jurisdiction_areas`, `sdo`, `range`, `pincode`.

2. **`users`** (Authentication & Governance):
   - Administrative credentials and account security states.
   - Fields: `id`, `username`, `passwordHash`, `role` (`SUPER_ADMIN` / `ADMIN` / `EDITOR`), `email`, `failed_logins`, `locked`, `status`, `lastLogin`, `force_password_change`.

3. **`activity_logs`** (Security Audit Trail):
   - Immutable security log of administrative actions.
   - Fields: `id`, `username`, `userRole`, `ipAddress`, `action`, `module`, `userAgent`, `created_at`.

4. **`news`** (Articles & Media Releases):
   - Newsroom publication items.
   - Fields: `id`, `title_en`, `title_ta`, `content_en`, `content_ta`, `category`, `image`, `views`, `is_breaking`, `created_at`.

5. **`alerts`** (Traffic & Emergency Bulletins):
   - Live public advisories.
   - Fields: `id`, `title`, `description`, `severity`, `category`, `source_url`, `created_at`.

6. **`menu_items` & `submenus`** (Dynamic Navigation):
   - Navigation links rendered in the primary header.
   - Fields: `id`, `title_en`, `title_ta`, `href`, `order_index`, `is_active`, `menu_id`.

---

## 🧩 System Modules

### 1. Public Portal & Newsroom System
- **Hero News Spotlight**: Carousel of major announcements.
- **Categorized News Feed**: Filter by Crime, Public Safety, Outreach, Traffic Advisories.
- **Video News Center (`/videos`)**: Embedded video players with view counters.
- **Web Stories**: Mobile-first visual story cards.
- **Document Center**: Downloadable PDFs, circulars, and gazettes.

### 2. Police Station Directory & Locality Precinct Finder
- **103 Precinct Dataset**: Full dataset covering all Chennai localities (Adyar, Anna Nagar, Egmore, T. Nagar, Tambaram, Chromepet, Avadi, Poonamallee, Guindy, Velachery, etc.).
- **Levenshtein Fuzzy Search Engine**: Typo-tolerant search (`isTypoMatch`).
- **Dedicated Route `/stations/[slug]`**: Direct pages with map links, contact details, and nearby precincts.

### 3. Emergency & Traffic Advisory Synchronization System
- **Traffic Advisory Page (`/traffic`)**: Road closures, diversions, weather alerts.
- **Automated Sync Module (`trafficSync.ts`)**: Background feed fetcher and deduplicator.

### 4. Admin CMS & Content Control Center (`/controller`)
- **Rich Text Editor**: WYSIWYG article composition in English & Tamil.
- **Navigation Builder**: Drag-and-drop menu reordering and submenu binding.
- **Dynamic Page Editor**: Standalone CMS page builder (`/page/[slug]`).
- **Precinct Manager**: Update station Inspector contact details, phone numbers, and map locations.

### 5. SuperAdmin Console & Security Management
- **User Provisioning**: Create and edit accounts with RBAC roles.
- **Lockout Management**: View and unlock locked user accounts.
- **Audit Log Viewer**: Filterable live activity logs.

### 6. Bilingual Localization Engine
- **English & Tamil Switching**: Instant UI translation via `LanguageContext`.
- **Persistent Preferences**: Remembers selected language in LocalStorage & Cookies.

---

## 🔒 Security Architecture & Controls

### 1. Honeypot URL Obfuscation & Stealth Path Rewriting
- Middleware [`src/proxy.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/proxy.ts) rewrites `/admin`, `/dashboard`, `/backend`, `/login/admin` to `/404`.

### 2. Zero-Dependency Dynamic SVG HMAC CAPTCHA Engine
- Generator [`src/lib/captcha.ts`](file:///d:/commissioner/Commissioner%20Amalraj/src/lib/captcha.ts) creates distorted 6-character SVG images with noise dots, lines, quadratic curves, and character rotations.
- Validated via HMAC-SHA256 signatures with 5-minute expiry and single-use token tracking.

### 3. Brute-Force & Account Lockout Defense
- Locks accounts after **5 failed login attempts** (`user.locked = 1`).
- Enforces mandatory password rotation after 90 days.

### 4. Client-Side Anti-Scraping & Content Protection
- Controlled by [`ContentProtection.tsx`](file:///d:/commissioner/Commissioner%20Amalraj/src/components/security/ContentProtection.tsx).
- Blocks context menu, text selection, drag-and-drop, DevTools (`F12`, `Ctrl+Shift+I/J/C`), View Source (`Ctrl+U`), Print (`Ctrl+P`), Save (`Ctrl+S`), and wipes clipboard on `PrintScreen`.
- Auto-bypasses protection on admin `/controller` routes.

### 5. Role-Based Access Control (RBAC)
- Hierarchy: `SUPER_ADMIN` > `ADMIN` > `EDITOR`.
- Evaluates resolved permissions before serving sensitive API endpoints.

### 6. SQL Injection Prevention & Connection Safety
- 100% parameterized queries via `mysql2/promise`.
- Database transaction rollback protection (`transaction()`).

### 7. Comprehensive Security Audit Logging
- System actions logged to `activity_logs` with username, role, IP address, user-agent, action description, and timestamp.

### 8. Session Security & Cookie Hardening
- HttpOnly, SameSite, Secure cookies for admin session management (`admin_session`).

---

## ⚡ Core Functionalities & Technical Capabilities

- **AI-Powered Content Generation**: Integration with Google Generative AI for article summaries, metadata, and SEO suggestions.
- **Typo-Tolerant Search**: Custom Levenshtein algorithm matching user searches despite spelling errors.
- **Cinematic Patrol Vehicle Login UI**: Physics-based suspension bobbing, rotating alloy wheels, headlight beams, and flashing red/blue LED emergency beacons.
- **Automated Sitemaps**: `sitemap.xml`, `news-sitemap.xml`, `video-sitemap.xml`.

---

*Greater Chennai Police Portal Technical Specification - 2026*

# Security Assessment / VAPT Scope & Questionnaire

**Project / Application**: Greater Chennai Police Commissioner Portal (Chennai Guardian)  
**Document Type**: Application Security Assessment Scope & Client Response  
**Date**: September 2026  

---

## Assessment Questionnaire Table

| Field | Information to be Provided | Client Response |
| :--- | :--- | :--- |
| **Company name** | Legal / incorporated company name | **Greater Chennai Police (GCP), Government of Tamil Nadu** |
| **Application Name** | Name of the application being assessed | **Greater Chennai Police Commissioner Portal (Chennai Guardian)** |
| **Assessment Technology** | Web / API / Network / Infra / Mobile / Thick Client / Cloud / Source Code Review / SCA / Server Config Review / etc., | **Web Application, REST APIs, Server Configuration Review & Source Code Review**<br>*(Tech Stack: Next.js 16.2.9, React 19, TypeScript, TailwindCSS, Node.js, MySQL / JSON DB Fallback Engine)* |
| **Assessment Type** | Black Box / Grey Box / White Box | **Grey Box / White Box** *(Recommended for full coverage including authenticated admin interfaces and API endpoints)* |
| **Scope** | Endpoints, URLs, IP ranges, or packages | **1. Public Portal Routes:**<br>• Home (`/`)<br>• About Us (`/about`, `/about/initiatives/*`, `/about/special-units/*`)<br>• Police Stations Directory (`/stations`, `/stations/[slug]`)<br>• Citizen Services (`/citizen-services`)<br>• Newsroom & Categories (`/news/[slug]`, `/category/[id]`)<br>• Video Portal (`/videos`)<br>• Commissioner Profile (`/commissioner-profile`)<br>• Chief Minister Page (`/chief-minister`)<br>• Contact Us (`/contact-us`)<br>• Traffic Portal Redirect (`/traffic`)<br><br>**2. Admin Controller Area:**<br>• `/controller` / `/control-center`<br><br>**3. REST APIs:**<br>• `/api/news/*`<br>• `/api/police-stations/*`<br>• `/api/citizen-services/*`<br>• `/api/citizen-service-categories`<br>• `/api/analytics/*` (`/api/analytics/visit`, `/api/analytics/visitor-count`)<br>• `/api/admin/*` (`/api/admin/auth`, `/api/admin/crud/*`, `/api/admin/security-config`, `/api/admin/security-events`, `/api/admin/sessions`, `/api/admin/mfa/*`, `/api/admin/captcha`, `/api/admin/csrf`, `/api/admin/media`, `/api/admin/backups`)<br>• `/api/trace-mobile`<br>• `/api/send-email`<br>• `/api/feedback`<br>• `/api/alerts` |
| **Version** | Version / Release number | **v1.0.0 (Release 2026.1 / Turbopack Production Build)** |
| **No. of Pages (if applicable)** | Total number of pages/screens | **29 Primary Routes / Pages + 50+ Backend REST API Endpoints + Full Admin Controller Suite** |
| **SHA256 Hash of Testing Version** | Hash value of deployed build/package | **Git Commit Ref: `c11f786d5e1ba28b2488e3328e1d2c67425110d7`** *(or sha256 of deployed archive bundle)* |
| **Post-Authenticated Pages in Scope** | Authenticated areas to be tested | **Administrative Control Center (`/controller` / `/control-center`):**<br>• Security Dashboard & Session Monitor (`/controller/dashboard`, `/controller/security`)<br>• Role & User Management (`/controller/users`)<br>• News & Multimedia Management (`/controller/news`, `/controller/videos`)<br>• Police Stations & Divisions Directory Manager (`/controller/stations`)<br>• Citizen Services Management (`/controller/citizen-services`)<br>• SEO, Menus & Page Contents Editor (`/controller/seo`, `/controller/menus`, `/controller/page-editor`)<br>• System Backups & Cache Management (`/controller/backups`, `/controller/cache`) |
| **User Roles to be Tested** | User / Admin / Super Admin / Other roles | **1. Anonymous / Public Citizen** (Unauthenticated)<br>**2. Content Editor** (`editor`)<br>**3. Content Admin** (`contentadmin`)<br>**4. Security / System Administrator** (`admin` / `ADMIN`)<br>**5. Super Administrator** (`superadmin`) |
| **Environment Type** | Prod / Preprod / Staging / UAT / Dev | **Staging / Preprod / UAT** *(or Production environment as agreed with testing team)* |
| **Scan Duration Window** | Start & End date/time | **[To be agreed with Assessment Team - Suggested: 5 to 7 Business Days]** |
| **Authentication Method** | Password / SSO / MFA / API Key / Token | **• Username & Password (Bcrypt / SHA-256)**<br>• **Session Management (HTTP-only, Secure, SameSite Cookie)**<br>• **CSRF Token Validation**<br>• **Single-Use Replay-Protected Captcha**<br>• **Multi-Factor Authentication (MFA / TOTP & Step-Up Verification)** |
| **Credentials / Test Accounts** | Test credentials for all roles | **1. Superadmin**: `superadmin@chennaiguardian.in` / `Digital_TN_GovMaster`<br>**2. Admin**: `admin@chennaiguardian.in` / `newseditormanager`<br>**3. Security Officer**: `secofficer_2042@gcp.tn.gov.in` / `SecOfficer_2042`<br>**4. Editor**: `editor@chennaiguardian.in` / `editor`<br>*(Exact staging passwords to be shared securely via encrypted channel)* |
| **Out of Scope Items** | Items explicitly excluded | **1. External Third-Party Portals & Services:**<br>• Greater Chennai Traffic Police (`https://gctp.in/`)<br>• TN Police CCTNS E-Services (`https://eservices.tnpolice.gov.in/`)<br>• Social Welfare Department (`https://tnsocialwelfare.tn.gov.in/`)<br>• External Social Media Platforms (Facebook, X/Twitter, Instagram, YouTube)<br>**2. Disruptive Actions:**<br>• Volumetric Denial of Service (DoS / DDoS) attacks<br>• Social engineering / Phishing targeting portal staff<br>• Physical hosting infrastructure out of scope |
| **Business Hours Restriction** | Allowed / Restricted | **Allowed 24/7 for Staging / UAT environment.**<br>*(If performing intrusive automated testing on Live Production, restrict heavy vulnerability scanning to Off-Peak Window: 10:00 PM – 06:00 AM IST).* |

---

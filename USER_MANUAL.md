# 📖 Greater Chennai Police Portal ("Chennai Guardian")
## Complete Page-by-Page Content & Functional User Manual

> **Portal Name:** Greater Chennai Police – Official Citizen & Administrative Portal (Chennai Guardian)  
> **Document Purpose:** Complete page-by-page breakdown of all content, sections, features, and workflows available across public citizen pages and the administrative command portal.  
> **Languages Supported:** English & Tamil (தமிழ்)

---

## 📑 Table of Contents

1. [Global Elements & Header / Footer Layout](#1-global-elements--header--footer-layout)
2. [Public Citizen Pages: Content Breakdown](#2-public-citizen-pages-content-breakdown)
   - [2.1 Homepage (`/`)](#21-homepage-)
   - [2.2 About Us (`/about`)](#22-about-us-about)
   - [2.3 Achievements & Command Milestones (`/achievements`)](#23-achievements--command-milestones-achievements)
   - [2.4 Hon'ble Chief Minister Profile (`/chief-minister`)](#24-honble-chief-minister-profile-chief-minister)
   - [2.5 Commissioner of Police Profile (`/commissioner-profile`)](#25-commissioner-of-police-profile-commissioner-profile)
   - [2.6 Citizen Services Directory (`/citizen-services`)](#26-citizen-services-directory-citizen-services)
   - [2.7 Police Stations & Precinct Directory (`/stations`)](#27-police-stations--precinct-directory-stations)
   - [2.8 Live Traffic Portal (`/traffic`)](#28-live-traffic-portal-traffic)
   - [2.9 News Article & Press Release Pages (`/news/[slug]`)](#29-news-article--press-release-pages-newsslug)
   - [2.10 News Categories Directory (`/category/[slug]`)](#210-news-categories-directory-categoryslug)
   - [2.11 Official Video Gallery (`/videos`)](#211-official-video-gallery-videos)
   - [2.12 Visual Web Stories (`/stories`)](#212-visual-web-stories-stories)
   - [2.13 Contact Us & Grievance Directory (`/contact-us`)](#213-contact-us--grievance-directory-contact-us)
3. [Administrative & CMS Console (`/controller`): Tab Content Breakdown](#3-administrative--cms-console-controller-tab-content-breakdown)
   - [3.1 Secure Authentication & MFA Gate](#31-secure-authentication--mfa-gate)
   - [3.2 Tab: Dashboard (`/controller/dashboard`)](#32-tab-dashboard-controllerdashboard)
   - [3.3 Tab: News & Press Releases (`/controller/news`)](#33-tab-news--press-releases-controllernews)
   - [3.4 Tab: Breaking News Ticker (`/controller/ticker`)](#34-tab-breaking-news-ticker-controllerticker)
   - [3.5 Tab: Hero Carousel Slider (`/controller/slider`)](#35-tab-hero-carousel-slider-controllerslider)
   - [3.6 Tab: Police Stations Master DB (`/controller/police-stations`)](#36-tab-police-stations-master-db-controllerpolice-stations)
   - [3.7 Tab: Citizen Services Management (`/controller/citizen-services`)](#37-tab-citizen-services-management-controllercitizen-services)
   - [3.8 Tab: Video Library (`/controller/videos`)](#38-tab-video-library-controllervideos)
   - [3.9 Tab: Visual Web Stories (`/controller/web-stories`)](#39-tab-visual-web-stories-controllerweb-stories)
   - [3.10 Tab: Traffic & Emergency Alerts (`/controller/alerts`)](#310-tab-traffic--emergency-alerts-controlleralerts)
   - [3.11 Tab: Commissioner Profile Editor (`/controller/profile`)](#311-tab-commissioner-profile-editor-controllerprofile)
   - [3.12 Tab: Dynamic Page Builder (`/controller/page-editor`)](#312-tab-dynamic-page-builder-controllerpage-editor)
   - [3.13 Tab: Navigation Menu Builder (`/controller/menu-management`)](#313-tab-navigation-menu-builder-controllermenu-management)
   - [3.14 Tab: Footer & Contact Settings (`/controller/footer`)](#314-tab-footer--contact-settings-controllerfooter)
   - [3.15 Tab: Media Library (`/controller/media`)](#315-tab-media-library-controllermedia)
   - [3.16 Tab: SEO & Social Meta Manager (`/controller/seo`)](#316-tab-seo--social-meta-manager-controllerseo)
   - [3.17 Tab: User & Role Security Center (`/controller/users` & `/controller/superadmin`)](#317-tab-user--role-security-center-controllerusers--controllersuperadmin)
   - [3.18 Tab: Activity Audit Trail Logs (`/controller/logs`)](#318-tab-activity-audit-trail-logs-controllerlogs)
   - [3.19 Tab: System & Theme Settings (`/controller/settings` & `/controller/theme`)](#319-tab-system--theme-settings-controllersettings--controllertheme)

---

## 1. Global Elements & Header / Footer Layout

Every public page of the portal includes standardized, persistent global components:

### 1.1 Top Utility & Emergency Bar
* **Emergency Quick-Dial Helplines:** Immediate one-tap calling buttons for:
  - `100` / `112` — Police Emergency
  - `1091` — Women Helpline
  - `1098` — Child Helpline (Childline)
  - `1930` — Cyber Crime National Helpline
  - `1253` — Senior Citizens Support
* **Bilingual Switcher:** Toggle button between **English** and **தமிழ் (Tamil)** that instantly translates all labels, navigation items, content feeds, and dates.
* **Theme Mode Switcher:** Toggle between **Light Mode** and high-contrast **Dark Mode**.

### 1.2 Breaking News & Live Alert Ticker
* High-priority scrolling announcement banner located right beneath the navigation bar.
* Displays real-time police alerts, traffic advisories, flood/weather warnings, and urgent public circulars with direct clickable links to full press releases.

### 1.3 Main Header Navigation
* Official Greater Chennai Police Emblem and Commissionerate Title.
* Multi-level responsive menu:
  - **Home (`/`)**
  - **About Us (`/about`)** (Sub-items: *History, Organizational Chart, Roles & Initiatives, Hall of Fame*)
  - **Hon'ble Chief Minister (`/chief-minister`)**
  - **Commissioner Profile (`/commissioner-profile`)**
  - **Police Stations (`/stations`)**
  - **Citizen Services (`/citizen-services`)**
  - **Achievements (`/achievements`)**
  - **Traffic (`/traffic`)**
  - **Videos (`/videos`)**
  - **Stories (`/stories`)**
  - **Contact Us (`/contact-us`)**

### 1.4 Global Footer
* **Commissionerate Address:** Commissioner of Police, Greater Chennai Police, No.132, EVK Sampath Road, Vepery, Chennai - 600 007.
* **Quick Links Grid:** Fast access to FIR status, cyber reporting, station finder, and traffic portal.
* **Social Media Connections:** Official GCP channels (X/Twitter, Facebook, YouTube, Instagram).
* **Copyright & Compliance Notice:** Government of Tamil Nadu & Greater Chennai Police intellectual property notice.

---

## 2. Public Citizen Pages: Content Breakdown

### 2.1 Homepage (`/`)

The primary digital landing page designed with a rich media news channel broadcast layout.

#### Exact Content & Sections:
1. **Hero Spotlight Slider Carousel:**
   - Visual banner showcase of major department initiatives, VIP events, and key announcements.
   - Includes high-resolution imagery, headline, brief summary, date badge, and "Read More" button.
2. **Citizen Quick-Action Grid:**
   - 4 prominent service tiles for immediate citizen engagement:
     - 🔍 *Find Nearest Police Station* (Redirects to `/stations`)
     - 📱 *Lost Mobile Phone Tracing* (Redirects to `/citizen-services`)
     - 🚦 *Live Traffic Advisories* (Redirects to `/traffic`)
     - 📋 *CSR / FIR Status Verification* (Redirects to Citizen Services)
3. **Latest News & Press Releases Section:**
   - Filterable tabs by category: *All, Crime Detection, Traffic Safety, Community Outreach, Cyber Safety, Women & Child Protection*.
   - Featured main story with large banner and accompanying grid of recent news cards with dates, read times, and thumbnail images.
4. **Web Stories Highlights:**
   - Circular and card visual web stories for rapid mobile viewing.
5. **Video Presentations & Live Briefings:**
   - Embedded video cards with YouTube integration for commissioner press conferences and public awareness shorts.
6. **Commissioner's Executive Corner:**
   - Profile card of Dr. A. Amalraj, IPS, featuring his official vision quote, photograph, and link to the complete profile.
7. **Emergency Contacts Fast-Bar:**
   - Quick-reference directory for city control rooms and precinct helplines.

---

### 2.2 About Us (`/about`)

A comprehensive 4-tab interactive repository detailing the history, structure, and operations of the Greater Chennai Police.

#### Exact Content & Sections:
1. **History & Legacy Tab:**
   - **Founding Narrative:** Tracing Chennai Police history from the 1856 Madras City Police Act to modern metropolitan policing.
   - **Chronological Milestones:** Key historical advancements including the introduction of wireless control rooms, modern PCR vans, computerization of FIRs, and integrated command centers.
2. **Organization Structure Tab:**
   - **Interactive Org Chart:** High-definition organizational hierarchy diagram from Director General of Police (DGP) / Commissioner of Police down to Joint Commissioners, Deputy Commissioners (DCPs), Assistant Commissioners (ACPs), and Inspectors.
   - **Zoom & Pan Modal:** Fullscreen interactive viewer with Zoom In (`+`), Zoom Out (`-`), and Reset (`100%`) controls.
3. **Roles & Responsibilities Tab:**
   - Breakdown of police specialized wings:
     - *Law & Order Wing (L&O):* Daily beat patrols, community safety, peace maintenance.
     - *Crime Detection & Investigation:* Special crime teams, fingerprint analysis, forensic science coordination.
     - *Greater Chennai Traffic Police (GCTP):* Intelligent traffic management, signal automation, accident reduction.
     - *Cyber Crime Cell:* Financial fraud detection, social media monitoring, 1930 incident response.
4. **Key Initiatives & Welfare Tab:**
   - **AVAL Program:** Dedicated women empowerment and domestic violence support initiative.
   - **Drive Against Drugs (DAD):** Coordinated narcotics control and youth rehabilitation programs.
   - **Operation Kaaval:** Proactive night patrolling and surveillance in residential zones.
   - **Third Eye (CCTV Mesh):** Comprehensive city-wide public CCTV coverage network.
5. **Hall of Fame Tab:**
   - Roll of honour showcasing officers who received the President's Police Medal for Distinguished Service, Gallantry Medals, and Tamil Nadu Chief Minister's Police Medals.

---

### 2.3 Achievements & Command Milestones (`/achievements`)

A public impact dashboard demonstrating performance statistics, operational results, and welfare outreach.

#### Exact Content & Sections:
1. **Key Impact Metrics Dashboard:**
   - `120,000+` Citizens Reached through outreach programs.
   - `350+` Public Safety & Cyber Awareness Campaigns conducted.
   - `45+` Specialized Community & Youth Development Programs.
   - `24/7` Continuous Public Service Support.
2. **6 Core Pillars of Achievement:**
   - 🛡️ **Women Safety Initiatives:** Expansion of Pink Patrol vehicles and campus safety drives.
   - 👥 **Community Outreach Programs:** Police-public sports meets, blood donation drives, and school awareness lectures.
   - 🔒 **Crime Prevention Operations:** Coordinated crackdowns on property offenses and organized crime syndicates.
   - 💻 **Technology-Driven Policing:** Deployment of facial recognition, ANPR (Automatic Number Plate Recognition) cameras, and drone surveillance.
   - 📢 **Public Awareness Campaigns:** Multi-channel campaigns on cyber hygiene, traffic helmet compliance, and anti-ragging.
   - 🏆 **Administrative Excellence:** Rapid digital grievance redressal and transparent beat administration.

---

### 2.4 Hon'ble Chief Minister Profile (`/chief-minister`)

An executive profile dedicated to the Chief Minister of Tamil Nadu, Thiru C. Joseph Vijay.

#### Exact Content & Sections:
1. **Executive Hero Banner:**
   - High-resolution portrait, official designation ("21st Chief Minister of Tamil Nadu"), tenure details (Term: 2026 - Present), constituency, and party affiliation.
2. **Personal Biography & Background Table:**
   - Date of birth, birthplace (Chennai, Tamil Nadu), educational qualifications (Loyola College, Visual Communications), and family heritage.
3. **Early Life & Public Mission:**
   - In-depth background narrative detailing social initiatives, educational scholarships, and transition into state governance.
4. **Political Journey Interactive Timeline:**
   - Milestone tracking from cultural engagement (1992), social welfare network expansion (2009), political party inception (Feb 2026), to assuming office as Chief Minister (April 2026).
5. **Vision for Tamil Nadu 2030 (4 Strategic Pillars):**
   - 📖 *Free Quality Education:* Modernizing government school infrastructure.
   - ⚡ *Digital Governance:* Unified single-window public grievance clearance.
   - 🛡️ *Women's Safety First:* Expanding urban surveillance mesh and emergency response.
   - ❤️ *Youth Employment:* Innovation centers, skill hubs, and startup seed funding.
6. **State Performance Counters:**
   - `1,500+` Infrastructure & welfare projects completed.
   - `12M+` Welfare beneficiaries via direct benefit transfers.
   - `250K+` Employment opportunities generated.
   - `320+` Municipal healthcare centers upgraded.
7. **Media Gallery & Video Presentations:**
   - Photo archives categorized by *Meetings* and *Public Events*.
   - Embedded video briefings and keynote addresses.
8. **Public Download Center & CMO Office Directory:**
   - Downloadable policy briefs and whitepapers.
   - Direct contact details for the Chief Minister's Office (CMO), Secretariat, Fort St. George, Chennai.

---

### 2.5 Commissioner of Police Profile (`/commissioner-profile`)

An official profile page dedicated to Dr. A. Amalraj, IPS, Commissioner of Police, Greater Chennai.

#### Exact Content & Sections:
1. **Executive Header & Portrait:**
   - Formal police portrait, IPS batch details, current rank (Additional Director General of Police / Commissioner of Police).
2. **Career Background & Leadership History:**
   - Detailed record of previous postings across various districts, specialized investigation units, intelligence wings, and law enforcement branches.
3. **Honours & Gallantry Medals:**
   - President's Police Medal for Distinguished Service.
   - Police Medal for Meritorious Service.
   - Tamil Nadu Chief Minister's Police Medal for Excellence.
4. **Strategic Priorities & Directives:**
   - Zero-tolerance policy against narcotics and illicit substances.
   - People-friendly community policing at every station reception desk.
   - Scientific crime investigation and digital forensics integration.
   - Strict monitoring of traffic bottlenecks with intelligent signal control.
5. **Secretariat Office Contact:**
   - Direct correspondence address at Vepery Headquarters, official appointment desk number, and designated grievance email.

---

### 2.6 Citizen Services Directory (`/citizen-services`)

The unified citizen e-services directory consolidating all state and city police services into one searchable catalog.

#### Exact Content & Categories:
1. **Interactive Search & Category Filter:**
   - Real-time instant search bar to find services by name or keyword.
   - Filter pills to switch between service classifications.
2. **8 Master Service Categories:**
   - 📝 **Complaints & FIRs:**
     - *Online Complaint Filing:* Register non-emergency complaints online.
     - *FIR Status Tracking:* Check status of registered FIRs using station and year.
     - *CSR (Community Service Register) Status:* Verify CSR receipt numbers.
   - 🛡️ **Verifications & Police Clearance:**
     - *Police Verification Certificate (PVC):* For job applicants, prospective tenants, domestic help, and private security guards.
   - 📱 **Lost Property & Cyber Cell:**
     - *Lost Mobile Phone Tracing:* Direct IMEI registration with Cyber Crime Cell.
     - *Lost Document Report (LDR):* Report lost passports, driving licenses, certificates.
     - *Cyber Crime Helpline 1930:* Direct link to national cyber reporting portal.
   - 🚦 **Traffic & Vehicle Desk:**
     - *E-Challan Payment:* Check and pay traffic violation challans online.
     - *Vehicle Impound Status:* Locate impounded vehicles.
   - 📜 **Permissions & Licenses:**
     - *Loudspeaker Permission:* Request event audio permits.
     - *Public Meeting / Procession NOC:* Approvals for cultural or religious gatherings.
     - *Arms License Renewal:* Firearm license status.
   - 👩‍👧 **Women & Child Safety:**
     - *AVAL Domestic Support:* Specialized counseling and legal guidance.
     - *Childline (1098):* Immediate child welfare interventions.
   - 👴 **Senior Citizen Support:**
     - *Elder Safety Desk (1253):* Regular beat officer check-in registration.
   - 📖 **RTI (Right to Information):**
     - *Online RTI Filing:* Submit information requests to Public Information Officers.

---

### 2.7 Police Stations & Precinct Directory (`/stations`)

A directory mapping all **103 police stations** under Greater Chennai Police jurisdiction.

#### Exact Content & Sections:
1. **Fuzzy Typo-Tolerant Station Search:**
   - Smart search engine that matches station names even with spelling mistakes (e.g. typing *"Valachery"* or *"Adayar"* finds Velachery and Adyar stations).
2. **Zonal Filters:**
   - Filter stations by operational zones: **North Zone**, **South Zone**, **East Zone**, **West Zone**.
3. **Detailed Police Station Cards:**
   - **Station Name & Official Code** (in English & Tamil).
   - **Officer-in-Charge:** Inspector name and designation.
   - **Phone Contacts:** Direct station landline and duty mobile numbers with 1-tap dial buttons.
   - **Jurisdiction Coverage:** Complete list of streets, residential colonies, landmarks, and postal codes covered by the station.
   - **GPS Turn-by-Turn Navigation:** Direct "Get Directions" button linking to Google Maps.
4. **Citizen Request Desk Form (Modal):**
   - Online form enabling citizens to submit queries, feedback, or assistance requests directly to a specific station.
5. **Emergency Contact Directory:**
   - Quick reference phone grid for all control rooms and commissionerate divisions.

---

### 2.8 Live Traffic Portal (`/traffic`)

* Directly integrates and routes citizens to the **Greater Chennai Traffic Police (GCTP)** command portal (`https://gctp.in/chennai-home`).
* Provides real-time traffic condition updates, road diversions, monsoon waterlogging alerts, flyover construction notices, and live transit advisories.

---

### 2.9 News Article & Press Release Pages (`/news/[slug]`)

Dedicated individual article reading experience for all official police announcements and press releases.

#### Exact Content & Features:
1. **Article Header:**
   - Bilingual Headline, Published Date, Category Badge, and Estimated Reading Time.
2. **High-Resolution Banner Image:**
   - Official press photo with explanatory caption.
3. **AI Text-to-Speech (TTS) Voice Reader:**
   - In-page audio player allowing citizens to listen to the entire article read aloud in clear Tamil or English.
4. **Rich-Text Content Body:**
   - Detailed news narrative, quotes from police leadership, and bulleted incident summaries.
5. **Official Document Attachments:**
   - Downloadable official PDF circulars and press release copies with verified SHA-256 checksums.
6. **Social Sharing Hub:**
   - 1-click sharing to WhatsApp, X (Twitter), Facebook, and Copy Link.
7. **Related News Recommendations:**
   - 3 related articles from the same category.

---

### 2.10 News Categories Directory (`/category/[slug]`)

* Aggregated index listing all press releases filed under specific police categories: *Crime, Traffic, Cyber, Women & Child, Community, Admin*.
* Includes pagination, search filter, and date ordering.

---

### 2.11 Official Video Gallery (`/videos`)

* Video streaming archive displaying official GCP press conferences, public safety awareness campaigns, traffic guidelines, and documentary shorts.
* Includes YouTube integration with modal playback.

---

### 2.12 Visual Web Stories (`/stories`)

* Mobile-first, tap-through visual micro-stories optimized for smartphone users.
* High-impact fullscreen image cards with text overlays, category tags, and direct links to full news articles.

---

### 2.13 Contact Us & Grievance Directory (`/contact-us`)

* **Headquarters Physical Location:** Greater Chennai Police Headquarters, Vepery, Chennai - 600 007.
* **Embedded Interactive Map:** High-precision map showing location and transit routes to the Commissioner's Office.
* **Control Room Phone Bank:** Dedicated phone numbers for Control Room, Crime Branch, Traffic Wing, and Public Relations.
* **Direct Citizen Inquiry Form:** Allows visitors to submit name, contact number, email, and message to the police public relations desk.

---

## 3. Administrative & CMS Console (`/controller`): Tab Content Breakdown

> **Important Security Notice:** Access to the management console is restricted to authorized police officers via `/controller` (or `/control-center`). Decoy URLs like `/admin` serve as security honeypots.

---

### 3.1 Secure Authentication & MFA Gate
* **Login Form:** Case-insensitive username and encrypted password field.
* **Dynamic Security CAPTCHA:** Distorted SVG verification image with 1-click refresh to prevent automated bot attacks.
* **Multi-Factor Authentication (MFA / TOTP):** Time-based One-Time Password prompt for accounts with 2FA enabled.
* **5-Attempt Lockout Mechanism:** Automatically locks accounts upon 5 consecutive failed logins.

---

### 3.2 Tab: Dashboard (`/controller/dashboard`)
* **Real-Time Statistical Counters:** Total News Published, Active Ticker Items, Slider Count, Police Stations (103), Videos, and Active Alerts.
* **Recent Activity Feed:** Live stream of recent content modifications and officer updates.
* **Quick Action Buttons:** Fast shortcuts to create news, publish emergency bulletins, or add slider items.
* **Security Status Widget:** Displays current session health, TLS status, and system uptime.

---

### 3.3 Tab: News & Press Releases (`/controller/news`)
* **Article Management Table:** List of all draft and published news articles with category badges, dates, and view counts.
* **Bilingual Rich-Text Editor:**
  - Separate editing panes for **English** and **Tamil** titles, summaries, and full articles.
  - Formatting tools: Bold, Italic, Lists, Blockquotes, Hyperlinks.
* **AI Content Assistant (Google Gemini):** 1-click AI button to generate summaries, SEO keywords, and bilingual tags.
* **Breaking News Toggle:** Flag any article to immediately broadcast on the global homepage ticker.
* **Media Attachment:** Upload banner images and official PDF circulars.

---

### 3.4 Tab: Breaking News Ticker (`/controller/ticker`)
* **Ticker List:** View and reorder all active scrolling announcements.
* **Create Ticker Item:** Input bilingual text (English & Tamil) and optional link URL.
* **Status Switch:** Instantly activate or deactivate ticker items with 1 click.

---

### 3.5 Tab: Hero Carousel Slider (`/controller/slider`)
* **Slider Manager:** Manage visual banners displayed on the homepage hero carousel.
* **Fields:** English/Tamil title, description, high-resolution banner image, target URL, and display order sequence.

---

### 3.6 Tab: Police Stations Master DB (`/controller/police-stations`)
* **103 Police Stations Master Editor:** Complete registry of all stations in Greater Chennai.
* **Editable Precinct Fields:**
  - Station Name (EN & TA).
  - Zone (North, South, East, West).
  - Inspector In-Charge name.
  - Landline and duty mobile contact numbers.
  - Detailed jurisdiction boundary description.
  - Google Maps GPS coordinates link.
  - Active / Inactive status toggle.

---

### 3.7 Tab: Citizen Services Management (`/controller/citizen-services`)
* **Service Categories Manager:** Create and reorder service categories (*Complaints, Verifications, Cyber, Traffic, etc.*).
* **Service Cards Editor:** Add or edit individual services with bilingual title, description, action URL, icon selection, and external portal link badge.

---

### 3.8 Tab: Video Library (`/controller/videos`)
* **Video Catalog:** Manage video cards displayed on the `/videos` page and homepage.
* **Fields:** YouTube Video ID / URL, English & Tamil titles, category tag, and display priority.

---

### 3.9 Tab: Visual Web Stories (`/controller/web-stories`)
* **Web Story Creator:** Design mobile-first vertical stories.
* **Fields:** Title, high-resolution portrait image, teaser caption, target article link, and active status.

---

### 3.10 Tab: Traffic & Emergency Alerts (`/controller/alerts`)
* **Emergency Alert Dispatcher:** Issue urgent city-wide public safety bulletins.
* **Alert Classifications:** *Critical Emergency, Road Diversion, Weather Alert, General Advisory*.
* **Display Control:** Set start time, expiry time, and auto-archive triggers.

---

### 3.11 Tab: Commissioner Profile Editor (`/controller/profile`)
* **Leadership Profile CMS:** Update Commissioner name, rank, biography paragraphs, awards list, official portrait photo, and secretariat contact details in both English and Tamil.

---

### 3.12 Tab: Dynamic Page Builder (`/controller/page-editor`)
* **Custom Public Page Builder:** Create standalone pages (e.g. `/page/[slug]`) without modifying code.
* **Modular Block Builder:** Add dynamic sections: *Hero Banner, Text Blocks, Image Galleries, Document Lists, Contact Grids*.

---

### 3.13 Tab: Navigation Menu Builder (`/controller/menu-management`)
* **Menu Hierarchy Editor:** Reorder header and footer menus using drag-and-drop or order indexes.
* **Menu Properties:** Title (EN & TA), target URL, parent dropdown category, external link toggle, and visibility state.

---

### 3.14 Tab: Footer & Contact Settings (`/controller/footer`)
* **Footer Configuration:** Edit headquarters address, control room helpline numbers, social media URLs, and disclaimer notices.

---

### 3.15 Tab: Media Library (`/controller/media`)
* **Secure Upload Center:** Upload images (`JPG`, `PNG`, `WebP`) and documents (`PDF`).
* **Upload Security Engine:** Automated MIME magic-byte verification, SHA-256 checksum generation, EXIF metadata stripping, and UUID filename assignment.
* **Media Browser:** Search, copy URL, preview, and delete uploaded files.

---

### 3.16 Tab: SEO & Social Meta Manager (`/controller/seo`)
* **Per-Page Meta Configuration:** Customize Meta Title, Meta Description, Canonical URL, OpenGraph (OG) sharing images, and Twitter Card tags for every route.
* **Schema.org Structured Data:** Manage JSON-LD structured data for Google News and Search indexation.

---

### 3.17 Tab: User & Role Security Center (`/controller/users` & `/controller/superadmin`)
* *Restricted exclusively to `SUPER_ADMIN` accounts.*
* **User Management:** Create, edit, and deactivate user accounts with role-based permissions (`SUPER_ADMIN`, `ADMIN`, `EDITOR`).
* **Account Unlock Utility:** Review locked officer profiles and reset failed login counters with 1 click.
* **Password Policy Enforcement:** Enforce strong password complexity.

---

### 3.18 Tab: Activity Audit Trail Logs (`/controller/logs`)
* **Tamper-Evident Audit Trail:** Detailed chronological record of all administrative actions:
  - User ID, Username, and Role.
  - Action Type (*LOGIN, LOGOUT, CREATE_NEWS, UPDATE_STATION, DELETE_ALERT, FAILED_LOGIN*).
  - Target Entity and Record ID.
  - IP Address and Browser User-Agent.
  - Exact Timestamp.
* **Filter & Export:** Search logs by date range, user, or action type, and export to CSV/PDF for security reviews.

---

### 3.19 Tab: System & Theme Settings (`/controller/settings` & `/controller/theme`)
* **Visual Theme Customization:** Configure portal primary colors, maroon/gold brand accents, font styles, and dark mode defaults.
* **System Maintenance:** Toggle portal maintenance mode and view system version info.

---

*Greater Chennai Police Portal Operational Manual — Version 2026.1*  
*Prepared for Greater Chennai Police Department & Citizens of Chennai*

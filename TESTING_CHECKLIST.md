# Greater Chennai Police Portal — Comprehensive Quality Assurance & Testing Checklist

**Document Version**: 2.0.0  
**Target Environment**: Staging & Production Verification  
**File**: `TESTING_CHECKLIST.md`

---

## Quick Reference Test Matrix

| Category | High-Priority Test Areas | Pass/Fail Criteria |
| :--- | :--- | :--- |
| **1. Authentication** | Username Normalization, Dual Hash, Safe Errors, Request IDs | No username mismatch, generic error messages with `REQ-2026-XXXXXXXX` |
| **2. CAPTCHA Engine** | Single-Use Invalidation, Replay Defense, Accessible UI | Replay attacks blocked (400), `<input id="captchaInput">` focusable & typable |
| **3. MFA & Sessions** | Super Admin MFA Challenge, Device Trust, 30m Inactivity Timeout | Untrusted device requires OTP, session cookies secure and non-tamperable |
| **4. RBAC & Quick Actions**| Sidebar vs Quick Actions consistency, Backend 403 enforcement | `ADMIN` only sees authorized actions (no fake locks), `SUPER_ADMIN` sees all |
| **5. Responsive UI** | Desktop (1920px), Tablet (768px–1024px), Mobile (320px–425px) | No horizontal scrolling, unclipped Profile Dropdown & Logout button |
| **6. Core CMS & Registry** | News, Slider, Videos, Ticker, Stations, Helplines | CRUD updates persist cleanly to DB with English/Tamil bilingual support |
| **7. Diagnostics & Health** | `/api/admin/system/auth-health`, Audit Logs, Rate Limiting | Status `healthy`, 5 failed login lockout, brute-force rate limiter active |

---

## 1. Authentication & Security Engine

### 1.1 Username Normalization & Case Insensitivity
- [ ] **Test Case 1.1.1**: Log in as `newseditormanager` with exact lowercase.
  - *Expected*: Successful authentication (200 OK).
- [ ] **Test Case 1.1.2**: Log in as `NewsEditorManager` or `NEWSEDITORMANAGER` with mixed case.
  - *Expected*: Normalizes to lowercase and authenticates without error.
- [ ] **Test Case 1.1.3**: Log in with leading or trailing whitespace (`" newseditormanager "`).
  - *Expected*: Trims whitespace automatically and logs in successfully.

### 1.2 Password Verification (SHA-256 & Bcrypt Support)
- [ ] **Test Case 1.2.1**: Log in with legacy SHA-256 production password.
  - *Expected*: Authenticates via constant-time equality check (`crypto.timingSafeEqual`).
- [ ] **Test Case 1.2.2**: Log in with bcrypt-hashed account.
  - *Expected*: Authenticates via `bcryptjs.compareSync` without module errors.

### 1.3 Safe Generic Errors & Request ID Auditing
- [ ] **Test Case 1.3.1**: Enter valid username with wrong password.
  - *Expected*: Generic response `"Invalid username or password."` (HTTP 401) with unique `requestId` (e.g. `REQ-2026-B2B6AA58`). No account enumeration hints.
- [ ] **Test Case 1.3.2**: Enter non-existent username with random password.
  - *Expected*: Identical generic response `"Invalid username or password."` (HTTP 401).

---

## 2. Server-Side Cryptographic CAPTCHA

### 2.1 Mathematical Challenge Generation
- [ ] **Test Case 2.1.1**: Load the `/control-center` login page.
  - *Expected*: Renders distinct SVG math challenge (e.g. `12 + 7 = ?`) with HMAC-SHA256 signed token.
- [ ] **Test Case 2.1.2**: Click the Refresh CAPTCHA icon button.
  - *Expected*: Instantly fetches a fresh equation and new token without full page reload.

### 2.2 Replay Attack Prevention (Single-Use Token Invalidation)
- [ ] **Test Case 2.2.1**: Complete login with a valid CAPTCHA answer and token.
- [ ] **Test Case 2.2.2**: Attempt to submit a second login request using the exact same CAPTCHA token.
  - *Expected*: Rejected immediately with HTTP 400 (`"Invalid security verification code. Please try again."`).

### 2.3 Form Accessibility & Touch Target UX
- [ ] **Test Case 2.3.1**: Check HTML markup for `<label htmlFor="captchaInput">` and `<input id="captchaInput" name="captchaInput">`.
  - *Expected*: Clicking the label activates the input.
- [ ] **Test Case 2.3.2**: Tap the CAPTCHA text box on mobile or small screen.
  - *Expected*: Clean blue focus ring (`#1e40af`), minimum 44px touch target, smooth keyboard typing.

---

## 3. Multi-Factor Authentication (MFA) & Session Lifecycle

### 3.1 Super Admin MFA Flow
- [ ] **Test Case 3.1.1**: Submit valid credentials for `Digital_TN_GovMaster`.
  - *Expected*: Triggers MFA challenge modal (`mfa_required: true`, `challenge_id: mfa_ch_...`).
- [ ] **Test Case 3.1.2**: Submit invalid OTP code (e.g. `000000`).
  - *Expected*: Returns HTTP 401 with remaining retry count.
- [ ] **Test Case 3.1.3**: Submit valid OTP code (e.g. `123456` or registered TOTP).
  - *Expected*: Sets `admin_session` cookie (`status: "MFA_VERIFIED"`) and redirects to `/control-center`.

### 3.2 Session Timeout & Protection
- [ ] **Test Case 3.2.1**: Verify session cookie attributes.
  - *Expected*: `HttpOnly: true`, `SameSite: Lax` (and `Secure: true` on HTTPS in production).
- [ ] **Test Case 3.2.2**: Leave browser idle for > 30 minutes.
  - *Expected*: Next API call prompts for session renewal or redirects to login.

---

## 4. Role-Based Access Control (RBAC) & Quick Actions

### 4.1 Role Permission Verification Matrix

| Role | Permitted Quick Actions | Restricted / Hidden Actions |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Add News, Add Slider, Add Video, Add Ticker, Add Story, Add Alert, Add Station, Add Helpline, Edit Profile, Branding, Config, Live Portal | None |
| **`ADMIN`** | Add News, Add Station, Add Helpline, Edit Profile, Live Portal | Add Slider, Add Video, Add Ticker, Add Story, Add Alert, Branding, Config |
| **`EDITOR`** | Add News, Add Story, Live Portal | Add Slider, Add Video, Add Ticker, Add Station, Add Helpline, Branding, Config |

### 4.2 Quick Actions UI Consistency
- [ ] **Test Case 4.2.1**: Log in as `ADMIN` (`newseditormanager`).
  - *Expected*: 
    - `Add News`, `Add Station`, `Add Helpline`, `Edit Profile`, `Live Portal` are rendered and clickable.
    - `Add Slider`, `Add Video`, `Add Ticker`, `Branding`, `Config` are **completely absent** from DOM (no fake locks, no grayed-out disabled buttons).
    - Quick Actions grid auto-reflows cleanly without blank gaps.
- [ ] **Test Case 4.2.2**: Log in as `SUPER_ADMIN` (`Digital_TN_GovMaster`).
  - *Expected*: All 12 actions appear in a neat 4-column responsive grid.

### 4.3 Direct Navigation & Tab Route Guards
- [ ] **Test Case 4.3.1**: While logged in as `ADMIN`, attempt to click or programmatically switch to `slider` or `superadmin` tab.
  - *Expected*: Content area displays the dedicated **Access Restricted** card with "Return to Overview Dashboard" button.
- [ ] **Test Case 4.3.2**: While logged in as `ADMIN`, manually submit API requests:
  - `POST /api/admin/crud/slider` ➔ **403 Forbidden**
  - `POST /api/admin/crud/videos` ➔ **403 Forbidden**
  - `POST /api/admin/crud/ticker` ➔ **403 Forbidden**
  - `POST /api/admin/crud/news` ➔ **200 OK** (Authorized)

---

## 5. Responsive Design & Viewport Validation

### 5.1 Desktop Viewports (1280px – 1920px)
- [ ] **Test Case 5.1.1**: View Admin Dashboard on full desktop screen.
  - *Expected*: Sidebar expanded, header ribbon displays quick links, alert badges, and user profile avatar.
- [ ] **Test Case 5.1.2**: Click profile avatar in header ribbon.
  - *Expected*: Unclipped profile popover displays User Name, Role badge, links, and red **Sign Out / Terminate** button.

### 5.2 Tablet Viewports (768px – 1024px)
- [ ] **Test Case 5.2.1**: Resize browser to 768px (iPad Mini / iPad Air).
  - *Expected*: Sidebar collapses to drawer or condensed layout, header actions fit without wrapping.
- [ ] **Test Case 5.2.2**: Open profile menu.
  - *Expected*: Popover aligns within screen bounds with full touch support.

### 5.3 Mobile Viewports (320px – 425px)
- [ ] **Test Case 5.3.1**: Resize browser to 375px (iPhone / Android mobile).
  - *Expected*: Zero horizontal scrolling, hamburger menu opens drawer, top header displays GCP logo and Profile Avatar button.
- [ ] **Test Case 5.3.2**: Tap Profile Avatar on mobile.
  - *Expected*: Opens clean dropdown with **Sign Out / Terminate** button prominently visible and easily tappable.
- [ ] **Test Case 5.3.3**: Click **Sign Out / Terminate**.
  - *Expected*: Invalidates session on backend, deletes cookies, and redirects to `/control-center`.

---

## 6. Core Content Management & Public Portal Modules

### 6.1 News & Press Releases
- [ ] **Test Case 6.1.1**: Create a new news article with English title/content and Tamil title/content.
  - *Expected*: Saves with auto-generated slug, appears in news list and public homepage feed.
- [ ] **Test Case 6.1.2**: Toggle article status (Draft ➔ Published) and set as "Featured".
  - *Expected*: Published article displays in the top spotlight banner on public site.

### 6.2 Bilingual Language Switcher
- [ ] **Test Case 6.2.1**: Toggle language switcher on public portal (`English` ➔ `தமிழ்`).
  - *Expected*: All navigation links, headlines, ticker, and emergency numbers switch to Tamil immediately.

### 6.3 Police Station & Helplines Directory
- [ ] **Test Case 6.3.1**: Filter police stations by Zone (e.g. South, North, East, West).
  - *Expected*: Instant filtering showing Inspector in-charge, phone number, and address.
- [ ] **Test Case 6.3.2**: Click emergency helpline number on mobile.
  - *Expected*: Prompts native `tel:` dialer (e.g. `100`, `112`, `1091`).

---

## 7. Diagnostics, System Health & Security Logs

### 7.1 Administrative Health Check Endpoint
- [ ] **Test Case 7.1.1**: Send request to `/api/admin/system/auth-health` as authenticated administrator.
  - *Expected*: Returns JSON diagnostic report with status `healthy`:
    - Database connection & user count
    - Active roles mapping
    - Password hashing mechanisms (`sha256_hex`, `bcrypt_compatible`)
    - CAPTCHA subsystem status & single-use policy
    - Active sessions count & security policy (30m timeout, 5-try lockout)
  - *Security check*: Confirms no passwords, hashes, salts, or session tokens are leaked in output.

### 7.2 Activity & Audit Logging
- [ ] **Test Case 7.2.1**: Perform an article create/edit or user login.
  - *Expected*: Entry recorded in Activity Log table with Username, Timestamp, Action, and IP.

---

## Test Execution Sign-Off

| Milestone | Tester Name | Date | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & CAPTCHA** | | | [ ] PASS / [ ] FAIL | |
| **RBAC & Quick Actions** | | | [ ] PASS / [ ] FAIL | |
| **Responsive Header & Logout** | | | [ ] PASS / [ ] FAIL | |
| **Core CMS & Bilingual Pages** | | | [ ] PASS / [ ] FAIL | |
| **System Diagnostics** | | | [ ] PASS / [ ] FAIL | |

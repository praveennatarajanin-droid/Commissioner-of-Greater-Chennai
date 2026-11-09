/**
 * Generates pristine, self-contained HTML for HTTP 503 Maintenance Mode.
 *
 * Benefits:
 * - 0ms latency (zero loopback network calls).
 * - Zero ECONNRESET / socket abort errors during page refresh.
 * - Perfectly responsive on all screen sizes (360px - 1920px).
 * - Generously sized, highly readable, authoritative typography ("light big").
 * - Full client-side bilingual toggle (English / Tamil).
 * - Animated police patrol SUV with roof emergency siren and rotating alloy wheels.
 * - Auto-recovery poll every 15 seconds to return to portal when maintenance is turned off.
 */

export interface MaintenanceHtmlConfig {
  maintenance_enabled: boolean;
  maintenance_title_en?: string;
  maintenance_description_en?: string;
  maintenance_title_ta?: string;
  maintenance_description_ta?: string;
  expected_restoration_datetime?: string | null;
  expected_restore_at?: string | null;
  maintenance_message_en?: string;
  maintenance_message_ta?: string;
}

export function renderMaintenanceHtml(config: MaintenanceHtmlConfig): string {
  const restoreIso = config.expected_restoration_datetime || config.expected_restore_at;

  let formattedDateEn = "To be announced";
  let formattedDateTa = "விரைவில் அறிவிக்கப்படும்";

  if (restoreIso) {
    try {
      const d = new Date(restoreIso);
      if (!isNaN(d.getTime())) {
        const formatted =
          new Intl.DateTimeFormat("en-IN", {
            timeZone: "Asia/Kolkata",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }).format(d) + " IST";
        formattedDateEn = formatted;
        formattedDateTa = formatted;
      }
    } catch {}
  }

  const descEn =
    config.maintenance_description_en ||
    config.maintenance_message_en ||
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance to improve our services. We apologize for the inconvenience and appreciate your patience.";

  const descTa =
    config.maintenance_description_ta ||
    config.maintenance_message_ta ||
    "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் மேம்படுத்தும் பணிகளுக்காக தற்காலிகமாக பராமரிப்பில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
  <title>Under Maintenance | Greater Chennai Police</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="icon" href="/favicon.ico" />
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    html, body {
      min-height: 100%;
      min-height: 100dvh;
      overflow-x: hidden;
      overflow-y: auto;
      background: linear-gradient(180deg, #070e20 0%, #0b1736 50%, #020617 100%);
      background-color: #070e20;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      min-height: 100%;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
    }
    /* Header (Enhanced & Readable) */
    header {
      background-color: rgba(7, 14, 32, 0.96);
      border-bottom: 1px solid rgba(245, 158, 11, 0.3);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 12px 24px;
      z-index: 40;
      flex-shrink: 0;
    }
    .header-inner {
      max-width: 1300px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .branding {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .emblem-box {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: rgba(15, 23, 42, 0.95);
      border: 2px solid rgba(245, 158, 11, 0.7);
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .emblem-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .brand-title {
      font-size: 15px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ffffff;
      line-height: 1.25;
    }
    .brand-sub {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #f59e0b;
      line-height: 1.25;
    }
    .lang-switcher {
      display: flex;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 8px;
      padding: 3px;
      gap: 4px;
      flex-shrink: 0;
    }
    .lang-btn {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .lang-btn.active {
      background: #1d4ed8;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(29, 78, 216, 0.7);
    }

    /* Main Section (Slightly Bigger, Grand & Legible) */
    main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 20px;
      text-align: center;
      max-width: 960px;
      margin: 0 auto;
      width: 100%;
      z-index: 20;
      min-height: 0;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 18px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      background: rgba(245, 158, 11, 0.14);
      border: 1.5px solid rgba(245, 158, 11, 0.5);
      color: #fbbf24;
      box-shadow: 0 0 16px rgba(245, 158, 11, 0.2);
      margin-bottom: 10px;
      flex-shrink: 0;
    }
    .status-dot {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #f59e0b;
      box-shadow: 0 0 10px #f59e0b;
      animation: pulseDot 1.5s infinite;
    }
    @keyframes pulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.35; transform: scale(0.8); }
    }
    .heading-main {
      font-size: clamp(28px, 4.8vw, 54px);
      font-weight: 900;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      color: #ffffff;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.95), 0 0 32px rgba(30, 58, 138, 0.5);
      margin-bottom: 6px;
      line-height: 1.15;
    }
    .heading-sub {
      font-size: clamp(16px, 2.2vw, 22px);
      font-weight: 800;
      color: #fde68a;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
      margin-bottom: 8px;
      letter-spacing: 0.02em;
    }
    .description {
      font-size: clamp(13px, 1.6vw, 15.5px);
      line-height: 1.6;
      color: #cbd5e1;
      max-width: 680px;
      margin: 0 auto;
      text-shadow: 0 1px 8px rgba(0, 0, 0, 0.8);
    }

    /* Notice Card (Prominent & Clear) */
    .notice-card {
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.96) 0%, rgba(2, 6, 23, 0.98) 100%);
      border: 1.5px solid rgba(245, 158, 11, 0.45);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(245, 158, 11, 0.15);
      border-radius: 14px;
      padding: 12px 20px;
      margin-top: 12px;
      max-width: 500px;
      width: 100%;
      flex-shrink: 0;
    }
    .notice-header {
      font-size: 12.5px;
      font-weight: 900;
      text-transform: uppercase;
      color: #f59e0b;
      letter-spacing: 0.1em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .notice-divider {
      height: 1px;
      background: rgba(51, 65, 85, 0.85);
      margin-bottom: 8px;
    }
    .notice-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.06em;
      margin-bottom: 5px;
    }
    .notice-time {
      font-size: clamp(14px, 2vw, 18px);
      font-weight: 900;
      color: #fef08a;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(245, 158, 11, 0.4);
      padding: 4px 14px;
      border-radius: 8px;
      display: inline-block;
      letter-spacing: 0.03em;
    }

    /* Helpline Section (Generous Typography) */
    .helpline-section {
      width: 100%;
      max-width: 820px;
      margin-top: 12px;
      flex-shrink: 0;
    }
    .helpline-title {
      font-size: 11.5px;
      font-weight: 900;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .helpline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    .helpline-card {
      background: rgba(15, 23, 42, 0.94);
      border-radius: 10px;
      padding: 10px 12px;
      text-decoration: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .helpline-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
    }
    .card-100 { border: 1.5px solid rgba(239, 68, 68, 0.5); }
    .card-112 { border: 1.5px solid rgba(245, 158, 11, 0.5); }
    .card-1091 { border: 1.5px solid rgba(236, 72, 153, 0.5); }
    .card-1930 { border: 1.5px solid rgba(59, 130, 246, 0.5); }
    .helpline-label {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      letter-spacing: 0.04em;
    }
    .helpline-num-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 6px;
    }
    .helpline-num {
      font-size: clamp(18px, 2.6vw, 26px);
      font-weight: 900;
      font-family: monospace;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .helpline-icon-box {
      width: 28px;
      height: 28px;
      border-radius: 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
    }
    .card-100 .helpline-icon-box { background: rgba(239, 68, 68, 0.22); border: 1px solid rgba(239, 68, 68, 0.6); color: #f87171; }
    .card-112 .helpline-icon-box { background: rgba(245, 158, 11, 0.22); border: 1px solid rgba(245, 158, 11, 0.6); color: #fbbf24; }
    .card-1091 .helpline-icon-box { background: rgba(236, 72, 153, 0.22); border: 1px solid rgba(236, 72, 153, 0.6); color: #f472b6; }
    .card-1930 .helpline-icon-box { background: rgba(59, 130, 246, 0.22); border: 1px solid rgba(59, 130, 246, 0.6); color: #60a5fa; }

    /* Footer & Vehicle Scene */
    footer {
      width: 100%;
      flex-shrink: 0;
      position: relative;
      z-index: 30;
    }
    .road-canvas {
      width: 100%;
      height: 110px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }
    .asphalt {
      position: absolute;
      inset: auto 0 0 0;
      height: 44px;
      background: linear-gradient(180deg, #0b1528 0%, #060b16 55%, #020617 100%);
      border-top: 2px solid rgba(245, 158, 11, 0.45);
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.6);
    }
    .yellow-divider {
      position: absolute;
      inset: 50% 0 auto 0;
      transform: translateY(-50%);
      height: 2px;
      background-image: repeating-linear-gradient(to right, rgba(254, 240, 138, 0.85) 0px, rgba(254, 240, 138, 0.85) 36px, transparent 36px, transparent 80px);
      background-size: 80px 2px;
      opacity: 0.8;
    }
    .car-container {
      position: absolute;
      bottom: 7px;
      width: 320px;
      height: 120px;
      animation: carTravelAcross 9.5s linear infinite;
      will-change: transform;
      pointer-events: none;
    }
    @keyframes carTravelAcross {
      0% { transform: translateX(-370px); }
      100% { transform: translateX(calc(100vw + 370px)); }
    }
    .siren-red-strobe {
      animation: flashRed 0.7s ease-in-out infinite;
    }
    .siren-blue-strobe {
      animation: flashBlue 0.7s ease-in-out infinite;
    }
    @keyframes flashRed {
      0%, 100% { opacity: 0.18; filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4)); }
      50% { opacity: 1; filter: drop-shadow(0 0 16px rgba(239, 68, 68, 1)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.85)); }
    }
    @keyframes flashBlue {
      0%, 100% { opacity: 1; filter: drop-shadow(0 0 16px rgba(59, 130, 246, 1)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.85)); }
      50% { opacity: 0.18; filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.4)); }
    }
    .footer-bar {
      background-color: #020617;
      border-top: 1px solid rgba(30, 41, 59, 0.8);
      padding: 8px 16px;
      text-align: center;
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    @media (max-width: 640px) {
      .helpline-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .brand-title {
        font-size: 13px;
      }
      .brand-sub {
        font-size: 9.5px;
      }
      .emblem-box {
        width: 36px;
        height: 36px;
      }
      .lang-btn {
        padding: 5px 10px;
        font-size: 11px;
      }
      .road-canvas {
        height: 95px;
      }
      .car-container {
        width: 260px;
        height: 100px;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .car-container {
        animation: none !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <header>
      <div class="header-inner">
        <div class="branding">
          <div class="emblem-box">
            <img src="/images/gcp_logo.png" alt="GCP Logo" />
          </div>
          <div>
            <div class="brand-title" id="hdr-title">GREATER CHENNAI POLICE</div>
            <div class="brand-sub" id="hdr-sub">CHENNAI GUARDIAN · COMMISSIONER PORTAL</div>
          </div>
        </div>
        <div class="lang-switcher">
          <button class="lang-btn active" id="btn-en" onclick="setLang('en')">English</button>
          <button class="lang-btn" id="btn-ta" onclick="setLang('ta')">தமிழ்</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <div class="status-badge">
        <span class="status-dot"></span>
        <span id="txt-badge">WEBSITE UNDER MAINTENANCE</span>
      </div>

      <h1 class="heading-main" id="txt-heading">UNDER MAINTENANCE</h1>
      <h2 class="heading-sub" id="txt-subheading">We'll Be Back Soon!</h2>
      <p class="description" id="txt-desc">${descEn}</p>

      <!-- Restoration Card -->
      <div class="notice-card">
        <div class="notice-header">
          <span>🕒</span>
          <span id="txt-notice-title">SERVICE AVAILABILITY NOTICE</span>
        </div>
        <div class="notice-divider"></div>
        <div class="notice-label" id="txt-notice-lbl">EXPECTED RESTORATION TIME:</div>
        <div class="notice-time" id="txt-notice-time">${formattedDateEn}</div>
      </div>

      <!-- Emergency Helpline Section -->
      <div class="helpline-section">
        <div class="helpline-title" id="txt-helpline-title">
          FOR IMMEDIATE EMERGENCY ASSISTANCE, DIAL 24×7 HELPLINES
        </div>
        <div class="helpline-grid">
          <a href="tel:100" class="helpline-card card-100" title="Dial 100">
            <div class="helpline-label" id="lbl-100">POLICE CONTROL</div>
            <div class="helpline-num-row">
              <span class="helpline-num">100</span>
              <div class="helpline-icon-box">📞</div>
            </div>
          </a>
          <a href="tel:112" class="helpline-card card-112" title="Dial 112">
            <div class="helpline-label" id="lbl-112">ALL EMERGENCY</div>
            <div class="helpline-num-row">
              <span class="helpline-num">112</span>
              <div class="helpline-icon-box">📞</div>
            </div>
          </a>
          <a href="tel:1091" class="helpline-card card-1091" title="Dial 1091">
            <div class="helpline-label" id="lbl-1091">WOMEN HELPLINE</div>
            <div class="helpline-num-row">
              <span class="helpline-num">1091</span>
              <div class="helpline-icon-box">📞</div>
            </div>
          </a>
          <a href="tel:1930" class="helpline-card card-1930" title="Dial 1930">
            <div class="helpline-label" id="lbl-1930">CYBER CRIME</div>
            <div class="helpline-num-row">
              <span class="helpline-num">1930</span>
              <div class="helpline-icon-box">📞</div>
            </div>
          </a>
        </div>
      </div>
    </main>

    <!-- Footer & Vehicle -->
    <footer>
      <div class="road-canvas">
        <div class="asphalt">
          <div class="yellow-divider"></div>
        </div>

        <!-- Patrol Police SUV with Roof Siren & Animated Wheels -->
        <div class="car-container">
          <svg viewBox="0 0 260 100" style="width:100%;height:100%;overflow:visible" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="40%" stop-color="#f8fafc" />
                <stop offset="80%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#cbd5e1" />
              </linearGradient>
              <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#0b1120" stop-opacity="0.96" />
                <stop offset="60%" stop-color="#1e293b" stop-opacity="0.92" />
                <stop offset="100%" stop-color="#020617" stop-opacity="0.98" />
              </linearGradient>
              <linearGradient id="gcpStripe" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1e3a8a" />
                <stop offset="42%" stop-color="#1d4ed8" />
                <stop offset="68%" stop-color="#b91c1c" />
                <stop offset="100%" stop-color="#7f1d1d" />
              </linearGradient>
              <radialGradient id="redGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#fee2e2" stop-opacity="1" />
                <stop offset="30%" stop-color="#ef4444" stop-opacity="0.95" />
                <stop offset="70%" stop-color="#dc2626" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#b91c1c" stop-opacity="0" />
              </radialGradient>
              <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#dbeafe" stop-opacity="1" />
                <stop offset="30%" stop-color="#3b82f6" stop-opacity="0.95" />
                <stop offset="70%" stop-color="#2563eb" stop-opacity="0.5" />
                <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0" />
              </radialGradient>
            </defs>

            <!-- 1. ROOF EMERGENCY SIREN -->
            <path d="M 44 26 L 56 25 L 58 29 L 44 29 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8" />
            <rect x="46" y="27" width="6" height="1.5" rx="0.5" fill="#ef4444" />
            <path d="M 64 26 L 70 26 L 67 20 Z" fill="#1e293b" stroke="#334155" stroke-width="0.8" />
            <path d="M 76 24 L 142 23 L 140 25.5 L 77 26.5 Z" fill="#64748b" stroke="#94a3b8" stroke-width="0.7" />

            <!-- Siren Base & Center Horn -->
            <rect x="100" y="22" width="4" height="2.5" fill="#1e293b" rx="0.5" />
            <rect x="124" y="22" width="4" height="2.5" fill="#1e293b" rx="0.5" />
            <rect x="96" y="19.5" width="36" height="3" rx="1.2" fill="#0f172a" stroke="#334155" stroke-width="0.6" />
            <rect x="109" y="12" width="10" height="8" rx="1.8" fill="#0f172a" stroke="#475569" stroke-width="0.8" />
            <line x1="111" y1="15" x2="117" y2="15" stroke="#94a3b8" stroke-width="0.8" />
            <line x1="111" y1="17.5" x2="117" y2="17.5" stroke="#94a3b8" stroke-width="0.8" />

            <!-- Left Red Strobe -->
            <circle cx="103" cy="16" r="14" fill="url(#redGlow)" class="siren-red-strobe" />
            <rect x="97" y="13" width="12" height="7" rx="2" fill="#ef4444" stroke="#f87171" stroke-width="0.8" />
            <rect x="99" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#fee2e2" />
            <rect x="104" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#fee2e2" />

            <!-- Right Blue Strobe -->
            <circle cx="125" cy="16" r="14" fill="url(#blueGlow)" class="siren-blue-strobe" />
            <rect x="119" y="13" width="12" height="7" rx="2" fill="#3b82f6" stroke="#60a5fa" stroke-width="0.8" />
            <rect x="121" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#dbeafe" />
            <rect x="126" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#dbeafe" />

            <!-- 2. BODY SHELL -->
            <path d="M 28 78 L 24 74 L 24 67 L 26 57 L 32 47 L 48 26 L 136 25 L 170 46 L 236 54 L 244 63 L 242 74 L 236 78 L 214 78 A 20 20 0 0 0 174 78 L 84 78 A 20 20 0 0 0 44 78 Z" fill="url(#bodyGrad)" stroke="#94a3b8" stroke-width="1.2" />

            <!-- Windows -->
            <path d="M 134 26 L 168 46 L 164 49 L 132 28 Z" fill="#64748b" opacity="0.5" />
            <path d="M 132 27 L 114 27 L 114 48 L 162 48 L 166 46 Z" fill="url(#glassGrad)" stroke="#1e293b" stroke-width="0.8" />
            <path d="M 110 27 L 80 27 L 80 48 L 110 48 Z" fill="url(#glassGrad)" stroke="#1e293b" stroke-width="0.8" />
            <path d="M 76 27 L 50 28 L 36 41 L 76 48 Z" fill="url(#glassGrad)" stroke="#1e293b" stroke-width="0.8" />
            <line x1="112" y1="26" x2="112" y2="49" stroke="#0f172a" stroke-width="3" />
            <line x1="78" y1="26" x2="78" y2="49" stroke="#0f172a" stroke-width="3" />

            <!-- Officer -->
            <circle cx="130" cy="36" r="5" fill="#0f172a" />
            <ellipse cx="130" cy="33" rx="6.5" ry="2" fill="#1e3a8a" />
            <rect x="132" y="32.5" width="4" height="1.2" rx="0.5" fill="#0f172a" />
            <path d="M 124 42 Q 130 39 136 42 L 136 48 L 124 48 Z" fill="#1e293b" />

            <!-- Mirror -->
            <path d="M 164 45 L 171 44 Q 173 47 171 50 L 163 49 Z" fill="#f8fafc" stroke="#475569" stroke-width="0.9" />

            <!-- Livery -->
            <path d="M 26 59 L 235 59 L 230 65 L 26 65 Z" fill="url(#gcpStripe)" />
            <path d="M 26 65 L 229 65 L 228 66.5 L 26 66.5 Z" fill="#f59e0b" />
            <g transform="translate(138, 50)">
              <circle cx="8" cy="8" r="7" fill="#fbbf24" stroke="#d97706" stroke-width="0.8" />
              <polygon points="8,2 9.8,6 14,6.5 10.5,9.5 11.8,14 8,11.5 4.2,14 5.5,9.5 2,6.5 6.2,6" fill="#1e3a8a" />
            </g>
            <text x="108" y="56.5" font-family="system-ui, sans-serif" font-size="5" font-weight="900" fill="#1e3a8a" letter-spacing="0.6">CHENNAI POLICE</text>
            <text x="108" y="63.5" font-family="system-ui, sans-serif" font-size="4" font-weight="800" fill="#ffffff" letter-spacing="0.5">INNOVA CRYSTA</text>
            <text x="32" y="63.5" font-family="system-ui, sans-serif" font-size="4.5" font-weight="900" fill="#ffffff" letter-spacing="0.5">DIAL 100</text>

            <!-- Front Light & Taillamp -->
            <path d="M 226 52 L 241 58 L 238 64 L 222 58 Z" fill="#cbd5e1" stroke="#64748b" stroke-width="0.8" />
            <circle cx="233" cy="59" r="2.2" fill="#ffffff" stroke="#94a3b8" stroke-width="0.6" />
            <path d="M 26 51 L 30 51 L 29 64 L 24 64 L 24 58 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="0.8" />

            <!-- 3. WHEELS LOCKED TO AXLES VIA NATIVE SVG ANIMATETRANSFORM -->
            <!-- Rear Wheel (Axle: 64, 78) -->
            <g transform="translate(64, 78)">
              <path d="M -21 0 A 21 21 0 0 1 21 0" stroke="#0f172a" stroke-width="3" fill="none" />
              <circle cx="0" cy="0" r="17" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
              <circle cx="0" cy="0" r="11" fill="#475569" stroke="#334155" stroke-width="0.8" />
              <path d="M -7 -7 A 10 10 0 0 1 -2 -9.5 L -2 -5 Z" fill="#b91c1c" />
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="0.65s" repeatCount="indefinite" />
                <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#64748b" stroke-width="1" />
                <line x1="-1.3" y1="-10" x2="-1.3" y2="10" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="1.3" y1="-10" x2="1.3" y2="10" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-9.5" y1="-3.8" x2="9.5" y2="3.8" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-9" y1="-1.6" x2="9" y2="1.6" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-6.8" y1="7.2" x2="6.8" y2="-7.2" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-5" y1="8.8" x2="5" y2="-8.8" stroke="#f8fafc" stroke-width="1.4" />
                <circle cx="0" cy="0" r="3.8" fill="#cbd5e1" stroke="#334155" stroke-width="0.8" />
                <circle cx="0" cy="0" r="1.6" fill="#1e3a8a" />
              </g>
            </g>

            <!-- Front Wheel (Axle: 194, 78) -->
            <g transform="translate(194, 78)">
              <path d="M -21 0 A 21 21 0 0 1 21 0" stroke="#0f172a" stroke-width="3" fill="none" />
              <circle cx="0" cy="0" r="17" fill="#1e293b" stroke="#0f172a" stroke-width="3" />
              <circle cx="0" cy="0" r="11" fill="#475569" stroke="#334155" stroke-width="0.8" />
              <path d="M -7 -7 A 10 10 0 0 1 -2 -9.5 L -2 -5 Z" fill="#b91c1c" />
              <g>
                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="0.65s" repeatCount="indefinite" />
                <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#64748b" stroke-width="1" />
                <line x1="-1.3" y1="-10" x2="-1.3" y2="10" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="1.3" y1="-10" x2="1.3" y2="10" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-9.5" y1="-3.8" x2="9.5" y2="3.8" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-9" y1="-1.6" x2="9" y2="1.6" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-6.8" y1="7.2" x2="6.8" y2="-7.2" stroke="#f8fafc" stroke-width="1.4" />
                <line x1="-5" y1="8.8" x2="5" y2="-8.8" stroke="#f8fafc" stroke-width="1.4" />
                <circle cx="0" cy="0" r="3.8" fill="#cbd5e1" stroke="#334155" stroke-width="0.8" />
                <circle cx="0" cy="0" r="1.6" fill="#1e3a8a" />
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div class="footer-bar">
        GREATER CHENNAI POLICE | CHENNAI GUARDIAN · COMMISSIONER PORTAL · © ${new Date().getFullYear()} OFFICIAL GOVERNMENT PORTAL
      </div>
    </footer>
  </div>

  <script>
    const content = {
      en: {
        hdrTitle: "GREATER CHENNAI POLICE",
        hdrSub: "CHENNAI GUARDIAN · COMMISSIONER PORTAL",
        badge: "WEBSITE UNDER MAINTENANCE",
        heading: "UNDER MAINTENANCE",
        subheading: "We'll Be Back Soon!",
        desc: ${JSON.stringify(descEn)},
        noticeTitle: "SERVICE AVAILABILITY NOTICE",
        noticeLbl: "EXPECTED RESTORATION TIME:",
        noticeTime: ${JSON.stringify(formattedDateEn)},
        helplineTitle: "FOR IMMEDIATE EMERGENCY ASSISTANCE, DIAL 24×7 HELPLINES",
        lbl100: "POLICE CONTROL",
        lbl112: "ALL EMERGENCY",
        lbl1091: "WOMEN HELPLINE",
        lbl1930: "CYBER CRIME"
      },
      ta: {
        hdrTitle: "சென்னை பெருநகர காவல்",
        hdrSub: "சென்னை கார்டியன் · ஆணையரக இணையதளம்",
        badge: "இணையதளம் பராமரிப்பில் உள்ளது",
        heading: "இணையதளம் பராமரிப்பில் உள்ளது",
        subheading: "விரைவில் மீண்டும் செயல்படும்!",
        desc: ${JSON.stringify(descTa)},
        noticeTitle: "சேவை கிடைக்கும் அறிவிப்பு",
        noticeLbl: "எதிர்பார்க்கப்படும் மீட்பு நேரம்:",
        noticeTime: ${JSON.stringify(formattedDateTa)},
        helplineTitle: "அவசர உதவிக்கு 24×7 தொடர்பு எண்கள்",
        lbl100: "காவல் கட்டுப்பாடு",
        lbl112: "அனைத்து அவசரம்",
        lbl1091: "பெண்கள் உதவி",
        lbl1930: "சைபர் க்ரைம்"
      }
    };

    function setLang(lang) {
      const c = content[lang];
      document.getElementById('hdr-title').innerText = c.hdrTitle;
      document.getElementById('hdr-sub').innerText = c.hdrSub;
      document.getElementById('txt-badge').innerText = c.badge;
      document.getElementById('txt-heading').innerText = c.heading;
      document.getElementById('txt-subheading').innerText = c.subheading;
      document.getElementById('txt-desc').innerText = c.desc;
      document.getElementById('txt-notice-title').innerText = c.noticeTitle;
      document.getElementById('txt-notice-lbl').innerText = c.noticeLbl;
      document.getElementById('txt-notice-time').innerText = c.noticeTime;
      document.getElementById('txt-helpline-title').innerText = c.helplineTitle;
      document.getElementById('lbl-100').innerText = c.lbl100;
      document.getElementById('lbl-112').innerText = c.lbl112;
      document.getElementById('lbl-1091').innerText = c.lbl1091;
      document.getElementById('lbl-1930').innerText = c.lbl1930;

      document.getElementById('btn-en').className = 'lang-btn' + (lang === 'en' ? ' active' : '');
      document.getElementById('btn-ta').className = 'lang-btn' + (lang === 'ta' ? ' active' : '');
    }

    // Auto-poll maintenance status every 15 seconds to return to live portal automatically
    setInterval(async () => {
      try {
        const res = await fetch('/api/maintenance/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.maintenance === false) {
            window.location.href = '/';
          }
        }
      } catch(e) {}
    }, 15000);
  </script>
</body>
</html>`;
}

"use client";

import React from "react";

/**
 * Chennai Skyline Illustration Vector Component
 * Features:
 * - Left: Heritage-style Colonial Edifice (Historic GCP Headquarters / Ripon Building with central cupola dome, clock tower, and colonnades)
 * - Right: Iconic Chennai Lighthouse (Marina Beach) with red & white bands, lantern room, and sweeping beacon beam
 * - Center: Urban Chennai architectural skyline with telecommunication masts and soft window illumination
 * - Sky: Midnight gradient with subtle stars and soft atmospheric clouds
 * - Subdued contrast & gradient scrim to strictly protect foreground text readability
 */
export default function ChennaiSkylineIllustration() {
  return (
    <div
      className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
      style={{ height: "280px", maxHeight: "36vh" }}
    >
      {/* Dark gradient overlay scrim to ensure foreground text has 100% contrast */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background: "linear-gradient(0deg, #020617 0%, rgba(2, 6, 23, 0.8) 50%, transparent 100%)",
        }}
      />

      <svg
        className="w-full h-full object-cover object-bottom transition-opacity"
        style={{ opacity: 0.6 }}
        viewBox="0 0 1440 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          {/* Sky Gradient */}
          <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b1736" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#09132b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.95" />
          </linearGradient>

          {/* Building Fill Gradient */}
          <linearGradient id="buildingGradDark" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#090d16" stopOpacity="0.95" />
          </linearGradient>

          {/* Heritage Building Highlight Gradient */}
          <linearGradient id="heritageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#1e293b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
          </linearGradient>

          {/* Lighthouse Beam Gradient */}
          <linearGradient id="lighthouseBeam" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#fef08a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── 1. SKY AMBIENCE & STARS ── */}
        <rect width="1440" height="360" fill="url(#skyGradient)" />
        
        {/* Distant Twinkling Stars */}
        <g fill="#93c5fd" opacity="0.45">
          <circle cx="80" cy="50" r="1" />
          <circle cx="160" cy="35" r="1.2" />
          <circle cx="280" cy="70" r="0.8" />
          <circle cx="390" cy="40" r="1.5" />
          <circle cx="520" cy="65" r="1" />
          <circle cx="680" cy="30" r="1.2" />
          <circle cx="810" cy="75" r="0.8" />
          <circle cx="950" cy="45" r="1.5" />
          <circle cx="1080" cy="35" r="1" />
          <circle cx="1210" cy="60" r="1.2" />
          <circle cx="1340" cy="40" r="1.5" />
        </g>

        {/* ── 2. DISTANT BACKGROUND CITY SKYLINE (METROPOLIS LAYER) ── */}
        <g fill="#0d1527" opacity="0.6">
          {/* Distant Towers */}
          <rect x="260" y="160" width="45" height="180" />
          <rect x="315" y="140" width="60" height="200" />
          <rect x="385" y="180" width="50" height="160" />
          <rect x="445" y="130" width="75" height="210" />
          <rect x="530" y="170" width="55" height="170" />
          <rect x="595" y="150" width="80" height="190" />
          <rect x="685" y="120" width="70" height="220" />
          <rect x="765" y="165" width="60" height="175" />
          <rect x="835" y="135" width="70" height="205" />
          <rect x="915" y="155" width="85" height="185" />
          <rect x="1010" y="170" width="65" height="170" />
          <rect x="1085" y="145" width="55" height="195" />
          <rect x="1150" y="160" width="70" height="180" />
        </g>

        {/* ── 3. MIDGROUND ARCHITECTURAL SILHOUETTE ── */}
        <g fill="url(#buildingGradDark)">
          {/* Communication Tower Antenna with red warning beacons */}
          <line x1="720" y1="120" x2="720" y2="70" stroke="#475569" strokeWidth="2" />
          <circle cx="720" cy="70" r="2.5" fill="#ef4444" className="animate-pulse" />
          <line x1="480" y1="130" x2="480" y2="85" stroke="#475569" strokeWidth="1.5" />
          <circle cx="480" cy="85" r="2" fill="#ef4444" className="animate-pulse" />
          <line x1="870" y1="135" x2="870" y2="90" stroke="#475569" strokeWidth="1.5" />
          <circle cx="870" cy="90" r="2" fill="#ef4444" className="animate-pulse" />

          {/* Central Chennai Commercial Highrises */}
          <rect x="340" y="175" width="45" height="165" rx="2" />
          <rect x="460" y="160" width="55" height="180" rx="2" />
          <rect x="620" y="180" width="50" height="160" rx="2" />
          <rect x="700" y="145" width="65" height="195" rx="3" />
          <rect x="850" y="165" width="60" height="175" rx="2" />
          <rect x="930" y="180" width="55" height="160" rx="2" />
          <rect x="1030" y="160" width="50" height="180" rx="2" />

          {/* Soft Window Illuminations */}
          <g fill="#fef08a" opacity="0.35">
            <rect x="470" y="175" width="4" height="6" />
            <rect x="480" y="175" width="4" height="6" />
            <rect x="495" y="175" width="4" height="6" />
            <rect x="470" y="195" width="4" height="6" />
            <rect x="495" y="195" width="4" height="6" />
            <rect x="480" y="215" width="4" height="6" />
            <rect x="715" y="165" width="5" height="7" />
            <rect x="730" y="165" width="5" height="7" />
            <rect x="745" y="165" width="5" height="7" />
            <rect x="715" y="185" width="5" height="7" />
            <rect x="745" y="185" width="5" height="7" />
            <rect x="730" y="205" width="5" height="7" />
            <rect x="865" y="180" width="4" height="6" />
            <rect x="885" y="180" width="4" height="6" />
            <rect x="865" y="200" width="4" height="6" />
          </g>
        </g>

        {/* ── 4. LEFT: HERITAGE COLONIAL HEADQUARTERS (GCP HQ / RIPON BUILDING) ── */}
        <g id="heritage-building" transform="translate(40, 110)">
          {/* Base Wings */}
          <rect x="0" y="110" width="220" height="120" fill="url(#heritageGrad)" rx="2" stroke="#475569" strokeWidth="1" />

          {/* Classical Colonnade / Arches Row */}
          <g fill="#0b1329" opacity="0.85">
            <rect x="15" y="145" width="12" height="24" rx="6" />
            <rect x="35" y="145" width="12" height="24" rx="6" />
            <rect x="55" y="145" width="12" height="24" rx="6" />
            <rect x="75" y="145" width="12" height="24" rx="6" />
            <rect x="135" y="145" width="12" height="24" rx="6" />
            <rect x="155" y="145" width="12" height="24" rx="6" />
            <rect x="175" y="145" width="12" height="24" rx="6" />
            <rect x="195" y="145" width="12" height="24" rx="6" />
          </g>

          {/* Roof Balustrade / Parapet */}
          <rect x="-4" y="105" width="228" height="6" fill="#475569" />
          <line x1="0" y1="102" x2="220" y2="102" stroke="#64748b" strokeWidth="1" />

          {/* Central Facade & Pediment */}
          <rect x="85" y="70" width="50" height="50" fill="url(#heritageGrad)" stroke="#475569" strokeWidth="1" />
          {/* Triangular Pediment */}
          <polygon points="80,70 110,48 140,70" fill="#334155" stroke="#64748b" strokeWidth="1" />

          {/* Central Clock Tower */}
          <rect x="95" y="25" width="30" height="25" fill="#1e293b" stroke="#475569" strokeWidth="1" />
          {/* Clock Face */}
          <circle cx="110" cy="37" r="7" fill="#f8fafc" opacity="0.8" />
          <circle cx="110" cy="37" r="5" fill="#0f172a" />
          <line x1="110" y1="37" x2="110" y2="34" stroke="#f8fafc" strokeWidth="1" />
          <line x1="110" y1="37" x2="113" y2="37" stroke="#f8fafc" strokeWidth="1" />

          {/* Classical Dome / Cupola with Finial Spire */}
          <path
            d="M 92 25 Q 110 -2 128 25 Z"
            fill="#334155"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          {/* Central Finial Spire */}
          <line x1="110" y1="-2" x2="110" y2="-16" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="110" cy="-16" r="2" fill="#f59e0b" />

          {/* Subtle Warm Arched Window Lights */}
          <g fill="#fef08a" opacity="0.4">
            <rect x="97" y="80" width="10" height="16" rx="5" />
            <rect x="113" y="80" width="10" height="16" rx="5" />
          </g>
        </g>

        {/* ── 5. RIGHT: ICONIC CHENNAI LIGHTHOUSE (MARINA BEACH) ── */}
        <g id="chennai-lighthouse" transform="translate(1260, 90)">
          {/* Sweeping Navigational Light Beam */}
          <polygon
            points="45,30 -650,-10 -650,70 45,34"
            fill="url(#lighthouseBeam)"
            opacity="0.35"
          />

          {/* Lighthouse Base Building / Administration Office */}
          <rect x="0" y="145" width="90" height="85" fill="#1e293b" stroke="#334155" strokeWidth="1" rx="2" />
          <rect x="10" y="165" width="12" height="16" rx="1" fill="#0f172a" />
          <rect x="68" y="165" width="12" height="16" rx="1" fill="#0f172a" />
          <rect x="36" y="180" width="18" height="35" rx="1" fill="#0f172a" />

          {/* Concrete Hexagonal/Cylindrical Tower with Red & White Bands */}
          {/* White Base Section */}
          <polygon points="25,145 27,125 63,125 65,145" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Red Band 1 */}
          <polygon points="27,125 29,105 61,105 63,125" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.8" />
          {/* White Band 2 */}
          <polygon points="29,105 31,85 59,85 61,105" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Red Band 2 */}
          <polygon points="31,85 33,65 57,65 59,85" fill="#dc2626" stroke="#b91c1c" strokeWidth="0.8" />
          {/* White Top Band */}
          <polygon points="33,65 34,48 56,48 57,65" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />

          {/* Observation Gallery / Balcony */}
          <rect x="26" y="44" width="38" height="5" fill="#1e293b" rx="1" stroke="#475569" strokeWidth="0.8" />
          <line x1="28" y1="42" x2="62" y2="42" stroke="#94a3b8" strokeWidth="1" />

          {/* Glass Lantern Room */}
          <rect x="34" y="26" width="22" height="18" fill="#fef08a" opacity="0.9" stroke="#334155" strokeWidth="1" />
          <line x1="45" y1="26" x2="45" y2="44" stroke="#334155" strokeWidth="1" />

          {/* Dome Roof & Lightning Rod Spire */}
          <path d="M 32 26 Q 45 12 58 26 Z" fill="#dc2626" stroke="#991b1b" strokeWidth="1" />
          <line x1="45" y1="12" x2="45" y2="0" stroke="#f59e0b" strokeWidth="1.5" />
          <circle cx="45" cy="0" r="1.5" fill="#f59e0b" />

          {/* Beacon Glowing Core */}
          <circle cx="45" cy="35" r="5" fill="#ffffff" />
          <circle cx="45" cy="35" r="9" fill="#fef08a" opacity="0.6" className="animate-pulse" />
        </g>

        {/* ── 6. FOREGROUND COASTAL SILHOUETTE (MARINA BEACH PALMS & SHORE) ── */}
        <path
          d="M 0 320 Q 360 305 720 315 T 1440 310 L 1440 360 L 0 360 Z"
          fill="#050b17"
        />

        {/* Coastal Palm Trees Silhouettes along the shoreline */}
        <g fill="#020617">
          {/* Palm 1 near heritage building */}
          <path d="M 270 330 Q 275 295 285 270 L 288 270 Q 278 295 273 330 Z" />
          <path d="M 285 270 Q 260 260 250 275 Q 265 270 285 270 Z" />
          <path d="M 285 270 Q 280 250 270 245 Q 280 255 285 270 Z" />
          <path d="M 285 270 Q 305 255 315 265 Q 300 265 285 270 Z" />

          {/* Palm 2 near lighthouse */}
          <path d="M 1240 330 Q 1235 295 1225 270 L 1222 270 Q 1232 295 1237 330 Z" />
          <path d="M 1225 270 Q 1200 260 1190 275 Q 1205 270 1225 270 Z" />
          <path d="M 1225 270 Q 1230 250 1240 245 Q 1230 255 1225 270 Z" />
          <path d="M 1225 270 Q 1245 255 1255 265 Q 1240 265 1225 270 Z" />
        </g>
      </svg>
    </div>
  );
}


"use client";

import React from "react";

/**
 * Animated Greater Chennai Police Patrol SUV with Roof-Mounted Emergency Siren.
 *
 * Specific Enhancements Applied:
 * 1. PROMINENT ROOFTOP EMERGENCY SIREN LIGHTBAR (UNCLIPPED & VIBRANT):
 *    - Full roofline, silver roof rails, and aerodynamic shark-fin antenna.
 *    - Dual-tone LED police lightbar: Multi-lens Red Strobe (Left) & Multi-lens Blue Strobe (Right).
 *    - Central matte-black electronic PA siren horn with chrome detail.
 *    - High-intensity alternating strobe flash animations with ambient roof reflection.
 *    - Road canvas height increased (h-26 sm:h-30) to eliminate any clipping.
 *
 * 2. FIRMLY ATTACHED WHEELS (ZERO ROAMING):
 *    - Diamond-cut split-spoke alloy wheels with red brake calipers and disc rotors.
 *    - Native SVG <animateTransform> rotating strictly around local axle center (0,0).
 *    - Mathematically locked to the vehicle chassis — zero drift, zero detachment.
 *
 * 3. NO UNDER-CAR BLACK LINE / SHADOW PILL:
 *    - Natural ground clearance between the wheels allowing the asphalt road to show through.
 *    - Tires rest realistically on the road surface.
 *
 * 4. POLICE LIVERY & BRANDING:
 *    - Official Greater Chennai Police Navy Blue & Crimson Red dual-tone curved stripe.
 *    - Official GCP Gold Star crest badge on the front door.
 *    - Bold "CHENNAI POLICE", "INNOVA CRYSTA", and "DIAL 100" emergency decals.
 *    - Officer silhouette in uniform with official GCP peaked cap.
 *
 * 5. SEAMLESS TRAVERSAL & REDUCED MOTION:
 *    - Smooth left-to-right traversal across the full viewport.
 *    - Accessibility compliant via @media (prefers-reduced-motion: reduce).
 */
export default function PoliceCarAnimation() {
  return (
    <div
      className="w-full overflow-hidden select-none relative"
      aria-label="Animated Greater Chennai Police patrol SUV with flashing emergency siren"
      role="img"
    >
      <style jsx>{`
        /* Police SUV Highway Traversal: Left to Right across full viewport */
        @keyframes patrolSuvTravelAcross {
          0% {
            transform: translateX(-360px);
          }
          100% {
            transform: translateX(calc(100vw + 360px));
          }
        }

        /* Alternating Roof Siren Strobes */
        @keyframes flasherRedStrobe {
          0%, 100% {
            opacity: 0.18;
            filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.4));
          }
          50% {
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(239, 68, 68, 1)) drop-shadow(0 0 24px rgba(239, 68, 68, 0.85));
          }
        }

        @keyframes flasherBlueStrobe {
          0%, 100% {
            opacity: 1;
            filter: drop-shadow(0 0 16px rgba(59, 130, 246, 1)) drop-shadow(0 0 24px rgba(59, 130, 246, 0.85));
          }
          50% {
            opacity: 0.18;
            filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.4));
          }
        }

        /* Ambient Roof Flash Reflection */
        @keyframes roofAmbientStrobe {
          0%, 100% {
            opacity: 0.8;
            fill: url(#sirenAmbientBlue);
          }
          50% {
            opacity: 0.8;
            fill: url(#sirenAmbientRed);
          }
        }

        .patrol-police-vehicle {
          animation: patrolSuvTravelAcross 9.5s linear infinite;
          will-change: transform;
        }

        .siren-red-strobe {
          animation: flasherRedStrobe 0.7s ease-in-out infinite;
        }

        .siren-blue-strobe {
          animation: flasherBlueStrobe 0.7s ease-in-out infinite;
        }

        .roof-ambient-flash {
          animation: roofAmbientStrobe 0.7s ease-in-out infinite;
        }

        .road-dash-markings {
          background-image: repeating-linear-gradient(
            to right,
            rgba(254, 240, 138, 0.85) 0px,
            rgba(254, 240, 138, 0.85) 36px,
            transparent 36px,
            transparent 80px
          );
          background-size: 80px 3px;
        }

        /* Accessibility: Honors prefers-reduced-motion */
        @media (prefers-reduced-motion: reduce) {
          .patrol-police-vehicle {
            animation: none !important;
            transform: translateX(0) !important;
            margin: 0 auto !important;
            position: relative !important;
            left: auto !important;
          }
          .siren-red-strobe {
            animation: none !important;
            opacity: 0.9 !important;
            filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.85)) !important;
          }
          .siren-blue-strobe {
            animation: none !important;
            opacity: 0.9 !important;
            filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.85)) !important;
          }
          .roof-ambient-flash {
            animation: none !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>

      {/* Road Canvas with Asphalt Surface (Ample Height to Ensure Siren is Never Clipped) */}
      <div className="w-full relative h-26 sm:h-30 flex items-end">
        {/* Road Surface */}
        <div
          className="absolute inset-x-0 bottom-0 h-10 sm:h-11 shadow-2xl"
          style={{
            background: "linear-gradient(180deg, #0b1528 0%, #060b16 55%, #020617 100%)",
            borderTop: "2px solid rgba(245, 158, 11, 0.45)",
          }}
        >
          {/* Top Yellow Warning Border */}
          <div
            className="absolute inset-x-0 top-0 h-0.5"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(245, 158, 11, 0.85) 50%, transparent 100%)",
            }}
          />
          {/* Center Road Dashes */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 road-dash-markings opacity-80" />
          {/* Asphalt Granular Highlights */}
          <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-800/80" />
        </div>

        {/* Police Patrol SUV Container */}
        <div className="patrol-police-vehicle absolute bottom-[5px] sm:bottom-[7px] z-10 origin-bottom-left pointer-events-none">
          <div className="relative w-[270px] sm:w-[320px] md:w-[360px] aspect-[260/100] flex items-end">
            <svg
              viewBox="0 0 260 100"
              className="w-full h-full overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Pearl White Automotive Body Gradient */}
                <linearGradient id="crystaBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#f8fafc" />
                  <stop offset="75%" stopColor="#e2e8f0" />
                  <stop offset="100%" stopColor="#cbd5e1" />
                </linearGradient>

                {/* Automotive Privacy Glass Gradient */}
                <linearGradient id="crystaGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0b1120" stopOpacity="0.96" />
                  <stop offset="60%" stopColor="#1e293b" stopOpacity="0.92" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.98" />
                </linearGradient>

                {/* Official GCP Dual-Tone Patrol Livery (Navy & Crimson) */}
                <linearGradient id="crystaGcpLivery" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="42%" stopColor="#1d4ed8" />
                  <stop offset="68%" stopColor="#b91c1c" />
                  <stop offset="100%" stopColor="#7f1d1d" />
                </linearGradient>

                {/* Chrome Trim Accent */}
                <linearGradient id="crystaChrome" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#94a3b8" />
                </linearGradient>

                {/* High-Intensity Red Emergency Siren Radial Glow */}
                <radialGradient id="crystaRedGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fee2e2" stopOpacity="1" />
                  <stop offset="25%" stopColor="#ef4444" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#dc2626" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0" />
                </radialGradient>

                {/* High-Intensity Blue Emergency Siren Radial Glow */}
                <radialGradient id="crystaBlueGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#dbeafe" stopOpacity="1" />
                  <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.95" />
                  <stop offset="70%" stopColor="#2563eb" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
                </radialGradient>

                {/* Ambient Roof Reflections */}
                <linearGradient id="sirenAmbientRed" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor="rgba(239, 68, 68, 0.45)" />
                  <stop offset="55%" stopColor="rgba(239, 68, 68, 0.45)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>

                <linearGradient id="sirenAmbientBlue" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="45%" stopColor="rgba(59, 130, 246, 0.45)" />
                  <stop offset="55%" stopColor="rgba(59, 130, 246, 0.45)" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>

              {/* ========== 1. PROMINENT ROOFTOP EMERGENCY POLICE SIREN ========== */}
              {/* Integrated Rear Roof Spoiler with LED High Mount Stop Lamp */}
              <path
                d="M 44 26 L 56 25 L 58 29 L 44 29 Z"
                fill="#cbd5e1"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              <rect x="46" y="27" width="6" height="1.5" rx="0.5" fill="#ef4444" />

              {/* Aerodynamic Shark-Fin Roof Antenna */}
              <path
                d="M 64 26 L 70 26 L 67 20 Z"
                fill="#1e293b"
                stroke="#334155"
                strokeWidth="0.8"
              />

              {/* Low-Profile Silver Roof Rails */}
              <path
                d="M 76 24 L 142 23 L 140 25.5 L 77 26.5 Z"
                fill="#64748b"
                stroke="#94a3b8"
                strokeWidth="0.7"
              />
              <rect x="80" y="25" width="3.5" height="1.8" fill="#334155" />
              <rect x="108" y="24.5" width="3.5" height="1.8" fill="#334155" />
              <rect x="136" y="24" width="3.5" height="1.8" fill="#334155" />

              {/* Ambient Roof Siren Glow onto Car Roof */}
              <ellipse cx="114" cy="25" rx="30" ry="3" className="roof-ambient-flash" />

              {/* Siren Mounting Feet & Base Platform */}
              <rect x="100" y="22" width="4" height="2.5" fill="#1e293b" rx="0.5" />
              <rect x="124" y="22" width="4" height="2.5" fill="#1e293b" rx="0.5" />
              <rect x="96" y="19.5" width="36" height="3" rx="1.2" fill="#0f172a" stroke="#334155" strokeWidth="0.6" />

              {/* Center Electronic Siren Speaker Housing / PA Horn */}
              <rect x="109" y="12" width="10" height="8" rx="1.8" fill="#0f172a" stroke="#475569" strokeWidth="0.8" />
              <line x1="111" y1="15" x2="117" y2="15" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="111" y1="17.5" x2="117" y2="17.5" stroke="#94a3b8" strokeWidth="0.8" />
              <circle cx="114" cy="16.2" r="1.3" fill="#cbd5e1" />

              {/* Left: Red High-Output Emergency LED Strobe Module */}
              <g>
                {/* Red Strobe Halo Glow */}
                <circle cx="103" cy="16" r="14" fill="url(#crystaRedGlow)" className="siren-red-strobe" />
                {/* Red Polycarbonate Lens Housing */}
                <rect x="97" y="13" width="12" height="7" rx="2" fill="#ef4444" stroke="#f87171" strokeWidth="0.8" />
                {/* Internal Multi-Fresnel LED Optic Bars */}
                <rect x="99" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#fee2e2" />
                <rect x="104" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#fee2e2" />
              </g>

              {/* Right: Blue High-Output Emergency LED Strobe Module */}
              <g>
                {/* Blue Strobe Halo Glow */}
                <circle cx="125" cy="16" r="14" fill="url(#crystaBlueGlow)" className="siren-blue-strobe" />
                {/* Blue Polycarbonate Lens Housing */}
                <rect x="119" y="13" width="12" height="7" rx="2" fill="#3b82f6" stroke="#60a5fa" strokeWidth="0.8" />
                {/* Internal Multi-Fresnel LED Optic Bars */}
                <rect x="121" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#dbeafe" />
                <rect x="126" y="14.5" width="3.5" height="3.5" rx="0.8" fill="#dbeafe" />
              </g>

              {/* ========== 2. POLICE SUV BODY SHELL ========== */}
              <path
                d="M 28 78
                   L 24 74
                   L 24 67
                   L 26 57
                   L 32 47
                   L 48 26
                   L 136 25
                   L 170 46
                   L 236 54
                   L 244 63
                   L 242 74
                   L 236 78
                   L 214 78
                   A 20 20 0 0 0 174 78
                   L 84 78
                   A 20 20 0 0 0 44 78
                   Z"
                fill="url(#crystaBodyGrad)"
                stroke="#94a3b8"
                strokeWidth="1.2"
              />

              {/* Muscular Hood Crease Lines */}
              <path d="M 138 26 L 172 47 L 236 55" stroke="#cbd5e1" strokeWidth="1" fill="none" />
              <path d="M 170 48 L 240 58" stroke="#e2e8f0" strokeWidth="0.8" fill="none" />

              {/* ========== 3. FRONT TRAPEZOIDAL CHROME GRILLE & INTEGRATED BUMPER ========== */}
              <path
                d="M 236 56 L 244 61 L 243 68 L 234 68 Z"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="0.8"
              />
              <line x1="236" y1="59" x2="243" y2="62" stroke="url(#crystaChrome)" strokeWidth="1.5" />
              <line x1="235" y1="64" x2="242" y2="66" stroke="url(#crystaChrome)" strokeWidth="1.5" />
              <ellipse cx="239" cy="62" rx="2.2" ry="1.5" fill="#94a3b8" stroke="#ffffff" strokeWidth="0.6" />

              {/* Lower Air Dam & Front Fog Lamps */}
              <rect x="234" y="70" width="5" height="3.5" rx="1" fill="#0f172a" />
              <circle cx="236.5" cy="71.8" r="1.2" fill="#fef08a" />

              {/* ========== 4. THE SIGNATURE GLASSHOUSE (WINDOWS) ========== */}
              {/* Front Windshield Glass */}
              <path
                d="M 134 26 L 168 46 L 164 49 L 132 28 Z"
                fill="#64748b"
                opacity="0.5"
              />

              {/* Front Driver Door Window */}
              <path
                d="M 132 27 L 114 27 L 114 48 L 162 48 L 166 46 Z"
                fill="url(#crystaGlassGrad)"
                stroke="#1e293b"
                strokeWidth="0.8"
              />

              {/* Middle Passenger Door Window */}
              <path
                d="M 110 27 L 80 27 L 80 48 L 110 48 Z"
                fill="url(#crystaGlassGrad)"
                stroke="#1e293b"
                strokeWidth="0.8"
              />

              {/* Signature Upward Upswept Rear Quarter Glass */}
              <path
                d="M 76 27 L 50 28 L 36 41 L 76 48 Z"
                fill="url(#crystaGlassGrad)"
                stroke="#1e293b"
                strokeWidth="0.8"
              />

              {/* Blacked-Out Pillars (Floating Roof Aesthetic) */}
              <line x1="112" y1="26" x2="112" y2="49" stroke="#0f172a" strokeWidth="3" />
              <line x1="78" y1="26" x2="78" y2="49" stroke="#0f172a" strokeWidth="3" />

              {/* Chrome Lower Window Beltline Accent */}
              <path
                d="M 167 48.5 L 76 48.5 L 36 41.5"
                stroke="url(#crystaChrome)"
                strokeWidth="1.2"
                fill="none"
              />

              {/* Officer Silhouette with Official GCP Peaked Cap */}
              <circle cx="130" cy="36" r="5" fill="#0f172a" />
              <ellipse cx="130" cy="33" rx="6.5" ry="2" fill="#1e3a8a" />
              <rect x="132" y="32.5" width="4" height="1.2" rx="0.5" fill="#0f172a" />
              <path d="M 124 42 Q 130 39 136 42 L 136 48 L 124 48 Z" fill="#1e293b" />

              {/* Side Wing Mirror with Turn Indicator */}
              <path
                d="M 164 45 L 171 44 Q 173 47 171 50 L 163 49 Z"
                fill="#f8fafc"
                stroke="#475569"
                strokeWidth="0.9"
              />
              <line x1="165" y1="47" x2="170" y2="47" stroke="#f59e0b" strokeWidth="0.9" />

              {/* ========== 5. LIGHTING CLUSTERS ========== */}
              {/* Jewel Projector Headlight Unit extending into fender */}
              <path
                d="M 226 52 L 241 58 L 238 64 L 222 58 Z"
                fill="url(#crystaChrome)"
                stroke="#64748b"
                strokeWidth="0.8"
              />
              <circle cx="233" cy="59" r="2.2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
              <circle cx="226" cy="56" r="1.8" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.6" />
              <path d="M 224 54 L 239 57" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />

              {/* Inverted L-Shaped Wrap-Around Taillamp */}
              <path
                d="M 26 51 L 30 51 L 29 64 L 24 64 L 24 58 Z"
                fill="#ef4444"
                stroke="#b91c1c"
                strokeWidth="0.8"
              />
              <rect x="25" y="57" width="3.5" height="2.5" fill="#fee2e2" />

              {/* ========== 6. OFFICIAL GREATER CHENNAI POLICE LIVERY & DECALS ========== */}
              {/* Primary Dual-Tone Navy & Crimson GCP Patrol Band */}
              <path
                d="M 26 59 L 235 59 L 230 65 L 26 65 Z"
                fill="url(#crystaGcpLivery)"
              />
              {/* Reflective Yellow Accent Pin-Stripe */}
              <path
                d="M 26 65 L 229 65 L 228 66.5 L 26 66.5 Z"
                fill="#f59e0b"
              />

              {/* Chrome Side Body Moulding (Lower Door Protector) */}
              <rect x="80" y="74" width="98" height="2.2" rx="1.1" fill="#334155" />
              <line x1="82" y1="75" x2="176" y2="75" stroke="url(#crystaChrome)" strokeWidth="1" />

              {/* Door Cutlines */}
              <line x1="80" y1="49" x2="80" y2="76" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="112" y1="49" x2="112" y2="76" stroke="#94a3b8" strokeWidth="0.8" />
              <line x1="166" y1="49" x2="164" y2="76" stroke="#94a3b8" strokeWidth="0.8" />

              {/* Chrome Door Handles */}
              <rect x="88" y="53" width="9" height="2" rx="1" fill="url(#crystaChrome)" stroke="#475569" strokeWidth="0.5" />
              <rect x="122" y="53" width="9" height="2" rx="1" fill="url(#crystaChrome)" stroke="#475569" strokeWidth="0.5" />

              {/* Official GCP Gold Crest Star Badge on Front Door */}
              <g transform="translate(138, 50)">
                <circle cx="8" cy="8" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />
                <polygon
                  points="8,2 9.8,6 14,6.5 10.5,9.5 11.8,14 8,11.5 4.2,14 5.5,9.5 2,6.5 6.2,6"
                  fill="#1e3a8a"
                />
              </g>

              {/* Official Decals: CHENNAI POLICE */}
              <text
                x="108"
                y="56.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="5"
                fontWeight="900"
                fill="#1e3a8a"
                letterSpacing="0.6"
              >
                CHENNAI POLICE
              </text>
              <text
                x="108"
                y="63.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="4"
                fontWeight="800"
                fill="#ffffff"
                letterSpacing="0.5"
              >
                INNOVA CRYSTA
              </text>

              {/* Rear Quarter Decal: DIAL 100 */}
              <text
                x="32"
                y="63.5"
                fontFamily="system-ui, -apple-system, sans-serif"
                fontSize="4.5"
                fontWeight="900"
                fill="#ffffff"
                letterSpacing="0.5"
              >
                DIAL 100
              </text>

              {/* Rear Bumper Step & Reflector */}
              <rect x="23" y="71" width="3.5" height="1.8" rx="0.5" fill="#dc2626" />
              <rect x="24" y="74" width="10" height="2.5" rx="1" fill="#1e293b" />

              {/* ========== 7. WHEELS (RIGIDLY ANCHORED VIA SVG NATIVE ANIMATETRANSFORM) ========== */}

              {/* REAR WHEEL (Center: X=64, Y=78) */}
              <g transform="translate(64, 78)">
                {/* Wheel Arch Flaring */}
                <path d="M -21 0 A 21 21 0 0 1 21 0" stroke="#0f172a" strokeWidth="3" fill="none" />
                {/* Rubber Tire with Tread */}
                <circle cx="0" cy="0" r="17" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                <circle cx="0" cy="0" r="15.5" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />

                {/* Disc Brake Rotor & Red Caliper (Mounted to axle, stationary) */}
                <circle cx="0" cy="0" r="11" fill="#475569" stroke="#334155" strokeWidth="0.8" />
                <path d="M -7 -7 A 10 10 0 0 1 -2 -9.5 L -2 -5 Z" fill="#b91c1c" />

                {/* Rotating Diamond-Cut Split-Spoke Alloy Rim (Rotates strictly around local axle 0,0) */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="0.65s"
                    repeatCount="indefinite"
                  />
                  {/* Dark Anthracite Inner Rim */}
                  <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

                  {/* 5 Distinctive Machined Twin-Spokes */}
                  <line x1="-1.3" y1="-10" x2="-1.3" y2="10" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="1.3" y1="-10" x2="1.3" y2="10" stroke="#f8fafc" strokeWidth="1.4" />

                  <line x1="-9.5" y1="-3.8" x2="9.5" y2="3.8" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="-9" y1="-1.6" x2="9" y2="1.6" stroke="#f8fafc" strokeWidth="1.4" />

                  <line x1="-6.8" y1="7.2" x2="6.8" y2="-7.2" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="-5" y1="8.8" x2="5" y2="-8.8" stroke="#f8fafc" strokeWidth="1.4" />

                  {/* Center Chrome Hubcap */}
                  <circle cx="0" cy="0" r="3.8" fill="url(#crystaChrome)" stroke="#334155" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="1.6" fill="#1e3a8a" />
                </g>
              </g>

              {/* FRONT WHEEL (Center: X=194, Y=78) */}
              <g transform="translate(194, 78)">
                {/* Wheel Arch Flaring */}
                <path d="M -21 0 A 21 21 0 0 1 21 0" stroke="#0f172a" strokeWidth="3" fill="none" />
                {/* Rubber Tire with Tread */}
                <circle cx="0" cy="0" r="17" fill="#1e293b" stroke="#0f172a" strokeWidth="3" />
                <circle cx="0" cy="0" r="15.5" fill="none" stroke="#334155" strokeWidth="0.8" strokeDasharray="2,2" />

                {/* Disc Brake Rotor & Red Caliper (Mounted to axle, stationary) */}
                <circle cx="0" cy="0" r="11" fill="#475569" stroke="#334155" strokeWidth="0.8" />
                <path d="M -7 -7 A 10 10 0 0 1 -2 -9.5 L -2 -5 Z" fill="#b91c1c" />

                {/* Rotating Diamond-Cut Split-Spoke Alloy Rim (Rotates strictly around local axle 0,0) */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 0 0"
                    to="360 0 0"
                    dur="0.65s"
                    repeatCount="indefinite"
                  />
                  {/* Dark Anthracite Inner Rim */}
                  <circle cx="0" cy="0" r="11" fill="#0f172a" stroke="#64748b" strokeWidth="1" />

                  {/* 5 Distinctive Machined Twin-Spokes */}
                  <line x1="-1.3" y1="-10" x2="-1.3" y2="10" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="1.3" y1="-10" x2="1.3" y2="10" stroke="#f8fafc" strokeWidth="1.4" />

                  <line x1="-9.5" y1="-3.8" x2="9.5" y2="3.8" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="-9" y1="-1.6" x2="9" y2="1.6" stroke="#f8fafc" strokeWidth="1.4" />

                  <line x1="-6.8" y1="7.2" x2="6.8" y2="-7.2" stroke="#f8fafc" strokeWidth="1.4" />
                  <line x1="-5" y1="8.8" x2="5" y2="-8.8" stroke="#f8fafc" strokeWidth="1.4" />

                  {/* Center Chrome Hubcap */}
                  <circle cx="0" cy="0" r="3.8" fill="url(#crystaChrome)" stroke="#334155" strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="1.6" fill="#1e3a8a" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

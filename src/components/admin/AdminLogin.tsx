"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ShieldCheck, Lock, User, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (user: { username: string; role: string }) => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // MFA States
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [challengeId, setChallengeId] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [useRecoveryCode, setUseRecoveryCode] = useState(false);
  const [trustDevice, setTrustDevice] = useState(true);

  // CAPTCHA States
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaSvg, setCaptchaSvg] = useState("");
  const [captchaLoading, setCaptchaLoading] = useState(false);

  const refreshCaptcha = async () => {
    setCaptchaLoading(true);
    setCaptchaInput("");
    try {
      const res = await fetch("/api/admin/captcha");
      if (res.ok) {
        const data = await res.json();
        setCaptchaToken(data.captchaToken || "");
        setCaptchaSvg(data.captchaSvg || "");
      }
    } catch (err) {
      console.error("Failed to fetch CAPTCHA challenge:", err);
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captchaInput.trim()) {
      setError("Invalid security verification code. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captchaInput, captchaToken }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.mfa_required) {
          setIsMfaStep(true);
          setChallengeId(data.challenge_id || "");
          setMfaCode("");
          setError(null);
        } else {
          onLoginSuccess(data.user);
        }
      } else {
        setError(data.error || "INVALID USERNAME OR PASSWORD");
        refreshCaptcha();
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please try again.");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        challenge_id: challengeId,
        username,
        trust_device: trustDevice,
      };

      if (useRecoveryCode) {
        payload.recovery_code = mfaCode;
      } else {
        payload.code = mfaCode;
      }

      const res = await fetch("/api/admin/mfa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Verification code is invalid or expired.");
      }
    } catch {
      setError("Unable to verify your code. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 relative"
      style={{
        background: "linear-gradient(135deg, #f0f4f8 0%, #e8eef5 50%, #dde6f0 100%)",
      }}
    >
      <style>{`
        /* ── Radar pulse ── */
        @keyframes radar {
          0%   { r: 4;  opacity: 0.9; }
          100% { r: 60; opacity: 0; }
        }
        .radar-ring { animation: radar 3s ease-out infinite; }
        .radar-ring-2 { animation: radar 3s ease-out infinite 1.5s; }

        /* ── GPS location pulse rings ── */
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.85; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .gps-pulse-ring-1 {
          transform-origin: 0px 0px;
          animation: pulse-ring 2.6s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
        }
        .gps-pulse-ring-2 {
          transform-origin: 0px 0px;
          animation: pulse-ring 3.0s cubic-bezier(0.215, 0.610, 0.355, 1) infinite 0.8s;
        }
        .gps-pulse-ring-3 {
          transform-origin: 0px 0px;
          animation: pulse-ring 3.4s cubic-bezier(0.215, 0.610, 0.355, 1) infinite 1.6s;
        }

        /* ── GPS location markers fade in/out ── */
        @keyframes gps-fade-1 {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1.0; }
        }
        @keyframes gps-fade-2 {
          0%, 100% { opacity: 1.0; }
          50% { opacity: 0.35; }
        }
        @keyframes gps-fade-3 {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.95; }
        }
        .gps-marker-fade-1 { animation: gps-fade-1 3.8s ease-in-out infinite; }
        .gps-marker-fade-2 { animation: gps-fade-2 4.2s ease-in-out infinite; }
        .gps-marker-fade-3 { animation: gps-fade-3 4.6s ease-in-out infinite; }

        /* ── Road lane dash (static) ── */
        .lane-dash { stroke-dashoffset: 0; }

        /* ── Emergency Beacons Flashing ── */
        @keyframes police-red-flash {
          0%, 30%, 100% { fill: rgba(239, 68, 68, 0); filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0)); }
          15% { fill: rgba(239, 68, 68, 1); filter: drop-shadow(0 0 15px rgba(239, 68, 68, 1)) drop-shadow(0 0 30px rgba(239, 68, 68, 0.8)); }
        }
        @keyframes police-blue-flash {
          0%, 50%, 100% { fill: rgba(59, 130, 246, 0); filter: drop-shadow(0 0 0 rgba(59, 130, 246, 0)); }
          65% { fill: rgba(59, 130, 246, 1); filter: drop-shadow(0 0 15px rgba(59, 130, 246, 1)) drop-shadow(0 0 30px rgba(59, 130, 246, 0.8)); }
        }
        .beacon-red { animation: police-red-flash 1.0s infinite; }
        .beacon-blue { animation: police-blue-flash 1.0s infinite; }

        /* ── Road reflections ── */
        @keyframes road-red-glow {
          0%, 30%, 100% { opacity: 0; }
          15% { opacity: 0.65; }
        }
        @keyframes road-blue-glow {
          0%, 50%, 100% { opacity: 0; }
          65% { opacity: 0.65; }
        }
        .road-glow-red { animation: road-red-glow 1.0s infinite; mix-blend-mode: screen; }
        .road-glow-blue { animation: road-blue-glow 1.0s infinite; mix-blend-mode: screen; }

        /* ── Vehicle body reflection ── */
        @keyframes reflect-red {
          0%, 30%, 100% { opacity: 0; }
          15% { opacity: 0.8; }
        }
        @keyframes reflect-blue {
          0%, 50%, 100% { opacity: 0; }
          65% { opacity: 0.8; }
        }
        .vehicle-reflect-red { animation: reflect-red 1.0s infinite; mix-blend-mode: overlay; }
        .vehicle-reflect-blue { animation: reflect-blue 1.0s infinite; mix-blend-mode: overlay; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          COMMAND CENTER BACKGROUND
      ═══════════════════════════════════════════════════════════ */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
           style={{ background: "linear-gradient(160deg, #edf2f7 0%, #e2eaf4 40%, #d8e4f0 100%)" }}>

        <svg width="100%" height="100%" viewBox="0 0 1200 750"
             preserveAspectRatio="xMidYMid slice">
          <defs>

            {/* Fine HUD grid */}
            <pattern id="hud-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="rgba(30,64,175,0.045)" strokeWidth="0.8"/>
            </pattern>
            <pattern id="hud-dot" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="0" cy="0" r="1.2" fill="rgba(212,175,55,0.18)"/>
            </pattern>

            {/* Road asphalt gradient */}
            <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#0b0f17"/>
              <stop offset="12%"  stopColor="#141a26"/>
              <stop offset="50%"  stopColor="#212a3d"/>
              <stop offset="88%"  stopColor="#141a26"/>
              <stop offset="100%" stopColor="#0b0f17"/>
            </linearGradient>

            {/* Road shoulder strip */}
            <linearGradient id="shoulder" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#c8a84b"/>
              <stop offset="100%" stopColor="#a07830"/>
            </linearGradient>

            {/* Fog/neon glow around road */}
            <filter id="road-fog-filter" x="-10%" y="-60%" width="120%" height="220%">
              <feGaussianBlur stdDeviation="22"/>
            </filter>

            {/* Headlight beam filter */}
            <filter id="beam-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6"/>
            </filter>

            {/* Siren bloom */}
            <filter id="siren-bloom" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="5" result="b"/>
              <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>

            {/* SUV drop shadow */}
            <filter id="suv-shadow" x="-20%" y="-20%" width="140%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0a0f18" floodOpacity="0.5"/>
            </filter>

            {/* Road reflection gradients */}
            <radialGradient id="road-red-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.8)"/>
              <stop offset="50%" stopColor="rgba(239, 68, 68, 0.25)"/>
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)"/>
            </radialGradient>
            <radialGradient id="road-blue-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.8)"/>
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.25)"/>
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)"/>
            </radialGradient>

            {/* Vehicle body reflection gradients */}
            <radialGradient id="red-reflection-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.5)"/>
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)"/>
            </radialGradient>
            <radialGradient id="blue-reflection-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.5)"/>
              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)"/>
            </radialGradient>

            {/* Headlight beam gradient */}
            <linearGradient id="headlight-beam" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)"/>
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)"/>
            </linearGradient>

            {/* Shadow blur filter */}
            <filter id="suv-shadow-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4"/>
            </filter>

          </defs>

          {/* ── HUD grid layers ── */}
          <rect width="1200" height="750" fill="url(#hud-grid)"/>
          <rect width="1200" height="750" fill="url(#hud-dot)"/>

          {/* ── Faint city street lines (Chennai map suggestion) ── */}
          {/* Horizontal roads */}
          <line x1="0"    y1="180" x2="1200" y2="180" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          <line x1="0"    y1="310" x2="1200" y2="310" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          <line x1="0"    y1="460" x2="1200" y2="460" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          {/* Vertical roads */}
          <line x1="220"  y1="0"   x2="220"  y2="750" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          <line x1="480"  y1="0"   x2="480"  y2="750" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          <line x1="720"  y1="0"   x2="720"  y2="750" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          <line x1="980"  y1="0"   x2="980"  y2="750" stroke="rgba(30,64,175,0.04)" strokeWidth="1.5"/>
          {/* Diagonal connectors */}
          <line x1="0"    y1="0"   x2="480"  y2="310" stroke="rgba(30,64,175,0.025)" strokeWidth="1"/>
          <line x1="720"  y1="460" x2="1200" y2="750" stroke="rgba(30,64,175,0.025)" strokeWidth="1"/>
          <line x1="220"  y1="750" x2="720"  y2="310" stroke="rgba(30,64,175,0.02)"  strokeWidth="1"/>

          {/* ── Coastline hint (Bay of Bengal) ── */}
          <path d="M 1050,-30 C 1030,150 1000,350 1040,550 T 1000,780 L 1250,780 L 1250,-30 Z"
                fill="rgba(30,64,175,0.03)" stroke="rgba(30,64,175,0.06)" strokeWidth="1.5"/>
          <text x="1095" y="380" fill="rgba(30,64,175,0.1)" fontSize="10" fontWeight="800"
                letterSpacing="4" transform="rotate(90,1095,380)" textAnchor="middle">
            BAY OF BENGAL
          </text>

          {/* ══════════════════════════════════════════
              STRAIGHT NATIONAL HIGHWAY (horizontal)
              Running across y = 560..650
          ══════════════════════════════════════════ */}

          {/* Outer grass/shoulder bands */}
          <rect x="-50" y="545" width="1300" height="10" fill="rgba(34,197,94,0.12)" rx="2"/>
          <rect x="-50" y="649" width="1300" height="10" fill="rgba(34,197,94,0.12)" rx="2"/>

          {/* Yellow shoulder stripe */}
          <rect x="-50" y="554" width="1300" height="4" fill="url(#shoulder)" opacity="0.9"/>
          <rect x="-50" y="646" width="1300" height="4" fill="url(#shoulder)" opacity="0.9"/>

          {/* Main asphalt body */}
          <rect x="-50" y="558" width="1300" height="88" fill="url(#asphalt)"/>

          {/* Road surface texture bands */}
          <rect x="-50" y="558" width="1300" height="2"  fill="rgba(255,255,255,0.06)"/>
          <rect x="-50" y="644" width="1300" height="2"  fill="rgba(255,255,255,0.06)"/>

          {/* Top & bottom neon edge lines */}
          <rect x="-50" y="557" width="1300" height="1.5" fill="#38bdf8" opacity="0.55"/>
          <rect x="-50" y="645" width="1300" height="1.5" fill="#38bdf8" opacity="0.55"/>

          {/* Center dashed lane divider (animated flow) */}
          <line x1="-50" y1="603" x2="1250" y2="603"
                stroke="white" strokeWidth="2.5" strokeDasharray="28 22" opacity="0.75"
                className="lane-dash"/>

          {/* Subtle road wear marks */}
          <rect x="100"  y="570" width="60"  height="3" rx="1" fill="rgba(255,255,255,0.05)"/>
          <rect x="400"  y="635" width="80"  height="3" rx="1" fill="rgba(255,255,255,0.05)"/>
          <rect x="800"  y="570" width="50"  height="3" rx="1" fill="rgba(255,255,255,0.05)"/>

          {/* Grounding Shadow beneath SUV */}
          <ellipse cx="199" cy="665" rx="396" ry="20" fill="#000000" opacity="0.65" filter="url(#suv-shadow-blur)"/>

          {/* Soft Road Flashing Glows (Enhanced) */}
          <ellipse cx="16" cy="660" rx="240" ry="40" fill="url(#road-red-grad)" className="road-glow-red" />
          <ellipse cx="327" cy="660" rx="240" ry="40" fill="url(#road-blue-grad)" className="road-glow-blue" />

          {/* Premium Tamil Nadu Police Patrol SUV (Mahindra Scorpio style, facing right) - Scaled 25-35% larger */}
          <image
            href="/images/patrol_suv.png"
            x="-210"
            y="305"
            width="820"
            height="365"
          />

          {/* Subtle Headlight Glow */}
          <ellipse cx="505" cy="486" rx="45" ry="30" fill="rgba(255, 255, 255, 0.25)" filter="url(#beam-blur)" style={{ mixBlendMode: 'screen' }} />
          <path d="M 505 486 L 705 526 L 705 466 Z" fill="url(#headlight-beam)" opacity="0.15" style={{ mixBlendMode: 'screen' }} />

          {/* Body Reflections (Color Dodge glows on car surface) */}
          <ellipse cx="129" cy="426" rx="100" ry="70" fill="url(#red-reflection-grad)" className="vehicle-reflect-red" />
          <ellipse cx="214" cy="426" rx="100" ry="70" fill="url(#blue-reflection-grad)" className="vehicle-reflect-blue" />

          {/* Glowing Animated Beacons on Roof Light Bar (Enhanced) */}
          <ellipse cx="149" cy="330" rx="28" ry="10" fill="rgba(239, 68, 68, 0)" className="beacon-red" />
          <ellipse cx="182" cy="330" rx="28" ry="10" fill="rgba(59, 130, 246, 0)" className="beacon-blue" />



          {/* ══════════════════════════════════════════
              MAP OVERLAYS & LOCATION MARKERS
          ══════════════════════════════════════════ */}

          {/* Faint Chennai Road Network Lines (enhanced grid) */}
          <line x1="0" y1="120" x2="1200" y2="120" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="0" y1="240" x2="1200" y2="240" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="0" y1="380" x2="1200" y2="380" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="0" y1="500" x2="1200" y2="500" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>

          <line x1="120" y1="0" x2="120" y2="750" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="340" y1="0" x2="340" y2="750" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="580" y1="0" x2="580" y2="750" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>
          <line x1="840" y1="0" x2="840" y2="750" stroke="rgba(30,64,175,0.035)" strokeWidth="1.2"/>

          {/* Curved arterial bypasses */}
          <path d="M 100,50 Q 300,400 550,750" fill="none" stroke="rgba(30,64,175,0.02)" strokeWidth="1.5"/>
          <path d="M 0,300 Q 600,320 1200,600" fill="none" stroke="rgba(30,64,175,0.015)" strokeWidth="1.5"/>
          <path d="M 800,0 Q 900,350 1100,750" fill="none" stroke="rgba(30,64,175,0.02)" strokeWidth="1.5"/>

          {/* Faint Chennai District Boundaries */}
          <path d="M 150,0 C 250,150 200,300 350,420 C 450,500 400,600 500,750" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="1.5" strokeDasharray="6 8"/>
          <path d="M 600,0 C 580,200 680,350 780,490 C 820,550 900,650 950,750" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="1.5" strokeDasharray="6 8"/>
          <path d="M 0,250 C 300,200 600,350 1000,350" fill="none" stroke="rgba(212,175,55,0.08)" strokeWidth="1.5" strokeDasharray="6 8"/>

          {/* Radar pulse — top-right quadrant */}
          <g transform="translate(950, 180)">
            <circle cx="0" cy="0" r="4" fill="#1e40af" opacity="0.8"/>
            <circle cx="0" cy="0" r="4" fill="none" stroke="#1e40af" strokeWidth="1.5" className="radar-ring"/>
            <circle cx="0" cy="0" r="4" fill="none" stroke="#1e40af" strokeWidth="1"   className="radar-ring-2"/>
            <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(30,64,175,0.12)" strokeWidth="1"/>
            <line x1="0" y1="-70" x2="0" y2="70" stroke="rgba(30,64,175,0.12)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(30,64,175,0.08)" strokeWidth="1"/>
            <circle cx="0" cy="0" r="45" fill="none" stroke="rgba(30,64,175,0.06)" strokeWidth="1"/>
          </g>

          {/* GPS pin 1 — Commissioner Office (Vepery) */}
          <g transform="translate(500, 280)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Commissioner Office (Vepery)</text>
            </g>
          </g>

          {/* GPS pin 2 — Egmore */}
          <g transform="translate(460, 340)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Egmore</text>
            </g>
          </g>

          {/* GPS pin 3 — Royapuram */}
          <g transform="translate(650, 140)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Royapuram</text>
            </g>
          </g>

          {/* GPS pin 4 — T. Nagar */}
          <g transform="translate(400, 420)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">T. Nagar</text>
            </g>
          </g>

          {/* GPS pin 5 — Anna Nagar */}
          <g transform="translate(300, 260)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Anna Nagar</text>
            </g>
          </g>

          {/* GPS pin 6 — Velachery */}
          <g transform="translate(480, 510)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Velachery</text>
            </g>
          </g>

          {/* GPS pin 7 — Adyar */}
          <g transform="translate(580, 480)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Adyar</text>
            </g>
          </g>

          {/* GPS pin 8 — Guindy */}
          <g transform="translate(420, 480)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Guindy</text>
            </g>
          </g>

          {/* GPS pin 9 — Tambaram */}
          <g transform="translate(180, 530)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Tambaram</text>
            </g>
          </g>

          {/* GPS pin 10 — Porur */}
          <g transform="translate(160, 400)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Porur</text>
            </g>
          </g>

          {/* GPS pin 11 — Madhavaram */}
          <g transform="translate(380, 100)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Madhavaram</text>
            </g>
          </g>

          {/* GPS pin 12 — Perambur */}
          <g transform="translate(410, 180)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Perambur</text>
            </g>
          </g>

          {/* GPS pin 13 — Mylapore */}
          <g transform="translate(610, 400)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Mylapore</text>
            </g>
          </g>

          {/* GPS pin 14 — Marina Beach */}
          <g transform="translate(690, 330)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Marina Beach</text>
            </g>
          </g>

          {/* GPS pin 15 — Central Railway Station */}
          <g transform="translate(560, 260)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Central Railway Station</text>
            </g>
          </g>

          {/* GPS pin 16 — Airport */}
          <g transform="translate(240, 490)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Airport</text>
            </g>
          </g>

          {/* GPS pin 17 — OMR */}
          <g transform="translate(640, 520)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">OMR</text>
            </g>
          </g>

          {/* GPS pin 18 — ECR */}
          <g transform="translate(720, 530)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">ECR</text>
            </g>
          </g>

          {/* GPS pin 19 — Ambattur */}
          <g transform="translate(200, 250)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-1" />
            <g className="gps-marker-fade-2">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Ambattur</text>
            </g>
          </g>

          {/* GPS pin 20 — Sholinganallur */}
          <g transform="translate(660, 545)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-2" />
            <g className="gps-marker-fade-3">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Sholinganallur</text>
            </g>
          </g>

          {/* GPS pin 21 — Avadi */}
          <g transform="translate(110, 220)">
            <circle cx="0" cy="0" r="10" fill="none" stroke="#1e40af" strokeWidth="1" className="gps-pulse-ring-3" />
            <g className="gps-marker-fade-1">
              <path d="M 0,-10 C -3.5,-10 -5.5,-7 0,0 C 5.5,-7 3.5,-10 0,-10 Z" fill="#1e40af" stroke="#d4af37" strokeWidth="0.8"/>
              <circle cx="0" cy="-6.5" r="2.2" fill="#ed1b24"/>
              <text x="6" y="-3" fill="rgba(30,64,175,0.6)" fontSize="7.5" fontWeight="800">Avadi</text>
            </g>
          </g>

          {/* Road name label */}
          <text x="600" y="553" fill="rgba(255,255,255,0.25)" fontSize="9" fontWeight="700"
                letterSpacing="4" textAnchor="middle">NATIONAL HIGHWAY 48 · GRAND SOUTHERN TRUNK ROAD</text>

        </svg>

        {/* ── "Patrolling Chennai City" corner badge ── */}
        <div style={{
          position: "absolute", bottom: "14px", left: "18px",
          display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(17,24,39,0.72)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(30,64,175,0.4)",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "rgba(255,255,255,0.85)",
          fontSize: "10px",
          fontWeight: "800",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>
          <span className="patrol-dot" style={{
            display: "inline-block", width: "7px", height: "7px",
            borderRadius: "50%", background: "#ed1b24",
            boxShadow: "0 0 8px #ed1b24",
          }}/>
          Patrolling Chennai City
        </div>

        {/* ── System clock label ── */}
        <div style={{
          position: "absolute", bottom: "14px", right: "18px",
          background: "rgba(17,24,39,0.72)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(30,64,175,0.3)",
          borderRadius: "8px",
          padding: "6px 12px",
          color: "rgba(212,175,55,0.9)",
          fontSize: "9px",
          fontWeight: "700",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}>
          ● GCP Command Center · Live
        </div>

      </div>

      {/* ── Login card beacon border glow wrapper ── */}


      {/* Decorative top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{ background: "linear-gradient(90deg, #ed1b24, #1e40af, #d4af37)" }}
      />

      {/* Login Card */}
      <div
        className="w-full max-w-md relative z-10 rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(30,64,175,0.12), 0 0 0 1px rgba(30,64,175,0.08)",
        }}
      >
        {/* Navy Blue Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #172554 0%, #1e40af 60%, #1e3a8a 100%)",
          }}
          className="px-8 pt-8 pb-6 text-center"
        >
          {/* Police Logo */}
          <div
            className="relative w-20 h-20 mx-auto mb-4 rounded-full p-1.5 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(212,175,55,0.6)",
            }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Logo"
                fill
                className="object-contain p-1"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </div>
          </div>

          {/* Branding */}
          <h1
            className="font-black text-white text-xl tracking-widest uppercase mb-1"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "0.12em" }}
          >
            Chennai Guardian
          </h1>
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "#d4af37", letterSpacing: "0.15em" }}
          >
            Administrative Command Portal
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.3)" }} />
            <ShieldCheck className="w-4 h-4" style={{ color: "#d4af37" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(212,175,55,0.3)" }} />
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-7 space-y-5" style={{ background: "#ffffff" }}>
          
          {/* Section label */}
          <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            {isMfaStep ? "Multi-Factor Authentication" : "Secure Sign In"}
          </p>

          {/* Error Alert */}
          {error && (
            <div
              className="flex items-start gap-2.5 p-3.5 rounded-xl text-xs leading-relaxed"
              style={{
                background: "#fff1f2",
                border: "1px solid #fecdd3",
                color: "#be123c",
              }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isMfaStep ? (
            /* ── DEDICATED MFA VERIFICATION FORM ── */
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 bg-[#1e40af]/10 border border-[#1e40af]/30 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6 text-[#1e40af]" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                  {useRecoveryCode ? "Emergency Recovery Code" : "Authenticator Code Required"}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {useRecoveryCode
                    ? "Enter one of your 10-character single-use emergency recovery codes."
                    : "Enter the 6-digit verification code from your authenticator app."}
                </p>
              </div>

              {/* MFA Code Input */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">
                  {useRecoveryCode ? "10-Character Recovery Code" : "6-Digit Authenticator Code"}
                </label>
                {useRecoveryCode ? (
                  <input
                    type="text"
                    required
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX"
                    className="w-full text-center text-lg font-mono font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-[#1e40af] rounded-xl focus:outline-none uppercase text-slate-900"
                  />
                ) : (
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="000000"
                    className="w-full text-center text-2xl font-mono font-black tracking-[0.5em] px-4 py-3 bg-slate-50 border-2 border-[#1e40af] rounded-xl focus:outline-none text-slate-900"
                  />
                )}
              </div>

              {/* Trust Device Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="trust_device"
                  checked={trustDevice}
                  onChange={(e) => setTrustDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#1e40af] focus:ring-[#1e40af] cursor-pointer"
                />
                <label htmlFor="trust_device" className="text-xs text-slate-600 font-bold cursor-pointer select-none">
                  Trust this device for 30 days
                </label>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={loading || !mfaCode}
                className="w-full py-3.5 rounded-xl font-black tracking-widest text-xs uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Continue</span>
                  </>
                )}
              </button>

              {/* Toggle Recovery Code / Back */}
              <div className="flex flex-col gap-2 pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseRecoveryCode(!useRecoveryCode);
                    setMfaCode("");
                    setError(null);
                  }}
                  className="text-xs font-bold text-[#1e40af] hover:underline cursor-pointer"
                >
                  {useRecoveryCode ? "Use Authenticator App Code" : "Use Recovery Code"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsMfaStep(false);
                    setError(null);
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* ── STANDARD PASSWORD + CAPTCHA LOGIN FORM ── */
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div className="space-y-1.5">
                <label
                  className="block text-[11px] font-black uppercase tracking-wider"
                  style={{ color: "#374151" }}
                >
                  Username
                </label>
                <div className="relative flex items-center">
                  <User
                    className="absolute left-3.5 w-4 h-4 pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full text-sm py-3.5 pl-10 pr-4 rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      color: "#1e293b",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1.5px solid #1e40af";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,64,175,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1.5px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    className="block text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "#374151" }}
                  >
                    Password
                  </label>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Contact your system Super Administrator to reset access credentials.");
                    }}
                    className="text-[11px] font-bold transition-colors duration-200"
                    style={{ color: "#1e40af" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#ed1b24")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#1e40af")}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="relative flex items-center">
                  <Lock
                    className="absolute left-3.5 w-4 h-4 pointer-events-none"
                    style={{ color: "#94a3b8" }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm py-3.5 pl-10 pr-11 rounded-xl outline-none transition-all duration-200"
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                      color: "#1e293b",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1.5px solid #1e40af";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,64,175,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1.5px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="captchaInput"
                    className="block text-[11px] font-black uppercase tracking-wider text-slate-700 cursor-pointer"
                  >
                    Security Verification Code
                  </label>
                  <span className="text-[10px] font-bold text-slate-400">Single-use Challenge</span>
                </div>
                
                {/* CAPTCHA Display + Refresh Button */}
                <div className="flex items-stretch gap-2.5">
                  <div className="flex-1 min-h-[46px] rounded-xl overflow-hidden flex items-center justify-center relative select-none border bg-slate-900 border-slate-300 shadow-inner">
                    {captchaSvg ? (
                      <img
                        src={captchaSvg}
                        alt="Security Verification Challenge"
                        className="w-full h-full object-contain pointer-events-none select-none max-h-[46px]"
                      />
                    ) : (
                      <div className="text-xs text-slate-400 font-medium animate-pulse">
                        Generating Challenge...
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    disabled={captchaLoading}
                    title="Refresh Verification Code"
                    aria-label="Refresh security verification code"
                    className="px-3.5 min-h-[46px] bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[#1e40af] rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 shrink-0 ${captchaLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {/* Accessible Form Control Input */}
                <div className="relative flex items-center">
                  <input
                    id="captchaInput"
                    name="captchaInput"
                    type="text"
                    required
                    tabIndex={0}
                    autoComplete="off"
                    placeholder="Enter the result above (e.g. 12)"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className="w-full text-sm min-h-[46px] py-3 pl-4 pr-4 rounded-xl outline-none transition-all duration-200 font-mono tracking-wider text-slate-900 placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400 font-bold"
                    style={{
                      background: "#f8fafc",
                      border: "1.5px solid #e2e8f0",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1.5px solid #1e40af";
                      e.currentTarget.style.background = "#fff";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(30,64,175,0.08)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1.5px solid #e2e8f0";
                      e.currentTarget.style.background = "#f8fafc";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>


              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-black tracking-widest text-xs uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 bg-[#1e40af] hover:bg-[#1e3a8a] text-white shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Authorize Access</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-4 text-center text-[10px] leading-relaxed"
          style={{
            background: "#f8fafc",
            borderTop: "1px solid #e2e8f0",
            color: "#94a3b8",
          }}
        >
          🔒 This is a secured government information system. Unauthorized access is strictly prohibited.
        </div>
      </div>
    </div>
  );
}

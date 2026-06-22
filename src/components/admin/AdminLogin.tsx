"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Authentication failed. Please check your credentials.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failure. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #f0f4f8 0%, #e8eef5 50%, #dde6f0 100%)",
      }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(46,49,146,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(46,49,146,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Decorative top bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-50"
        style={{ background: "linear-gradient(90deg, #ed1b24, #2e3192, #c5a059)" }}
      />

      {/* Login Card */}
      <div
        className="w-full max-w-md relative z-10 rounded-2xl overflow-hidden"
        style={{
          background: "#ffffff",
          boxShadow:
            "0 4px 6px rgba(0,0,0,0.04), 0 20px 60px rgba(46,49,146,0.12), 0 0 0 1px rgba(46,49,146,0.08)",
        }}
      >
        {/* Navy Blue Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1f6b 0%, #2e3192 60%, #1e2578 100%)",
          }}
          className="px-8 pt-8 pb-6 text-center"
        >
          {/* Police Logo */}
          <div
            className="relative w-20 h-20 mx-auto mb-4 rounded-full p-1.5 shadow-lg"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(197,160,89,0.6)",
            }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Logo"
                fill
                className="object-contain p-1"
              />
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
            style={{ color: "#c5a059", letterSpacing: "0.15em" }}
          >
            Administrative Command Portal
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mt-5">
            <div className="flex-1 h-px" style={{ background: "rgba(197,160,89,0.3)" }} />
            <ShieldCheck className="w-4 h-4" style={{ color: "#c5a059" }} />
            <div className="flex-1 h-px" style={{ background: "rgba(197,160,89,0.3)" }} />
          </div>
        </div>

        {/* Form Section */}
        <div className="px-8 py-7 space-y-5" style={{ background: "#ffffff" }}>
          
          {/* Section label */}
          <p className="text-center text-xs font-bold uppercase tracking-widest" style={{ color: "#64748b" }}>
            Secure Sign In
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
                    e.currentTarget.style.border = "1.5px solid #2e3192";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(46,49,146,0.08)";
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
                  style={{ color: "#2e3192" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#ed1b24")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#2e3192")}
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
                    e.currentTarget.style.border = "1.5px solid #2e3192";
                    e.currentTarget.style.background = "#fff";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(46,49,146,0.08)";
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
                  className="absolute right-3.5 cursor-pointer transition-colors duration-200"
                  style={{ color: "#94a3b8" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#2e3192")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded cursor-pointer"
                style={{ accentColor: "#2e3192", width: "15px", height: "15px" }}
              />
              <label
                htmlFor="remember-me"
                className="text-xs cursor-pointer select-none font-medium"
                style={{ color: "#64748b" }}
              >
                Keep me signed in on this device
              </label>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black tracking-widest text-xs uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 mt-2"
              style={{
                background: loading ? "#9ca3af" : "linear-gradient(135deg, #ed1b24 0%, #c0161e 100%)",
                color: "#ffffff",
                border: "none",
                boxShadow: loading ? "none" : "0 4px 15px rgba(237,27,36,0.35)",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #c0161e 0%, #a01219 100%)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(237,27,36,0.45)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = "linear-gradient(135deg, #ed1b24 0%, #c0161e 100%)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(237,27,36,0.35)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
                  />
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

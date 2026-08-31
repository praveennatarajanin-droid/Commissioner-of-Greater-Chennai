"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, QrCode, Key, Copy, Download, Check, AlertTriangle, X, RefreshCw, ArrowRight, CheckCircle2 } from "lucide-react";

interface MfaEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MfaEnrollmentModal({ isOpen, onClose, onSuccess }: MfaEnrollmentModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2 state
  const [secret, setSecret] = useState("");
  const [qrSvg, setQrSvg] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [manualCopySuccess, setManualCopySuccess] = useState(false);

  // Step 3 state
  const [totpCode, setTotpCode] = useState("");

  // Step 4 state
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [codesCopySuccess, setCodesCopySuccess] = useState(false);

  if (!isOpen) return null;

  // Step 1: Confirm Password -> Start Enrollment
  const handleStartEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSecret(data.secret);
        setQrSvg(data.qr_svg);
        setProvisioningUri(data.provisioning_uri);
        setStep(2);
      } else {
        setError(data.error || "Password verification failed.");
      }
    } catch {
      setError("Network error starting MFA enrollment.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify TOTP Code -> Activate MFA
  const handleVerifyEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/mfa/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", secret, code: totpCode }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRecoveryCodes(data.recovery_codes || []);
        setStep(4);
      } else {
        setError(data.error || "Invalid verification code.");
      }
    } catch {
      setError("Network error verifying MFA code.");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setManualCopySuccess(true);
    setTimeout(() => setManualCopySuccess(false), 2000);
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCodesCopySuccess(true);
    setTimeout(() => setCodesCopySuccess(false), 2000);
  };

  const downloadRecoveryCodes = () => {
    const text = `GREATER CHENNAI POLICE COMMISSIONER PORTAL\nEMERGENCY MFA RECOVERY CODES\nGenerated: ${new Date().toLocaleString()}\n\n` +
      recoveryCodes.map((code, i) => `${i + 1}. ${code}`).join("\n") +
      `\n\nKEEP THESE RECOVERY CODES SAFE. EACH CODE CAN BE USED ONCE.`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GCP_MFA_Recovery_Codes_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-fade-in font-sans text-left">
      <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 text-slate-800 dark:text-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1e40af]/10 border border-[#1e40af]/30 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#1e40af] dark:text-brand-gold" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-white">
                MFA Authenticator Setup
              </h3>
              <p className="text-[10px] text-slate-400">Step {step} of 4 &middot; RFC 6238 TOTP Protection</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CONFIRM PASSWORD */}
        {step === 1 && (
          <form onSubmit={handleStartEnrollment} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
              Please re-enter your current password to confirm identity before generating your TOTP authenticator secret.
            </p>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-stone-400">
                Current Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter current password..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#1e40af] font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1e40af] hover:bg-[#1b3899] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Confirm Password & Continue"}
            </button>
          </form>
        )}

        {/* STEP 2: DISPLAY QR CODE & MANUAL SECRET */}
        {step === 2 && (
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-600 dark:text-stone-300 font-medium">
              Scan this QR Code with your authenticator application (Google Authenticator, Microsoft Authenticator, Authy, or Bitwarden).
            </p>

            {/* QR Code Container */}
            <div className="flex justify-center my-3">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-md inline-block" dangerouslySetInnerHTML={{ __html: qrSvg }} />
            </div>

            {/* Manual Secret Fallback */}
            <div className="p-3 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl text-left space-y-1">
              <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider block">Manual Entry Code</span>
              <div className="flex items-center justify-between font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                <span className="tracking-widest">{secret}</span>
                <button type="button" onClick={copySecret} className="p-1 hover:bg-slate-200 dark:hover:bg-stone-800 rounded transition cursor-pointer">
                  {manualCopySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1e40af] hover:bg-[#1b3899] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Next: Enter Verification Code <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 3: VERIFY TOTP CODE */}
        {step === 3 && (
          <form onSubmit={handleVerifyEnrollment} className="space-y-4 text-center">
            <p className="text-xs text-slate-600 dark:text-stone-300 font-medium">
              Enter the 6-digit security code generated by your authenticator application to verify setup.
            </p>

            <div className="flex justify-center my-4">
              <input
                type="text"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="000000"
                className="w-48 text-center text-2xl font-mono font-black tracking-[0.5em] px-4 py-3 bg-slate-50 dark:bg-stone-950 border-2 border-[#1e40af] rounded-2xl focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-3 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 text-slate-700 dark:text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || totpCode.length !== 6}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Verify & Activate MFA"}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: DISPLAY ONE-TIME RECOVERY CODES */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Multi-Factor Authentication is active on your account!</span>
            </div>

            <p className="text-xs text-slate-600 dark:text-stone-300 font-medium leading-relaxed">
              Save these 10 one-time recovery codes in a secure location. If you lose access to your authenticator application, each code can be used once to sign in.
            </p>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-800 rounded-xl font-mono text-xs font-black text-slate-800 dark:text-stone-200">
              {recoveryCodes.map((code, idx) => (
                <div key={idx} className="p-1.5 bg-white dark:bg-stone-900 rounded border border-slate-150 dark:border-stone-800 text-center tracking-wider">
                  {code}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={copyRecoveryCodes}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-stone-800 hover:bg-slate-200 text-slate-700 dark:text-stone-300 text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                {codesCopySuccess ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />} Copy Codes
              </button>
              <button
                type="button"
                onClick={downloadRecoveryCodes}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1e40af] hover:bg-[#1b3899] text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download .txt
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition cursor-pointer mt-2"
            >
              Finish Setup
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

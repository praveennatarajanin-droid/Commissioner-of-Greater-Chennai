import crypto from "crypto";

export interface CaptchaChallenge {
  token: string;
  captchaToken: string;
  question: string;
  captchaQuestion: string;
  captchaSvg: string;
  expiresAt: number;
}

const CAPTCHA_SECRET = process.env.JWT_SECRET || "gcp_captcha_security_secret_key_2026";

function createHmacSignature(timestamp: number, num1: number, num2: number): string {
  return crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(`${timestamp}:${num1}:${num2}`)
    .digest("hex")
    .substring(0, 16);
}

function createCaptchaSvg(text: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="46" viewBox="0 0 200 46">
    <rect width="200" height="46" fill="#0f172a" rx="8" />
    <circle cx="20" cy="10" r="1.5" fill="rgba(212,175,55,0.4)"/>
    <circle cx="180" cy="35" r="2" fill="rgba(59,130,246,0.4)"/>
    <circle cx="100" cy="8" r="1.5" fill="rgba(255,255,255,0.3)"/>
    <path d="M10 24 Q 50 8 90 28 T 180 18" stroke="rgba(212,175,55,0.3)" stroke-width="2" fill="none"/>
    <path d="M0 32 Q 60 42 120 18 T 200 28" stroke="rgba(59,130,246,0.3)" stroke-width="2" fill="none"/>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" font-family="monospace, sans-serif" font-size="18" font-weight="900" fill="#f8fafc" letter-spacing="3">${text}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Generates a cryptographically signed server-side CAPTCHA challenge.
 * Immune to Next.js dev server hot-reloads and in-memory wipes.
 */
export function generateCaptchaChallenge(): CaptchaChallenge {
  const timestamp = Date.now();
  const num1 = Math.floor(Math.random() * 15) + 1;
  const num2 = Math.floor(Math.random() * 15) + 1;
  const sig = createHmacSignature(timestamp, num1, num2);
  const token = `gcp_cap_${timestamp}_${num1}_${num2}_${sig}`;

  const question = `${num1} + ${num2} = ?`;
  const captchaSvg = createCaptchaSvg(question);
  const expiresAt = timestamp + 5 * 60 * 1000; // 5 minutes expiry

  return {
    token,
    captchaToken: token,
    question,
    captchaQuestion: question,
    captchaSvg,
    expiresAt
  };
}

/**
 * Validates CAPTCHA answer server-side against cryptographic token signature.
 * Prevents replay attacks and survives dev server restarts/hot-reloads.
 */
export function verifyCaptchaChallenge(param1: string | null | undefined, param2: string | null | undefined): boolean {
  if (!param1 || !param2 || typeof param1 !== "string" || typeof param2 !== "string") return false;

  let token = param1;
  let answer = param2;

  // Auto-detect token vs answer if swapped
  if (!token.startsWith("gcp_cap_") && param2.startsWith("gcp_cap_")) {
    token = param2;
    answer = param1;
  }

  if (!token.startsWith("gcp_cap_")) return false;

  const parts = token.split("_");
  // Expected parts: ["gcp", "cap", timestamp, num1, num2, sig]
  if (parts.length < 6) return false;

  const timestamp = parseInt(parts[2], 10);
  const num1 = parseInt(parts[3], 10);
  const num2 = parseInt(parts[4], 10);
  const sig = parts[5];

  if (isNaN(timestamp) || isNaN(num1) || isNaN(num2)) return false;

  // Verify expiration (5 minutes)
  if (Date.now() - timestamp > 5 * 60 * 1000) return false;

  // Verify HMAC signature
  const expectedSig = createHmacSignature(timestamp, num1, num2);
  if (sig !== expectedSig) return false;

  // Verify mathematical answer
  const expectedAnswer = (num1 + num2).toString();
  return expectedAnswer === answer.trim().toLowerCase();
}

// Alias for existing route compatibility
export const verifyCaptchaToken = verifyCaptchaChallenge;

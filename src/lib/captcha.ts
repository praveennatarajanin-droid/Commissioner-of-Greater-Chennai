import crypto from "crypto";

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || "GCP_COMMISSIONER_PORTAL_CAPTCHA_SECRET_2026";
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// In-memory set to prevent single CAPTCHA token reuse
const usedTokens = new Set<string>();

const CAPTCHA_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

function getRandomChar(): string {
  const index = Math.floor(Math.random() * CAPTCHA_CHARS.length);
  return CAPTCHA_CHARS[index];
}

function getRandomColor(): string {
  const colors = ["#f59e0b", "#38bdf8", "#f43f5e", "#34d399", "#facc15", "#60a5fa", "#e879f9", "#ffffff"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomLineColor(): string {
  const colors = [
    "rgba(212,175,55,0.4)",
    "rgba(59,130,246,0.4)",
    "rgba(239,68,68,0.4)",
    "rgba(16,185,129,0.4)",
    "rgba(255,255,255,0.3)"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function generateCaptchaChallenge(): { captchaToken: string; captchaSvg: string } {
  // Generate 6 random characters
  let text = "";
  for (let i = 0; i < 6; i++) {
    text += getRandomChar();
  }

  const expiry = Date.now() + CAPTCHA_EXPIRY_MS;
  const signature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(text + ":" + expiry)
    .digest("hex");

  const captchaToken = `${signature}:${expiry}`;

  // Build distorted SVG image
  const width = 190;
  const height = 46;

  let svgElements = "";

  // 1. Background noise dots
  for (let i = 0; i < 45; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = (Math.random() * 1.5 + 0.5).toFixed(1);
    const opacity = (Math.random() * 0.4 + 0.1).toFixed(2);
    svgElements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#ffffff" opacity="${opacity}" />`;
  }

  // 2. Distorted background noise lines
  for (let i = 0; i < 6; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const strokeWidth = (Math.random() * 1.5 + 0.8).toFixed(1);
    const color = getRandomLineColor();
    svgElements += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${strokeWidth}" stroke-dasharray="4,2" />`;
  }

  // 3. Wavy curve overlay
  const qx1 = Math.floor(Math.random() * (width / 2));
  const qy1 = Math.floor(Math.random() * height);
  const qx2 = Math.floor(Math.random() * width);
  const qy2 = Math.floor(Math.random() * height);
  svgElements += `<path d="M 0 ${height / 2} Q ${qx1} ${qy1}, ${width / 2} ${height / 2} T ${width} ${qy2}" fill="none" stroke="rgba(212,175,55,0.45)" stroke-width="2" />`;

  // 4. Render 6 distorted characters with rotation, scale, and offset
  const charSpacing = Math.floor((width - 30) / 6);
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const x = 18 + i * charSpacing + (Math.random() * 4 - 2);
    const y = 31 + (Math.random() * 6 - 3);
    const angle = Math.floor(Math.random() * 44 - 22); // -22 to +22 deg
    const fontSize = Math.floor(Math.random() * 4 + 22); // 22px to 26px
    const color = getRandomColor();

    svgElements += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" fill="${color}" font-size="${fontSize}" font-family="monospace, sans-serif" font-weight="900" transform="rotate(${angle}, ${x}, ${y})" text-anchor="middle" letter-spacing="2">${char}</text>`;
  }

  const svgRaw = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #0f172a; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); select-none: none; user-select: none;">
    <rect width="${width}" height="${height}" fill="#0f172a" rx="8" />
    ${svgElements}
  </svg>`;

  const captchaSvg = `data:image/svg+xml;base64,${Buffer.from(svgRaw).toString("base64")}`;

  return { captchaToken, captchaSvg };
}

export function verifyCaptchaToken(captchaInput: string, captchaToken: string): boolean {
  if (!captchaInput || !captchaToken) return false;

  // Check token format
  const parts = captchaToken.split(":");
  if (parts.length !== 2) return false;

  const [signature, expiryStr] = parts;
  const expiry = parseInt(expiryStr, 10);

  // Check expiry
  if (isNaN(expiry) || Date.now() > expiry) {
    return false;
  }

  // Check single-use token consumption
  if (usedTokens.has(captchaToken)) {
    return false;
  }

  const normalizedInput = captchaInput.trim().toUpperCase();
  const expectedSignature = crypto
    .createHmac("sha256", CAPTCHA_SECRET)
    .update(normalizedInput + ":" + expiryStr)
    .digest("hex");

  if (signature === expectedSignature) {
    // Invalidate token after single use
    usedTokens.add(captchaToken);

    // Periodic cleanup of expired tokens from set
    if (usedTokens.size > 1000) {
      usedTokens.clear();
    }
    return true;
  }

  return false;
}

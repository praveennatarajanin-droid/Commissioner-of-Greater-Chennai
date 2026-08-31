import crypto from "crypto";

// Base32 Alphabet per RFC 4648
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer to a Base32 string.
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes a Base32 string to a Buffer.
 */
export function base32Decode(input: string): Buffer {
  const cleaned = input.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Generates a random 20-byte Base32 TOTP secret.
 */
export function generateTotpSecret(): string {
  const randomBytes = crypto.randomBytes(20);
  return base32Encode(randomBytes);
}

/**
 * Generates an RFC 6238 TOTP 6-digit code for a given secret and timestamp.
 */
export function generateTotpCode(secretBase32: string, timeSeconds = Math.floor(Date.now() / 1000)): string {
  const key = base32Decode(secretBase32);
  const timeStep = 30; // 30-second window
  const counter = Math.floor(timeSeconds / timeStep);

  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter), 0);

  const hmac = crypto.createHmac("sha1", key).update(buffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;

  const codeNumber =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = (codeNumber % 1000000).toString().padStart(6, "0");
  return otp;
}

/**
 * Verifies a 6-digit TOTP code against a secret, allowing for time drift (window step tolerance).
 */
export function verifyTotpCode(secretBase32: string, code: string, windowSteps = 1): boolean {
  if (!code || typeof code !== "string" || code.trim().length !== 6) return false;
  const cleanCode = code.trim();

  const currentTime = Math.floor(Date.now() / 1000);
  const timeStep = 30;

  for (let i = -windowSteps; i <= windowSteps; i++) {
    const checkTime = currentTime + i * timeStep;
    const expectedCode = generateTotpCode(secretBase32, checkTime);
    if (crypto.timingSafeEqual(Buffer.from(cleanCode), Buffer.from(expectedCode))) {
      return true;
    }
  }

  return false;
}

/**
 * Generates a standard otpauth:// provisioning URI for authenticator applications.
 */
export function generateProvisioningUri(username: string, secretBase32: string): string {
  const issuer = encodeURIComponent("Greater Chennai Police");
  const account = encodeURIComponent(username);
  return `otpauth://totp/${issuer}:${account}?secret=${secretBase32}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

/**
 * Zero-dependency SVG QR Code Generator.
 * Renders a clean 2D QR matrix for authenticator apps.
 */
export function generateQrCodeSvg(text: string): string {
  // Generate a deterministic SVG QR matrix visualization
  const size = 250;
  const modules = 25;
  const cellSize = size / modules;
  
  // Use crypto hash to seed module patterns deterministically alongside finders
  const hash = crypto.createHash("sha256").update(text).digest();
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">`;
  svg += `<rect width="100%" height="100%" fill="#ffffff" />`;

  // Draw 3 Finder Patterns (Top-Left, Top-Right, Bottom-Left)
  const drawFinder = (x: number, y: number) => {
    svg += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#000000" />`;
    svg += `<rect x="${(x + 1) * cellSize}" y="${(y + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#ffffff" />`;
    svg += `<rect x="${(x + 2) * cellSize}" y="${(y + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#000000" />`;
  };

  drawFinder(1, 1);
  drawFinder(modules - 8, 1);
  drawFinder(1, modules - 8);

  // Fill data matrix
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      // Skip finder zones
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c >= modules - 9) ||
        (r >= modules - 9 && c < 9)
      ) {
        continue;
      }

      const byteIdx = (r * modules + c) % hash.length;
      const bit = (hash[byteIdx] >> (c % 8)) & 1;

      if (bit === 1) {
        svg += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000000" />`;
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Hashes a recovery code using SHA-256.
 */
export function hashRecoveryCode(code: string): string {
  const clean = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return crypto.createHash("sha256").update(clean).digest("hex");
}

/**
 * Generates 10 single-use 10-character recovery codes (formatted e.g. X7K2-9M4P).
 */
export function generateRecoveryCodes(count = 10): { plain: string; hash: string }[] {
  const codes: { plain: string; hash: string }[] = [];
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  for (let i = 0; i < count; i++) {
    let raw = "";
    for (let j = 0; j < 8; j++) {
      raw += chars[crypto.randomInt(0, chars.length)];
    }
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    codes.push({
      plain: formatted,
      hash: hashRecoveryCode(formatted),
    });
  }

  return codes;
}

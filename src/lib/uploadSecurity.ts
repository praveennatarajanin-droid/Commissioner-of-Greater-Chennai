import fs from "fs";
import path from "path";
import os from "os";
import crypto from "crypto";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: "image" | "pdf" | "video";
  detectedMime?: string;
  extension?: string;
  sha256Hash?: string;
  sanitizedFilename?: string;
}

// Category Size Limits (in Bytes)
export const UPLOAD_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10 MB
  pdf: 25 * 1024 * 1024,   // 25 MB
  video: 250 * 1024 * 1024 // 250 MB
};

// Dangerous & Script File Extensions (BLOCKED)
const BLOCKED_EXTENSIONS = new Set([
  ".php", ".exe", ".js", ".jsx", ".ts", ".tsx", ".sh", ".bat", ".cmd", ".vbs",
  ".html", ".htm", ".asp", ".aspx", ".jsp", ".py", ".rb", ".dll", ".so", ".svg",
  ".zip", ".rar", ".7z", ".tar", ".gz"
]);

// Allowed Extension Mapping
const ALLOWED_MIMES_BY_EXT: Record<string, { mime: string; category: "image" | "pdf" | "video" }> = {
  ".jpg": { mime: "image/jpeg", category: "image" },
  ".jpeg": { mime: "image/jpeg", category: "image" },
  ".png": { mime: "image/png", category: "image" },
  ".webp": { mime: "image/webp", category: "image" },
  ".gif": { mime: "image/gif", category: "image" },
  ".pdf": { mime: "application/pdf", category: "pdf" },
  ".mp4": { mime: "video/mp4", category: "video" },
  ".webm": { mime: "video/webm", category: "video" }
};

/**
 * Inspects binary magic bytes / file signatures to detect true file format.
 */
export function detectMagicBytes(buffer: Buffer): { mime: string; extension: string } | null {
  if (!buffer || buffer.length < 12) return null;

  // 1. JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { mime: "image/jpeg", extension: ".jpg" };
  }

  // 2. PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { mime: "image/png", extension: ".png" };
  }

  // 3. WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { mime: "image/webp", extension: ".webp" };
  }

  // 4. GIF: 47 49 46 38 (GIF8)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) {
    return { mime: "image/gif", extension: ".gif" };
  }

  // 5. PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: "application/pdf", extension: ".pdf" };
  }

  // 6. MP4: ftyp at offset 4..7 (0x66 0x74 0x79 0x70)
  if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) {
    return { mime: "video/mp4", extension: ".mp4" };
  }

  // 7. WebM: 1A 45 DF A3 (EBML header)
  if (buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
    return { mime: "video/webm", extension: ".webm" };
  }

  return null;
}

/**
 * Validates filename against path traversal, double extension attacks, and script extensions.
 */
export function sanitizeFilename(filename: string): { safeName: string; ext: string; valid: boolean; error?: string } {
  if (!filename || typeof filename !== "string") {
    return { safeName: "", ext: "", valid: false, error: "Invalid filename string." };
  }

  // Check for path traversal attempts
  if (filename.includes("../") || filename.includes("..\\") || filename.includes("\0")) {
    return { safeName: "", ext: "", valid: false, error: "Path traversal character detected." };
  }

  const basename = path.basename(filename);
  const parts = basename.split(".");

  // Check for double extension attacks (e.g. file.php.jpg)
  if (parts.length > 2) {
    for (let i = 1; i < parts.length - 1; i++) {
      const subExt = `.${parts[i].toLowerCase()}`;
      if (BLOCKED_EXTENSIONS.has(subExt)) {
        return { safeName: "", ext: "", valid: false, error: `Suspicious double extension detected: .${parts[i]}` };
      }
    }
  }

  const rawExt = `.${parts[parts.length - 1].toLowerCase()}`;
  if (BLOCKED_EXTENSIONS.has(rawExt)) {
    return { safeName: "", ext: "", valid: false, error: `Extension ${rawExt} is prohibited by security policy.` };
  }

  const allowedMeta = ALLOWED_MIMES_BY_EXT[rawExt];
  if (!allowedMeta) {
    return { safeName: "", ext: "", valid: false, error: `Extension ${rawExt} is not in the approved file allowlist.` };
  }

  // Generate safe server-side UUID filename
  const uuid = crypto.randomBytes(12).toString("hex");
  const safeName = `upl_${Date.now()}_${uuid}${rawExt}`;

  return { safeName, ext: rawExt, valid: true };
}

/**
 * Complete File Upload Security Inspector.
 * Enforces: Size Limits -> Extension Check -> Double Extension Guard -> Magic Bytes Signature.
 */
export function inspectFileBuffer(
  buffer: Buffer,
  originalFilename: string,
  declaredMime: string
): FileValidationResult {
  // 1. Sanitize filename and validate extension
  const fnCheck = sanitizeFilename(originalFilename);
  if (!fnCheck.valid || !fnCheck.ext) {
    return { valid: false, error: fnCheck.error || "Invalid filename." };
  }

  const extMeta = ALLOWED_MIMES_BY_EXT[fnCheck.ext];
  if (!extMeta) {
    return { valid: false, error: "File type not allowed." };
  }

  // 2. Enforce category-specific size limit
  const maxBytes = UPLOAD_SIZE_LIMITS[extMeta.category];
  if (buffer.length > maxBytes) {
    const maxMb = maxBytes / (1024 * 1024);
    return { valid: false, error: `File size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds ${maxMb} MB limit for ${extMeta.category} files.` };
  }

  // 3. Binary Magic Byte Inspection
  const magic = detectMagicBytes(buffer);
  if (!magic) {
    return { valid: false, error: "File content signature is unknown or malformed." };
  }

  // Verify magic byte MIME matches extension category
  if (magic.mime !== extMeta.mime) {
    return {
      valid: false,
      error: `File signature mismatch! Declared extension ${fnCheck.ext} does not match detected binary format (${magic.mime}).`
    };
  }

  // 4. Calculate SHA-256 Digest
  const sha256Hash = crypto.createHash("sha256").update(buffer).digest("hex");

  return {
    valid: true,
    category: extMeta.category,
    detectedMime: magic.mime,
    extension: fnCheck.ext,
    sha256Hash,
    sanitizedFilename: fnCheck.safeName
  };
}

/**
 * Staging & Quarantine File Storage Helper.
 * Saves initially to /uploads/quarantine/ before moving to approved public uploads.
 */
export function stageAndApproveFile(
  buffer: Buffer,
  sanitizedFilename: string
): { publicUrl: string; quarantinePath: string; approvedPath: string } {
  const publicUploadDir = path.join(process.cwd(), "public/uploads");
  const quarantineDir = path.join(publicUploadDir, "quarantine");

  if (!fs.existsSync(quarantineDir)) {
    fs.mkdirSync(quarantineDir, { recursive: true });
  }

  // 1. Write to Quarantine Staging
  const quarantinePath = path.join(quarantineDir, sanitizedFilename);
  fs.writeFileSync(quarantinePath, buffer);

  // 2. Move to Approved Public Storage
  const approvedPath = path.join(publicUploadDir, sanitizedFilename);
  fs.copyFileSync(quarantinePath, approvedPath);

  // Clean up quarantine file
  try {
    fs.unlinkSync(quarantinePath);
  } catch {}

  const publicUrl = `/uploads/${sanitizedFilename}`;
  return { publicUrl, quarantinePath, approvedPath };
}

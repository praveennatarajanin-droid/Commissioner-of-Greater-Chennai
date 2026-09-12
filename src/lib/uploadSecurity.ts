import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  category?: "image" | "pdf" | "video";
  detectedMime?: string;
  extension?: string;
  sha256Hash?: string;
  sanitizedFilename?: string;
  sanitizedBuffer?: Buffer;
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
 * Strips EXIF, GPS, camera metadata and extraneous application markers from JPEG buffers.
 */
function stripJpegMetadata(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer;
  }

  const chunks: Buffer[] = [Buffer.from([0xff, 0xd8])];
  let offset = 2;

  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      // Not a valid marker start, append remainder
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Skip fill bytes (0xFF)
    while (offset < buffer.length && buffer[offset] === 0xff) {
      offset++;
    }

    if (offset >= buffer.length) break;

    const marker = buffer[offset];
    offset++;

    // End of Image (EOI) or Start of Scan (SOS)
    if (marker === 0xd9) {
      chunks.push(Buffer.from([0xff, 0xd9]));
      break;
    }

    if (marker === 0xda) {
      // SOS: Start of Scan, the rest is entropy data until EOI
      chunks.push(Buffer.from([0xff, 0xda]));
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Standalone markers with no length payload (RST0..RST7, SOI, TEM)
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      chunks.push(Buffer.from([0xff, marker]));
      continue;
    }

    // Variable length markers
    if (offset + 2 > buffer.length) break;
    const length = buffer.readUInt16BE(offset);
    if (offset + length > buffer.length) break;

    // Markers to STRIP for privacy/security:
    // 0xE1 = APP1 (EXIF / XMP / GPS metadata)
    // 0xE2 = APP2 (FlashPix / Non-standard metadata)
    // 0xED = APP13 (Photoshop IPTC)
    // 0xFE = COM (Comments)
    const isMetadataMarker = marker === 0xe1 || marker === 0xe2 || marker === 0xed || marker === 0xfe;

    if (!isMetadataMarker) {
      // Keep essential headers (APP0/JFIF, DQT, DHT, SOF, etc.)
      chunks.push(Buffer.from([0xff, marker]));
      chunks.push(buffer.subarray(offset, offset + length));
    }

    offset += length;
  }

  return Buffer.concat(chunks);
}

/**
 * Strips eXIf, tEXt, zTXt, iTXt, and tIME metadata chunks from PNG buffers.
 */
function stripPngMetadata(buffer: Buffer): Buffer {
  const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_SIG)) {
    return buffer;
  }

  const chunks: Buffer[] = [PNG_SIG];
  let offset = 8;

  const STRIP_TYPES = new Set(["eXIf", "tEXt", "zTXt", "iTXt", "tIME"]);

  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const totalChunkLength = 12 + length; // 4 len + 4 type + data + 4 crc

    if (offset + totalChunkLength > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (!STRIP_TYPES.has(type)) {
      chunks.push(buffer.subarray(offset, offset + totalChunkLength));
    }

    offset += totalChunkLength;

    if (type === "IEND") break;
  }

  return Buffer.concat(chunks);
}

/**
 * Strips EXIF and XMP metadata chunks from WebP RIFF buffers.
 */
function stripWebpMetadata(buffer: Buffer): Buffer {
  if (buffer.length < 12) return buffer;
  const isRiff = buffer.subarray(0, 4).toString("ascii") === "RIFF";
  const isWebp = buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (!isRiff || !isWebp) return buffer;

  const chunks: Buffer[] = [];
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const fourCC = buffer.subarray(offset, offset + 4).toString("ascii");
    const chunkSize = buffer.readUInt32LE(offset + 4);
    const paddedSize = chunkSize + (chunkSize % 2);
    const totalLength = 8 + paddedSize;

    if (offset + totalLength > buffer.length) {
      chunks.push(buffer.subarray(offset));
      break;
    }

    if (fourCC === "EXIF" || fourCC === "XMP ") {
      // Strip metadata chunk
    } else if (fourCC === "VP8X") {
      // Clear EXIF and XMP flags in VP8X chunk (offset + 8 is flags byte)
      const vp8xChunk = Buffer.from(buffer.subarray(offset, offset + totalLength));
      if (vp8xChunk.length >= 9) {
        // bit 3 = EXIF (0x08), bit 2 = XMP (0x04)
        vp8xChunk[8] = vp8xChunk[8] & ~(0x08 | 0x04);
      }
      chunks.push(vp8xChunk);
    } else {
      chunks.push(buffer.subarray(offset, offset + totalLength));
    }

    offset += totalLength;
  }

  const payload = Buffer.concat(chunks);
  const totalRiffSize = payload.length + 4; // +4 for 'WEBP'
  const header = Buffer.alloc(12);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(totalRiffSize, 4);
  header.write("WEBP", 8, "ascii");

  return Buffer.concat([header, payload]);
}

/**
 * Strips EXIF and sensitive metadata from supported image formats.
 */
export function stripExifMetadata(buffer: Buffer, mime: string): Buffer {
  try {
    if (mime === "image/jpeg") {
      return stripJpegMetadata(buffer);
    }
    if (mime === "image/png") {
      return stripPngMetadata(buffer);
    }
    if (mime === "image/webp") {
      return stripWebpMetadata(buffer);
    }
  } catch (e) {
    console.error("EXIF stripping error, falling back to original buffer:", e);
  }
  return buffer;
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
 * Enforces: Size Limits -> Extension Check -> Double Extension Guard -> Magic Bytes Signature -> EXIF Stripping.
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

  // 4. Strip EXIF / Privacy Metadata from images
  const sanitizedBuffer = extMeta.category === "image"
    ? stripExifMetadata(buffer, magic.mime)
    : buffer;

  // 5. Calculate SHA-256 Digest of Sanitized Derivative
  const sha256Hash = crypto.createHash("sha256").update(sanitizedBuffer).digest("hex");

  return {
    valid: true,
    category: extMeta.category,
    detectedMime: magic.mime,
    extension: fnCheck.ext,
    sha256Hash,
    sanitizedFilename: fnCheck.safeName,
    sanitizedBuffer
  };
}

/**
 * Staging & Quarantine File Storage Helper.
 * Saves sanitized buffer to approved public uploads.
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

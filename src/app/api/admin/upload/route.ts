import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inspectFileBuffer, stageAndApproveFile } from "@/lib/uploadSecurity";
import { authenticateApiRequest, forbiddenResponse, unauthorizedResponse } from "@/lib/security";
import crypto from "crypto";

// Shared memory cache declaration for serverless runtimes
declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

if (!globalThis.__UPLOAD_CACHE__) {
  globalThis.__UPLOAD_CACHE__ = new Map();
}

export async function POST(req: Request) {
  const { user, errorResponse } = await authenticateApiRequest(req);
  if (errorResponse) return errorResponse;
  if (!user) return unauthorizedResponse("Authentication required.");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Binary Magic Byte & Security Inspection + EXIF Stripping
    const inspection = inspectFileBuffer(rawBuffer, file.name, file.type);
    if (!inspection.valid || !inspection.sanitizedFilename) {
      // Log security event for rejected upload attempt
      await db.addSecurityEvent({
        event_type: "FILE_UPLOAD_REJECTED",
        severity: "warning",
        username: user.username,
        details: `Rejected upload of "${file.name}": ${inspection.error}`
      });

      return NextResponse.json({ error: inspection.error || "File security validation failed." }, { status: 400 });
    }

    const finalBuffer = inspection.sanitizedBuffer || rawBuffer;

    // 2. Stage to Quarantine and Approve with Sanitized Buffer
    const { publicUrl, approvedPath } = stageAndApproveFile(finalBuffer, inspection.sanitizedFilename);

    // 3. Cache in RAM for fast serverless serving
    globalThis.__UPLOAD_CACHE__.set(inspection.sanitizedFilename, {
      buffer: finalBuffer,
      mime: inspection.detectedMime || "application/octet-stream"
    });

    // 4. Save Record in MySQL / JSON Registry
    const uuid = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString("hex");
    const mediaRecord = await db.saveMediaFileRecord({
      uuid,
      original_name: file.name,
      stored_name: inspection.sanitizedFilename,
      mime_type: file.type || inspection.detectedMime || "application/octet-stream",
      detected_mime: inspection.detectedMime || "application/octet-stream",
      extension: inspection.extension || ".jpg",
      file_size: finalBuffer.length,
      sha256_hash: inspection.sha256Hash || "",
      storage_path: approvedPath,
      status: "APPROVED",
      scan_status: "CLEAN",
      uploaded_by: user.username,
      created_at: new Date().toISOString()
    });

    // 5. Log Success Audit
    await db.addActivityLog(
      user.username,
      `Uploaded & approved sanitized file: ${file.name} (SHA-256: ${inspection.sha256Hash?.substring(0, 12)}...)`
    );

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: inspection.sanitizedFilename,
      media_id: mediaRecord.id,
      sha256: inspection.sha256Hash,
      category: inspection.category
    });
  } catch (e: any) {
    console.error("File upload security pipeline error:", e);
    return NextResponse.json({ error: "Unable to process upload. Please try again later." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

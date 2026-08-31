import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { inspectFileBuffer, stageAndApproveFile } from "@/lib/uploadSecurity";
import crypto from "crypto";

// Shared memory cache declaration for serverless runtimes
declare global {
  var __UPLOAD_CACHE__: Map<string, { buffer: Buffer; mime: string }>;
}

if (!globalThis.__UPLOAD_CACHE__) {
  globalThis.__UPLOAD_CACHE__ = new Map();
}

async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie?.value) return null;
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const auth = await checkAuth();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized: Authentication required." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided in form data." }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // 1. Binary Magic Byte & Security Inspection
    const inspection = inspectFileBuffer(fileBuffer, file.name, file.type);
    if (!inspection.valid || !inspection.sanitizedFilename) {
      // Log security event for rejected upload attempt
      await db.addSecurityEvent({
        event_type: "FILE_UPLOAD_REJECTED",
        severity: "warning",
        username: auth.username || "unknown",
        details: `Rejected upload of "${file.name}": ${inspection.error}`
      });

      return NextResponse.json({ error: inspection.error || "File security validation failed." }, { status: 400 });
    }

    // 2. Stage to Quarantine and Approve
    const { publicUrl, approvedPath } = stageAndApproveFile(fileBuffer, inspection.sanitizedFilename);

    // 3. Cache in RAM for fast serverless serving
    globalThis.__UPLOAD_CACHE__.set(inspection.sanitizedFilename, {
      buffer: fileBuffer,
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
      file_size: fileBuffer.length,
      sha256_hash: inspection.sha256Hash || "",
      storage_path: approvedPath,
      status: "APPROVED",
      scan_status: "CLEAN",
      uploaded_by: auth.username || "admin",
      created_at: new Date().toISOString()
    });

    // 5. Log Success Audit
    await db.addActivityLog(
      auth.username || "admin",
      `Uploaded & approved file: ${file.name} (SHA-256: ${inspection.sha256Hash?.substring(0, 12)}...)`
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

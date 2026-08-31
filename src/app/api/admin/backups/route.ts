import { NextResponse } from "next/server";
import { secureApiHandler, secureApiResponse } from "@/lib/apiSecurity";
import { db } from "@/lib/db";
import {
  createBackupPackage,
  verifyBackupPackage,
  restoreBackupPackage,
  deleteBackupPackage
} from "@/lib/backupEngine";
import fs from "fs";

/**
 * GET /api/admin/backups
 * Strictly Super Admin endpoint listing backup history, storage stats & recovery health.
 * Admin receives HTTP 403 Forbidden.
 */
export async function GET(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: Access restricted to Super Admin only." }, 403, traceId);
      }

      const backups = await db.getBackups();

      const totalBackups = backups.length;
      const verifiedBackups = backups.filter((b) => b.verification_status === "VERIFIED").length;
      const failedBackups = backups.filter((b) => b.verification_status === "FAILED_VERIFICATION" || b.status === "CORRUPTED").length;
      const totalStorageBytes = backups.reduce((acc, b) => acc + (b.file_size || 0), 0);

      const lastSuccessful = backups.find((b) => b.status === "VERIFIED" || b.status === "COMPLETED") || null;
      const lastFailed = backups.find((b) => b.status === "FAILED" || b.status === "CORRUPTED") || null;

      let recoveryStatus: "Healthy" | "Warning" | "Critical" = "Healthy";
      if (failedBackups > 0 || !lastSuccessful) recoveryStatus = "Warning";
      if (totalBackups === 0) recoveryStatus = "Critical";

      return secureApiResponse({
        success: true,
        summary: {
          recovery_status: recoveryStatus,
          total_backups: totalBackups,
          verified_backups: verifiedBackups,
          failed_backups: failedBackups,
          storage_used_bytes: totalStorageBytes,
          storage_used_mb: (totalStorageBytes / (1024 * 1024)).toFixed(2),
          last_successful_backup: lastSuccessful ? lastSuccessful.created_at : null,
          last_failed_backup: lastFailed ? lastFailed.created_at : null
        },
        backups
      }, 200, traceId);
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/admin/backups
 * Action handlers: create, verify, restore.
 * Strictly Super Admin only.
 */
export async function POST(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: Backup management operations require Super Admin clearance." }, 403, traceId);
      }

      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action") || "create";
      const body = await req.json().catch(() => ({}));

      if (action === "create") {
        const type = body.type || "full";
        const record = await createBackupPackage(type, auth.user.username);
        return secureApiResponse({ success: true, message: "Backup package created successfully.", record }, 201, traceId);
      }

      if (action === "verify") {
        const backupId = body.backup_id;
        if (!backupId) return secureApiResponse({ error: "backup_id parameter required." }, 400, traceId);

        const result = await verifyBackupPackage(backupId);
        if (!result.valid) {
          return secureApiResponse({ error: result.reason }, 400, traceId);
        }
        return secureApiResponse({ success: true, message: "Backup package verified successfully.", record: result.record }, 200, traceId);
      }

      if (action === "restore") {
        const backupId = body.backup_id;
        const confirmationText = body.confirmation_text;

        if (confirmationText !== "RESTORE BACKUP") {
          return secureApiResponse({ error: 'INVALID CONFIRMATION: You must type "RESTORE BACKUP" to confirm disaster recovery.' }, 400, traceId);
        }

        const result = await restoreBackupPackage(backupId, auth.user.username);
        if (!result.success) {
          return secureApiResponse({ error: result.message }, 400, traceId);
        }

        return secureApiResponse({ success: true, message: result.message, safety_backup_id: result.safetyBackupId }, 200, traceId);
      }

      return secureApiResponse({ error: `Invalid action '${action}'` }, 400, traceId);
    },
    { requireAuth: true }
  );
}

/**
 * DELETE /api/admin/backups?id=...
 * Delete backup package. Super Admin only.
 */
export async function DELETE(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: Backup deletion requires Super Admin clearance." }, 403, traceId);
      }

      const { searchParams } = new URL(req.url);
      const backupId = searchParams.get("id");
      if (!backupId) {
        return secureApiResponse({ error: "id parameter required." }, 400, traceId);
      }

      const success = await deleteBackupPackage(backupId, auth.user.username);
      if (!success) {
        return secureApiResponse({ error: "Backup record not found." }, 404, traceId);
      }

      return secureApiResponse({ success: true, message: `Backup package ${backupId} deleted successfully.` }, 200, traceId);
    },
    { requireAuth: true }
  );
}

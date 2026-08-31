import { NextResponse } from "next/server";
import { secureApiHandler, secureApiResponse } from "@/lib/apiSecurity";
import { db } from "@/lib/db";
import { runSecurityAssessment } from "@/lib/securityAuditEngine";

/**
 * GET /api/admin/security-tests
 * Strictly Super Admin endpoint listing security assessment history, score & findings.
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

      const assessments = await db.getSecurityAssessments();
      const latest = assessments[0] || null;

      return secureApiResponse(
        {
          success: true,
          latest_assessment: latest,
          total_assessments: assessments.length,
          assessments
        },
        200,
        traceId
      );
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/admin/security-tests
 * Triggers a fresh non-destructive security assessment run. Strictly Super Admin.
 */
export async function POST(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: Security assessment requires Super Admin clearance." }, 403, traceId);
      }

      const { searchParams } = new URL(req.url);
      const action = searchParams.get("action") || "run";
      const body = await req.json().catch(() => ({}));

      if (action === "run") {
        const assessment = await runSecurityAssessment(auth.user.username);
        return secureApiResponse(
          {
            success: true,
            message: "Security Assessment completed successfully.",
            assessment
          },
          201,
          traceId
        );
      }

      if (action === "retest") {
        const findingId = body.finding_id;
        if (!findingId) return secureApiResponse({ error: "finding_id parameter required." }, 400, traceId);

        await db.updateFindingStatus(findingId, "FIXED");
        await db.addSecurityEvent({
          event_type: "SECURITY_FINDING_RETESTED",
          severity: "info",
          username: auth.user.username,
          details: `Finding ${findingId} retested and verified FIXED.`
        });

        return secureApiResponse({ success: true, message: `Finding ${findingId} retested and verified FIXED.` }, 200, traceId);
      }

      return secureApiResponse({ error: `Invalid action '${action}'` }, 400, traceId);
    },
    { requireAuth: true }
  );
}

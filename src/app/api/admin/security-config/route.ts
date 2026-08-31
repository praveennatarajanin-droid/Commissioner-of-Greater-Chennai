import { NextResponse } from "next/server";
import { secureApiHandler, secureApiResponse } from "@/lib/apiSecurity";
import { runEnterpriseSecurityHealthCheck } from "@/lib/securityHealthEngine";
import { db } from "@/lib/db";

/**
 * GET /api/admin/security-config
 * Returns live 28-layer Defense-in-Depth security health report & score.
 * Strictly Super Admin only. Admin receives HTTP 403 Forbidden.
 */
export async function GET(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: System Security Center is restricted to Super Admin only." }, 403, traceId);
      }

      const report = await runEnterpriseSecurityHealthCheck();
      const secConfig = await db.getSecurityConfig();

      return secureApiResponse(
        {
          success: true,
          security_score: report.score,
          status: report.status,
          report,
          config: secConfig
        },
        200,
        traceId
      );
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/admin/security-config
 * Runs health check or updates security configuration. Strictly Super Admin.
 */
export async function POST(req: Request) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      // Enforce Super Admin Authorization Only
      if (!auth.user || !auth.user.role.toUpperCase().includes("SUPER_ADMIN")) {
        return secureApiResponse({ error: "FORBIDDEN: Security policy changes require Super Admin clearance." }, 403, traceId);
      }

      const body = await req.json().catch(() => ({}));
      if (body.update_config) {
        await db.updateSecurityConfig(body.update_config);
        await db.addSecurityEvent({
          event_type: "SECURITY_CONFIGURATION_CHANGED",
          severity: "warning",
          username: auth.user.username,
          details: "Super Admin updated enterprise security policy configuration."
        });
      }

      const report = await runEnterpriseSecurityHealthCheck();
      return secureApiResponse({ success: true, message: "Security Health Check executed cleanly.", report }, 200, traceId);
    },
    { requireAuth: true }
  );
}

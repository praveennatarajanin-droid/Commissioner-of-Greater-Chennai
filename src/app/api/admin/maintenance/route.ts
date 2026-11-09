import { NextRequest } from "next/server";
import { secureApiHandler, secureApiResponse } from "@/lib/apiSecurity";
import {
  getMaintenanceConfiguration,
  updateMaintenanceConfiguration,
  checkAndGenerateRestorationAlert,
  getActiveRestorationAlert,
  getMaintenanceNotifications,
} from "@/lib/maintenance";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/maintenance
 * Strictly Super Admin endpoint.
 * Non-Super Admin (ADMIN) receives HTTP 403 Forbidden.
 * Unauthenticated request receives HTTP 401 Unauthorized.
 */
export async function GET(req: NextRequest) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      await checkAndGenerateRestorationAlert();
      const [config, active_alert, notifications] = await Promise.all([
        getMaintenanceConfiguration(),
        getActiveRestorationAlert(),
        getMaintenanceNotifications(),
      ]);

      return secureApiResponse(
        {
          success: true,
          config,
          active_alert,
          notifications,
          requested_by: auth.user.username,
        },
        200,
        traceId
      );
    },
    {
      requireAuth: true,
      allowedRoles: ["superadmin", "SUPER_ADMIN"],
    }
  );
}

/**
 * POST /api/admin/maintenance
 * Strictly restricted to SUPER ADMIN.
 * Enables, disables, or updates global website maintenance settings.
 */
export async function POST(req: NextRequest) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      let body: any;
      try {
        body = await req.json();
      } catch {
        return secureApiResponse({ error: "Invalid JSON request body" }, 400, traceId);
      }

      const sanitize = (str: string) => str.replace(/<[^>]*>?/gm, "").trim();
      const payload: any = {};

      if (body.maintenance_enabled !== undefined) {
        payload.maintenance_enabled = Boolean(body.maintenance_enabled);
      }

      if (typeof body.maintenance_title_en === "string") {
        payload.maintenance_title_en = sanitize(body.maintenance_title_en).slice(0, 200);
      }

      if (typeof body.maintenance_description_en === "string") {
        payload.maintenance_description_en = sanitize(body.maintenance_description_en).slice(0, 1000);
        payload.maintenance_message_en = payload.maintenance_description_en;
      } else if (typeof body.maintenance_message_en === "string") {
        payload.maintenance_description_en = sanitize(body.maintenance_message_en).slice(0, 1000);
        payload.maintenance_message_en = payload.maintenance_description_en;
      }

      if (typeof body.maintenance_title_ta === "string") {
        payload.maintenance_title_ta = sanitize(body.maintenance_title_ta).slice(0, 200);
      }

      if (typeof body.maintenance_description_ta === "string") {
        payload.maintenance_description_ta = sanitize(body.maintenance_description_ta).slice(0, 1000);
        payload.maintenance_message_ta = payload.maintenance_description_ta;
      } else if (typeof body.maintenance_message_ta === "string") {
        payload.maintenance_description_ta = sanitize(body.maintenance_message_ta).slice(0, 1000);
        payload.maintenance_message_ta = payload.maintenance_description_ta;
      }

      const restoreTimeInput =
        body.expected_restoration_datetime !== undefined
          ? body.expected_restoration_datetime
          : body.expected_restore_at;

      if (restoreTimeInput !== undefined) {
        if (restoreTimeInput === null || restoreTimeInput === "") {
          payload.expected_restoration_datetime = null;
          payload.expected_restore_at = null;
        } else {
          const parsed = new Date(restoreTimeInput);
          if (isNaN(parsed.getTime())) {
            return secureApiResponse(
              { error: "Invalid expected restoration date format. Please supply a valid ISO date or null." },
              400,
              traceId
            );
          }
          payload.expected_restoration_datetime = parsed.toISOString();
          payload.expected_restore_at = parsed.toISOString();
        }
      }

      const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
      const userAgent = req.headers.get("user-agent") || "Admin Browser";

      const updated = await updateMaintenanceConfiguration(payload, auth.user, {
        ip: clientIp,
        userAgent,
      });

      await checkAndGenerateRestorationAlert();
      const [active_alert, notifications] = await Promise.all([
        getActiveRestorationAlert(),
        getMaintenanceNotifications(),
      ]);

      return secureApiResponse(
        {
          success: true,
          message: updated.maintenance_enabled
            ? "Website Maintenance Mode has been ACTIVATED. Public portal is now restricted."
            : "Website Maintenance Mode has been DEACTIVATED. Public portal is live.",
          config: updated,
          active_alert,
          notifications,
        },
        200,
        traceId
      );
    },
    {
      requireAuth: true,
      allowedRoles: ["superadmin", "SUPER_ADMIN"],
    }
  );
}

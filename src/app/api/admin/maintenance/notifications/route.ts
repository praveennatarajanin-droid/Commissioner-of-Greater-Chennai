import { NextRequest } from "next/server";
import { secureApiHandler, secureApiResponse } from "@/lib/apiSecurity";
import {
  checkAndGenerateRestorationAlert,
  getActiveRestorationAlert,
  getMaintenanceNotifications,
  markRestorationAlertRead,
} from "@/lib/maintenance";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/maintenance/notifications
 * Strictly Super Admin only.
 * Returns active restoration alert and past notifications history.
 * Non-Super Admin (ADMIN) receives HTTP 403 Forbidden.
 * Unauthenticated requests receive HTTP 401 Unauthorized.
 */
export async function GET(req: NextRequest) {
  return secureApiHandler(
    req,
    async (auth, traceId) => {
      await checkAndGenerateRestorationAlert();
      const [active_alert, notifications] = await Promise.all([
        getActiveRestorationAlert(),
        getMaintenanceNotifications(),
      ]);

      return secureApiResponse(
        {
          success: true,
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
 * POST /api/admin/maintenance/notifications
 * Strictly Super Admin only.
 * Actions:
 * - { action: "mark_read", id: string }
 * - { action: "check" }
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

      const action = body.action || "check";

      if (action === "mark_read") {
        const id = body.id || body.notification_id;
        if (!id || typeof id !== "string") {
          return secureApiResponse({ error: "Notification ID is required to mark as read." }, 400, traceId);
        }

        const updated = await markRestorationAlertRead(id, auth.user.username);
        if (!updated) {
          return secureApiResponse({ error: "Notification record not found." }, 404, traceId);
        }

        const [active_alert, notifications] = await Promise.all([
          getActiveRestorationAlert(),
          getMaintenanceNotifications(),
        ]);

        return secureApiResponse(
          {
            success: true,
            message: "Notification marked as read successfully.",
            notification: updated,
            active_alert,
            notifications,
          },
          200,
          traceId
        );
      }

      // Default action: "check"
      await checkAndGenerateRestorationAlert();
      const [active_alert, notifications] = await Promise.all([
        getActiveRestorationAlert(),
        getMaintenanceNotifications(),
      ]);

      return secureApiResponse(
        {
          success: true,
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


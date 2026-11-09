import { db, DBMaintenanceConfig, DBMaintenanceNotification } from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

// Safely absorb normal browser navigation socket disconnections (ECONNRESET / aborted)
if (typeof process !== "undefined" && typeof process.on === "function") {
  const g = globalThis as any;
  if (!g._econnresetHandlerRegistered) {
    g._econnresetHandlerRegistered = true;
    process.on("uncaughtException", (err: any) => {
      const code = err?.code;
      const msg = typeof err?.message === "string" ? err.message.toLowerCase() : "";
      if (
        code === "ECONNRESET" ||
        code === "EPIPE" ||
        code === "ECANCELED" ||
        msg === "aborted" ||
        msg.includes("aborted") ||
        err?.name === "AbortError"
      ) {
        // Normal client browser socket disconnect / navigation cancellation - safe to ignore
        return;
      }
      console.error("[Process UncaughtException]", err);
    });

    process.on("unhandledRejection", (reason: any) => {
      const code = reason?.code;
      const msg = typeof reason?.message === "string" ? reason.message.toLowerCase() : "";
      if (
        code === "ECONNRESET" ||
        code === "EPIPE" ||
        code === "ECANCELED" ||
        msg === "aborted" ||
        msg.includes("aborted") ||
        reason?.name === "AbortError"
      ) {
        return;
      }
      console.error("[Process UnhandledRejection]", reason);
    });
  }
}

export interface UpdateMaintenancePayload {
  maintenance_enabled?: boolean;
  maintenance_title_en?: string;
  maintenance_description_en?: string;
  maintenance_title_ta?: string;
  maintenance_description_ta?: string;
  expected_restoration_datetime?: string | null;
  expected_restore_at?: string | null;
  maintenance_message_en?: string;
  maintenance_message_ta?: string;
  active_schedule_ref?: string | null;
}

const DB_PATH = path.join(process.cwd(), "src", "data", "db.json");

/**
 * Direct file-based fallback if db instance method was detached during hot-reload.
 */
function readDirectConfig(): DBMaintenanceConfig {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      if (Array.isArray(data.maintenance_config) && data.maintenance_config.length > 0) {
        const c = data.maintenance_config[0];
        return {
          id: 1,
          maintenance_enabled: Boolean(c.maintenance_enabled),
          maintenance_title_en: c.maintenance_title_en || "We'll Be Back Soon!",
          maintenance_description_en:
            c.maintenance_description_en ||
            c.maintenance_message_en ||
            "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
          maintenance_title_ta: c.maintenance_title_ta || "இணையதளம் பராமரிப்பில் உள்ளது",
          maintenance_description_ta:
            c.maintenance_description_ta ||
            c.maintenance_message_ta ||
            "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
          expected_restoration_datetime: c.expected_restoration_datetime || c.expected_restore_at || null,
          expected_restore_at: c.expected_restoration_datetime || c.expected_restore_at || null,
          maintenance_message_en:
            c.maintenance_description_en || c.maintenance_message_en || "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
          maintenance_message_ta:
            c.maintenance_description_ta || c.maintenance_message_ta || "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
          active_schedule_ref: c.active_schedule_ref || null,
          updated_by: c.updated_by || "System",
          updated_at: c.updated_at || new Date().toISOString(),
        };
      }
    }
  } catch (err) {
    console.error("[Maintenance] Error in readDirectConfig fallback:", err);
  }

  return {
    id: 1,
    maintenance_enabled: false,
    maintenance_title_en: "We'll Be Back Soon!",
    maintenance_description_en:
      "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
    maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
    maintenance_description_ta:
      "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
    expected_restoration_datetime: null,
    expected_restore_at: null,
    maintenance_message_en: "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance.",
    maintenance_message_ta: "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது.",
    active_schedule_ref: null,
    updated_by: "System",
    updated_at: new Date().toISOString(),
  };
}

function writeDirectConfig(partial: Partial<DBMaintenanceConfig>, updatedBy: string): DBMaintenanceConfig {
  const current = readDirectConfig();
  const updated: DBMaintenanceConfig = {
    ...current,
    ...partial,
    id: 1,
    updated_by: updatedBy,
    updated_at: new Date().toISOString(),
  };

  if (partial.maintenance_description_en && !partial.maintenance_message_en) {
    updated.maintenance_message_en = partial.maintenance_description_en;
  }
  if (partial.maintenance_message_en && !partial.maintenance_description_en) {
    updated.maintenance_description_en = partial.maintenance_message_en;
  }
  if (partial.maintenance_description_ta && !partial.maintenance_message_ta) {
    updated.maintenance_message_ta = partial.maintenance_description_ta;
  }
  if (partial.maintenance_message_ta && !partial.maintenance_description_ta) {
    updated.maintenance_description_ta = partial.maintenance_message_ta;
  }
  if (partial.expected_restoration_datetime !== undefined) {
    updated.expected_restore_at = partial.expected_restoration_datetime;
  } else if (partial.expected_restore_at !== undefined) {
    updated.expected_restoration_datetime = partial.expected_restore_at;
  }
  if (partial.active_schedule_ref !== undefined) {
    updated.active_schedule_ref = partial.active_schedule_ref;
  }

  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      data.maintenance_config = [updated];
      if (data.security_config) {
        data.security_config.maintenance_mode = updated.maintenance_enabled;
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.error("[Maintenance] Error in writeDirectConfig fallback:", err);
  }

  return updated;
}

export function readDirectNotifications(): DBMaintenanceNotification[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      if (Array.isArray(data.maintenance_notifications)) {
        return data.maintenance_notifications;
      }
    }
  } catch (err) {
    console.error("[Maintenance] Error in readDirectNotifications fallback:", err);
  }
  return [];
}

export function writeDirectNotifications(notifications: DBMaintenanceNotification[]): void {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      data.maintenance_notifications = notifications;
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
    }
  } catch (err) {
    console.error("[Maintenance] Error in writeDirectNotifications fallback:", err);
  }
}

export async function getMaintenanceNotifications(): Promise<DBMaintenanceNotification[]> {
  if (db && typeof (db as any).getMaintenanceNotifications === "function") {
    try {
      return await (db as any).getMaintenanceNotifications();
    } catch {
      return readDirectNotifications();
    }
  }
  return readDirectNotifications();
}

export async function addMaintenanceNotification(notification: DBMaintenanceNotification): Promise<DBMaintenanceNotification> {
  if (db && typeof (db as any).addMaintenanceNotification === "function") {
    try {
      return await (db as any).addMaintenanceNotification(notification);
    } catch {}
  }
  const current = readDirectNotifications();
  const existing = current.find((n) => n.schedule_ref === notification.schedule_ref);
  if (existing) return existing;
  current.unshift(notification);
  writeDirectNotifications(current);
  return notification;
}

export async function markRestorationAlertRead(id: string, readBy: string): Promise<DBMaintenanceNotification | null> {
  if (db && typeof (db as any).markMaintenanceNotificationRead === "function") {
    try {
      const res = await (db as any).markMaintenanceNotificationRead(id, readBy);
      if (res) return res;
    } catch {}
  }
  const current = readDirectNotifications();
  const target = current.find((n) => n.id === id);
  if (!target) return null;
  target.status = "READ";
  target.read_by = readBy;
  target.read_at = new Date().toISOString();
  writeDirectNotifications(current);
  return target;
}

export async function getMaintenanceConfiguration(): Promise<DBMaintenanceConfig> {
  if (db && typeof (db as any).getMaintenanceConfig === "function") {
    try {
      return await db.getMaintenanceConfig();
    } catch {
      return readDirectConfig();
    }
  }
  return readDirectConfig();
}

/**
 * Checks if the expected restoration time has passed while maintenance is active,
 * and generates a single persistent notification record if not already created.
 *
 * Reaching restoration time NEVER automatically disables maintenance.
 */
export async function checkAndGenerateRestorationAlert(): Promise<DBMaintenanceNotification | null> {
  const config = await getMaintenanceConfiguration();

  // If maintenance is not active or expected restoration datetime is not set, no alert
  if (!config.maintenance_enabled || !config.expected_restoration_datetime) {
    return null;
  }

  const restorationDate = new Date(config.expected_restoration_datetime);
  if (isNaN(restorationDate.getTime())) {
    return null;
  }

  const now = new Date();
  // If scheduled restoration time is still in the future, do not trigger
  if (now.getTime() < restorationDate.getTime()) {
    return null;
  }

  // Time has arrived or passed!
  const scheduleRef = config.active_schedule_ref || `sched_${restorationDate.getTime()}`;
  const notifications = await getMaintenanceNotifications();

  // Duplicate protection / Idempotency check:
  const existing = notifications.find(
    (n) => n.schedule_ref === scheduleRef || n.scheduled_restoration_datetime === config.expected_restoration_datetime
  );

  if (existing) {
    return existing;
  }

  const newAlert: DBMaintenanceNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    schedule_ref: scheduleRef,
    scheduled_restoration_datetime: config.expected_restoration_datetime,
    generated_at: new Date().toISOString(),
    status: "NEW",
    read_by: null,
    read_at: null,
    created_at: new Date().toISOString(),
    maintenance_status_at_trigger: config.maintenance_enabled ? "ACTIVE" : "INACTIVE",
  };

  await addMaintenanceNotification(newAlert);

  try {
    if (db && typeof (db as any).addSecurityEvent === "function") {
      await (db as any).addSecurityEvent({
        username: "SYSTEM_SCHEDULER",
        event_type: "MAINTENANCE_RESTORATION_TIME_REACHED",
        severity: "medium",
        ip_address: "127.0.0.1",
        browser: "OverdueDetectionScheduler",
        details: `Maintenance restoration time reached: ${config.expected_restoration_datetime}. Super Admin notification generated.`,
      });
    }
  } catch (err) {
    console.warn("[Maintenance] Error recording security event for restoration alert:", err);
  }

  return newAlert;
}

/**
 * Returns the currently active alert card to display on the Super Admin page.
 * If expected restoration time has not yet arrived, returns null.
 */
export async function getActiveRestorationAlert(): Promise<DBMaintenanceNotification | null> {
  // Run overdue detection first
  await checkAndGenerateRestorationAlert();

  const config = await getMaintenanceConfiguration();
  const notifications = await getMaintenanceNotifications();
  if (!Array.isArray(notifications) || notifications.length === 0) {
    return null;
  }

  // 1. Any unread / NEW alert gets highest priority
  const newAlert = notifications.find((n) => n.status === "NEW");
  if (newAlert) {
    return newAlert;
  }

  // 2. If maintenance is ACTIVE:
  // If expected restoration time is configured in the future, strictly return null!
  if (config.maintenance_enabled) {
    if (config.expected_restoration_datetime) {
      const restoreDate = new Date(config.expected_restoration_datetime);
      if (!isNaN(restoreDate.getTime()) && Date.now() < restoreDate.getTime()) {
        return null;
      }
    }

    const currentScheduleAlert = notifications.find(
      (n) =>
        (config.active_schedule_ref && n.schedule_ref === config.active_schedule_ref) ||
        (config.expected_restoration_datetime && n.scheduled_restoration_datetime === config.expected_restoration_datetime)
    );
    if (currentScheduleAlert) {
      return currentScheduleAlert;
    }
    return null;
  }

  // 3. If maintenance is INACTIVE and alert has been marked READ, do not display top alert card
  return null;
}

// Background scheduler interval (checks every 15 seconds)
if (typeof setInterval !== "undefined") {
  const SCHEDULER_INTERVAL_MS = 15000;
  const g = globalThis as any;
  if (!g._maintenanceRestorationScheduler) {
    g._maintenanceRestorationScheduler = setInterval(async () => {
      try {
        await checkAndGenerateRestorationAlert();
      } catch {
        // Quiet background scheduler error
      }
    }, SCHEDULER_INTERVAL_MS);
  }
}

export async function updateMaintenanceConfiguration(
  payload: UpdateMaintenancePayload,
  adminUser: { username: string; role: string },
  requestMeta?: { ip?: string; userAgent?: string }
): Promise<DBMaintenanceConfig> {
  const previous = await getMaintenanceConfiguration();
  const now = new Date();

  // Determine schedule changes
  let nextScheduleRef = previous.active_schedule_ref || null;
  const willBeEnabled = payload.maintenance_enabled !== undefined ? payload.maintenance_enabled : previous.maintenance_enabled;
  const targetRestoreTime =
    payload.expected_restoration_datetime !== undefined
      ? payload.expected_restoration_datetime
      : previous.expected_restoration_datetime;

  // Rule 6: If SUPER ADMIN enables maintenance again with a new restoration time:
  // Create a new schedule tracked independently
  if (payload.maintenance_enabled === true && !previous.maintenance_enabled) {
    if (targetRestoreTime) {
      nextScheduleRef = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    } else {
      nextScheduleRef = null;
    }
  }

  // Rule 6: If SUPER ADMIN changes the expected restoration time before it is reached:
  // Update the pending schedule. Do not generate an alert for the old time.
  if (
    willBeEnabled &&
    payload.expected_restoration_datetime !== undefined &&
    payload.expected_restoration_datetime !== previous.expected_restoration_datetime
  ) {
    if (payload.expected_restoration_datetime) {
      const prevDate = previous.expected_restoration_datetime ? new Date(previous.expected_restoration_datetime) : null;
      if (!prevDate || prevDate.getTime() > now.getTime()) {
        nextScheduleRef = `sched_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      }
    } else {
      nextScheduleRef = null;
    }
  }

  // Rule 6: If SUPER ADMIN disables Maintenance Mode before the scheduled time:
  // Cancel or invalidate the pending schedule. Do not generate a restoration alert for that cancelled schedule.
  if (payload.maintenance_enabled === false && previous.maintenance_enabled) {
    const prevDate = previous.expected_restoration_datetime ? new Date(previous.expected_restoration_datetime) : null;
    if (prevDate && prevDate.getTime() > now.getTime()) {
      nextScheduleRef = null;
    }
  }

  const effectivePayload: Partial<DBMaintenanceConfig> = {
    ...payload,
    active_schedule_ref: nextScheduleRef,
  };

  let updated: DBMaintenanceConfig;

  if (db && typeof (db as any).updateMaintenanceConfig === "function") {
    try {
      updated = await db.updateMaintenanceConfig(effectivePayload, adminUser.username);
    } catch {
      updated = writeDirectConfig(effectivePayload, adminUser.username);
    }
  } else {
    updated = writeDirectConfig(effectivePayload, adminUser.username);
  }

  // Invalidate Next.js cache so the public portal immediately reflects the new state
  try {
    revalidatePath("/", "layout");
    revalidatePath("/maintenance");
  } catch (err) {
    console.warn("[Maintenance] Cache revalidation error:", err);
  }

  // Audit Logging
  try {
    const ip = requestMeta?.ip || "127.0.0.1";
    const userAgent = requestMeta?.userAgent || "Internal";

    const stateChanged = payload.maintenance_enabled !== undefined && payload.maintenance_enabled !== previous.maintenance_enabled;
    const action = stateChanged
      ? payload.maintenance_enabled
        ? "WEBSITE_MAINTENANCE_MODE_ENABLED"
        : "WEBSITE_MAINTENANCE_MODE_DISABLED"
      : "WEBSITE_MAINTENANCE_SETTINGS_UPDATED";

    const details = stateChanged
      ? `Global Website Maintenance Mode changed from ${previous.maintenance_enabled ? "ON" : "OFF"} to ${updated.maintenance_enabled ? "ON" : "OFF"}. Updated by Super Admin: ${adminUser.username}.`
      : `Maintenance settings updated by Super Admin: ${adminUser.username}. Title: "${updated.maintenance_title_en}", Expected restore: ${updated.expected_restoration_datetime || "Not set"}.`;

    if (db && typeof (db as any).addRbacAuditLog === "function") {
      await db.addRbacAuditLog(
        adminUser.username,
        adminUser.role,
        ip,
        action,
        "MAINTENANCE_MODE",
        userAgent,
        JSON.stringify({
          enabled: previous.maintenance_enabled,
          title_en: previous.maintenance_title_en,
          expected_restore: previous.expected_restoration_datetime,
        }),
        JSON.stringify({
          enabled: updated.maintenance_enabled,
          title_en: updated.maintenance_title_en,
          expected_restore: updated.expected_restoration_datetime,
        })
      );
    }

    if (db && typeof (db as any).addSecurityEvent === "function") {
      await db.addSecurityEvent({
        username: adminUser.username,
        event_type: action,
        severity: stateChanged ? (updated.maintenance_enabled ? "critical" : "medium") : "info",
        ip_address: ip,
        browser: userAgent,
        details,
      });
    }
  } catch (logErr) {
    console.error("[Maintenance] Failed to write audit logs:", logErr);
  }

  return updated;
}

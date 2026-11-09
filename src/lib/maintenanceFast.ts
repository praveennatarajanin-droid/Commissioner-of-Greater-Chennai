import fs from "fs";
import path from "path";

export interface FastMaintenanceState {
  maintenance_enabled: boolean;
  maintenance_title_en: string;
  maintenance_description_en: string;
  maintenance_title_ta: string;
  maintenance_description_ta: string;
  expected_restoration_datetime: string | null;
  expected_restore_at: string | null;
  maintenance_message_en: string;
  maintenance_message_ta: string;
  updated_by: string;
  updated_at: string;
}

const DB_JSON_PATH = path.join(process.cwd(), "src", "data", "db.json");

const fallbackState: FastMaintenanceState = {
  maintenance_enabled: false,
  maintenance_title_en: "We'll Be Back Soon!",
  maintenance_description_en:
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
  maintenance_title_ta: "இணையதளம் பராமரிப்பில் உள்ளது",
  maintenance_description_ta:
    "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
  expected_restoration_datetime: null,
  expected_restore_at: null,
  maintenance_message_en:
    "The Greater Chennai Police Commissioner Portal is temporarily undergoing scheduled maintenance. We apologize for the inconvenience and will be back shortly.",
  maintenance_message_ta:
    "சென்னை பெருநகர காவல் ஆணையரக இணையதளம் தற்போது பராமரிப்புப் பணியில் உள்ளது. ஏற்பட்டுள்ள சிரமத்திற்கு வருந்துகிறோம். விரைவில் மீண்டும் செயல்படும்.",
  updated_by: "System",
  updated_at: new Date().toISOString(),
};

interface CacheHolder {
  mtime: number;
  state: FastMaintenanceState;
}

let cache: CacheHolder | null = null;

/**
 * Fast, non-blocking maintenance state reader for proxy.ts.
 * Does not import database drivers, next/cache, or client components.
 * Cached by mtime; fails open safely to maintenance_enabled: false.
 */
export function getFastMaintenanceState(): FastMaintenanceState {
  try {
    if (!fs.existsSync(DB_JSON_PATH)) {
      return fallbackState;
    }

    const stat = fs.statSync(DB_JSON_PATH);
    if (cache && cache.mtime === stat.mtimeMs) {
      return cache.state;
    }

    const raw = fs.readFileSync(DB_JSON_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const table = parsed.maintenance_config;

    let state: FastMaintenanceState = fallbackState;
    if (Array.isArray(table) && table.length > 0) {
      const rec = table[0];
      const descEn = rec.maintenance_description_en || rec.maintenance_message_en || fallbackState.maintenance_description_en;
      const descTa = rec.maintenance_description_ta || rec.maintenance_message_ta || fallbackState.maintenance_description_ta;
      const restoreTime = rec.expected_restoration_datetime || rec.expected_restore_at || null;

      state = {
        maintenance_enabled: Boolean(rec.maintenance_enabled),
        maintenance_title_en: rec.maintenance_title_en || fallbackState.maintenance_title_en,
        maintenance_description_en: descEn,
        maintenance_title_ta: rec.maintenance_title_ta || fallbackState.maintenance_title_ta,
        maintenance_description_ta: descTa,
        expected_restoration_datetime: restoreTime,
        expected_restore_at: restoreTime,
        maintenance_message_en: descEn,
        maintenance_message_ta: descTa,
        updated_by: rec.updated_by || "System",
        updated_at: rec.updated_at || new Date().toISOString(),
      };
    }

    cache = {
      mtime: stat.mtimeMs,
      state,
    };
    return state;
  } catch (err) {
    console.error("[Maintenance] Error in getFastMaintenanceState:", err);
    return fallbackState;
  }
}

/**
 * Calculates remaining seconds until expected restoration for HTTP Retry-After header.
 */
export function getRetryAfterSeconds(expectedRestoreAt: string | null | undefined): number | null {
  if (!expectedRestoreAt) return null;
  try {
    const restoreTime = new Date(expectedRestoreAt).getTime();
    if (isNaN(restoreTime)) return null;
    const diffSeconds = Math.ceil((restoreTime - Date.now()) / 1000);
    return diffSeconds > 0 ? diffSeconds : null;
  } catch {
    return null;
  }
}

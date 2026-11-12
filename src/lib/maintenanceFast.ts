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

const globalWithFastCache = globalThis as typeof globalThis & {
  _fastMaintenanceCache?: FastMaintenanceState;
  _fastMaintenanceTimestamp?: number;
};

let cache: CacheHolder | null = null;

export function setFastMaintenanceCache(state: FastMaintenanceState) {
  globalWithFastCache._fastMaintenanceCache = state;
  globalWithFastCache._fastMaintenanceTimestamp = Date.now();
  cache = {
    mtime: -1,
    state,
  };
}

/**
 * Fast, non-blocking maintenance state reader for proxy.ts.
 * Does not import database drivers, next/cache, or client components.
 * Prioritizes live in-memory state; fails open safely to maintenance_enabled: false.
 */
export function getFastMaintenanceState(): FastMaintenanceState {
  if (globalWithFastCache._fastMaintenanceCache) {
    return globalWithFastCache._fastMaintenanceCache;
  }
  if (cache && cache.mtime === -1) {
    return cache.state;
  }
  return fallbackState;
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

"use client";

interface ApiFetchOptions extends RequestInit {
  skipDeduplication?: boolean;
  skipErrorToast?: boolean;
}

// In-flight GET request deduplication map
const inflightGetMap = new Map<string, Promise<any>>();

// In-flight state-changing request submission timestamp map (Double-click protection)
const recentMutationsMap = new Map<string, number>();

// Toast callback listener registered by AuthContext or UI
type NotificationCallback = (message: string, type: "success" | "error" | "warning") => void;
let notifyCallback: NotificationCallback | null = null;
let logoutCallback: (() => void) | null = null;

export function registerApiNotifications(
  onNotify: NotificationCallback,
  onLogout: () => void
) {
  notifyCallback = onNotify;
  logoutCallback = onLogout;
}

/**
 * Centralized Security API Client.
 * Handles deduplication, double-click prevention, AbortController, and status code interceptors (401, 403, 429).
 */
export async function apiFetch<T = any>(
  url: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const isGet = method === "GET";

  // 1. Double-Click / Double-Submit Guard for mutations (POST, PUT, DELETE)
  if (!isGet) {
    const mutationKey = `${method}:${url}:${JSON.stringify(options.body || {})}`;
    const lastSubmitted = recentMutationsMap.get(mutationKey);
    const now = Date.now();

    if (lastSubmitted && now - lastSubmitted < 1000) {
      console.warn(`[ApiClient] Suppressed duplicate ${method} request to ${url} (Double-click guard)`);
      throw new Error("DUPLICATE_SUBMISSION_PREVENTED");
    }
    recentMutationsMap.set(mutationKey, now);

    // Clean mutation history after 2 seconds
    setTimeout(() => recentMutationsMap.delete(mutationKey), 2000);
  }

  // 2. Request Deduplication for GET requests
  if (isGet && !options.skipDeduplication) {
    const getMapKey = `${url}:${JSON.stringify(options.headers || {})}`;
    if (inflightGetMap.has(getMapKey)) {
      return inflightGetMap.get(getMapKey);
    }

    const fetchPromise = executeFetch<T>(url, options).finally(() => {
      inflightGetMap.delete(getMapKey);
    });

    inflightGetMap.set(getMapKey, fetchPromise);
    return fetchPromise;
  }

  return executeFetch<T>(url, options);
}

let cachedCsrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  // Read gcp_csrf_token cookie if available
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(?:^|; )gcp_csrf_token=([^;]*)/);
    if (match && match[1]) return decodeURIComponent(match[1]);
  }

  if (cachedCsrfToken) return cachedCsrfToken;

  try {
    const res = await fetch("/api/admin/csrf");
    if (res.ok) {
      const data = await res.json();
      if (data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        return data.csrfToken;
      }
    }
  } catch {}

  return "";
}

async function executeFetch<T>(url: string, options: ApiFetchOptions, isRetry = false): Promise<T> {
  try {
    const headers = new Headers(options.headers || {});
    if (!headers.has("Content-Type") && options.body && typeof options.body === "string") {
      headers.set("Content-Type", "application/json");
    }

    // Attach CSRF protection header for state-changing methods
    const method = (options.method || "GET").toUpperCase();
    if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
      const token = await getCsrfToken();
      if (token) {
        headers.set("X-CSRF-Token", token);
      }
    }

    const res = await fetch(url, { ...options, headers });

    // Handle 401 Unauthorized -> Session Expired or Revoked
    if (res.status === 401) {
      if (notifyCallback && !options.skipErrorToast) {
        notifyCallback("SESSION EXPIRED. Please sign in again.", "warning");
      }
      if (logoutCallback) {
        logoutCallback();
      }
      throw new Error("UNAUTHORIZED");
    }

    // Handle 403 Forbidden -> Permission Denied or CSRF Validation Failure
    if (res.status === 403) {
      const errData = await res.json().catch(() => ({}));

      // If CSRF validation failed and haven't retried yet -> refresh token and retry request once
      if (errData.code === "CSRF_VALIDATION_FAILED" && !isRetry) {
        console.warn("[ApiClient] CSRF Token Validation Failed. Fetching fresh token and retrying request...");
        cachedCsrfToken = null;
        await getCsrfToken();
        return executeFetch<T>(url, options, true);
      }

      const msg = errData.message || errData.error || "ACCESS DENIED: You lack authorization for this action.";
      if (notifyCallback && !options.skipErrorToast) {
        notifyCallback(msg, "error");
      }
      throw new Error("FORBIDDEN");
    }

    // Handle 429 Too Many Requests -> Rate Limited
    if (res.status === 429) {
      if (notifyCallback && !options.skipErrorToast) {
        notifyCallback("Too many requests. Please wait a moment before trying again.", "warning");
      }
      throw new Error("RATE_LIMITED");
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({ error: `HTTP ${res.status} Error` }));
      throw new Error(errData.error || `Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.log(`[ApiClient] Request to ${url} aborted.`);
      throw error;
    }

    // Handle Network / Connection Loss
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      if (notifyCallback && !options.skipErrorToast) {
        notifyCallback("CONNECTION LOST: Unable to reach security gateway. Please check network connection.", "warning");
      }
    }

    throw error;
  }
}

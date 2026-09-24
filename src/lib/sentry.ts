/**
 * ==============================================================================
 * SENTRY OBSERVABILITY & ERROR MONITORING ENGINE
 * Greater Chennai Police Commissioner Portal
 * ==============================================================================
 */

export interface SentryBreadcrumb {
  category: string;
  message: string;
  level?: "info" | "warning" | "error";
  data?: Record<string, any>;
  timestamp?: number;
}

class SentryClient {
  private dsn: string | undefined;
  private environment: string;
  private isEnabled: boolean;
  private breadcrumbs: SentryBreadcrumb[] = [];

  constructor() {
    this.dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;
    this.environment = process.env.NODE_ENV || "development";
    this.isEnabled = !!this.dsn;
  }

  public init(options?: { dsn?: string; environment?: string; tracesSampleRate?: number }) {
    if (options?.dsn) this.dsn = options.dsn;
    if (options?.environment) this.environment = options.environment;
    this.isEnabled = !!this.dsn;
  }

  public addBreadcrumb(breadcrumb: SentryBreadcrumb) {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now()
    });
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs.shift();
    }
  }

  public captureException(error: Error | any, context?: Record<string, any>) {
    const errorDetails = {
      message: error?.message || String(error),
      stack: error?.stack,
      name: error?.name || "Error",
      context: context || {},
      breadcrumbs: [...this.breadcrumbs],
      environment: this.environment,
      timestamp: new Date().toISOString()
    };

    if (this.isEnabled && typeof window !== "undefined" && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureException(error, { extra: context });
      } catch {}
    } else if (process.env.NODE_ENV === "development") {
      // In development, log formatted Sentry capture
      console.warn("[Sentry Telemetry Capture]:", errorDetails.name, "-", errorDetails.message);
    }
  }

  public captureMessage(message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>) {
    if (this.isEnabled && typeof window !== "undefined" && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureMessage(message, level);
      } catch {}
    }
    this.addBreadcrumb({ category: "log", message, level, data: context });
  }
}

export const sentry = new SentryClient();
export const captureException = (error: Error | any, context?: Record<string, any>) => sentry.captureException(error, context);
export const captureMessage = (message: string, level: "info" | "warning" | "error" = "info", context?: Record<string, any>) => sentry.captureMessage(message, level, context);
export const addBreadcrumb = (breadcrumb: SentryBreadcrumb) => sentry.addBreadcrumb(breadcrumb);
export default sentry;

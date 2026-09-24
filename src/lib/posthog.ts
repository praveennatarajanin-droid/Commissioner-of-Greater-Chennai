/**
 * ==============================================================================
 * POSTHOG TELEMETRY & PRODUCT ANALYTICS INTEGRATION
 * Greater Chennai Police Commissioner Portal
 * ==============================================================================
 */

class PostHogClient {
  private apiKey: string | undefined;
  private host: string;
  private isEnabled: boolean;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    this.host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
    this.isEnabled = !!this.apiKey;
  }

  public init(apiKey?: string, host?: string) {
    if (apiKey) this.apiKey = apiKey;
    if (host) this.host = host;
    this.isEnabled = !!this.apiKey;
  }

  public capture(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;
    
    // Privacy protection: exclude any internal passwords or secret values
    const safeProps = { ...properties };
    delete safeProps.password;
    delete safeProps.token;
    delete safeProps.captchaToken;

    if (typeof window !== "undefined" && (window as any).posthog) {
      try {
        (window as any).posthog.capture(eventName, safeProps);
      } catch {}
    }
  }

  public identify(distinctId: string, userProperties?: Record<string, any>) {
    if (!this.isEnabled) return;
    if (typeof window !== "undefined" && (window as any).posthog) {
      try {
        (window as any).posthog.identify(distinctId, userProperties);
      } catch {}
    }
  }
}

export const posthog = new PostHogClient();

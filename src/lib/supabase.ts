/**
 * ==============================================================================
 * SUPABASE CLOUD DATABASE & STORAGE CLIENT
 * Greater Chennai Police Commissioner Portal
 * ==============================================================================
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

class SupabaseManager {
  private url: string | undefined;
  private anonKey: string | undefined;
  private isConfigured: boolean;

  constructor() {
    this.url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    this.anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    this.isConfigured = !!(this.url && this.anonKey);
  }

  public getStatus() {
    return {
      configured: this.isConfigured,
      url: this.url ? `${this.url.substring(0, 15)}...` : "Not set",
      hasAnonKey: !!this.anonKey,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };
  }

  public async query(table: string, options?: { select?: string; limit?: number }) {
    if (!this.isConfigured) {
      return { data: null, error: new Error("Supabase is not configured. Using local database.") };
    }

    try {
      const endpoint = `${this.url}/rest/v1/${table}?select=${encodeURIComponent(options?.select || "*")}&limit=${options?.limit || 50}`;
      const res = await fetch(endpoint, {
        headers: {
          "apikey": this.anonKey!,
          "Authorization": `Bearer ${this.anonKey!}`,
          "Content-Type": "application/json"
        }
      });
      if (!res.ok) {
        throw new Error(`Supabase query failed with HTTP ${res.status}`);
      }
      const data = await res.json();
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  }
}

export const supabase = new SupabaseManager();

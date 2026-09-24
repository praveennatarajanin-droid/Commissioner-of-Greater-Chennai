import crypto from "crypto";

/**
 * Have I Been Pwned (HIBP) Password Compromise Checker
 * 
 * Implements the NIST SP 800-63B and OWASP A07:2025 compliant k-Anonymity model.
 * The raw password is NEVER transmitted over the network or saved anywhere.
 * 
 * Flow:
 * 1. Compute SHA-1 hash of the password locally in memory.
 * 2. Send only the first 5 hexadecimal characters of the hash (prefix) to HIBP.
 * 3. Receive the set of matching hash suffixes with their breach counts.
 * 4. Compare the remaining 35 characters against the response list locally.
 */

export interface HibpCheckResult {
  pwned: boolean;
  count: number;
  safe: boolean;
  checked: boolean;
  error?: string;
}

export async function checkPasswordPwned(password: string): Promise<HibpCheckResult> {
  if (!password || typeof password !== "string" || password.trim().length === 0) {
    return { pwned: false, count: 0, safe: true, checked: false };
  }

  try {
    // 1. Calculate SHA-1 hash of the plaintext password in uppercase
    const sha1Hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = sha1Hash.substring(0, 5);
    const suffix = sha1Hash.substring(5);

    // 2. Query Have I Been Pwned k-Anonymity API (with 3-second timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "User-Agent": "Chennai-Guardian-Police-Portal-HIBP-Validator",
        "Add-Padding": "true" // Defends against network-level side-channel packet size analysis
      },
      signal: controller.signal,
      cache: "no-store"
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[HIBP] API returned status ${response.status}. Graceful fallback.`);
      return { pwned: false, count: 0, safe: true, checked: false, error: `HIBP API HTTP ${response.status}` };
    }

    const text = await response.text();
    const lines = text.split("\r\n");

    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix && hashSuffix.trim().toUpperCase() === suffix) {
        const count = parseInt(countStr || "0", 10);
        return {
          pwned: count > 0,
          count,
          safe: count === 0,
          checked: true
        };
      }
    }

    // Hash suffix was not found in breach list
    return {
      pwned: false,
      count: 0,
      safe: true,
      checked: true
    };
  } catch (error: any) {
    console.warn("[HIBP] Breach check encountered network or timeout error:", error?.message || error);
    // Graceful fallback to preserve portal availability
    return {
      pwned: false,
      count: 0,
      safe: true,
      checked: false,
      error: error?.message || "HIBP API timeout"
    };
  }
}

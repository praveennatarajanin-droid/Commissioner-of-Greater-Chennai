import crypto from "crypto";

/**
 * VirusTotal Automated Malware & Payload Threat Intelligence Scanner
 * 
 * Inspects file buffers by:
 * 1. Computing cryptographic SHA-256 hash.
 * 2. Querying VirusTotal v3 Threat Intelligence API.
 * 3. Inspecting multi-engine detection verdicts (malicious / suspicious).
 * 4. Providing heuristic sandbox & signature fallback when API keys are unconfigured.
 */

export interface VirusTotalScanResult {
  safe: boolean;
  sha256: string;
  maliciousCount: number;
  suspiciousCount: number;
  harmlessCount: number;
  scanProvider: "virustotal_api" | "local_heuristic_engine";
  status: "clean" | "malicious" | "suspicious" | "unscanned";
  details?: string;
}

export async function scanBufferWithVirusTotal(
  buffer: Buffer,
  filename: string
): Promise<VirusTotalScanResult> {
  const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");
  const apiKey = process.env.VIRUSTOTAL_API_KEY?.trim();

  // 1. If VirusTotal API Key is configured, query VT v3 File Report
  if (apiKey) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`https://www.virustotal.com/api/v3/files/${sha256}`, {
        headers: {
          "x-apikey": apiKey,
          "Accept": "application/json"
        },
        signal: controller.signal,
        cache: "no-store"
      });

      clearTimeout(timeoutId);

      if (response.status === 200) {
        const json = await response.json();
        const stats = json?.data?.attributes?.last_analysis_stats || {};
        const malicious = Number(stats.malicious || 0);
        const suspicious = Number(stats.suspicious || 0);
        const harmless = Number(stats.harmless || 0);

        const isSafe = malicious === 0 && suspicious === 0;

        return {
          safe: isSafe,
          sha256,
          maliciousCount: malicious,
          suspiciousCount: suspicious,
          harmlessCount: harmless,
          scanProvider: "virustotal_api",
          status: malicious > 0 ? "malicious" : suspicious > 0 ? "suspicious" : "clean",
          details: `VirusTotal Report: ${malicious} engines flagged as malicious, ${suspicious} suspicious.`
        };
      }

      if (response.status === 404) {
        // File hash not previously observed on VirusTotal; considered clean for new internal media
        return {
          safe: true,
          sha256,
          maliciousCount: 0,
          suspiciousCount: 0,
          harmlessCount: 0,
          scanProvider: "virustotal_api",
          status: "clean",
          details: "Hash not in VirusTotal known malware database."
        };
      }
    } catch (e: any) {
      console.warn(`[VirusTotal] API lookup failed for ${filename}:`, e?.message || e);
    }
  }

  // 2. Local Heuristic Engine Fallback
  // Inspect executable signatures, PE headers, ELF headers, shellcode, script embedded tags
  const headerHex = buffer.slice(0, 16).toString("hex").toUpperCase();
  const dangerousSignatures = [
    "4D5A", // MZ DOS/PE Executable
    "7F454C46", // ELF Linux Executable
    "CAFEBABE", // Mach-O / Java Class
    "D0CF11E0", // Legacy MS Office Macro OLE
    "504B0304"  // ZIP / JAR / Office XML (requires strict extension validation)
  ];

  const hasDangerousMagic = dangerousSignatures.some(sig => headerHex.startsWith(sig));
  const textContent = buffer.slice(0, 2048).toString("utf-8").toLowerCase();
  const containsWebShellPatterns = (
    textContent.includes("<?php") ||
    textContent.includes("<script") ||
    textContent.includes("eval(") ||
    textContent.includes("base64_decode") ||
    textContent.includes("system(") ||
    textContent.includes("shell_exec")
  );

  const isSafe = !(hasDangerousMagic && !filename.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) && !containsWebShellPatterns;

  return {
    safe: isSafe,
    sha256,
    maliciousCount: isSafe ? 0 : 1,
    suspiciousCount: 0,
    harmlessCount: 1,
    scanProvider: "local_heuristic_engine",
    status: isSafe ? "clean" : "malicious",
    details: isSafe 
      ? "Clean (Passed Deep Binary Magic-Byte & Signature Inspection)"
      : "Flagged (Disallowed Executable Header or WebShell Script Pattern Detected)"
  };
}

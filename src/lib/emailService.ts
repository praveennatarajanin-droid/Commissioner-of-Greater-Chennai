import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { isValidEmail } from "@/lib/security";

/**
 * STRICT AUTHORIZED PRODUCTION SMTP IDENTITY
 * Single centralized GCP.IT account for all outbound portal email communications.
 */
export const AUTHORIZED_SMTP_ACCOUNT = "gcp.itdepartment@gmail.com";
export const AUTHORIZED_SMTP_SENDER = '"Greater Chennai Police Executive Desk" <gcp.itdepartment@gmail.com>';
export const AUTHORIZED_SMTP_HOST = "smtp.gmail.com";
export const AUTHORIZED_SMTP_PORT = 465;
export const AUTHORIZED_SMTP_SECURE = true;

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface EmailSendOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  text?: string;
  from?: string; // Strictly overridden by server-side AUTHORIZED_SMTP_SENDER
}

export interface EmailSendResult {
  success: boolean;
  status:
    | "SMTP_ACCEPTED"
    | "SMTP_NOT_CONFIGURED"
    | "SMTP_AUTH_FAILED"
    | "SMTP_CONNECTION_TIMEOUT"
    | "SMTP_CONNECTION_REFUSED"
    | "SMTP_DNS_ERROR"
    | "SMTP_TLS_ERROR"
    | "SMTP_RECIPIENT_REJECTED"
    | "SMTP_ERROR";
  messageId?: string;
  response?: string;
  error?: string;
  devMode?: boolean;
}

/**
 * Safely masks email addresses for privacy and security in audit logs.
 * Example: gcp.itdepartment@gmail.com -> gcp.itd***@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***@***.***";
  const [local, domain] = email.split("@");
  if (local.length <= 3) {
    return `${local[0] || "*"}***@${domain}`;
  }
  const visible = local.slice(0, Math.min(6, Math.floor(local.length / 2)));
  return `${visible}***@${domain}`;
}

/**
 * Cleans and normalizes SMTP password/secret strings.
 * Automatically removes accidental whitespace, Google App Password 4-char spaces, and enclosing quotes.
 */
export function cleanSmtpPassword(rawPass?: string | null): string {
  if (!rawPass) return "";
  return String(rawPass).trim().replace(/^["']|["']$/g, "").replace(/\s+/g, "");
}

/**
 * Strips CRLF characters to prevent SMTP / Email Header Injection attacks.
 */
export function stripCrlf(str: string): string {
  return str.replace(/[\r\n\0]/g, "").trim();
}

/**
 * Classifies low-level network / SMTP errors into actionable diagnostic codes.
 */
export function classifySmtpError(error: any): EmailSendResult["status"] {
  if (!error) return "SMTP_ERROR";
  const msg = String(error.message || "").toLowerCase();
  const code = String(error.code || "").toUpperCase();
  const responseCode = Number(error.responseCode);

  if (code === "EAUTH" || responseCode === 535 || msg.includes("badcredentials") || msg.includes("invalid login")) {
    return "SMTP_AUTH_FAILED";
  }
  if (code === "ENOTFOUND" || code === "EDNS" || msg.includes("getaddrinfo")) {
    return "SMTP_DNS_ERROR";
  }
  if (code === "ETIMEDOUT" || code === "ETIME" || msg.includes("timeout") || msg.includes("timed out")) {
    return "SMTP_CONNECTION_TIMEOUT";
  }
  if (code === "ECONNREFUSED" || msg.includes("connection refused")) {
    return "SMTP_CONNECTION_REFUSED";
  }
  if (code === "ESOCKET" || msg.includes("tls") || msg.includes("handshake") || msg.includes("certificate")) {
    return "SMTP_TLS_ERROR";
  }
  if (responseCode === 550 || responseCode === 553 || msg.includes("recipient rejected")) {
    return "SMTP_RECIPIENT_REJECTED";
  }
  return "SMTP_ERROR";
}

/**
 * Resolves the authoritative production SMTP configuration.
 * Strictly locks the user and sender to the authorized GCP.IT account: gcp.itdepartment@gmail.com
 */
export async function getSmtpConfig(): Promise<SmtpConfig> {
  const envPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "";
  const envHost = process.env.SMTP_HOST || AUTHORIZED_SMTP_HOST;
  const envPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : AUTHORIZED_SMTP_PORT;
  const envSecure = process.env.SMTP_SECURE !== undefined ? process.env.SMTP_SECURE === "true" : envPort === 465;

  let dbConfig: Record<string, any> = {};
  try {
    dbConfig = await db.getSuperadminConfig();
  } catch {}

  const host = envHost || dbConfig.smtpHost || AUTHORIZED_SMTP_HOST;
  const port = envPort || (dbConfig.smtpPort ? parseInt(dbConfig.smtpPort, 10) : AUTHORIZED_SMTP_PORT);
  const secure = envSecure !== undefined ? envSecure : port === 465;
  const pass = cleanSmtpPassword(envPass || dbConfig.smtpPass || "");

  // STRICT SINGLE ACCOUNT ENFORCEMENT
  const user = AUTHORIZED_SMTP_ACCOUNT;
  const from = AUTHORIZED_SMTP_SENDER;

  return { host, port, secure, user, pass, from };
}

/**
 * Creates a configured Nodemailer transporter with robust timeouts and modern TLS parameters.
 */
export function createTransporter(config: SmtpConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    connectionTimeout: 10000, // 10 seconds for TCP/TLS establishment
    greetingTimeout: 10000,   // 10 seconds for SMTP greeting
    socketTimeout: 10000,     // 10 seconds for socket inactivity
    auth: config.pass ? { user: AUTHORIZED_SMTP_ACCOUNT, pass: config.pass } : undefined,
    tls: {
      minVersion: "TLSv1.2",
      rejectUnauthorized: true,
    },
  });
}

/**
 * Verifies SMTP server connectivity and credentials without sending an email message.
 */
export async function verifySmtpConnection(): Promise<{
  ok: boolean;
  status: EmailSendResult["status"];
  message: string;
  configSummary: { host: string; port: number; secure: boolean; user: string; sender: string };
}> {
  const config = await getSmtpConfig();
  const configSummary = {
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: maskEmail(AUTHORIZED_SMTP_ACCOUNT),
    sender: AUTHORIZED_SMTP_ACCOUNT,
  };

  if (!config.pass) {
    return {
      ok: false,
      status: "SMTP_NOT_CONFIGURED",
      message: "SMTP password/secret is not configured.",
      configSummary,
    };
  }

  try {
    const transporter = createTransporter(config);
    await transporter.verify();
    return {
      ok: true,
      status: "SMTP_ACCEPTED",
      message: "SMTP connection, TLS handshake, and authentication successfully verified for authorized account gcp.itdepartment@gmail.com.",
      configSummary,
    };
  } catch (err: any) {
    const classified = classifySmtpError(err);
    return {
      ok: false,
      status: classified,
      message: `SMTP verification failed (${classified}): ${err.message || "Unknown error"}`,
      configSummary,
    };
  }
}

/**
 * Authoritative Email Dispatch Service.
 * Enforces:
 * 1. Sender is ALWAYS gcp.itdepartment@gmail.com (client override ignored).
 * 2. Synchronous delivery acknowledgment (SMTP 250 OK before reporting success).
 * 3. Sanitized and validated replyTo header.
 */
export async function sendSmtpEmail(options: EmailSendOptions): Promise<EmailSendResult> {
  const config = await getSmtpConfig();
  const maskedTo = maskEmail(options.to);
  const timestamp = new Date().toISOString();

  // If no credentials configured, enter safe dev outbox logging
  if (!config.pass) {
    console.log(`[EMAIL_DEV_OUTBOX] ${timestamp} SENDER: ${AUTHORIZED_SMTP_ACCOUNT} | TO: ${maskedTo} | SUBJECT: ${options.subject}`);
    console.log("NOTE: Real SMTP is disabled because no SMTP password was provided in environment variables.");
    return {
      success: true,
      status: "SMTP_NOT_CONFIGURED",
      devMode: true,
      error: "Real SMTP credentials not configured; logged to dev outbox.",
    };
  }

  console.log(`[EMAIL_SEND_STARTED] ${timestamp} | SENDER: ${maskEmail(AUTHORIZED_SMTP_ACCOUNT)} | RECIPIENT: ${maskedTo} | SUBJECT: ${options.subject}`);

  try {
    const transporter = createTransporter(config);

    // Validate and sanitize Reply-To if supplied
    let safeReplyTo: string | undefined = undefined;
    if (options.replyTo) {
      const cleanedReply = stripCrlf(options.replyTo);
      if (isValidEmail(cleanedReply)) {
        safeReplyTo = cleanedReply;
      }
    }
    
    // ENFORCE SERVER-CONTROLLED SENDER IDENTITY (CLIENT FROM OVERRIDE IGNORED)
    const info = await transporter.sendMail({
      from: AUTHORIZED_SMTP_SENDER,
      to: options.to,
      replyTo: safeReplyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    const isAccepted = Array.isArray(info.accepted) && info.accepted.length > 0;
    if (isAccepted) {
      console.log(`[SMTP_ACCEPTED] SENDER: ${maskEmail(AUTHORIZED_SMTP_ACCOUNT)} | MessageId: ${info.messageId} | Response: ${info.response}`);
      return {
        success: true,
        status: "SMTP_ACCEPTED",
        messageId: info.messageId,
        response: info.response,
      };
    } else {
      console.warn(`[SMTP_REJECTED] SENDER: ${maskEmail(AUTHORIZED_SMTP_ACCOUNT)} | Rejected recipient ${maskedTo} | Response: ${info.response}`);
      return {
        success: false,
        status: "SMTP_RECIPIENT_REJECTED",
        response: info.response,
        error: "SMTP server rejected the recipient address.",
      };
    }
  } catch (err: any) {
    const classified = classifySmtpError(err);
    console.error(`[${classified}] ${timestamp} Delivery failure for ${maskedTo}:`, err.message || err);

    return {
      success: false,
      status: classified,
      error: `Email delivery failed: ${classified} (${err.message || "Network error"})`,
    };
  }
}

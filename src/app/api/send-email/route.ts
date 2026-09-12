import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { checkRateLimit, RateLimitPolicies, getClientIp, rateLimitExceededResponse } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/sanitizer";
import { isValidEmail } from "@/lib/security";

/**
 * Strips Carriage Return and Line Feed characters to prevent SMTP / HTTP Header Injection.
 */
function stripCrlf(str: string): string {
  return str.replace(/[\r\n\0]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Enforce Server-Side Rate Limiting (5 requests per 15 mins per IP)
    const rateCheck = checkRateLimit(ip, RateLimitPolicies.EMAIL);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(request, "email", rateCheck);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const rawName = String(body.name || "").trim();
    const rawEmail = String(body.email || "").trim();
    const rawMobile = String(body.mobile || "").trim();
    const rawGrievance = String(body.grievance || "").trim();

    // 2. Strict Input Validation & Schema Restrictions
    if (!rawName || !rawEmail || !rawMobile || !rawGrievance) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (rawName.length > 100 || rawEmail.length > 100 || rawMobile.length > 20 || rawGrievance.length > 5000) {
      return NextResponse.json({ success: false, error: "Input payload exceeds allowed maximum length." }, { status: 400 });
    }

    if (!isValidEmail(rawEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email address provided." }, { status: 400 });
    }

    // 3. Header Sanitization (CRLF Stripping)
    const safeHeaderName = stripCrlf(rawName);
    const safeHeaderEmail = stripCrlf(rawEmail);
    const safeHeaderMobile = stripCrlf(rawMobile);

    // 4. HTML Entity Encoding (Defense against HTML Injection)
    const safeHtmlName = escapeHtml(safeHeaderName);
    const safeHtmlEmail = escapeHtml(safeHeaderEmail);
    const safeHtmlMobile = escapeHtml(safeHeaderMobile);
    const safeHtmlGrievance = escapeHtml(rawGrievance);

    // Define the responsive email body with strict HTML-escaped content
    const emailHtml = `
      <style>
        @media only screen and (max-width: 600px) {
          .email-card {
            width: 100% !important;
            max-width: 100% !important;
            border-radius: 8px !important;
          }
          .email-header {
            padding: 16px 12px !important;
          }
          .email-body {
            padding: 16px 12px !important;
          }
          .email-table {
            display: block !important;
            width: 100% !important;
          }
          .email-table tbody {
            display: block !important;
            width: 100% !important;
          }
          .email-row {
            display: block !important;
            width: 100% !important;
          }
          .email-label {
            display: block !important;
            width: 100% !important;
            padding-top: 6px !important;
            padding-bottom: 2px !important;
            box-sizing: border-box !important;
          }
          .email-val {
            display: block !important;
            width: 100% !important;
            padding-bottom: 8px !important;
            box-sizing: border-box !important;
            word-break: break-all !important;
          }
          .email-title {
            font-size: 14px !important;
          }
          .email-subtitle {
            font-size: 8px !important;
          }
        }
      </style>
      <div class="email-card" style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: #ffffff;">
        <div class="email-header" style="background-color: #7A1C1C; color: white; padding: 24px; text-align: center; border-bottom: 4px solid #C5A059;">
          <h2 class="email-title" style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Greater Chennai Police</h2>
          <p class="email-subtitle" style="margin: 4px 0 0 0; font-size: 10px; color: #FDE047; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Administrative Desk Notification</p>
        </div>
        
        <div class="email-body" style="padding: 24px; color: #1f2937; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #7A1C1C; font-size: 15px; font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">New Citizen Grievance Submission</h3>
          
          <table class="email-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; width: 120px; vertical-align: top;">Sender Name:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeHtmlName}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Email Address:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827;"><a href="mailto:${safeHtmlEmail}" style="color: #7A1C1C; text-decoration: none; font-weight: 600;">${safeHtmlEmail}</a></td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Mobile Number:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeHtmlMobile}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Grievance / Message:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; white-space: pre-wrap; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px; display: block;">${safeHtmlGrievance}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">This outreach message is securely dispatched to the GCP Executive Desk.</p>
          <p style="margin: 4px 0 0 0; font-weight: bold; color: #7A1C1C;">© 2026 Chennai Guardian | Greater Chennai Police Executive Desk</p>
        </div>
      </div>
    `;

    // Dispatch email asynchronously so client response is not delayed by SMTP handshakes
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (pass) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        connectionTimeout: 2000,
        greetingTimeout: 2000,
        socketTimeout: 2000,
        auth: {
          user: "gcp.itdepartment@gmail.com",
          pass: pass,
        },
      });

      transporter.sendMail({
        from: '"Chennai Guardian Portal" <gcp.itdepartment@gmail.com>',
        to: "gcp.itdepartment@gmail.com",
        replyTo: safeHeaderEmail,
        subject: `New Grievance Registration - ${safeHeaderName}`,
        html: emailHtml,
      }).then(() => {
        console.log("Real email dispatched via SMTP to gcp.itdepartment@gmail.com");
      }).catch((smtpErr) => {
        console.warn("SMTP delivery failed or timed out:", smtpErr?.message || smtpErr);
      });
    } else {
      // Development fallback log
      console.log("\n==================== GCP EMAIL OUTBOX TRANSCRIPT ====================");
      console.log("NOTE: Real SMTP is disabled because GMAIL_APP_PASSWORD is not set in .env.local");
      console.log(`TO: gcp.itdepartment@gmail.com`);
      console.log(`SUBJECT: New Grievance Registration - ${safeHeaderName}`);
      console.log("=====================================================================");
    }

    return NextResponse.json({
      success: true,
      message: "Grievance registered and processed successfully."
    });
  } catch (err: any) {
    console.error("Nodemailer error:", err);
    return NextResponse.json({ success: false, error: "Failed to process grievance." }, { status: 500 });
  }
}

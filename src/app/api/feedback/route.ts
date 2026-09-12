import { NextResponse } from "next/server";
import { checkRateLimit, RateLimitPolicies, getClientIp, rateLimitExceededResponse } from "@/lib/rateLimit";
import { escapeHtml } from "@/lib/sanitizer";
import { isValidEmail } from "@/lib/security";

function stripCrlf(str: string): string {
  return str.replace(/[\r\n\0]/g, "").trim();
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);

    // 1. Rate Limiting
    const rateCheck = checkRateLimit(ip, RateLimitPolicies.EMAIL);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(request, "feedback", rateCheck);
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

    const rawName = String(body.name || "").trim();
    const rawEmail = String(body.email || "").trim();
    const rawPhone = String(body.phone || "").trim();
    const rawFeedbackType = String(body.feedbackType || "General").trim();
    const rawSubject = String(body.subject || "").trim();
    const rawMessage = String(body.message || "").trim();

    if (!rawName || !rawEmail || !rawPhone || !rawSubject || !rawMessage) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }

    if (rawName.length > 100 || rawEmail.length > 100 || rawPhone.length > 20 || rawSubject.length > 200 || rawMessage.length > 5000) {
      return NextResponse.json({ success: false, error: "Input payload exceeds allowed maximum length." }, { status: 400 });
    }

    if (!isValidEmail(rawEmail)) {
      return NextResponse.json({ success: false, error: "Invalid email address." }, { status: 400 });
    }

    // Generate feedback reference number
    const refNum = `GCP-FDB-${Math.floor(100000 + Math.random() * 900000)}`;

    const safeHeaderName = stripCrlf(rawName);
    const safeHeaderEmail = stripCrlf(rawEmail);
    const safeHeaderPhone = stripCrlf(rawPhone);
    const safeHeaderType = stripCrlf(rawFeedbackType);
    const safeHeaderSubject = stripCrlf(rawSubject);

    const safeHtmlName = escapeHtml(safeHeaderName);
    const safeHtmlEmail = escapeHtml(safeHeaderEmail);
    const safeHtmlPhone = escapeHtml(safeHeaderPhone);
    const safeHtmlType = escapeHtml(safeHeaderType);
    const safeHtmlSubject = escapeHtml(safeHeaderSubject);
    const safeHtmlMessage = escapeHtml(rawMessage);

    const emailHtml = `
      <div class="email-card" style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: #ffffff;">
        <div class="email-header" style="background-color: #ed1b24; color: white; padding: 24px; text-align: center; border-bottom: 4px solid #C5A059;">
          <h2 class="email-title" style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Greater Chennai Police</h2>
          <p class="email-subtitle" style="margin: 4px 0 0 0; font-size: 10px; color: #FDE047; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Public Feedback Desk</p>
        </div>
        
        <div class="email-body" style="padding: 24px; color: #1f2937; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #ed1b24; font-size: 15px; font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
            Feedback Registered — Ref: ${refNum}
          </h3>
          <p style="font-size: 13px; color: #374151;">
            Thank you for sharing your feedback with us. Your submission has been registered.
          </p>
          
          <table class="email-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; width: 140px; vertical-align: top;">Feedback Type:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600; text-transform: uppercase;">${safeHtmlType}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Name:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeHtmlName}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Email Address:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827;"><a href="mailto:${safeHtmlEmail}" style="color: #ed1b24; text-decoration: none; font-weight: 600;">${safeHtmlEmail}</a></td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Contact Number:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeHtmlPhone}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Subject:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${safeHtmlSubject}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Feedback Details:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; white-space: pre-wrap; background-color: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px; display: block;">${safeHtmlMessage}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">This outbox record is securely dispatched to: <strong>feedback@gcp.tn.gov.in</strong>.</p>
          <p style="margin: 4px 0 0 0; font-weight: bold; color: #ed1b24;">© 2026 Chennai Guardian | Greater Chennai Police Feedback & Grievance Desk</p>
        </div>
      </div>
    `;

    // Log the outbox to terminal console
    console.log(`[Feedback Registered] Ref: ${refNum} by ${safeHeaderName} (${safeHeaderEmail})`);

    return NextResponse.json({
      success: true,
      message: "Feedback registered successfully",
      referenceNumber: refNum
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "Failed to register feedback." }, { status: 500 });
  }
}

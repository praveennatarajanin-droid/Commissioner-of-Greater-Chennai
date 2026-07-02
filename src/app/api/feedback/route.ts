import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, feedbackType, subject, message } = body;

    // Generate feedback reference number
    const refNum = `GCP-FDB-${Math.floor(100000 + Math.random() * 900000)}`;

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
            letter-spacing: 1px !important;
          }
        }
      </style>
      <div class="email-card" style="font-family: Arial, sans-serif; width: 100%; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); background-color: #ffffff;">
        <div class="email-header" style="background-color: #ed1b24; color: white; padding: 24px; text-align: center; border-bottom: 4px solid #C5A059;">
          <img src="/images/gcp_logo.png" alt="Greater Chennai Police Logo" style="width: 70px; height: 70px; margin-bottom: 10px; display: inline-block;" />
          <h2 class="email-title" style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Greater Chennai Police</h2>
          <p class="email-subtitle" style="margin: 4px 0 0 0; font-size: 10px; color: #FDE047; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Public Feedback Desk</p>
        </div>
        
        <div class="email-body" style="padding: 24px; color: #1f2937; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #ed1b24; font-size: 15px; font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">
            Feedback Registered — Ref: ${refNum}
          </h3>
          <p style="font-size: 13px; color: #374151;">
            Thank you for sharing your feedback with us. Your submission has been registered and forwarded to the concerned department for analysis and implementation.
          </p>
          
          <table class="email-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; width: 140px; vertical-align: top;">Feedback Type:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${feedbackType}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Name:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${name}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Email Address:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827;"><a href="mailto:${email}" style="color: #ed1b24; text-decoration: none; font-weight: 600;">${email}</a></td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Contact Number:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${phone}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Subject:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; font-weight: 600;">${subject}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 6px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Feedback Details:</td>
              <td class="email-val" style="padding: 6px 0; font-size: 13px; color: #111827; white-space: pre-wrap; background-color: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px; display: block;">${message}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">This outbox record is automatically dispatched to: <strong>feedback@gcp.tn.gov.in</strong>.</p>
          <p style="margin: 4px 0 0 0; font-weight: bold; color: #ed1b24;">© 2026 Chennai Guardian | Greater Chennai Police Feedback & Grievance Desk</p>
        </div>
      </div>
    `;

    // Log the outbox to terminal console
    console.log("\n==================== GCP EMAIL OUTBOX TRANSCRIPT (FEEDBACK) ====================");
    console.log(`TO: feedback@gcp.tn.gov.in`);
    console.log(`SUBJECT: Feedback Received [${feedbackType}] - Ref: ${refNum} - ${subject}`);
    console.log("================================================================================");
    console.log(emailHtml.trim());
    console.log("================================================================================\n");

    return NextResponse.json({
      success: true,
      message: "Feedback registered successfully",
      referenceNumber: refNum,
      recipient: "feedback@gcp.tn.gov.in",
      emailHtml: emailHtml
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

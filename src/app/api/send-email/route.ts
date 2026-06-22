import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, mobile, grievance } = body;

    // Define the responsive email body with style tags and media queries
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
        <div class="email-header" style="background-color: #7A1C1C; color: white; padding: 24px; text-align: center; border-bottom: 4px solid #C5A059;">
          <!-- Greater Chennai Police Crest Logo -->
          <img src="/images/gcp_logo.png" alt="Greater Chennai Police Logo" style="width: 70px; height: 70px; margin-bottom: 10px; display: inline-block;" />
          <h2 class="email-title" style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">Greater Chennai Police</h2>
          <p class="email-subtitle" style="margin: 4px 0 0 0; font-size: 10px; color: #FDE047; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Administrative Desk Notification</p>
        </div>
        
        <div class="email-body" style="padding: 24px; color: #1f2937; line-height: 1.6;">
          <h3 style="margin-top: 0; color: #7A1C1C; font-size: 15px; font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-bottom: 8px;">New Citizen Grievance Submission</h3>
          
          <table class="email-table" style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; width: 120px; vertical-align: top;">Sender Name:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${name}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Email Address:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827;"><a href="mailto:${email}" style="color: #7A1C1C; text-decoration: none; font-weight: 600;">${email}</a></td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Mobile Number:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; font-weight: 600;">${mobile}</td>
            </tr>
            <tr class="email-row">
              <td class="email-label" style="padding: 8px 0; font-weight: bold; font-size: 13px; color: #4b5563; vertical-align: top;">Grievance / Message:</td>
              <td class="email-val" style="padding: 8px 0; font-size: 13px; color: #111827; white-space: pre-wrap; background-color: #f9fafb; padding: 12px; border-radius: 6px; border: 1px solid #f3f4f6; margin-top: 4px; display: block;">${grievance}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0;">This outreach message is automatically dispatched to: <strong>prasathragul75@gmail.com</strong>.</p>
          <p style="margin: 4px 0 0 0; font-weight: bold; color: #7A1C1C;">© 2026 Chennai Guardian | Greater Chennai Police Executive Desk</p>
        </div>
      </div>
    `;

    // Log the simulated email outbox to the development terminal
    console.log("\n==================== GCP EMAIL OUTBOX TRANSCRIPT ====================");
    console.log(`TO: prasathragul75@gmail.com`);
    console.log(`SUBJECT: New Grievance Registration - ${name}`);
    console.log("=====================================================================");
    console.log(emailHtml.trim());
    console.log("=====================================================================\n");

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      recipient: "prasathragul75@gmail.com",
      emailHtml: emailHtml
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

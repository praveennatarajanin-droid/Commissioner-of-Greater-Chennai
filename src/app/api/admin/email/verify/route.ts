import { NextResponse } from "next/server";
import { getSessionUser, isAdmin } from "@/lib/auth";
import { verifySmtpConnection, sendSmtpEmail } from "@/lib/emailService";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/email/verify
 * Diagnostic endpoint for administrators to check SMTP connectivity, TLS handshake, and authentication.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const result = await verifySmtpConnection();
  return NextResponse.json(result);
}

/**
 * POST /api/admin/email/verify
 * Triggers a controlled real-email test send to gcp.itdepartment@gmail.com by an authorized Super Admin / Admin.
 */
export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const targetEmail = body.to || "gcp.itdepartment@gmail.com";

  const result = await sendSmtpEmail({
    to: targetEmail,
    subject: `[ADMIN DIAGNOSTIC] SMTP Verification Test - ${new Date().toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #1e40af; margin-top: 0;">GCP Portal SMTP Diagnostic Test</h2>
        <p>This is a controlled diagnostic test dispatched from the Greater Chennai Police Commissioner Portal Admin Console.</p>
        <p><strong>Triggered By:</strong> ${user.username} (${user.role})</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;" />
        <p style="font-size: 11px; color: #6b7280;">© 2026 Greater Chennai Police Portal Administration</p>
      </div>
    `,
    text: `GCP Portal SMTP Diagnostic Test\nTriggered By: ${user.username}\nTimestamp: ${new Date().toISOString()}`,
  });

  if (result.success) {
    await db.addActivityLog(user.username, `Executed SMTP diagnostic test send to ${targetEmail} (Status: ${result.status})`);
  }

  return NextResponse.json(result);
}

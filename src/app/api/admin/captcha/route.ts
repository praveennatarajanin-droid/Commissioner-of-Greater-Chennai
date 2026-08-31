import { NextResponse } from "next/server";
import { generateCaptchaChallenge, verifyCaptchaChallenge } from "@/lib/captcha";
import { secureApiResponse } from "@/lib/apiSecurity";

/**
 * GET /api/admin/captcha
 * Returns a fresh single-use server-side CAPTCHA challenge token & question.
 */
export async function GET() {
  const challenge = generateCaptchaChallenge();
  return NextResponse.json({
    success: true,
    token: challenge.token,
    captchaToken: challenge.token,
    question: challenge.question,
    captchaQuestion: challenge.question,
    captchaSvg: challenge.captchaSvg,
    expires_at: challenge.expiresAt
  });
}

/**
 * POST /api/admin/captcha
 * Validates CAPTCHA answer server-side and invalidates token.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { token, answer } = body;

  const valid = verifyCaptchaChallenge(token, answer);
  if (!valid) {
    return secureApiResponse({ success: false, error: "INVALID_CAPTCHA: Challenge answer is incorrect or expired." }, 400);
  }

  return secureApiResponse({ success: true, message: "CAPTCHA challenge verified successfully." });
}

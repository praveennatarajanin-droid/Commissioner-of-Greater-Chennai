import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { cookies } from "next/headers";
import { getIpAddress } from "@/lib/auth";
import { verifyCaptchaToken } from "@/lib/captcha";

export async function POST(req: Request) {
  try {
    const { username, password, captchaInput, captchaToken } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    // Server-side CAPTCHA verification check
    if (!captchaInput || !captchaToken || !verifyCaptchaToken(captchaInput, captchaToken)) {
      return NextResponse.json(
        { error: "Invalid security verification code. Please try again." },
        { status: 400 }
      );
    }

    const users = await db.getUsers();
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    // Lockout protection
    if (user.locked === 1 || (user.failed_logins && user.failed_logins >= 5)) {
      user.locked = 1;
      await db.saveUsers(users);
      await db.addRbacAuditLog(username, "Unknown", ip, "Login attempt blocked: Account is locked", "Auth", browser);
      return NextResponse.json({ error: "Your account has been locked due to too many failed login attempts. Contact your system administrator to unlock it." }, { status: 403 });
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "Your account has been disabled. Contact system administrator." }, { status: 403 });
    }

    const hash = hashPassword(password);
    if (user.passwordHash !== hash) {
      user.failed_logins = (user.failed_logins || 0) + 1;
      if (user.failed_logins >= 5) {
        user.locked = 1;
      }
      await db.saveUsers(users);
      await db.addRbacAuditLog(user.username, user.role, ip, `Failed login attempt (${user.failed_logins}/5)`, "Auth", browser);
      
      if (user.failed_logins >= 5) {
        return NextResponse.json({ error: "Invalid credentials. Too many failed attempts: your account is now locked." }, { status: 401 });
      }
      return NextResponse.json({ error: `Invalid credentials. Failed attempt ${user.failed_logins} of 5.` }, { status: 401 });
    }

    // Password expiry warning/force change logic (90 days)
    if (user.createdAt) {
      const createdDate = new Date(user.createdAt);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreation > 90) {
        user.force_password_change = 1;
      }
    }

    // Reset failed counter on success
    user.failed_logins = 0;
    user.lastLogin = new Date().toISOString();
    await db.saveUsers(users);

    await db.addRbacAuditLog(user.username, user.role, ip, "User logged in successfully", "Auth", browser);

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    const permissions = await db.getResolvedPermissions(user.username, user.role);
    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        role: user.role,
        email: user.email || "",
        mobile: (user as any).mobile || "",
        profile_photo: (user as any).profile_photo || "",
        force_password_change: (user as any).force_password_change || 0,
        permissions
      }
    });
  } catch (e) {
    console.error("Auth login error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ authenticated: false });
    }

    const session = JSON.parse(sessionCookie.value);
    const permissions = await db.getResolvedPermissions(session.username, session.role);
    const usersList = await db.getUsers();
    const userRecord = usersList.find(u => u.username.toLowerCase() === session.username.toLowerCase());

    return NextResponse.json({
      authenticated: true,
      user: {
        username: session.username,
        role: session.role,
        email: userRecord?.email || "",
        mobile: (userRecord as any)?.mobile || "",
        profile_photo: (userRecord as any)?.profile_photo || "",
        force_password_change: (userRecord as any)?.force_password_change || 0,
        permissions
      }
    });
  } catch (e) {
    console.error("Auth check error", e);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (sessionCookie && sessionCookie.value) {
      try {
        const session = JSON.parse(sessionCookie.value);
        const ip = getIpAddress(req);
        await db.addRbacAuditLog(session.username, session.role, ip, "User logged out", "Auth");
      } catch {}
    }
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Auth logout error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

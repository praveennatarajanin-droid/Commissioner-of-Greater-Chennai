import { NextResponse } from "next/server";
import { db, hashPassword } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const users = await db.getUsers();
    const hash = hashPassword(password);
    const user = users.find((u) => u.username === username && u.passwordHash === hash);

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "disabled") {
      return NextResponse.json({ error: "Your account has been disabled. Contact system administrator." }, { status: 403 });
    }

    // Update lastLogin
    user.lastLogin = new Date().toISOString();
    await db.saveUsers(users);

    // Add activity log
    await db.addActivityLog(user.username, "User logged in successfully");

    // Set secure cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", JSON.stringify({ username: user.username, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return NextResponse.json({ success: true, user: { username: user.username, role: user.role } });
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
    return NextResponse.json({ authenticated: true, user: session });
  } catch (e) {
    console.error("Auth check error", e);
    return NextResponse.json({ authenticated: false });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Auth logout error", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

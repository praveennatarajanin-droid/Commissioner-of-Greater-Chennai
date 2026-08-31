import { NextResponse } from "next/server";
import { getIpAddress } from "@/lib/auth";
import { db, hashPassword } from "@/lib/db";
import { authenticateApiRequest, authorizeRole, forbiddenResponse, unauthorizedResponse } from "@/lib/security";

// ── GET HANDLER ──
export async function GET(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin privilege required.");
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (action === "users") {
      const usersList = await db.getUsers();
      // Remove password hash from response
      const sanitizedUsers = usersList.map(({ passwordHash, ...rest }) => rest);
      return NextResponse.json(sanitizedUsers);
    }

    if (action === "roles") {
      const roles = await db.getCustomRoles();
      return NextResponse.json(roles);
    }

    if (action === "logs") {
      const logs = await db.getActivityLogs();
      return NextResponse.json(logs);
    }

    if (action === "backup") {
      const backupJson = await db.backupDatabase();
      const ip = getIpAddress(req);
      const browser = req.headers.get("user-agent") || "Unknown";
      await db.addRbacAuditLog(user.username, user.role, ip, "Database backup downloaded", "Backup", browser);
      
      return new NextResponse(backupJson, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="chennai_guardian_backup_${Date.now()}.json"`,
        },
      });
    }

    if (action === "config") {
      const config = await db.getSuperadminConfig();
      return NextResponse.json(config);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Superadmin GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── POST HANDLER ──
export async function POST(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin privilege required.");
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    if (action === "users") {
      const { username, password, role, email, status, mobile, profile_photo, locked, force_password_change, permissions_json } = await req.json();
      if (!username || !password || !role || !email) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const usersList = await db.getUsers();
      if (usersList.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }

      const newUser = {
        id: usersList.length > 0 ? Math.max(...usersList.map((u) => u.id)) + 1 : 1,
        username,
        passwordHash: hashPassword(password),
        role,
        email,
        status: status || "active",
        mobile: mobile || "",
        profile_photo: profile_photo || "",
        locked: locked ? 1 : 0,
        failed_logins: 0,
        force_password_change: force_password_change ? 1 : 0,
        permissions_json: typeof permissions_json === "object" ? JSON.stringify(permissions_json) : (permissions_json || ""),
        createdAt: new Date().toISOString(),
      };

      usersList.push(newUser as any);
      await db.saveUsers(usersList);

      await db.addRbacAuditLog(user.username, user.role, ip, `Created user: ${username} (${role})`, "UserManagement", browser, "", JSON.stringify(newUser));
      return NextResponse.json({ success: true });
    }

    if (action === "roles") {
      const { role_name, permissions_json } = await req.json();
      if (!role_name) {
        return NextResponse.json({ error: "Role name is required" }, { status: 400 });
      }

      const roles = await db.getCustomRoles();
      if (roles.some((r) => r.role_name.toLowerCase() === role_name.toLowerCase())) {
        return NextResponse.json({ error: "Role name already exists" }, { status: 400 });
      }

      const newRole = {
        id: roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1,
        role_name,
        permissions_json: typeof permissions_json === "object" ? JSON.stringify(permissions_json) : (permissions_json || "")
      };

      roles.push(newRole);
      await db.saveCustomRoles(roles);

      await db.addRbacAuditLog(user.username, user.role, ip, `Created custom role: ${role_name}`, "RoleManagement", browser, "", JSON.stringify(newRole));
      return NextResponse.json({ success: true });
    }

    if (action === "config") {
      const { key, value } = await req.json();
      if (!key) {
        return NextResponse.json({ error: "Key is required" }, { status: 400 });
      }

      await db.saveSuperadminConfig(key, value);

      await db.addRbacAuditLog(user.username, user.role, ip, `Updated system configuration key: ${key}`, "SystemConfig", browser);
      return NextResponse.json({ success: true });
    }

    if (action === "restore") {
      const { backupJson } = await req.json();
      if (!backupJson) {
        return NextResponse.json({ error: "Backup data is required" }, { status: 400 });
      }

      const success = await db.restoreDatabase(backupJson);
      if (!success) {
        return NextResponse.json({ error: "Restore failed. Verify backup JSON format." }, { status: 500 });
      }

      await db.addRbacAuditLog(user.username, user.role, ip, "Database restored from backup snapshot", "Backup", browser);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Superadmin POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── PUT HANDLER ──
export async function PUT(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin privilege required.");
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    if (action === "users") {
      const { id, username, password, role, email, status, mobile, profile_photo, locked, force_password_change, permissions_json } = await req.json();
      if (!id) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }

      const usersList = await db.getUsers();
      const userIndex = usersList.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const targetUser = usersList[userIndex];
      const beforeState = JSON.stringify(targetUser);

      if (targetUser.username === user.username && (status === "disabled" || locked || role !== targetUser.role)) {
        return NextResponse.json({ error: "You cannot change your own role, lock your account, or disable your own account." }, { status: 400 });
      }

      if (username) targetUser.username = username;
      if (role) targetUser.role = role;
      if (email) targetUser.email = email;
      if (status) targetUser.status = status;
      if (mobile !== undefined) (targetUser as any).mobile = mobile;
      if (profile_photo !== undefined) (targetUser as any).profile_photo = profile_photo;
      if (locked !== undefined) {
        (targetUser as any).locked = locked ? 1 : 0;
        if (!locked) {
          (targetUser as any).failed_logins = 0;
        }
      }
      if (force_password_change !== undefined) (targetUser as any).force_password_change = force_password_change ? 1 : 0;
      if (permissions_json !== undefined) {
        (targetUser as any).permissions_json = typeof permissions_json === "object" ? JSON.stringify(permissions_json) : (permissions_json || "");
      }
      if (password) {
        targetUser.passwordHash = hashPassword(password);
      }

      await db.saveUsers(usersList);

      await db.addRbacAuditLog(user.username, user.role, ip, `Updated user details: ${targetUser.username}`, "UserManagement", browser, beforeState, JSON.stringify(targetUser));
      return NextResponse.json({ success: true });
    }

    if (action === "roles") {
      const { id, role_name, permissions_json } = await req.json();
      if (!id) {
        return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
      }

      const roles = await db.getCustomRoles();
      const roleIndex = roles.findIndex((r) => r.id === id);
      if (roleIndex === -1) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      const targetRole = roles[roleIndex];
      const beforeState = JSON.stringify(targetRole);

      if (role_name) targetRole.role_name = role_name;
      if (permissions_json !== undefined) {
        targetRole.permissions_json = typeof permissions_json === "object" ? JSON.stringify(permissions_json) : (permissions_json || "");
      }

      await db.saveCustomRoles(roles);

      await db.addRbacAuditLog(user.username, user.role, ip, `Updated custom role details: ${targetRole.role_name}`, "RoleManagement", browser, beforeState, JSON.stringify(targetRole));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Superadmin PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE HANDLER ──
export async function DELETE(req: Request) {
  try {
    const { user, errorResponse } = await authenticateApiRequest(req);
    if (errorResponse) return errorResponse;
    if (!user || !authorizeRole(user, ["SUPER_ADMIN"])) {
      return forbiddenResponse("Super Admin privilege required.");
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");
    const idStr = searchParams.get("id");
    const ip = getIpAddress(req);
    const browser = req.headers.get("user-agent") || "Unknown";

    if (action === "users") {
      if (!idStr) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 });
      }
      const id = parseInt(idStr, 10);

      const usersList = await db.getUsers();
      const targetUser = usersList.find((u) => u.id === id);
      if (!targetUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (targetUser.username === user.username) {
        return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
      }

      const updatedUsersList = usersList.filter((u) => u.id !== id);
      await db.saveUsers(updatedUsersList);

      await db.addRbacAuditLog(user.username, user.role, ip, `Deleted user account: ${targetUser.username}`, "UserManagement", browser, JSON.stringify(targetUser));
      return NextResponse.json({ success: true });
    }

    if (action === "roles") {
      if (!idStr) {
        return NextResponse.json({ error: "Role ID is required" }, { status: 400 });
      }
      const id = parseInt(idStr, 10);

      const roles = await db.getCustomRoles();
      const targetRole = roles.find((r) => r.id === id);
      if (!targetRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      const updatedRoles = roles.filter((r) => r.id !== id);
      await db.saveCustomRoles(updatedRoles);

      await db.addRbacAuditLog(user.username, user.role, ip, `Deleted custom role: ${targetRole.role_name}`, "RoleManagement", browser, JSON.stringify(targetRole));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Superadmin DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

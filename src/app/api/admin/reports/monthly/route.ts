import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySignedSessionToken } from "@/lib/auth";
import { generateMonthlyReport, getAvailableReportingMonths } from "@/lib/monthlyReportEngine";

// Authenticate session and verify administrative permissions
async function checkReportAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin_session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }
    const sessionData = verifySignedSessionToken(sessionCookie.value);
    if (!sessionData || !sessionData.username || !sessionData.sessionId) {
      return null;
    }

    // Verify active session in DB
    const dbSession = await db.validateSession(sessionData.sessionId);
    if (!dbSession) return null;
    await db.touchSession(sessionData.sessionId);

    // Verify user account status and authoritative role
    const users = await db.getUsers();
    const uRec = users.find((u) => u.username.toLowerCase() === sessionData.username.toLowerCase());
    if (!uRec || uRec.status === "disabled" || uRec.locked === 1) {
      return null;
    }

    if (dbSession.username.toLowerCase() !== uRec.username.toLowerCase()) {
      return null;
    }

    const normRole = (uRec.role || "").toUpperCase().replace(/[_\s]+/g, "");
    const allowedRoles = [
      "SUPERADMIN",
      "SUPERADMINISTRATOR",
      "ADMIN",
      "ADMINISTRATOR",
      "EDITOR",
      "CONTENTADMIN",
      "SECOFFICER",
      "AUDITOR",
      "OFFICER",
      "CUSTOM"
    ];
    if (!allowedRoles.includes(normRole) && !normRole.includes("ADMIN") && !normRole.includes("OFFICER")) {
      return null;
    }

    return {
      username: uRec.username,
      role: uRec.role
    };
  } catch (err) {
    console.error("Authentication error in monthly report API:", err);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await checkReportAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Administrative clearance is required to generate or view Monthly Reports." },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get("reportType") || "Overall Report";
    const month = searchParams.get("month") || undefined;
    const department = searchParams.get("department") || "All Departments";
    const policeStation = searchParams.get("policeStation") || "All Police Stations";
    const rangeType = (searchParams.get("rangeType") as any) || "current";
    const fromMonth = searchParams.get("fromMonth") || undefined;
    const toMonth = searchParams.get("toMonth") || undefined;
    const fromDate = searchParams.get("fromDate") || undefined;
    const toDate = searchParams.get("toDate") || undefined;

    // Validate date ranges
    if (rangeType === "custom-date" && fromDate && toDate) {
      if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
        return NextResponse.json(
          { error: "Invalid date range: 'From Date' must be before or equal to 'To Date'." },
          { status: 400 }
        );
      }
    }

    const report = await generateMonthlyReport({
      reportType,
      month,
      department,
      policeStation,
      rangeType,
      fromMonth,
      toMonth,
      fromDate,
      toDate,
      username: auth.username
    });

    const availableMonths = getAvailableReportingMonths(14);

    return NextResponse.json({
      success: true,
      report,
      availableMonths
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating monthly report:", error);
    return NextResponse.json(
      { error: "Unable to generate the report. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkReportAuth();
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Administrative clearance is required to generate or view Monthly Reports." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const reportType = body.reportType || "Overall Report";
    const month = body.month || undefined;
    const department = body.department || "All Departments";
    const policeStation = body.policeStation || "All Police Stations";
    const rangeType = body.rangeType || "current";
    const fromMonth = body.fromMonth || undefined;
    const toMonth = body.toMonth || undefined;
    const fromDate = body.fromDate || undefined;
    const toDate = body.toDate || undefined;

    // Validate date ranges
    if (rangeType === "custom-date" && fromDate && toDate) {
      if (new Date(fromDate).getTime() > new Date(toDate).getTime()) {
        return NextResponse.json(
          { error: "Invalid date range: 'From Date' must be before or equal to 'To Date'." },
          { status: 400 }
        );
      }
    }

    const report = await generateMonthlyReport({
      reportType,
      month,
      department,
      policeStation,
      rangeType,
      fromMonth,
      toMonth,
      fromDate,
      toDate,
      username: auth.username
    });

    const availableMonths = getAvailableReportingMonths(14);

    return NextResponse.json({
      success: true,
      report,
      availableMonths
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating monthly report POST:", error);
    return NextResponse.json(
      { error: "Unable to generate the report. Please try again." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";

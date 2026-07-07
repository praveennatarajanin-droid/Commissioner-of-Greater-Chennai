import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      applicantName, 
      mobileNumber, 
      email, 
      address, 
      serviceRequired, 
      policeStation, 
      message 
    } = data;

    // Validate inputs
    if (!applicantName || !mobileNumber || !email || !address || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique reference receipt ID
    const receiptId = `GCP-REQ-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store in JSON DB
    const requests = await db.getServiceRequests();
    const newId = requests.length > 0 ? Math.max(...requests.map(r => r.id)) + 1 : 1;
    const newRequest = {
      id: newId,
      applicantName,
      mobileNumber,
      email,
      address,
      serviceRequired,
      policeStation: policeStation || "Unassigned",
      message,
      receiptId,
      created_at: new Date().toISOString()
    };
    requests.push(newRequest);
    await db.saveServiceRequests(requests);

    // Format transcript details for console outbox log
    console.log(`
========================================================================
📧 OUTBOX EMAIL DISPATCH TRANSCRIPT
========================================================================
From: Greater Chennai Police Citizen Desk <noreply@gcp.tn.gov.in>
To: support@gcp.tn.gov.in, ${email}
Subject: Citizen Service Desk Receipt Confirmation - ${receiptId}

Dear ${applicantName},

Your service request has been received and logged in our system.

------------------------------------------------------------------------
REQUEST DETAILS:
------------------------------------------------------------------------
Receipt Reference ID : ${receiptId}
Applicant Name      : ${applicantName}
Contact Mobile      : ${mobileNumber}
Target Police Station: ${policeStation}
Service Type        : ${serviceRequired}
Applicant Address    : ${address}

Description of Request / Message:
"${message}"

------------------------------------------------------------------------
This is an automated confirmation email. Your request has been assigned
to the designated officer-in-charge at ${policeStation} for review.
========================================================================
`);

    return NextResponse.json({ 
      success: true, 
      receiptId,
      message: "Service request registered successfully." 
    });

  } catch (err: any) {
    console.error("Service request API error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

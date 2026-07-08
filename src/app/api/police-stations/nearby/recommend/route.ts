import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { lat, lng, stations } = body;

    if (!stations || !Array.isArray(stations) || stations.length === 0) {
      return NextResponse.json({ error: "Missing stations data" }, { status: 400 });
    }

    const closest = stations[0]; // The sorted list has the nearest station first
    const distanceStr = closest.distance !== undefined ? `${closest.distance} KM` : "a short distance";
    const stationName = closest.name_en || closest.station_name || "Nearest Station";
    const typeStr = closest.type || "precinct";

    // Build default rule-based recommendation
    let recommendation = `The ${stationName} (${typeStr}) is the closest available precinct to your location, situated approximately ${distanceStr} away. It operates 24/7 and is ready to assist with any safety or emergency concerns.`;

    // Attempt Gemini-powered personalized recommendation if API key is present
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are an emergency safety dispatch assistant for the Greater Chennai Police Department.
          A citizen is looking for the nearest police station from their current coordinates (Lat: ${lat}, Lng: ${lng}).
          The closest station is:
          - Name: ${stationName}
          - Type: ${typeStr}
          - Distance: ${distanceStr}
          - Address: ${closest.address_en || "Chennai"}
          - Phone: ${closest.phone || "100"}

          Write a brief, reassuring, and highly professional recommendation message (maximum 2 sentences, 40 words) for this citizen.
          Highlight that this station is their closest point of contact for safety, note its exact distance, and remind them that it is open 24/7. Keep it operational and direct. Do not include markdown formatting or extra text.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text) {
          recommendation = text;
        }
      } catch (geminiErr) {
        console.error("Gemini recommendation generation failed, falling back to rule-based:", geminiErr);
      }
    }

    return NextResponse.json({ success: true, recommendation });
  } catch (err: any) {
    console.error("API /api/police-stations/nearby/recommend error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

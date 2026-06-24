import { NextRequest, NextResponse } from "next/server";

// ─── Category keyword map for rules-based fallback ──────────────────────────
const CATEGORY_RULES: [string[], string, string][] = [
  [["award", "medal", "felicitat", "recogni", "honor", "honour", "appreciat", "champion"], "AWARDS & RECOGNITION", "விருதுகள் & அங்கீகாரம்"],
  [["cyber", "online", "internet", "digital", "fraud", "scam", "hacking"], "CYBER SAFETY", "இணைய பாதுகாப்பு"],
  [["women", "child", "girl", "mahila", "shakti", "domestic"], "WOMEN SAFETY", "பெண்கள் பாதுகாப்பு"],
  [["traffic", "road", "signal", "helmet", "vehicle", "drunk drive"], "TRAFFIC MANAGEMENT", "போக்குவரத்து மேலாண்மை"],
  [["crime", "arrest", "nabbed", "accused", "criminal", "gang", "seized"], "CRIME PREVENTION", "குற்றத் தடுப்பு"],
  [["community", "outreach", "public", "citizen", "school", "college", "awareness"], "COMMUNITY OUTREACH", "சமுக தொடர்பு"],
  [["operation", "special", "task force", "crackdown", "drive"], "CRIME PREVENTION", "குற்றத் தடுப்பு"],
  [["mounted", "equestrian", "dog squad", "bomb", "commando"], "POLICE ACHIEVEMENT", "காவல் துறை சாதனை"],
  [["law", "order", "bandobust", "security", "patrol", "deployment"], "LAW & ORDER", "சட்டம் & ஒழுங்கு"],
  [["commissioner", "ips", "officer", "superintendent", "director"], "POLICE ACHIEVEMENT", "காவல் துறை சாதனை"],
];

function rulesBasedCategory(desc: string): { en: string; ta: string } {
  const lower = desc.toLowerCase();
  for (const [keywords, en, ta] of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return { en, ta };
  }
  return { en: "PUBLIC SAFETY", ta: "பொது பாதுகாப்பு" };
}

function rulesBasedTitle(desc: string): string {
  // Extract first 10 words and clean up into a headline
  const words = desc.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/).slice(0, 10).join(" ");
  return words.length > 5 ? words : desc.slice(0, 60);
}

// ─── Gemini-powered generation ──────────────────────────────────────────────
async function generateWithGemini(descriptionEn: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a professional news editor for a Tamil Nadu Police media team.
Given this English description of a police news event, generate the following in strict JSON format:

Input Description: "${descriptionEn}"

Generate:
1. category_en: A short ALL-CAPS category (2-4 words) from this list or similar:
   POLICE ACHIEVEMENT, LAW & ORDER, CYBER SAFETY, WOMEN SAFETY, COMMUNITY OUTREACH,
   AWARDS & RECOGNITION, TRAFFIC MANAGEMENT, CRIME PREVENTION, PUBLIC SAFETY
2. title_en: A short professional English headline (6-10 words, government news style, title case)
3. category_ta: The Tamil translation of category_en
4. title_ta: The Tamil translation of title_en (natural, fluent Tamil)
5. desc_ta: Full Tamil translation of the input description (natural fluent Tamil, not literal)

Return ONLY valid JSON, no markdown, no extra text:
{"category_en":"...","title_en":"...","category_ta":"...","title_ta":"...","desc_ta":"..."}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("Gemini generation failed:", err);
    return null;
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { desc_en } = await req.json();

    if (!desc_en || typeof desc_en !== "string" || desc_en.trim().length < 10) {
      return NextResponse.json({ error: "Description too short." }, { status: 400 });
    }

    const trimmed = desc_en.trim();

    // Try Gemini first
    const ai = await generateWithGemini(trimmed);
    if (ai) {
      return NextResponse.json({ ...ai, source: "ai" });
    }

    // Rules-based fallback
    const { en: category_en, ta: category_ta } = rulesBasedCategory(trimmed);
    const title_en = rulesBasedTitle(trimmed);

    return NextResponse.json({
      category_en,
      title_en,
      category_ta,
      title_ta: "",   // Can't translate without AI
      desc_ta: "",    // Can't translate without AI
      source: "rules",
      hint: "Add GEMINI_API_KEY to .env.local for full Tamil auto-generation."
    });
  } catch (err) {
    console.error("Generate slider error:", err);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}

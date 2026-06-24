import { NextRequest, NextResponse } from "next/server";

// ─── Category keyword map for rules-based fallback ──────────────────────────
const CATEGORY_RULES: [string[], string, string][] = [
  [["award", "medal", "felicitat", "recogni", "honor", "honour", "appreciat", "champion"], "AWARDS & RECOGNITION", "விருதுகள் & அங்கீகாரம்"],
  [["cyber", "online", "internet", "digital", "fraud", "scam", "hacking", "phishing"], "CYBER SAFETY", "இணைய பாதுகாப்பு"],
  [["women", "child", "girl", "mahila", "shakti", "domestic", "harassment"], "WOMEN SAFETY", "பெண்கள் பாதுகாப்பு"],
  [["traffic", "road", "signal", "helmet", "vehicle", "drunk drive", "intersection", "pedestrian"], "TRAFFIC MANAGEMENT", "போக்குவரத்து மேலாண்மை"],
  [["crime", "arrest", "nabbed", "accused", "criminal", "gang", "seized", "stolen", "robbery"], "CRIME PREVENTION", "குற்றத் தடுப்பு"],
  [["community", "outreach", "public", "citizen", "school", "college", "awareness", "camp"], "COMMUNITY OUTREACH", "சமுக தொடர்பு"],
  [["operation", "special", "task force", "crackdown", "drive", "mission"], "CRIME PREVENTION", "குற்றத் தடுப்பு"],
  [["mounted", "equestrian", "dog squad", "bomb", "commando", "ngo", "sniffer"], "POLICE ACHIEVEMENT", "காவல் துறை சாதனை"],
  [["law", "order", "bandobust", "security", "patrol", "deployment", "election"], "LAW & ORDER", "சட்டம் & ஒழுங்கு"],
  [["commissioner", "ips", "officer", "superintendent", "director", "inspect", "review"], "POLICE ACHIEVEMENT", "காவல் துறை சாதனை"],
  [["drug", "narcotic", "ganja", "contraband", "illicit", "liquor"], "CRIME PREVENTION", "குற்றத் தடுப்பு"],
  [["fire", "rescue", "disaster", "flood", "relief", "ndr", "ndf"], "PUBLIC SAFETY", "பொது பாதுகாப்பு"],
];

function rulesBasedCategory(text: string): { en: string; ta: string } {
  const lower = text.toLowerCase();
  for (const [keywords, en, ta] of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return { en, ta };
  }
  return { en: "PUBLIC SAFETY", ta: "பொது பாதுகாப்பு" };
}

function rulesBasedTitle(text: string): string {
  const words = text.replace(/[^a-zA-Z0-9\s]/g, " ").trim().split(/\s+/).slice(0, 10).join(" ");
  return words.length > 5 ? words : text.slice(0, 60);
}

function rulesBasedSlug(titleEn: string): string {
  return titleEn
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function rulesBasedTags(text: string): string[] {
  const tagMap: Record<string, string> = {
    "award": "Awards", "medal": "Medals", "commissioner": "Commissioner",
    "traffic": "Traffic", "road": "Road Safety", "cyber": "Cyber Safety",
    "crime": "Crime Prevention", "women": "Women Safety", "child": "Child Safety",
    "operation": "Crime Prevention", "patrol": "Patrol", "arrest": "Arrest",
    "community": "Community Outreach", "awareness": "Awareness",
    "drug": "Drugs", "rescue": "Rescue", "fire": "Fire Safety",
    "scam": "Online Scam", "fraud": "Fraud", "gcp": "GCP",
    "police": "Police", "law": "Law & Order", "security": "Security",
  };
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [kw, tag] of Object.entries(tagMap)) {
    if (lower.includes(kw) && !found.includes(tag)) found.push(tag);
  }
  if (!found.includes("Greater Chennai Police")) found.unshift("Greater Chennai Police");
  return found.slice(0, 6);
}

function rulesBasedSection(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("award") || lower.includes("medal") || lower.includes("felicitat")) return "spotlight";
  if (lower.includes("press release") || lower.includes("official statement")) return "press";
  if (lower.includes("event") || lower.includes("ceremony") || lower.includes("district")) return "event";
  if (lower.includes("communit") || lower.includes("outreach") || lower.includes("public")) return "activity";
  return "latest";
}

// ─── Gemini-powered full news generation ────────────────────────────────────
async function generateWithGemini(contentEn: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a professional bilingual news editor for the Tamil Nadu Police (Greater Chennai Police) media desk.
Given this English news content from a police press release or report, generate all fields automatically.

English Content:
"""
${contentEn}
"""

Generate the following in strict JSON format (no markdown, no extra text):

{
  "title_en": "Professional English headline (6-12 words, Title Case, government news style)",
  "title_ta": "Tamil headline (natural, fluent Tamil, not literal translation)",
  "category_en": "ALL CAPS category 2-4 words from: POLICE ACHIEVEMENT | LAW & ORDER | CYBER SAFETY | WOMEN SAFETY | COMMUNITY OUTREACH | AWARDS & RECOGNITION | TRAFFIC MANAGEMENT | CRIME PREVENTION | PUBLIC SAFETY",
  "category_ta": "Tamil translation of the category",
  "summary_en": "2-3 sentence professional English summary of the news (50-80 words)",
  "summary_ta": "Tamil translation of the summary (natural, fluent Tamil, 50-80 words)",
  "content_ta": "Full Tamil translation of the entire English content above (natural, paragraph-by-paragraph, fluent Tamil — NOT word-for-word literal)",
  "tags_en": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "tags_ta": ["குறிச்சொல்1", "குறிச்சொல்2", "குறிச்சொல்3"],
  "section": "one of: spotlight | latest | press | event | activity",
  "slug": "seo-friendly-url-slug-from-title-en (lowercase, hyphens, no special chars, max 80 chars)"
}

Rules:
- tags_en: 4-6 relevant English tags like "Greater Chennai Police", "Awards", "Traffic Safety", etc.
- tags_ta: 3-5 Tamil equivalent tags
- section: "spotlight" for awards/achievements, "press" for official statements, "event" for events/ceremonies, "activity" for outreach/community, "latest" for general news
- slug: derived from title_en, URL-safe

Return ONLY the JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error("Gemini news generation failed:", err);
    return null;
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { content_en } = await req.json();

    if (!content_en || typeof content_en !== "string" || content_en.trim().length < 20) {
      return NextResponse.json(
        { error: "Content too short. Paste at least one full paragraph." },
        { status: 400 }
      );
    }

    const trimmed = content_en.trim();

    // Try Gemini first
    const ai = await generateWithGemini(trimmed);
    if (ai) {
      return NextResponse.json({ ...ai, source: "ai" });
    }

    // Rules-based fallback
    const { en: category_en, ta: category_ta } = rulesBasedCategory(trimmed);
    const title_en = rulesBasedTitle(trimmed);
    const tags_en = rulesBasedTags(trimmed);
    const section = rulesBasedSection(trimmed);
    const slug = rulesBasedSlug(title_en);

    return NextResponse.json({
      title_en,
      title_ta: "",
      category_en,
      category_ta,
      summary_en: trimmed.slice(0, 200) + (trimmed.length > 200 ? "..." : ""),
      summary_ta: "",
      content_ta: "",
      tags_en,
      tags_ta: [],
      section,
      slug,
      source: "rules",
      hint: "Add GEMINI_API_KEY to .env.local for full bilingual auto-generation.",
    });
  } catch (err) {
    console.error("Generate news error:", err);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}

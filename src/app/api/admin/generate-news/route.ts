import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Category keyword map for rules-based fallback ──────────────────────────
const CATEGORY_RULES: [string[], string, string][] = [
  [["award", "medal", "felicitat", "recogni", "honor", "honour", "appreciat", "champion"], "Awards & Recognition", "விருதுகள் & அங்கீகாரம்"],
  [["cyber", "online", "internet", "digital", "fraud", "scam", "hacking", "phishing"], "Cyber Safety", "இணைய பாதுகாப்பு"],
  [["women", "child", "girl", "mahila", "shakti", "domestic", "harassment"], "Women Safety", "பெண்கள் பாதுகாப்பு"],
  [["traffic", "road", "signal", "helmet", "vehicle", "drunk drive", "intersection", "pedestrian"], "Traffic Updates", "போக்குவரத்து தகவல்கள்"],
  [["crime", "arrest", "nabbed", "accused", "criminal", "gang", "seized", "robbery", "murder", "theft"], "Crime", "குற்றம்"],
  [["community", "outreach", "public", "citizen", "school", "college", "awareness", "camp"], "Outreach", "சமூக அவுட்ரீச்"],
  [["missing", "traced", "kidnap", "runaway"], "Missing Persons", "காணாமல் போனவர்கள்"],
  [["emergency", "alert", "flood", "cyclone", "disaster", "heavy rain"], "Emergency Alerts", "அவசர எச்சரிக்கைகள்"],
  [["official", "circular", "notification"], "Official Alerts", "அதிகாரப்பூர்வ அறிவிப்புகள்"],
  [["press", "release", "statement"], "Press Release", "பத்திரிகை வெளியீடு"],
  [["event", "ceremony", "inauguration", "launch"], "Events", "நிகழ்வுகள்"],
];

function rulesBasedCategory(text: string): { en: string; ta: string } {
  const lower = text.toLowerCase();
  for (const [keywords, en, ta] of CATEGORY_RULES) {
    if (keywords.some((kw) => lower.includes(kw))) return { en, ta };
  }
  return { en: "General News", ta: "பொதுச் செய்திகள்" };
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

function rulesBasedSection(text: string): "spotlight" | "latest" | "press" | "event" | "activity" {
  const lower = text.toLowerCase();
  if (lower.includes("award") || lower.includes("medal") || lower.includes("felicitat")) return "spotlight";
  if (lower.includes("press release") || lower.includes("official statement")) return "press";
  if (lower.includes("event") || lower.includes("ceremony") || lower.includes("district")) return "event";
  if (lower.includes("communit") || lower.includes("outreach") || lower.includes("public")) return "activity";
  return "latest";
}

// ─── Gemini news generation ──────────────────────────────────────────────────
async function generateWithGemini(contentEn: string, image: string | null) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let imagePart: any = null;
    if (image && image.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", image);
        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          imagePart = {
            inlineData: {
              data: fileBuffer.toString("base64"),
              mimeType: image.endsWith(".png") ? "image/png" : image.endsWith(".gif") ? "image/gif" : image.endsWith(".webp") ? "image/webp" : "image/jpeg"
            }
          };
        }
      } catch (e) {
        console.error("Error reading image file for Gemini:", e);
      }
    }

    const prompt = `You are a professional bilingual news editor for the Tamil Nadu Police (Greater Chennai Police) media desk.
Given this news content (could be text or a URL) and an optional uploaded image, generate all database and SEO metadata fields automatically.

English Content / Context:
"""
${contentEn}
"""

Generate the following in strict JSON format (no markdown code blocks, return ONLY valid parsable JSON):

{
  "title_en": "Professional English headline (6-12 words, Title Case, government style)",
  "title_ta": "Natural Tamil headline (not literal translation)",
  "category_en": "Select the best category from: Crime | Cyber Safety | Women Safety | Public Safety | Outreach | Official Alerts | Awards & Recognition | Press Release | Traffic Updates | Missing Persons | Events | Emergency Alerts | General News",
  "category_ta": "Tamil translation of the selected category",
  "summary_en": "2-3 sentence professional English summary of the news (50-80 words)",
  "summary_ta": "Tamil translation of the summary (natural, fluent Tamil)",
  "content_ta": ["paragraph 1 in Tamil", "paragraph 2 in Tamil"],
  "tags_en": ["tag1", "tag2", "tag3", "tag4"],
  "tags_ta": ["குறிச்சொல்1", "குறிச்சொல்2", "குறிச்சொல்3"],
  "section": "one of: spotlight | latest | press | event | activity",
  "featured": 1 or 0,
  "big_story": 1 or 0,
  "breaking": 1 or 0,
  "sourceName": "Greater Chennai Police",
  "author_en": "Greater Chennai Police Media Desk",
  "author_ta": "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
  "meta_description": "SEO meta description in English (max 160 chars)",
  "meta_keywords": "comma-separated list of SEO keywords",
  "short_caption": "A single-sentence caption summarizing the event/image",
  "slug": "lowercase-hyphen-separated-url-slug (derived from title_en, max 80 chars)"
}

Rules:
- category_en MUST be one of the specified list.
- content_ta MUST be an array of strings representing paragraph-by-paragraph translation of the news.
- Return ONLY the JSON object.`;

    const contents = imagePart ? [prompt, imagePart] : [prompt];
    const result = await model.generateContent(contents);
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
    const body = await req.json();
    let { content_en, image } = body;

    // Handle URL content fetching
    if (content_en && content_en.trim().startsWith("http")) {
      try {
        const response = await fetch(content_en.trim());
        if (response.ok) {
          const html = await response.text();
          const text = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          content_en = text.slice(0, 10000);
        }
      } catch (err) {
        console.error("Failed to fetch content from URL:", err);
      }
    }

    const trimmed = (content_en || "").trim();

    // Try Gemini first
    if (trimmed.length > 5 || image) {
      const ai = await generateWithGemini(trimmed, image || null);
      if (ai) {
        return NextResponse.json({ ...ai, source: "ai" });
      }
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
      content_ta: [],
      tags_en,
      tags_ta: [],
      section,
      slug,
      featured: 0,
      big_story: 0,
      breaking: 0,
      sourceName: "Greater Chennai Police",
      author_en: "Greater Chennai Police Media Desk",
      author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
      meta_description: trimmed.slice(0, 150),
      meta_keywords: tags_en.join(", "),
      short_caption: title_en,
      source: "rules",
      hint: "Add GEMINI_API_KEY to .env.local for full bilingual auto-generation.",
    });
  } catch (err) {
    console.error("Generate news error:", err);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

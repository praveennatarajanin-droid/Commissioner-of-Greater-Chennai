import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// ─── Category translation map ────────────────────────────────────────────────
const CATEGORY_MAP: Record<string, { en: string; ta: string }> = {
  "Crime": { en: "Crime", ta: "குற்றம்" },
  "Cyber Safety": { en: "Cyber Safety", ta: "இணைய பாதுகாப்பு" },
  "Women Safety": { en: "Women Safety", ta: "பெண்கள் பாதுகாப்பு" },
  "Public Safety": { en: "Public Safety", ta: "பொது பாதுகாப்பு" },
  "Outreach": { en: "Outreach", ta: "சமூக அவுட்ரீச்" },
  "Traffic": { en: "Traffic Updates", ta: "போக்குவரத்து தகவல்கள்" },
  "Police Achievement": { en: "Awards & Recognition", ta: "விருதுகள் & அங்கீகாரம்" },
  "Government Update": { en: "Official Alerts", ta: "அதிகாரப்பூர்வ அறிவிப்புகள்" },
  "General News": { en: "General News", ta: "பொதுச் செய்திகள்" }
};

// Category keywords for rules-based backup
const CATEGORY_RULES: [string[], string][] = [
  [["award", "medal", "felicitat", "recogni", "honor", "honour", "appreciat", "champion", "achievement"], "Police Achievement"],
  [["cyber", "online", "internet", "digital", "fraud", "scam", "hacking", "phishing"], "Cyber Safety"],
  [["women", "child", "girl", "mahila", "shakti", "domestic", "harassment"], "Women Safety"],
  [["traffic", "road", "signal", "helmet", "vehicle", "drunk drive", "intersection", "pedestrian"], "Traffic"],
  [["crime", "arrest", "nabbed", "accused", "criminal", "gang", "seized", "robbery", "murder", "theft"], "Crime"],
  [["community", "outreach", "public", "citizen", "school", "college", "awareness", "camp"], "Outreach"],
  [["public safety", "safety guide", "emergency", "alert", "flood", "cyclone", "disaster"], "Public Safety"],
  [["official", "circular", "notification", "government", "announcement"], "Government Update"],
];

function rulesBasedCategory(text: string): { category: string; confidence: number; quote: string } {
  const lower = text.toLowerCase();
  for (const [keywords, cat] of CATEGORY_RULES) {
    for (const kw of keywords) {
      const idx = lower.indexOf(kw);
      if (idx !== -1) {
        // Extract surrounding sentence as quote
        const start = Math.max(0, text.lastIndexOf(".", idx) + 1);
        const end = text.indexOf(".", idx);
        const quote = text.slice(start, end !== -1 ? end + 1 : idx + 30).trim();
        return { category: cat, confidence: 85, quote };
      }
    }
  }
  return { category: "General News", confidence: 40, quote: "No matching category keywords found in article body." };
}

function rulesBasedTitle(text: string): { title: string; confidence: number; quote: string } {
  // Take first sentence or first 10 words
  const firstDot = text.indexOf(".");
  let title = "";
  if (firstDot > 10 && firstDot < 150) {
    title = text.slice(0, firstDot).trim();
  } else {
    title = text.split(/\s+/).slice(0, 10).join(" ");
  }
  return { title: title + "...", confidence: 60, quote: title };
}

function rulesBasedTags(text: string): { tags: string[]; confidence: number; quote: string } {
  const words = ["delhi police", "akriti sutar", "chhatarpur", "investigation", "chennai", "police", "arrest", "cyber", "women", "traffic", "safety"];
  const lower = text.toLowerCase();
  const matched: string[] = [];
  const quotes: string[] = [];

  words.forEach(w => {
    const idx = lower.indexOf(w);
    if (idx !== -1) {
      matched.push(w.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" "));
      quotes.push(text.slice(idx, idx + w.length));
    }
  });

  if (matched.length === 0) {
    return { tags: ["Greater Chennai Police"], confidence: 50, quote: "Defaults to Greater Chennai Police" };
  }
  return { tags: matched.slice(0, 5), confidence: 80, quote: quotes.join(", ") };
}

function rulesBasedSourceUrl(text: string): { url: string; confidence: number; quote: string } {
  const match = text.match(/https?:\/\/[^\s$.?#].[^\s]*/i);
  if (match) {
    return { url: match[0], confidence: 95, quote: `Found URL: ${match[0]}` };
  }
  return { url: "", confidence: 0, quote: "No URL matches found in the article text." };
}

function rulesBasedPublishDate(text: string): { date: string; confidence: number; quote: string } {
  // Look for date patterns e.g. June 22, 2026 or 22-06-2026
  const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const lower = text.toLowerCase();
  for (const m of months) {
    const idx = lower.indexOf(m);
    if (idx !== -1) {
      const start = Math.max(0, idx - 10);
      const end = idx + m.length + 15;
      const snippet = text.slice(start, end);
      return { date: snippet.trim(), confidence: 75, quote: snippet };
    }
  }
  return { date: "", confidence: 0, quote: "No explicit date pattern extracted." };
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
Analyze the following article content using Named Entity Recognition (NER), context classification, keyword extraction, and summarization.

Article Content:
"""
${contentEn}
"""

Extract and generate metadata details. For EACH field, you must provide:
1. "value": The extracted/generated field value.
2. "confidence": An integer score from 0 to 100 based on validation. (If information does not exist or has low certainty, lower the score; if it exists explicitly, set it high).
3. "extracted_from": The exact quote or sentence from the article content from which this field was derived or verified (or null if it is a general synthesis/translation).

Output MUST be a single, valid JSON object matching the exact structure below. Do not wrap in markdown \`\`\`json blocks. Return ONLY the raw JSON string.

JSON Schema:
{
  "title_en": {
    "value": "Headline based entirely on article content (6-12 words, Title Case)",
    "confidence": 95,
    "extracted_from": "Exact text containing the main event details"
  },
  "title_ta": {
    "value": "Accurate Tamil translation of the headline",
    "confidence": 90,
    "extracted_from": "Text translated"
  },
  "category": {
    "value": "Select exactly one from: Crime | Cyber Safety | Women Safety | Public Safety | Outreach | Traffic | Police Achievement | Government Update",
    "confidence": 95,
    "extracted_from": "Sentence indicating the category/nature of event"
  },
  "summary_en": {
    "value": "2-3 sentence English summary of the news (50-80 words)",
    "confidence": 95,
    "extracted_from": "Summary source sentences"
  },
  "summary_ta": {
    "value": "Tamil translation of the summary (natural, fluent Tamil)",
    "confidence": 90,
    "extracted_from": "Summary source sentences"
  },
  "tags": {
    "value": ["tag1", "tag2", "tag3"], // strictly keywords extracted from the text (no random tags)
    "confidence": 90,
    "extracted_from": "Words in text matching these tags"
  },
  "section": {
    "value": "Select based on article importance: latest | breaking | spotlight",
    "confidence": 85,
    "extracted_from": "Significance indicators in text"
  },
  "author": {
    "value": "Actual author name if explicitly mentioned in the article, otherwise default to 'Greater Chennai Police Media Desk'",
    "confidence": 100,
    "extracted_from": "Author attribution sentence or null"
  },
  "sourceName": {
    "value": "The actual news source/agency name mentioned in the article, otherwise default to 'Greater Chennai Police'",
    "confidence": 85,
    "extracted_from": "Source attribution sentence or null"
  },
  "sourceUrl": {
    "value": "The specific URL link mentioned in the article (or empty string \"\" if no URL is mentioned)",
    "confidence": 95, // set to 0 if empty
    "extracted_from": "The exact URL text or null"
  },
  "date": {
    "value": "The specific date mentioned in the article (or empty string \"\" if no date is mentioned)",
    "confidence": 90, // set to 0 if empty
    "extracted_from": "Sentence containing the date or null"
  },
  "views_count": {
    "value": 0, // must default to 0
    "confidence": 100,
    "extracted_from": null
  },
  "content_ta": {
    "value": ["Tamil translation paragraph 1", "Tamil translation paragraph 2"], // paragraph-by-paragraph translation of body
    "confidence": 90,
    "extracted_from": "Complete text body"
  }
}`;

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
        // Resolve database category mappings
        const catVal = ai.category?.value || "General News";
        const resolvedCat = CATEGORY_MAP[catVal] || CATEGORY_MAP["General News"];

        // Format to correct schema
        return NextResponse.json({
          success: true,
          source: "ai",
          fields: {
            title_en: ai.title_en || { value: "", confidence: 0, extracted_from: null },
            title_ta: ai.title_ta || { value: "", confidence: 0, extracted_from: null },
            category_en: {
              value: resolvedCat.en,
              confidence: ai.category?.confidence || 90,
              extracted_from: ai.category?.extracted_from || null
            },
            category_ta: {
              value: resolvedCat.ta,
              confidence: ai.category?.confidence || 90,
              extracted_from: ai.category?.extracted_from || null
            },
            summary_en: ai.summary_en || { value: "", confidence: 0, extracted_from: null },
            summary_ta: ai.summary_ta || { value: "", confidence: 0, extracted_from: null },
            tags_en: {
              value: ai.tags?.value || [],
              confidence: ai.tags?.confidence || 90,
              extracted_from: ai.tags?.extracted_from || null
            },
            tags_ta: {
              value: (ai.tags?.value || []).map((t: string) => t + " (தமிழ்)"),
              confidence: Math.max(0, (ai.tags?.confidence || 90) - 10),
              extracted_from: ai.tags?.extracted_from || null
            },
            section: ai.section || { value: "latest", confidence: 90, extracted_from: null },
            author_en: {
              value: ai.author?.value || "Greater Chennai Police Media Desk",
              confidence: ai.author?.confidence || 100,
              extracted_from: ai.author?.extracted_from || null
            },
            author_ta: {
              value: ai.author?.value === "Greater Chennai Police Media Desk" || !ai.author?.value
                ? "சென்னை பெருநகர காவல் ஊடகப் பிரிவு"
                : ai.author.value + " (தமிழ்)",
              confidence: ai.author?.confidence || 100,
              extracted_from: ai.author?.extracted_from || null
            },
            sourceName: ai.sourceName || { value: "Greater Chennai Police", confidence: 100, extracted_from: null },
            sourceUrl: ai.sourceUrl || { value: "", confidence: 0, extracted_from: null },
            date: ai.date || { value: "", confidence: 0, extracted_from: null },
            views_count: ai.views_count || { value: 0, confidence: 100, extracted_from: null },
            content_ta: ai.content_ta || { value: [], confidence: 90, extracted_from: null }
          }
        });
      }
    }

    // Rules-based fallback
    const categoryRes = rulesBasedCategory(trimmed);
    const titleRes = rulesBasedTitle(trimmed);
    const tagsRes = rulesBasedTags(trimmed);
    const sourceUrlRes = rulesBasedSourceUrl(trimmed);
    const dateRes = rulesBasedPublishDate(trimmed);
    
    const resolvedCat = CATEGORY_MAP[categoryRes.category] || CATEGORY_MAP["General News"];

    return NextResponse.json({
      success: true,
      source: "rules",
      fields: {
        title_en: {
          value: titleRes.title,
          confidence: titleRes.confidence,
          extracted_from: titleRes.quote
        },
        title_ta: {
          value: "",
          confidence: 0,
          extracted_from: "No Tamil translation available in rules mode."
        },
        category_en: {
          value: resolvedCat.en,
          confidence: categoryRes.confidence,
          extracted_from: categoryRes.quote
        },
        category_ta: {
          value: resolvedCat.ta,
          confidence: categoryRes.confidence,
          extracted_from: categoryRes.quote
        },
        summary_en: {
          value: trimmed.slice(0, 150) + (trimmed.length > 150 ? "..." : ""),
          confidence: 70,
          extracted_from: trimmed.slice(0, 200)
        },
        summary_ta: {
          value: "",
          confidence: 0,
          extracted_from: "No Tamil translation available in rules mode."
        },
        tags_en: {
          value: tagsRes.tags,
          confidence: tagsRes.confidence,
          extracted_from: tagsRes.quote
        },
        tags_ta: {
          value: [],
          confidence: 0,
          extracted_from: "No Tamil translation available in rules mode."
        },
        section: {
          value: "latest",
          confidence: 80,
          extracted_from: "Defaults to latest news section"
        },
        author_en: {
          value: "Greater Chennai Police Media Desk",
          confidence: 100,
          extracted_from: "Default attribution"
        },
        author_ta: {
          value: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
          confidence: 100,
          extracted_from: "Default attribution"
        },
        sourceName: {
          value: "Greater Chennai Police",
          confidence: 100,
          extracted_from: "Default attribution"
        },
        sourceUrl: {
          value: sourceUrlRes.url,
          confidence: sourceUrlRes.confidence,
          extracted_from: sourceUrlRes.quote
        },
        date: {
          value: dateRes.date,
          confidence: dateRes.confidence,
          extracted_from: dateRes.quote
        },
        views_count: {
          value: 0,
          confidence: 100,
          extracted_from: "Default views count"
        },
        content_ta: {
          value: [],
          confidence: 0,
          extracted_from: "No Tamil translation available in rules mode."
        }
      }
    });
  } catch (err) {
    console.error("Generate news error:", err);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

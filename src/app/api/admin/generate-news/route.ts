import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function translateText(text: string, targetLang: "en" | "ta"): Promise<string> {
  if (!text) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0]) {
        return data[0].map((s: any) => s[0]).join(" ");
      }
    }
  } catch (err) {
    console.error("Free translation API failed:", err);
  }
  return "";
}

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

const TAMIL_CATEGORY_RULES: [string[], string][] = [
  [["பாராட்டு", "விருது", "பதக்கம்", "சாதனை", "அங்கீகாரம்", "சம்பளம்"], "Police Achievement"],
  [["சைபர்", "இணைய", "மோசடி", "ஏமாற்று", "ஹேக்கிங்", "பாஸ்வேர்டு"], "Cyber Safety"],
  [["பெண்", "குழந்தை", "மகளிர்", "பாலியல்", "வன்கொடுமை", "கடத்தல்"], "Women Safety"],
  [["போக்குவரத்து", "சாலை", "விபத்து", "ஹெல்மெட்", "வாகனம்", "சிக்னல்", "காரணம்"], "Traffic"],
  [["கைது", "கொலை", "கொள்ளை", "திருட்டு", "குற்றம்", "வழக்கு", "கைது செய்யப்பட்டார்"], "Crime"],
  [["விழிப்புணர்வு", "முகாம்", "பள்ளி", "கல்லூரி", "பொதுமக்கள்", "சமூகம்"], "Outreach"],
  [["வெள்ளம்", "மழை", "புயல்", "அவசரம்", "பேரிடர்", "எச்சரிக்கை"], "Public Safety"],
  [["அரசாணை", "அறிவிப்பு", "அதிகாரப்பூர்வ", "சுற்றறிக்கை"], "Government Update"],
];

function stripHtml(html: string): string {
  if (!html) return "";
  let text = html;
  // Strip script and style tags
  text = text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, " ");
  // Compress whitespace
  text = text.replace(/\s+/g, " ");
  return text.trim();
}

function rulesBasedCategory(text: string): { category: string; confidence: number; quote: string } {
  const lower = text.toLowerCase();
  
  // Try Tamil first if there are Tamil characters
  const isTamil = /[\u0B80-\u0BFF]/.test(text);
  if (isTamil) {
    for (const [keywords, cat] of TAMIL_CATEGORY_RULES) {
      for (const kw of keywords) {
        const idx = lower.indexOf(kw);
        if (idx !== -1) {
          const start = Math.max(0, text.lastIndexOf(".", idx) + 1);
          const end = text.indexOf(".", idx);
          const quote = text.slice(start, end !== -1 ? end + 1 : idx + 30).trim();
          return { category: cat, confidence: 85, quote };
        }
      }
    }
  }

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
          content_en = await response.text();
        }
      } catch (err) {
        console.error("Failed to fetch content from URL:", err);
      }
    }

    const cleanContent = stripHtml(content_en || "");
    const trimmed = cleanContent.trim();

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
            views_count: ai.views_count || { value: 0, confidence: 100, extracted_from: null },
            content_ta: ai.content_ta || { value: [], confidence: 90, extracted_from: null }
          }
        });
      }
    }

    // Rules-based fallback
    const isTamil = /[\u0B80-\u0BFF]/.test(trimmed);
    const categoryRes = rulesBasedCategory(trimmed);
    const titleRes = rulesBasedTitle(trimmed);
    const tagsRes = rulesBasedTags(trimmed);
    const sourceUrlRes = rulesBasedSourceUrl(trimmed);
    const dateRes = rulesBasedPublishDate(trimmed);
    
    const resolvedCat = CATEGORY_MAP[categoryRes.category] || CATEGORY_MAP["General News"];

    // Synthesize bilingual details using the free translation helper
    let finalTitleEn = "";
    let finalTitleTa = "";
    let confidenceEn = 0;
    let confidenceTa = 0;
    let quoteEn = "";
    let quoteTa = "";

    if (isTamil) {
      finalTitleTa = titleRes.title;
      confidenceTa = titleRes.confidence;
      quoteTa = titleRes.quote;

      // Try translating Tamil headline to English
      const translatedTitle = await translateText(titleRes.title, "en");
      if (translatedTitle) {
        finalTitleEn = translatedTitle.trim();
        confidenceEn = 80;
        quoteEn = `Translated from Tamil headline: "${titleRes.title}"`;
      } else {
        const categoryEnTitles: Record<string, string> = {
          "Crime": "GCP Alert: Action Taken Against Crime Incident",
          "Cyber Safety": "Cyber Safety: Important Security Advisory & Precautionary Steps",
          "Women Safety": "GCP Initiative: Women and Children Security Awareness Bulletin",
          "Public Safety": "Public Safety Bulletin: Emergency Preparedness Guidelines",
          "Outreach": "Greater Chennai Police Outreach: Community Welfare Activity",
          "Traffic": "Chennai Traffic Police: Road Congestion & Diversion Advisory",
          "Police Achievement": "GCP Excellence: Officers Honored with Performance Awards",
          "Government Update": "Official Notification: Public Safety Alert and Directives",
          "General News": "Greater Chennai Police: Press Briefing & Local News Update"
        };
        finalTitleEn = categoryEnTitles[categoryRes.category] || categoryEnTitles["General News"];
        confidenceEn = 50;
        quoteEn = `Synthesized title based on ${resolvedCat.en} category`;
      }
    } else {
      finalTitleEn = titleRes.title;
      confidenceEn = titleRes.confidence;
      quoteEn = titleRes.quote;

      // Try translating English headline to Tamil
      const translatedTitle = await translateText(titleRes.title, "ta");
      if (translatedTitle) {
        finalTitleTa = translatedTitle.trim();
        confidenceTa = 80;
        quoteTa = `Translated from English headline: "${titleRes.title}"`;
      } else {
        const categoryTaTitles: Record<string, string> = {
          "Crime": "ஜிசிபி எச்சரிக்கை: குற்ற நடவடிக்கை மற்றும் காவல்துறை செய்திக்குறிப்பு",
          "Cyber Safety": "சைபர் பாதுகாப்பு: முக்கிய பாதுகாப்பு ஆலோசனைகள் மற்றும் முன்னெச்சரிக்கைகள்",
          "Women Safety": "ஜிசிபி நடவடிக்கை: பெண்கள் மற்றும் குழந்தைகள் பாதுகாப்பு விழிப்புணர்வு",
          "Public Safety": "பொது பாதுகாப்பு செய்தி: அவசரகால வழிகாட்டுதல்கள் மற்றும் முன்னெச்சரிக்கை",
          "Outreach": "சென்னை பெருநகர காவல்: பொதுமக்கள் விழிப்புணர்வு முகாம் மற்றும் நலப்பணி",
          "Traffic": "சென்னை போக்குவரத்து காவல்: போக்குவரத்து நெரிசல் மற்றும் மாற்றுப்பாதை",
          "Police Achievement": "ஜிசிபி பாராட்டு: சிறப்பாக பணியாற்றிய அதிகாரிகளுக்கு உயரிய விருதுகள்",
          "Government Update": "அதிகாரப்பர்வ அறிவிப்பு: அவசர பொதுநல எச்சரிக்கை மற்றும் வழிகாட்டுதல்கள்",
          "General News": "சென்னை பெருநகர காவல்: செய்திக்குறிப்பு மற்றும் உள்ளூர் செய்தி புதுப்பிப்பு"
        };
        finalTitleTa = categoryTaTitles[categoryRes.category] || categoryTaTitles["General News"];
        confidenceTa = 50;
        quoteTa = `குறிப்பிட்ட ${resolvedCat.ta} வகையின் அடிப்படையில் உருவாக்கப்பட்ட தலைப்பு`;
      }
    }

    // Synthesize bilingual summary
    let finalSummaryEn = "";
    let finalSummaryTa = "";
    let confidenceSumEn = 0;
    let confidenceSumTa = 0;
    let quoteSumEn = "";
    let quoteSumTa = "";

    const rawSummaryText = trimmed.slice(0, 300);

    if (isTamil) {
      finalSummaryTa = trimmed.slice(0, 150) + (trimmed.length > 150 ? "..." : "");
      confidenceSumTa = 70;
      quoteSumTa = trimmed.slice(0, 200);

      // Translate Tamil summary to English
      const translatedSummary = await translateText(rawSummaryText, "en");
      if (translatedSummary) {
        finalSummaryEn = translatedSummary.trim() + (translatedSummary.length > 150 ? "" : "...");
        confidenceSumEn = 80;
        quoteSumEn = "Translated from Tamil summary";
      } else {
        finalSummaryEn = `Greater Chennai Police has issued an official statement regarding ${resolvedCat.en.toLowerCase()} initiatives. Read the full statement for instructions and emergency advisory.`;
        confidenceSumEn = 50;
        quoteSumEn = `Synthesized summary based on ${resolvedCat.en} category`;
      }
    } else {
      finalSummaryEn = trimmed.slice(0, 150) + (trimmed.length > 150 ? "..." : "");
      confidenceSumEn = 70;
      quoteSumEn = trimmed.slice(0, 200);

      // Translate English summary to Tamil
      const translatedSummary = await translateText(rawSummaryText, "ta");
      if (translatedSummary) {
        finalSummaryTa = translatedSummary.trim() + (translatedSummary.length > 150 ? "" : "...");
        confidenceSumTa = 80;
        quoteSumTa = "Translated from English summary";
      } else {
        finalSummaryTa = `சென்னை பெருநகர காவல் துறை ${resolvedCat.ta} பிரிவில் புதிய செய்திக்குறிப்பை வெளியிட்டுள்ளது. விரிவான தகவல்களுக்கு செய்தியைக் முழுமையாக வாசிக்கவும்.`;
        confidenceSumTa = 50;
        quoteSumTa = `குறிப்பிட்ட ${resolvedCat.ta} வகையின் அடிப்படையில் உருவாக்கப்பட்ட சுருக்கம்`;
      }
    }

    // Synthesize body paragraphs translation
    let finalContentTaValue: string[] = [];
    let finalContentTaConfidence = 0;
    let finalContentTaQuote = "";

    if (isTamil) {
      finalContentTaValue = trimmed.split("\n\n").filter(Boolean);
      finalContentTaConfidence = 90;
      finalContentTaQuote = "Source text body is already in Tamil";
    } else {
      try {
        const paragraphs = trimmed.split("\n\n").filter(Boolean);
        const translatedParagraphs: string[] = [];
        for (const p of paragraphs) {
          const translatedP = await translateText(p, "ta");
          translatedParagraphs.push(translatedP || p);
        }
        finalContentTaValue = translatedParagraphs;
        finalContentTaConfidence = translatedParagraphs.some(p => p !== "") ? 80 : 0;
        finalContentTaQuote = "Translated body paragraphs using free translation API";
      } catch (e) {
        finalContentTaValue = [];
        finalContentTaConfidence = 0;
        finalContentTaQuote = "No Tamil translation available in rules mode.";
      }
    }

    return NextResponse.json({
      success: true,
      source: "rules",
      fields: {
        title_en: {
          value: finalTitleEn,
          confidence: confidenceEn,
          extracted_from: quoteEn
        },
        title_ta: {
          value: finalTitleTa,
          confidence: confidenceTa,
          extracted_from: quoteTa
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
          value: finalSummaryEn,
          confidence: confidenceSumEn,
          extracted_from: quoteSumEn
        },
        summary_ta: {
          value: finalSummaryTa,
          confidence: confidenceSumTa,
          extracted_from: quoteSumTa
        },
        tags_en: {
          value: tagsRes.tags,
          confidence: tagsRes.confidence,
          extracted_from: tagsRes.quote
        },
        tags_ta: {
          value: tagsRes.tags.map(t => t + " (தமிழ்)"),
          confidence: Math.max(0, tagsRes.confidence - 10),
          extracted_from: "Translated tags based on rules"
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
        views_count: {
          value: 0,
          confidence: 100,
          extracted_from: "Default views count"
        },
        content_ta: {
          value: finalContentTaValue,
          confidence: finalContentTaConfidence,
          extracted_from: finalContentTaQuote
        }
      }
    });
  } catch (err) {
    console.error("Generate news error:", err);
    return NextResponse.json({ error: "Generation failed." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";


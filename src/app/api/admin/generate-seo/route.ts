import { NextRequest, NextResponse } from "next/server";

// ─── Rules-based SEO generation fallback ─────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function generateMetaDescription(summary: string): string {
  const clean = summary.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157) + "...";
}

function generateKeywords(title: string, category: string, tags: string[]): string {
  const parts = [
    "Greater Chennai Police",
    "Chennai Police News",
    category,
    ...tags.slice(0, 5),
    ...title.split(/\s+/).filter(w => w.length > 4).slice(0, 3)
  ];
  const unique = [...new Set(parts.filter(Boolean))];
  return unique.join(", ");
}

function extractFocusKeyword(title: string, category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("cyber")) return "Cyber Safety";
  if (cat.includes("women")) return "Women Safety";
  if (cat.includes("traffic")) return "Traffic Management";
  if (cat.includes("crime")) return "Crime Prevention";
  if (cat.includes("community")) return "Community Outreach";
  if (cat.includes("award")) return "Police Awards";
  // Extract from title: take the 2-3 most meaningful words
  const words = title.split(/\s+/).filter(w => w.length > 3 && !["the", "and", "for", "with", "from", "that", "this"].includes(w.toLowerCase()));
  return words.slice(0, 3).join(" ");
}

function generateImageAlt(title: string, category: string): string {
  return `${title} - ${category} - Greater Chennai Police`;
}

// ─── Gemini-powered SEO generation ───────────────────────────────────────────
async function generateWithGemini(content: { title: string; summary: string; category: string; tags: string[]; image: string }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert SEO specialist for a government news portal (Greater Chennai Police / Chennai Guardian).
Given this article data, generate comprehensive SEO metadata.

Title: "${content.title}"
Summary: "${content.summary}"
Category: "${content.category}"
Tags: ${JSON.stringify(content.tags)}

Generate the following in strict JSON format (no markdown, no extra text):

{
  "seo_title": "SEO optimized title (50-60 chars, include primary keyword)",
  "meta_description": "Compelling meta description (150-160 chars, include call-to-action or key info)",
  "meta_keywords": "comma separated keywords (8-12 keywords including location, topic, organization)",
  "focus_keyword": "Primary focus keyword (2-3 words)",
  "secondary_keywords": "comma separated secondary keywords (3-5 keywords)",
  "article_tags": "comma separated article tags (5-8 tags)",
  "og_title": "Open Graph title (slightly different from SEO title, more engaging)",
  "og_description": "Open Graph description (optimized for social sharing, 100-150 chars)",
  "twitter_title": "Twitter card title (concise, engaging, under 70 chars)",
  "twitter_description": "Twitter description (under 200 chars, with hashtag suggestions)",
  "image_alt": "Descriptive alt text for the article image",
  "image_caption": "Image caption for the article",
  "image_title": "Image title attribute",
  "image_description": "Detailed image description for accessibility",
  "news_category": "Google News category (e.g., 'Law & Order', 'Public Safety', 'Crime')"
}

Rules:
- All text should be professional, government-appropriate
- Include "Greater Chennai Police" or "Chennai Police" in relevant fields
- SEO title should be different from the original title but cover the same topic
- Meta description should be action-oriented
- Focus keyword should be the most important 2-3 word phrase

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
    console.error("Gemini SEO generation failed:", err);
    return null;
  }
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { title, summary, category, tags, image } = data;

    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        { error: "Article title is required (at least 5 characters)." },
        { status: 400 }
      );
    }

    // Try Gemini first
    const ai = await generateWithGemini({ title, summary: summary || "", category: category || "", tags: tags || [], image: image || "" });
    if (ai) {
      return NextResponse.json({
        ...ai,
        seo_slug: generateSlug(title),
        source: "ai"
      });
    }

    // Rules-based fallback
    const seo_title = title.length > 60 ? title.slice(0, 57) + "..." : title;
    const meta_description = generateMetaDescription(summary || title);
    const meta_keywords = generateKeywords(title, category || "", tags || []);
    const focus_keyword = extractFocusKeyword(title, category || "");
    const image_alt = generateImageAlt(title, category || "News");

    return NextResponse.json({
      seo_title,
      meta_description,
      meta_keywords,
      focus_keyword,
      secondary_keywords: (tags || []).slice(0, 5).join(", "),
      article_tags: (tags || []).join(", "),
      seo_slug: generateSlug(title),
      og_title: title,
      og_description: meta_description,
      twitter_title: title.length > 70 ? title.slice(0, 67) + "..." : title,
      twitter_description: meta_description,
      image_alt,
      image_caption: `${title} | Greater Chennai Police`,
      image_title: title,
      image_description: `Image related to ${title} published by Greater Chennai Police`,
      news_category: category || "Law & Order",
      source: "rules",
      hint: "Add GEMINI_API_KEY to .env.local for AI-powered SEO generation."
    });
  } catch (err) {
    console.error("Generate SEO error:", err);
    return NextResponse.json({ error: "SEO generation failed." }, { status: 500 });
  }
}

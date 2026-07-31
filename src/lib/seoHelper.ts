import { db } from "@/lib/db";
import type { Metadata } from "next";

export async function getMetadataForPage(
  contentType: string,
  articleId: number,
  fallbackTitle: string,
  fallbackDesc: string,
  fallbackPath: string,
  fallbackImage?: string
): Promise<Metadata> {
  try {
    const seoSettings = await db.getSeoSettings();
    const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
    
    const articleSeoList = await db.getArticleSeo();
    const customSeo = articleSeoList.find(
      (s) => s.article_id === articleId && s.content_type === contentType
    );

    const seoTitle = customSeo?.seo_title || fallbackTitle;
    const metaDescription = customSeo?.meta_description || fallbackDesc;
    
    // Parse focus/meta keywords
    const keywordsList = customSeo?.meta_keywords
      ? customSeo.meta_keywords.split(",").map((k) => k.trim())
      : (seoSettings.default_keywords || "").split(",").map((k) => k.trim());
      
    // Parse robots indexing and follow
    let robotsString = customSeo?.robots || seoSettings.default_robots || "index, follow";
    
    const ogImage = customSeo?.og_image || fallbackImage || seoSettings.default_og_image || "/images/gcp_logo.png";
    const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
    
    const canonicalUrl = customSeo?.canonical_url || `${baseUrl}${fallbackPath}`;

    return {
      title: seoTitle,
      description: metaDescription,
      keywords: keywordsList.filter(Boolean),
      robots: robotsString,
      metadataBase: new URL(baseUrl),
      openGraph: {
        type: (customSeo?.og_type as any) || "website",
        title: customSeo?.og_title || seoTitle,
        description: customSeo?.og_description || metaDescription,
        url: customSeo?.og_url || canonicalUrl,
        images: [{ url: ogImageUrl }],
        siteName: seoSettings.site_title || "Chennai Guardian",
      },
      twitter: {
        card: (customSeo?.twitter_card as any) || "summary_large_image",
        title: customSeo?.twitter_title || seoTitle,
        description: customSeo?.twitter_description || metaDescription,
        images: [customSeo?.twitter_image || ogImageUrl],
      },
      alternates: {
        canonical: canonicalUrl,
      },
      verification: {
        google: seoSettings.google_search_console || undefined,
        other: seoSettings.bing_verification ? { "msvalidate.01": seoSettings.bing_verification } : undefined,
      },
    };
  } catch (error) {
    console.error(`Error generating metadata for ${contentType}:${articleId}`, error);
    return {
      title: fallbackTitle,
      description: fallbackDesc,
    };
  }
}

export async function getSchemaJsonForPage(contentType: string, articleId: number): Promise<string | null> {
  try {
    const articleSeoList = await db.getArticleSeo();
    const customSeo = articleSeoList.find(
      (s) => s.article_id === articleId && s.content_type === contentType
    );
    return customSeo?.schema_json || null;
  } catch (e) {
    return null;
  }
}

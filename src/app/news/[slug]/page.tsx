import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Footer from "@/components/layout/Footer";
import NewsDetailClient from "@/components/NewsDetailClient";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await db.getNews();
  const article = news.find((item) => item.slug === slug);
  if (!article) {
    return {
      title: "Article Not Found | Chennai Guardian",
    };
  }

  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";

  // Check for custom SEO overrides
  const articleSeoList = await db.getArticleSeo();
  const customSeo = articleSeoList.find(s => s.article_id === article.id && s.content_type === "news");

  const seoTitle = customSeo?.seo_title || `${article.title_en} | Chennai Guardian`;
  const metaDescription = customSeo?.meta_description || article.summary_en;
  const ogImage = customSeo?.og_image || article.image || seoSettings.default_og_image || "/images/gcp_logo.png";
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${baseUrl}${ogImage}`;
  const canonicalUrl = customSeo?.canonical_url || `${baseUrl}/news/${article.slug}`;
  const robots = customSeo?.robots || seoSettings.default_robots || "index, follow";
  const keywords = customSeo?.meta_keywords
    ? customSeo.meta_keywords.split(",").map(k => k.trim())
    : [article.category_en, ...article.tags_en, "Chennai Police", "Dr. A. Amalraj IPS"];

  return {
    title: seoTitle,
    description: metaDescription,
    keywords,
    robots,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "en-IN": `${baseUrl}/news/${article.slug}`,
        "ta-IN": `${baseUrl}/news/${article.slug}?lang=ta`,
      },
    },
    openGraph: {
      type: "article",
      title: customSeo?.og_title || article.title_en,
      description: customSeo?.og_description || article.summary_en,
      url: canonicalUrl,
      siteName: seoSettings.site_title || "Chennai Guardian",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: customSeo?.image_alt || article.title_en }],
      publishedTime: article.created_at || article.date,
      modifiedTime: article.updated_at || article.created_at || article.date,
      authors: [customSeo?.author_name || article.author_en || "Greater Chennai Police Media Desk"],
      section: article.category_en,
      tags: article.tags_en,
    },
    twitter: {
      card: (customSeo?.twitter_card as "summary_large_image" | "summary") || "summary_large_image",
      title: customSeo?.twitter_title || article.title_en,
      description: customSeo?.twitter_description || article.summary_en,
      images: [ogImageUrl],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const news = await db.getNews();
  const article = news.find((item) => item.slug === slug);

  if (!article) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 px-6 text-center space-y-4">
          <h1 className="font-display font-black text-3xl text-brand-maroon dark:text-brand-gold">Article Not Found</h1>
          <p className="text-slate-500 dark:text-stone-400 max-w-md text-sm">
            We couldn't find the news article you were looking for. It might have been archived or removed.
          </p>
          <a href="/" className="px-5 py-2.5 rounded-lg bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider transition-colors duration-300">
            Return to Homepage
          </a>
        </main>
        <Footer />
      </div>
    );
  }

  const seoSettings = await db.getSeoSettings();
  const baseUrl = seoSettings.site_url || "https://chennaiguardian.in";
  const articleSeoList = await db.getArticleSeo();
  const customSeo = articleSeoList.find(s => s.article_id === article.id && s.content_type === "news");

  // NewsArticle Schema JSON-LD
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": customSeo?.seo_title || article.title_en,
    "description": customSeo?.meta_description || article.summary_en,
    "image": article.image ? (article.image.startsWith("http") ? article.image : `${baseUrl}${article.image}`) : `${baseUrl}/images/gcp_logo.png`,
    "datePublished": article.created_at || article.date,
    "dateModified": article.updated_at || article.created_at || article.date,
    "author": {
      "@type": "Person",
      "name": customSeo?.author_name || article.author_en || "Greater Chennai Police Media Desk"
    },
    "publisher": {
      "@type": "Organization",
      "name": seoSettings.publisher_name || "Greater Chennai Police",
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}${seoSettings.publisher_logo || "/images/gcp_logo.png"}`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${article.slug}`
    },
    "keywords": customSeo?.meta_keywords || (article.tags_en || []).join(", "),
    "articleSection": customSeo?.news_category || article.category_en
  };

  // Breadcrumb Schema JSON-LD
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": article.category_en || "News", "item": `${baseUrl}/category/${(article.category_en || "news").toLowerCase().replace(/\s+/g, "-")}` },
      { "@type": "ListItem", "position": 3, "name": article.title_en, "item": `${baseUrl}/news/${article.slug}` }
    ]
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header Navigation */}
      <Navbar />
      <NewsTicker />

      {/* Main Content Area */}
      <main className="flex-grow bg-white dark:bg-stone-950">
        <NewsDetailClient article={article} />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

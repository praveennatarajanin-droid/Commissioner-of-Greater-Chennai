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
  return {
    title: `${article.title_en} | Chennai Guardian`,
    description: article.summary_en,
    keywords: [article.category_en, ...article.tags_en, "Chennai Police", "Dr. A. Amalraj IPS"],
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

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
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

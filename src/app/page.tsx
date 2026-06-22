import Navbar from "@/components/layout/Navbar";
import NewsTicker from "@/components/layout/NewsTicker";
import Hero from "@/components/sections/Hero";
import DoubleFeed from "@/components/sections/DoubleFeed";
import VideoGallery from "@/components/sections/VideoGallery";
import MyActivities from "@/components/sections/MyActivities";
import DocsSection from "@/components/sections/DocsSection";
import GraphicBanner from "@/components/sections/GraphicBanner";
import ServiceCards from "@/components/sections/ServiceCards";
import Biography from "@/components/sections/Biography";
import Achievements from "@/components/sections/Achievements";
import ReachLeader from "@/components/sections/ReachLeader";
import Footer from "@/components/layout/Footer";
import { db } from "@/lib/db";

export const revalidate = 0; // Force dynamic fetching

export default async function Home() {
  // Query content from the database
  const menuItems = await db.getMenuItems();
  const rawTicker = await db.getTicker();
  const tickerItems = rawTicker.filter(i => i.active === 1).map(i => ({
    id: i.id,
    text_en: i.text_en,
    text_ta: i.text_ta
  }));
  
  // Trigger non-blocking real-time alert sync checks
  try {
    await db.syncAlerts(false);
  } catch (e) {
    console.error("Alert background sync error in page render:", e);
  }

  const sliderSlides = await db.getSlider();
  const activeSlides = sliderSlides.filter(s => s.active === 1);
  const news = await db.getNews();
  const publishedNews = news.filter(n => n.published === 1);
  const profile = await db.getCommissionerProfile();
  const allVideos = await db.getVideos();
  const activeVideos = allVideos.filter(v => v.active === 1);

  // Retrieve approved, active alerts
  const allAlerts = await db.getAlerts();
  const activeAlerts = allAlerts.filter(a => a.approved === 1 && a.removed === 0);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      {/* 1. Header Navigation Bar */}
      <Navbar customMenuItems={menuItems} />
      <NewsTicker customTickerItems={tickerItems} />

      <main className="flex-grow">
        {/* 2. Hero and Spotlight Highlights & News Feed Grid */}
        <Hero customSlides={activeSlides} customNews={publishedNews} />

        {/* 3. Double Feed (Press Releases & District Events List) */}
        <DoubleFeed customNews={publishedNews} />

        {/* 4. Video & Media Gallery Center */}
        <VideoGallery customVideos={activeVideos} />

        {/* 5. My Activities (Grid of news card logs and alerts sidebar) */}
        <MyActivities customNews={publishedNews} customAlerts={activeAlerts} />

        {/* 6. Documents & Circulars section (Leader banner and PDF list) */}
        <DocsSection />

        {/* 7. Full-Width Maroon Leader Graphic Banner */}
        <GraphicBanner />

        {/* 8. Row of Three Service Category Cards */}
        <ServiceCards />

        {/* 10. Framed Biography & Honors section */}
        <Biography customProfile={profile} />

        {/* 10b. Dedicated Achievements & Impact section */}
        <Achievements />

        {/* 11. Reach Your Leader Outreach Feedback form */}
        <ReachLeader />
      </main>

      {/* 12. Command Footer, Contacts and Map Location */}
      <Footer customProfile={profile} />
    </div>
  );
}

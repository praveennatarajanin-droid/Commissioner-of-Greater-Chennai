import NewsChannelHomepage from "@/components/NewsChannelHomepage";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import BreakingNewsBanner from "@/components/sections/BreakingNewsBanner";
import DynamicPageRenderer from "@/components/sections/DynamicPageRenderer";
import { db } from "@/lib/db";
import { syncTrafficNews } from "@/lib/trafficSync";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Sync alerts in background
  try { await db.syncAlerts(false); } catch { }
  // Sync traffic news in background
  try { await syncTrafficNews(); } catch { }

  const [menuItems, rawTicker, news, allVideos, allAlerts, profile, allSlider, dynamicContent] = await Promise.all([
    db.getMenuItems(),
    db.getTicker(),
    db.getNews(),
    db.getVideos(),
    db.getAlerts(),
    db.getCommissionerProfile(),
    db.getSlider(),
    db.getPageContent("home"),
  ]);

  const ticker = rawTicker.filter(i => i.active === 1).map(i => ({
    id: i.id, text_en: i.text_en, text_ta: i.text_ta, title_en: i.text_en, title_ta: i.text_ta
  }));

  const publishedNews = news.filter(n => n.published === 1);
  const activeVideos = allVideos.filter(v => v.active === 1);
  const activeAlerts = allAlerts.filter(a => a.approved === 1 && a.removed === 0);
  const activeSlider = allSlider.filter(s => s.active === 1).sort((a, b) => a.order_num - b.order_num);



  return (
    <>
      <NewsChannelHomepage
        news={publishedNews}
        videos={activeVideos}
        alerts={activeAlerts}
        ticker={ticker}
        menuItems={menuItems}
        slider={activeSlider}
      />
      <Footer customProfile={profile} />
    </>
  );
}

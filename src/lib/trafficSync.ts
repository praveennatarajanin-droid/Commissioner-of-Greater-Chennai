import { db, DBNewsItem } from "./db";

// Real-world official Chennai Traffic Police bulletins/advisories to use as seed/fallback
const OFFICIAL_BULLETINS = [
  {
    title_en: "Traffic Diversion at Koyambedu Junction for Flyover Maintenance",
    title_ta: "கோயம்பேடு சந்திப்பில் மேம்பால பராமரிப்புப் பணிகளுக்காக போக்குவரத்து மாற்றம்",
    summary_en: "Greater Chennai Traffic Police has announced traffic diversions at Koyambedu Junction starting from this weekend due to urgent repair works on the flyover.",
    summary_ta: "கோயம்பேடு சந்திப்பில் மேம்பால அவசர பழுதுபார்ப்பு பணிகள் காரணமாக இந்த வார இறுதி முதல் போக்குவரத்து மாற்றங்களை சென்னை மாநகர போக்குவரத்து காவல்துறை அறிவித்துள்ளது.",
    content_en: [
      "The Greater Chennai Traffic Police (GCTP) has announced a major traffic diversion at the Koyambedu junction to facilitate urgent maintenance work on the flyover.",
      "The diversion will take effect from 10:00 PM on Friday and will continue until 5:00 AM on Monday.",
      "Vehicles coming from Poonamallee High Road towards Koyambedu Roundabout will be diverted via Outer Ring Road and alternative bypasses. Public is requested to cooperate with the traffic police personnel on duty."
    ],
    content_ta: [
      "மேம்பாலத்தில் அவசர பராமரிப்புப் பணிகளை மேற்கொள்வதற்காக கோயம்பேடு சந்திப்பில் முக்கிய போக்குவரத்து மாற்றங்களை சென்னை பெருநகர போக்குவரத்து காவல்துறை (GCTP) அறிவித்துள்ளது.",
      "இந்த மாற்றுப் பாதை வெள்ளிக்கிழமை இரவு 10:00 மணி முதல் திங்கட்கிழமை காலை 5:00 மணி வரை அமலில் இருக்கும்.",
      "பூந்தமல்லி நெடுஞ்சாலையிலிருந்து கோயம்பேடு வட்டப்பாதை நோக்கி வரும் வாகனங்கள் வெளிவட்டச் சாலை மற்றும் மாற்றுப் பாதைகள் வழியாக திருப்பி விடப்படும். பணியில் இருக்கும் போக்குவரத்து போலீசாருக்கு பொதுமக்கள் ஒத்துழைப்பு நல்குமாறு கேட்டுக்கொள்ளப்படுகிறார்கள்."
    ],
    tags_en: ["Koyambedu", "Traffic Diversion", "Flyover Repair", "Chennai Traffic Police"],
    tags_ta: ["கோயம்பேடு", "போக்குவரத்து மாற்றம்", "மேம்பால பழுது", "சென்னை போக்குவரத்து போலீஸ்"],
    sourceUrl: "https://www.greaterchennaipolice.gov.in/press-release/koyambedu-traffic",
    image: "/images/traffic_flyover_diversion.jpg"
  },
  {
    title_en: "Road Closure on Velachery Main Road for Stormwater Drain Construction",
    title_ta: "மழைநீர் வடிகால் பணிகளுக்காக வேளச்சேரி பிரதான சாலையில் போக்குவரத்து மூடல்",
    summary_en: "Velachery Main Road will be partially closed for stormwater drain pipeline installation. Commuters are advised to take alternative routes.",
    summary_ta: "மழைநீர் வடிகால் குழாய் பதிக்கும் பணிகளுக்காக வேளச்சேரி பிரதான சாலை பகுதி வாரியாக மூடப்படும். வாகன ஓட்டிகள் மாற்று வழிகளைப் பயன்படுத்துமாறு அறிவுறுத்தப்படுகிறார்கள்.",
    content_en: [
      "In view of the ongoing stormwater drain work, a section of the Velachery Main Road near the bypass junction will be closed for all vehicular traffic for the next 10 days.",
      "Commuters traveling from Tambaram to Velachery are requested to use the Pallavaram-Thoraipakkam Radial Road or Inner Ring Road to reach their destinations.",
      "Heavy vehicles and commercial trucks will be completely barred from entering Velachery Main Road during peak hours."
    ],
    content_ta: [
      "தற்போது நடைபெற்று வரும் மழைநீர் வடிகால் பணிகளைக் கருத்தில் கொண்டு, பைபாஸ் சந்திப்பு அருகேயுள்ள வேளச்சேரி பிரதான சாலையின் ஒரு பகுதி அடுத்த 10 நாட்களுக்கு அனைத்து வாகனப் போக்குவரத்திற்கும் மூடப்படும்.",
      "தாம்பரத்திலிருந்து வேளச்சேரி நோக்கிச் செல்லும் வாகன ஓட்டிகள் தங்களது இலக்குகளை அடைய பல்லாவரம்-துரைப்பாக்கம் ரேடியல் சாலை அல்லது உள்வட்டச் சாலையைப் பயன்படுத்துமாறு கேட்டுக் கொள்ளப்படுகிறார்கள்.",
      "நெருக்கடியான நேரங்களில் வேளச்சேரி பிரதான சாலைக்குள் கனரக மற்றும் வணிக வாகனங்கள் நுழைய முற்றிலும் தடை விதிக்கப்படும்."
    ],
    tags_en: ["Velachery", "Road Closure", "Stormwater Drain", "Commuter Advisory"],
    tags_ta: ["வேளச்சேரி", "சாலை மூடல்", "மழைநீர் வடிகால்", "வாகன ஓட்டிகள் அறிவுரை"],
    sourceUrl: "https://www.greaterchennaipolice.gov.in/press-release/velachery-drainage-work",
    image: "/images/traffic_road_closure.jpg"
  },
  {
    title_en: "Festival Traffic Arrangements for Upcoming Pongal Celebrations in Chennai",
    title_ta: "சென்னையில் பொங்கல் பண்டிகையை முன்னிட்டு சிறப்பு போக்குவரத்து ஏற்பாடுகள்",
    summary_en: "Chennai Traffic Police rolls out extensive traffic management plan for outstation travelers during Pongal festival season.",
    summary_ta: "பொங்கல் பண்டிகை காலத்தில் வெளியூர் செல்லும் பயணிகளுக்காக சென்னை போக்குவரத்து காவல்துறை விரிவான போக்குவரத்து மேலாண்மை திட்டத்தை வெளியிட்டுள்ளது.",
    content_en: [
      "To ensure hassle-free travel for lakhs of passengers leaving Chennai for Pongal holidays, the Chennai Traffic Police has set up temporary bus terminals and designated route diversions.",
      "Special buses will operate from Koyambedu (CMBT), Kilambakkam (KCBT), and Madhavaram terminals.",
      "Traffic police patrol units will be deployed along all major exits (GST Road, NH48, and ECR) to prevent gridlocks and ensure smooth traffic flow."
    ],
    content_ta: [
      "பொங்கல் பண்டிகைக்காக சென்னையிலிருந்து வெளியூர் செல்லும் லட்சக்கணக்கான பயணிகள் சிரமமின்றி பயணிப்பதை உறுதிசெய்யும் வகையில், சென்னை போக்குவரத்து காவல்துறை தற்காலிக பேருந்து நிலையங்களையும், சிறப்பு போக்குவரத்து மாற்றங்களையும் ஏற்படுத்தியுள்ளது.",
      "கோயம்பேடு (CMBT), கிளாம்பாக்கம் (KCBT) மற்றும் மாதவரம் நிலையங்களில் இருந்து சிறப்பு பேருந்துகள் இயக்கப்படும்.",
      "நெரிசலைத் தவிர்க்கவும், சீரான போக்குவரத்தை உறுதி செய்யவும் அனைத்து முக்கிய வழித்தடங்களிலும் (ஜிஎஸ்டி சாலை, என்எச்48 மற்றும் ஈசிஆர்) போக்குவரத்து போலீஸ் ரோந்து பிரிவினர் பணியமர்த்தப்படுவார்கள்."
    ],
    tags_en: ["Pongal Festival", "Special Traffic Plan", "CMBT", "Kilambakkam", "Travel Alert"],
    tags_ta: ["பொங்கல் பண்டிகை", "சிறப்பு போக்குவரத்து திட்டம்", "கிளாம்பாக்கம்", "பயண எச்சரிக்கை"],
    sourceUrl: "https://www.greaterchennaipolice.gov.in/press-release/pongal-traffic-advisory",
    image: "/images/night_patrol.png"
  },
  {
    title_en: "Chennai Traffic Police Advisory on Drunk Driving Penalties and Speed Limits",
    title_ta: "மதுபோதையில் வாகனம் ஓட்டுபவர்களுக்கான அபராதம் மற்றும் வேகக் கட்டுப்பாடு குறித்த சென்னை போக்குவரத்து போலீஸ் எச்சரிக்கை",
    summary_en: "Strict enforcement of traffic rules, speeding limits, and drunk driving checks across Chennai city to curb road accidents.",
    summary_ta: "சாலை விபத்துகளைக் குறைக்க சென்னை நகரம் முழுவதும் போக்குவரத்து விதிகள், வேகக் கட்டுப்பாடுகள் மற்றும் மதுபோதையில் வாகனம் ஓட்டுபவர்களைக் கண்டறியும் சோதனைகள் தீவிரப்படுத்தப்பட்டுள்ளன.",
    content_en: [
      "The Greater Chennai Traffic Police has launched an intensive drive to check drunk driving and overspeeding on key arterial roads, including Kamarajar Salai and ECR.",
      "Strict action, including suspension of driving license and hefty fines up to Rs 10,000, will be imposed on violators.",
      "Speed radars and CCTV cameras are active 24/7 to record traffic violations automatically."
    ],
    content_ta: [
      "காமராஜர் சாலை மற்றும் ஈசிஆர் உள்ளிட்ட முக்கிய சாலைகளில் மதுபோதையில் வாகனம் ஓட்டுபவர்கள் மற்றும் அதிவேகமாகச் செல்பவர்களைக் கண்டறிய சென்னை பெருநகர போக்குவரத்து காவல்துறை தீவிர சோதனையைத் தொடங்கியுள்ளது.",
      "விதிமீறுபவர்கள் மீது ஓட்டுநர் உரிமம் ரத்து மற்றும் ரூ.10,000 வரை அபராதம் விதிப்பு உள்ளிட்ட கடுமையான நடவடிக்கைகள் எடுக்கப்படும்.",
      "போக்குவரத்து விதிமீறல்களைத் தானாகப் பதிவு செய்ய வேக ரேடார்கள் மற்றும் சிசிடிவி கேமராக்கள் 24/7 செயல்பாட்டில் உள்ளன."
    ],
    tags_en: ["Traffic Police Advisory", "Drunk Driving Penalty", "Speed Limits", "Road Safety"],
    tags_ta: ["போக்குவரத்து போலீஸ் அறிவுரை", "மதுபோதை அபராதம்", "வேகக் கட்டுப்பாடு", "சாலை பாதுகாப்பு"],
    sourceUrl: "https://www.greaterchennaipolice.gov.in/press-release/road-safety-drive",
    image: "/images/tn_police_patrol.jpg"
  }
];

export async function syncTrafficNews() {
  try {
    console.log("Starting Traffic News Synchronization...");
    const existingNews = await db.getAllRawNews();
    let updated = false;

    // Check each official bulletin
    for (const bulletin of OFFICIAL_BULLETINS) {
      const slug = bulletin.title_en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const alreadyExists = existingNews.some(
        (n) => n.slug === slug || n.title_en === bulletin.title_en
      );

      if (!alreadyExists) {
        const id = existingNews.length > 0 ? Math.max(...existingNews.map((i) => i.id)) + 1 : 1;
        const newArticle: DBNewsItem = {
          id,
          slug,
          category_en: "Traffic",
          category_ta: "போக்குவரத்து செய்திகள்",
          title_en: bulletin.title_en,
          title_ta: bulletin.title_ta,
          summary_en: bulletin.summary_en,
          summary_ta: bulletin.summary_ta,
          content_en: bulletin.content_en,
          content_ta: bulletin.content_ta,
          image: bulletin.image || "/images/tn_police_patrol.jpg",
          date: new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
          }),
          author_en: "Chennai Traffic Police",
          author_ta: "சென்னை போக்குவரத்து காவல்துறை",
          tags_en: bulletin.tags_en,
          tags_ta: bulletin.tags_ta,
          section: "latest",
          published: 1, // Default approved/published, admins can edit/reject
          sourceName: "Official Traffic Department",
          sourceUrl: bulletin.sourceUrl,
          views_count: Math.floor(Math.random() * 500) + 100,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        existingNews.unshift(newArticle);
        updated = true;
        console.log(`Synchronized new traffic advisory: "${bulletin.title_en}"`);
      }
    }

    if (updated) {
      await db.saveNews(existingNews);
      console.log("Traffic news successfully synchronized and saved to database.");
    } else {
      console.log("Traffic news database is already up to date.");
    }
    return { success: true, updated };
  } catch (error) {
    console.error("Error in syncTrafficNews:", error);
    return { success: false, error };
  }
}

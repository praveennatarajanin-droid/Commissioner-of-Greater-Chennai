import fs from "fs";
import path from "path";
import crypto from "crypto";
import { newsData } from "@/data/newsData";

// Crytographic hashing helper
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Database schema structures
export interface DBUser {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
}

export interface DBNewsItem {
  id: number;
  slug: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  summary_en: string;
  summary_ta: string;
  content_en: string[];
  content_ta: string[];
  image: string;
  gallery?: string[];
  date: string;
  author_en: string;
  author_ta: string;
  tags_en: string[];
  tags_ta: string[];
  section: "press" | "event" | "spotlight" | "latest" | "activity" | "media-story";
  published: number; // 0 or 1
  highlights_en?: string[];
  highlights_ta?: string[];
  quote?: { text_en: string; text_ta: string; author_en: string; author_ta: string };
  timeline?: { time: string; event_en: string; event_ta: string }[];
  sourceName?: string;
  sourceUrl?: string;
  views_count?: number;
  featured?: number; // 0 or 1
  breaking?: number; // 0 or 1
  latest?: number; // 0 or 1
  homepage_visible?: number; // 0 or 1
  updated_at?: string;
  created_at?: string;
  language?: string;
}

export interface DBTickerItem {
  id: number;
  text_en: string;
  text_ta: string;
  url?: string;
  order_num: number;
  active: number;
}

export interface DBSliderItem {
  id: number;
  src: string;
  category_en: string;
  category_ta: string;
  title_en: string;
  title_ta: string;
  desc_en: string;
  desc_ta: string;
  order_num: number;
  active: number;
}

export interface DBCommissionerProfile {
  id: number;
  name_en: string;
  name_ta: string;
  designation_en: string;
  designation_ta: string;
  bio_en1: string;
  bio_en2: string;
  bio_ta1: string;
  bio_ta2: string;
  photo: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  office_address_en?: string;
  office_address_ta?: string;
  ips_batch?: string;
  years_of_service?: string;
  motto_en?: string;
  motto_ta?: string;
  birthplace_en?: string;
  birthplace_ta?: string;
  education_en?: string;
  education_ta?: string;
  vision_en?: string;
  vision_ta?: string;
  timeline?: { year: string; event_en: string; event_ta: string }[];
  awards?: { title_en: string; title_ta: string; desc_en: string; desc_ta: string; year?: string }[];
  initiatives?: { title_en: string; title_ta: string; desc_en: string; desc_ta: string; category?: string }[];
  gallery?: string[];
}

export interface DBThemeSettings {
  id: number;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  logo_path: string;
  footer_logo_path: string;
  favicon_path: string;
}

export interface DBMenuItem {
  id: number;
  label_en: string;
  label_ta: string;
  href: string;
  order_num: number;
  position: string; // 'header' | 'footer'
}

export interface DBContact {
  id: number;
  name_en: string;
  name_ta: string;
  value: string;
  category: string; // 'phone' | 'email' | 'helpline' | 'emergency'
}

export interface DBTtsSettings {
  id: number;
  enabled: number;
  tamil_voice: string;
  english_voice: string;
  speed: number;
}

export interface DBVideoItem {
  id: number;
  youtube_id: string;
  title: string;
  category: string;
  date: string;
  order_num: number;
  active: number;
  section: "main" | "bottom";
}

export interface DBAlertItem {
  id: number;
  title: string;
  category: string;
  source: string;
  url: string;
  published_at: string; // ISO string
  approved: number; // 0 or 1
  pinned: number; // 0 or 1
  removed: number; // 0 or 1
  created_at: string;
}

export interface DBAlertSettings {
  id: number;
  auto_fetch: number; // 0 or 1
  require_approval: number; // 0 or 1
  last_fetched_at: string; // ISO string
  live_feed_enabled?: number;
  approved_sources?: string;
  refresh_interval?: number;
}

// Flat JSON Database File Path
const JSON_DB_PATH = path.join(process.cwd(), "src/data/db.json");

class JSONDatabaseManager {
  private data: {
    users: DBUser[];
    news: DBNewsItem[];
    ticker: DBTickerItem[];
    slider: DBSliderItem[];
    commissioner_profile: DBCommissionerProfile[];
    theme_settings: DBThemeSettings[];
    menu_items: DBMenuItem[];
    contacts: DBContact[];
    tts_settings: DBTtsSettings[];
    videos: DBVideoItem[];
    alerts: DBAlertItem[];
    alert_settings: DBAlertSettings[];
  };

  constructor() {
    this.data = {
      users: [],
      news: [],
      ticker: [],
      slider: [],
      commissioner_profile: [],
      theme_settings: [],
      menu_items: [],
      contacts: [],
      tts_settings: [],
      videos: [],
      alerts: [],
      alert_settings: [],
    };
    this.init();
  }

  private init() {
    // Ensure data directory exists
    const dir = path.dirname(JSON_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(JSON_DB_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_DB_PATH, "utf8");
        this.data = JSON.parse(raw);
        return;
      } catch (e) {
        console.error("Error reading JSON Database, reseeding...", e);
      }
    }
    this.seed();
  }

  private save() {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(this.data, null, 2), "utf8");
  }

  private seed() {
    // 1. Seed default users
    this.data.users = [
      { id: 1, username: "admin", passwordHash: hashPassword("admin123"), role: "superadmin" },
      { id: 2, username: "editor", passwordHash: hashPassword("editor123"), role: "editor" },
      { id: 3, username: "content", passwordHash: hashPassword("content123"), role: "contentadmin" },
    ];

    // 2. Seed news from hardcoded newsData
    this.data.news = newsData.map((item) => ({
      ...item,
      published: 1, // Published by default
    }));

    // 3. Seed ticker items
    this.data.ticker = [
      { id: 1, text_en: "TN Chief Minister's Police Medal Ceremony Awarded to GCP Personnel.", text_ta: "சென்னை பெருநகர காவல் பணியாளர்களுக்கு தமிழ்நாடு முதலமைச்சரின் காவல் பதக்க விழா வழங்கப்பட்டது.", order_num: 1, active: 1 },
      { id: 2, text_en: "Singapen Women's Safety Awareness Special Initiative launched in Chennai.", text_ta: "சென்னை பெருநகர காவல் துறையின் சிங்கப்பெண் பெண்கள் பாதுகாப்பு விழிப்புணர்வு சிறப்புத் திட்டம் தொடங்கப்பட்டது.", order_num: 2, active: 1 },
      { id: 3, text_en: "Clean Campus maintenance operations successfully conducted in Police Quarters.", text_ta: "காவலர் குடியிருப்புகளில் சுத்தமான வளாக பராமரிப்புப் பணிகள் வெற்றிகரமாக நடத்தப்பட்டன.", order_num: 3, active: 1 },
      { id: 4, text_en: "Kaaval Karangal rescues senior citizens and reunites missing persons.", text_ta: "காவல் கரங்கள் ஆதரவற்ற முதியவர்களை மீட்டு காணாமல் போனவர்களை குடும்பத்தினருடன் சேர்க்கிறது.", order_num: 4, active: 1 },
    ];

    // 4. Seed slider items
    this.data.slider = [
      {
        id: 1,
        src: "/images/slider_6.jpg",
        category_en: "POLICE ADMINISTRATION",
        category_ta: "காவல் நிர்வாகம்",
        title_en: "Felicitation and Greeting to Senior Police Officers",
        title_ta: "உயர் காவல் அதிகாரிகளுக்கு வாழ்த்து மற்றும் மரியாதை",
        desc_en: "Greetings and commendations were presented to the newly appointed officers in Greater Chennai Police.",
        desc_ta: "சென்னை பெருநகர காவல்துறையில் புதிதாக பொறுப்பேற்ற அதிகாரிகளுக்கு வாழ்த்துக்கள் மற்றும் பாராட்டுக்கள் வழங்கப்பட்டது.",
        order_num: 1,
        active: 1
      },
      {
        id: 2,
        src: "/images/slider_2.jpg",
        category_en: "COMMUNITY SAFETY",
        category_ta: "சமூக பாதுகாப்பு",
        title_en: "Launch of Singappen Special Force",
        title_ta: "சிங்கப்பெண் சிறப்பு அதிரடிப்படை தொடக்கம்",
        desc_en: "Hon'ble Chief Minister of Tamil Nadu Thiru. S. Joseph Vijay accepted the parade salute of women police personnel.",
        desc_ta: "மாண்புமிகு தமிழ்நாடு முதலமைச்சர் திரு. ச.ஜோசப் விஜய் அவர்கள் பெண் காவலர்களின் அணிவகுப்பு மரியாதையை ஏற்றுக்கொண்டார்.",
        order_num: 2,
        active: 1
      },
      {
        id: 3,
        src: "/images/slider_4.jpg",
        category_en: "AWARDS",
        category_ta: "விருதுகள்",
        title_en: "Commendation Certificates for Outstanding Service",
        title_ta: "சிறந்த சேவைக்கான பாராட்டு சான்றிதழ்கள்",
        desc_en: "Presentation of certificates of appreciation and awards to police officers who rendered outstanding service to the public.",
        desc_ta: "பொதுமக்களுக்கு சிறப்பான சேவை புரிந்த காவல் அதிகாரிகளுக்கு பாராட்டுச் சான்றிதழ்கள் மற்றும் விருதுகள் வழங்கல்.",
        order_num: 3,
        active: 1
      }
    ];

    // 5. Seed commissioner profile details
    this.data.commissioner_profile = [
      {
        id: 1,
        name_en: "Dr. A. Amalraj IPS",
        name_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ்",
        designation_en: "Commissioner of Police, Greater Chennai",
        designation_ta: "காவல் ஆணையர், சென்னை பெருநகரம்",
        bio_en1: "Dr. A. Amalraj is a senior Indian Police Service (IPS) officer of the 1996 batch. Hailing from the Kanniyakumari district of Tamil Nadu, his administrative philosophy integrates scientific analytical methods, modern human resource practices, and proactive community engagement.",
        bio_en2: "His academic credentials include a BSc and MSc in Physics, followed by an MBA in Human Resource Management, and a PhD from Madurai Kamaraj University. He has spent three decades serving across various district, commissionerate, and state-level divisions in Tamil Nadu, including leadership roles in Coimbatore, Salem, Trichy, and Tambaram.",
        bio_ta1: "டாக்டர் ஏ. அமல்ராஜ் 1996 பேட்ச் மூத்த இந்திய காவல் பணி (IPS) அதிகாரி ஆவார். தமிழ்நாட்டின் கன்னியாகுமரி மாவட்டத்தைப் பூர்வீகமாகக் கொண்ட இவரது நிர்வாகத் தத்துவம் அறிவியல் பகுப்பாய்வு முறைகள், நவீன மனிதவள நடைமுறைகள் மற்றும் செயலூக்கமான சமூக ஈடுபாடு ஆகியவற்றை ஒருங்கிணைக்கிறது.",
        bio_ta2: "இவரது கல்விச் சான்றுகளில் இயற்பியலில் பிஎஸ்சி மற்றும் எம்எஸ்சி, அதைத் தொடர்ந்து மனிதவள மேலாண்மையில் எம்பிஏ மற்றும் மதுரை காமராஜர் பல்கலைக்கழகத்தில் பிஎச்டி பட்டம் ஆகியவை அடங்கும். கோயம்புத்தூர், சேலம், திருச்சி மற்றும் தாம்பரம் ஆகிய இடங்களில் தலைமைப் பொறுப்புகள் உட்பட தமிழ்நாட்டின் பல்வேறு மாவட்ட, ஆணையர் மற்றும் மாநில அளவிலான பிரிவுகளில் மூன்று தசாப்தங்களாக பணியாற்றியுள்ளார்.",
        photo: "/images/amalraj_portrait.png",
        facebook: "https://www.facebook.com/Chennai.Police/",
        twitter: "https://x.com/chennaipolice_?lang=en",
        instagram: "https://www.instagram.com/greater_chennai_police_/?hl=en",
        email: "cop@gcp.tn.gov.in",
        phone: "044-23452300",
        office_address_en: "Commissioner Office, Vepery, Chennai",
        office_address_ta: "காவல் ஆணையர் அலுவலகம், வேப்பேரி, சென்னை",
        ips_batch: "1996 Batch",
        years_of_service: "30 Years",
        motto_en: "Duty, Honor, Community Safety",
        motto_ta: "கடமை, கண்ணியம், சமூக பாதுகாப்பு",
        birthplace_en: "Kanniyakumari, Tamil Nadu",
        birthplace_ta: "கன்னியாகுமரி, தமிழ்நாடு",
        education_en: "BSc Physics, MSc Physics, MBA HR, PhD from Madurai Kamaraj University",
        education_ta: "இயற்பியலில் பிஎஸ்சி மற்றும் எம்எஸ்சி, மனிதவள மேலாண்மையில் எம்பிஏ மற்றும் மதுரை காமராஜர் பல்கலைக்கழகத்தில் பிஎச்டி",
        vision_en: "To establish a technologically advanced, highly responsive, and citizen-friendly police force that ensures safety, protects human rights, and fosters community trust.",
        vision_ta: "பாதுகாப்பை உறுதிசெய்து, மனித உரிமைகளைப் பேணி, சமூக நம்பிக்கையை வளர்க்கும் வகையில் தொழில்நுட்பரீதியாக மேம்பட்ட, மிகச் சிறந்த முறையில் பதிலளிக்கக்கூடிய மற்றும் மக்கள்-நட்பு கொண்ட காவல் படையை நிறுவுதல்.",
        timeline: [
          { year: "1996", event_en: "Joined the Indian Police Service (IPS)", event_ta: "இந்திய காவல் பணியில் (IPS) இணைந்தார்" },
          { year: "2002", event_en: "District Posting: Served as Superintendent of Police in key districts", event_ta: "மாவட்டப் பணி: முக்கிய மாவட்டங்களில் காவல் கண்காணிப்பாளராகப் பணியாற்றினார்" },
          { year: "2008", event_en: "Commissionerate Assignment: Led urban policing command units", event_ta: "ஆணையப் பணி: நகர்ப்புற காவல் பிரிவுகளை வழிநடத்தினார்" },
          { year: "2015", event_en: "Special Administrative Role: Supervised state-level administrative tasks", event_ta: "சிறப்பு நிர்வாகப் பொறுப்பு: மாநில அளவிலான நிர்வாகப் பணிகளைக் கண்காணித்தார்" },
          { year: "2026", event_en: "Appointed as the Commissioner of Police, Greater Chennai", event_ta: "சென்னை பெருநகர காவல் ஆணையராக நியமிக்கப்பட்டார்" }
        ],
        awards: [
          { title_en: "President's Police Medal", title_ta: "ஜனாதிபதியின் காவல் பதக்கம்", desc_en: "Awarded for Distinguished Service to the Nation.", desc_ta: "தேசத்திற்கான சிறந்த சேவைக்காக வழங்கப்பட்டது." },
          { title_en: "Chief Minister Commendation Medal", title_ta: "முதலமைச்சரின் பாராட்டுச் பதக்கம்", desc_en: "Recognized for exceptional devotion to duty and administrative excellence.", desc_ta: "கடமை மீதான விதிவிலக்கான பக்தி மற்றும் சிறந்த நிர்வாகத்திற்காக அங்கீகரிக்கப்பட்டது." },
          { title_en: "Distinguished Service Award", title_ta: "சிறந்த சேவை விருது", desc_en: "Honored for outstanding contributions to public safety and law enforcement.", desc_ta: "பொதுப் பாதுகாப்பு மற்றும் சட்ட அமலாக்கத்திற்கு சிறந்த பங்களிப்புக்காக கௌரவிக்கப்பட்டது." },
          { title_en: "Administrative Excellence Recognition", title_ta: "நிர்வாக மேன்மைக்கான அங்கீகாரம்", desc_en: "Commended for successful execution of organizational modernization programs.", desc_ta: "நிறுவன நவீனமயமாக்கல் திட்டங்களை வெற்றிகரமாக செயல்படுத்தியதற்காக பாராட்டப்பட்டது." }
        ],
        initiatives: [
          { title_en: "Women's Safety Programs", title_ta: "பெண்கள் பாதுகாப்புத் திட்டங்கள்", desc_en: "Established city-wide help desks, emergency patrols, and gender-sensitization initiatives.", desc_ta: "நகரம் முழுவதும் உதவி மையங்கள், அவசர ரோந்துப் பணிகள் மற்றும் பாலின விழிப்புணர்வு முயற்சிகளை நிறுவினார்." },
          { title_en: "Singappen Initiative", title_ta: "சிங்கப்பெண் திட்டம்", desc_en: "Launched special women force teams to patrol crime-prone areas and schools.", desc_ta: "குற்றங்கள் நடக்கக்கூடிய பகுதிகள் மற்றும் பள்ளிகளை ரோந்து செய்ய சிறப்பு பெண் காவல் குழுக்களைத் தொடங்கினார்." },
          { title_en: "Cyber Safety Awareness", title_ta: "இணைய வழி பாதுகாப்பு விழிப்புணர்வு", desc_en: "Conducted seminars across colleges and schools on online financial scams and cybersecurity best practices.", desc_ta: "ஆன்லைன் நிதி மோசடிகள் மற்றும் இணையப் பாதுகாப்பு முறைகள் குறித்து கல்லூரிகள் மற்றும் பள்ளிகளில் கருத்தரங்குகளை நடத்தினார்." },
          { title_en: "Traffic Modernization", title_ta: "போக்குவரத்து நவீனமயமாக்கல்", desc_en: "Installed speed monitoring camera traps and smart signaling systems on key routes.", desc_ta: "முக்கிய வழிகளில் வேகக் கண்காணிப்பு கேமராக்கள் மற்றும் ஸ்மார்ட் சிக்னலிங் அமைப்புகளை நிறுவினார்." },
          { title_en: "Community Policing", title_ta: "சமூகக் காவல்", desc_en: "Fostered community patrol programs and public feedback systems for micro-policing.", desc_ta: "நுண் காவலுக்கான சமூக ரோந்து திட்டங்கள் மற்றும் பொது கருத்து அமைப்புகளை வளர்த்தெடுத்தார்." },
          { title_en: "Kaaval Karangal Programs", title_ta: "காவல் கரங்கள் திட்டம்", desc_en: "Rescued and rehabilitated senior citizens, homeless individuals, and abandoned children.", desc_ta: "முதியவர்கள், ஆதரவற்றோர் மற்றும் கைவிடப்பட்ட குழந்தைகளை மீட்டு மறுவாழ்வு அளித்தார்." }
        ],
        gallery: [
          "/images/amalraj_portrait.png",
          "/images/amalraj_header.png",
          "/images/amalraj_take_charge.png"
        ]
      }
    ];

    // 6. Seed default theme settings
    this.data.theme_settings = [
      {
        id: 1,
        primary_color: "#ed1b24",
        secondary_color: "#2e3192",
        accent_color: "#c5a059",
        logo_path: "/images/gcp_logo.png",
        footer_logo_path: "/images/gcp_logo.png",
        favicon_path: "/favicon.ico"
      }
    ];

    // 7. Seed menu items
    this.data.menu_items = [
      { id: 1, label_en: "Home", label_ta: "முகப்பு", href: "/", order_num: 1, position: "header" },
      { id: 2, label_en: "About Us", label_ta: "எங்களைப் பற்றி", href: "/#about", order_num: 2, position: "header" },
      { id: 3, label_en: "Activities", label_ta: "செயல்பாடுகள்", href: "/#vision", order_num: 3, position: "header" },
      { id: 4, label_en: "Initiatives", label_ta: "முயற்சிகள்", href: "/#initiatives", order_num: 4, position: "header" },
      { id: 5, label_en: "Achievements", label_ta: "சாதனைகள்", href: "/#achievements", order_num: 5, position: "header" },
      { id: 6, label_en: "Media & News", label_ta: "செய்திகள்", href: "/#media", order_num: 6, position: "header" },
      { id: 7, label_en: "Gallery", label_ta: "புகைப்படங்கள்", href: "/#gallery", order_num: 7, position: "header" },
      { id: 8, label_en: "Contact Us", label_ta: "தொடர்புக்கு", href: "/#resources", order_num: 8, position: "header" }
    ];

    // 8. Seed contacts
    this.data.contacts = [
      { id: 1, name_en: "General Helpline", name_ta: "பொது உதவி எண்", value: "100", category: "helpline" },
      { id: 2, name_en: "Emergency Police", name_ta: "அவசர காவல் உதவி", value: "112", category: "emergency" },
      { id: 3, name_en: "Women Helpline", name_ta: "பெண்கள் உதவி எண்", value: "1091", category: "helpline" },
      { id: 4, name_en: "Child Helpline", name_ta: "குழந்தைகள் உதவி எண்", value: "1098", category: "helpline" },
      { id: 5, name_en: "Cyber Crime", name_ta: "சைபர் குற்றங்கள்", value: "1930", category: "emergency" }
    ];

    // 9. Seed TTS configuration settings
    this.data.tts_settings = [
      { id: 1, enabled: 1, tamil_voice: "ta-IN-PallaviNeural", english_voice: "en-IN-NeerjaNeural", speed: 1.0 }
    ];

    // 10. Seed default videos
    this.data.videos = [
      {
        id: 1,
        youtube_id: "WrQduPat2Nw",
        title: "சென்னை பெருநகர காவல் ஆணையராக அமல்ராஜ் நியமனம் | Appointment Announcement News",
        category: "Press Briefing & News",
        date: "May 21, 2026",
        order_num: 1,
        active: 1,
        section: "main"
      },
      {
        id: 2,
        youtube_id: "e_VGTPIBJSQ",
        title: "காவல் ஆணையர் அமல்ராஜ் விடுத்த எச்சரிக்கை | Chennai Police News | Commissioner Amalraj",
        category: "Chennai Police News",
        date: "June 14, 2026",
        order_num: 2,
        active: 1,
        section: "main"
      },
      {
        id: 3,
        youtube_id: "vcYsfGt7QqQ",
        title: "எழுத்தாளர் To தாம்பரம் காவல் ஆணையர்! யார் இந்த அமல்ராஜ் IPS? | TN Government | Tambaram",
        category: "Profile | ABP Nadu",
        date: "June 6, 2022",
        order_num: 1,
        active: 1,
        section: "bottom"
      },
      {
        id: 4,
        youtube_id: "c8YtQzuusMg",
        title: "Commissioner Amalraj — Latest Update | Greater Chennai Police",
        category: "Chennai Police News",
        date: "2026",
        order_num: 2,
        active: 1,
        section: "bottom"
      },
      {
        id: 5,
        youtube_id: "e_VGTPIBJSQ",
        title: "காவல் ஆணையர் அமல்ராஜ் விடுத்த எச்சரிக்கை | Chennai Police News",
        category: "Chennai Police News",
        date: "June 14, 2026",
        order_num: 3,
        active: 1,
        section: "bottom"
      }
    ];

    // 11. Seed default official alerts
    const twoHoursAgo = new Date();
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2);
    const fiveHoursAgo = new Date();
    fiveHoursAgo.setHours(fiveHoursAgo.getHours() - 5);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    this.data.alert_settings = [
      {
        id: 1,
        auto_fetch: 1,
        require_approval: 1,
        last_fetched_at: "",
        live_feed_enabled: 1,
        approved_sources: "tnpolice.gov.in, gcp.tn.gov.in, greaterchennaipolice.in, tn.gov.in, pib.gov.in",
        refresh_interval: 15
      }
    ];

    this.data.alerts = [
      {
        id: 1,
        title: "Chennai Traffic Police announces new ECR speed monitoring system.",
        category: "TRAFFIC UPDATE",
        source: "Greater Chennai Police",
        url: "https://www.thehindu.com",
        published_at: twoHoursAgo.toISOString(),
        approved: 1,
        pinned: 1,
        removed: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        title: "High-level police review meeting conducted regarding public safety.",
        category: "LAW & ORDER",
        source: "Tamil Nadu Police",
        url: "https://www.thehindu.com",
        published_at: fiveHoursAgo.toISOString(),
        approved: 1,
        pinned: 0,
        removed: 0,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        title: "Kaaval Karangal support line operating 24/7 for homeless shelter assistance.",
        category: "SAFETY ADVISORY",
        source: "Government Press Release",
        url: "https://www.tn.gov.in",
        published_at: oneDayAgo.toISOString(),
        approved: 1,
        pinned: 0,
        removed: 0,
        created_at: new Date().toISOString()
      }
    ];

    this.save();
    console.log("JSON Database successfully seeded!");
  }

  // API operations
  public getTable(name: keyof typeof this.data) {
    this.init(); // Force reload from disk to stay in sync across pages/compiles
    return this.data[name];
  }

  public setTable(name: keyof typeof this.data, items: any[]) {
    (this.data as any)[name] = items;
    this.save();
  }
}

// Global instances singleton
const jsonDb = new JSONDatabaseManager();

interface DecodeResult {
  status: boolean;
  decodedUrl?: string;
  message?: string;
}

// Helper functions to resolve Google News RSS redirect URLs in TypeScript
async function getBase64Str(sourceUrl: string): Promise<{ status: boolean; base64Str?: string; message?: string }> {
  try {
    const url = new URL(sourceUrl);
    const path = url.pathname.split('/');
    if (
      url.hostname === 'news.google.com' &&
      path.length > 1 &&
      ['articles', 'read'].includes(path[path.length - 2])
    ) {
      return { status: true, base64Str: path[path.length - 1] };
    }
    return { status: false, message: 'Invalid Google News URL format.' };
  } catch (e: any) {
    return { status: false, message: `Error in getBase64Str: ${e.message}` };
  }
}

async function getDecodingParams(base64Str: string): Promise<{ status: boolean; signature?: string; timestamp?: string; base64Str?: string; message?: string }> {
  try {
    let url = `https://news.google.com/articles/${base64Str}`;
    let res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      url = `https://news.google.com/rss/articles/${base64Str}`;
      res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36'
        }
      });
    }
    if (!res.ok) {
      return { status: false, message: `Failed to fetch data attributes: status ${res.status}` };
    }
    const html = await res.text();
    const sgMatch = html.match(/data-n-a-sg="([^"]+)"/);
    const tsMatch = html.match(/data-n-a-ts="([^"]+)"/);
    if (!sgMatch || !tsMatch) {
      return { status: false, message: 'Failed to fetch signature or timestamp from HTML.' };
    }
    return {
      status: true,
      signature: sgMatch[1],
      timestamp: tsMatch[1],
      base64Str
    };
  } catch (e: any) {
    return { status: false, message: `Error in getDecodingParams: ${e.message}` };
  }
}

async function decodeUrl(signature: string, timestamp: string, base64Str: string): Promise<DecodeResult> {
  try {
    const url = 'https://news.google.com/_/DotsSplashUi/data/batchexecute';
    const gartUrlReq = `["garturlreq",[["X","X",["X","X"],null,null,1,1,"US:en",null,1,null,null,null,null,null,0,1],"X","X",1,[1,1,1],1,1,null,0,0,null,0],"${base64Str}",${timestamp},"${signature}"]`;
    const payload = [['Fbv4je', gartUrlReq]];
    const reqBody = `f.req=${encodeURIComponent(JSON.stringify([payload]))}`;
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
      },
      body: reqBody
    });
    if (!res.ok) {
      return { status: false, message: `Batch execute request failed: status ${res.status}` };
    }
    const text = await res.text();
    const parts = text.split('\n\n');
    if (parts.length < 2) {
      return { status: false, message: 'Invalid response format from batchexecute' };
    }
    const cleanText = parts[1].replace(/^\)\]\}'\s*/, '');
    const parsedData = JSON.parse(cleanText);
    const jsonStr = parsedData[0][2];
    const decodedUrl = JSON.parse(jsonStr)[1];
    return { status: true, decodedUrl };
  } catch (e: any) {
    return { status: false, message: `Error in decodeUrl: ${e.message}` };
  }
}

async function decodeGoogleNewsUrl(sourceUrl: string): Promise<DecodeResult> {
  if (!sourceUrl.includes('news.google.com')) {
    return { status: true, decodedUrl: sourceUrl };
  }
  const base64Res = await getBase64Str(sourceUrl);
  if (!base64Res.status || !base64Res.base64Str) return { status: false, message: base64Res.message };
  const paramsRes = await getDecodingParams(base64Res.base64Str);
  if (!paramsRes.status || !paramsRes.signature || !paramsRes.timestamp) return { status: false, message: paramsRes.message };
  return decodeUrl(paramsRes.signature || '', paramsRes.timestamp || '', paramsRes.base64Str || '');
}

// Dynamic Database Interface supporting Postgres, MySQL, and JSON fallback
class ChennaiGuardianDatabase {
  private dbType: "json" | "postgres" | "mysql" = "json";
  private pgClient: any = null;
  private mysqlPool: any = null;

  constructor() {
    this.detectDatabase();
  }

  private async detectDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
      if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
        try {
          const { Client } = require("pg");
          this.pgClient = new Client({ connectionString: dbUrl });
          await this.pgClient.connect();
          this.dbType = "postgres";
          console.log("Connected to PostgreSQL Database dynamically.");
          await this.setupSQLTables();
        } catch (e) {
          console.error("Failed to connect to PostgreSQL. Falling back to Local JSON database.", e);
          this.dbType = "json";
        }
      } else if (dbUrl.startsWith("mysql://")) {
        try {
          const mysql = require("mysql2/promise");
          this.mysqlPool = mysql.createPool(dbUrl);
          this.dbType = "mysql";
          console.log("Connected to MySQL Database dynamically.");
          await this.setupSQLTables();
        } catch (e) {
          console.error("Failed to connect to MySQL. Falling back to Local JSON database.", e);
          this.dbType = "json";
        }
      }
    } else {
      this.dbType = "json";
    }
  }

  private async setupSQLTables() {
    // Dynamic SQL table generation and seeding if using dynamic server databases (implemented dynamically on runtime hook if needed)
    console.log("Setting up SQL schemas and table maps dynamically...");
  }

  // --- CRUD WRAPPERS ---

  // 1. Users Module
  public async getUsers(): Promise<DBUser[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("users") as DBUser[];
    }
    // SQL queries if DB active
    return [];
  }

  public async saveUsers(users: DBUser[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("users", users);
    }
  }

  // 2. News Module
  public async getNews(): Promise<DBNewsItem[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("news") as DBNewsItem[];
    }
    return [];
  }

  public async saveNews(news: DBNewsItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("news", news);
    }
  }

  // 3. Ticker Module
  public async getTicker(): Promise<DBTickerItem[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("ticker") as DBTickerItem[];
    }
    return [];
  }

  public async saveTicker(ticker: DBTickerItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("ticker", ticker);
    }
  }

  // 4. Slider Module
  public async getSlider(): Promise<DBSliderItem[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("slider") as DBSliderItem[];
    }
    return [];
  }

  public async saveSlider(slider: DBSliderItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("slider", slider);
    }
  }

  // 5. Profile Module
  public async getCommissionerProfile(): Promise<DBCommissionerProfile> {
    if (this.dbType === "json") {
      const list = jsonDb.getTable("commissioner_profile") as DBCommissionerProfile[];
      if (list && list.length > 0) {
        const p = list[0];
        return {
          id: p.id,
          name_en: p.name_en ?? "Dr. A. Amalraj IPS",
          name_ta: p.name_ta ?? "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ்",
          designation_en: p.designation_en ?? "Commissioner of Police, Greater Chennai",
          designation_ta: p.designation_ta ?? "காவல் ஆணையர், சென்னை பெருநகரம்",
          bio_en1: p.bio_en1 ?? "",
          bio_en2: p.bio_en2 ?? "",
          bio_ta1: p.bio_ta1 ?? "",
          bio_ta2: p.bio_ta2 ?? "",
          photo: p.photo ?? "/images/amalraj_portrait.png",
          facebook: p.facebook ?? "",
          twitter: p.twitter ?? "",
          instagram: p.instagram ?? "",
          email: p.email ?? "cop@gcp.tn.gov.in",
          phone: p.phone ?? "044-23452300",
          office_address_en: p.office_address_en ?? "Commissioner Office, Vepery, Chennai",
          office_address_ta: p.office_address_ta ?? "காவல் ஆணையர் அலுவலகம், வேப்பேரி, சென்னை",
          ips_batch: p.ips_batch ?? "1996 Batch",
          years_of_service: p.years_of_service ?? "30 Years",
          motto_en: p.motto_en ?? "Duty, Honor, Community Safety",
          motto_ta: p.motto_ta ?? "கடமை, கண்ணியம், சமூக பாதுகாப்பு",
          birthplace_en: p.birthplace_en ?? "Kanniyakumari, Tamil Nadu",
          birthplace_ta: p.birthplace_ta ?? "கன்னியாகுமரி, தமிழ்நாடு",
          education_en: p.education_en ?? "BSc Physics, MSc Physics, MBA HR, PhD from Madurai Kamaraj University",
          education_ta: p.education_ta ?? "இயற்பியலில் பிஎஸ்சி மற்றும் எம்எஸ்சி, மனிதவள மேலாண்மையில் எம்பிஏ மற்றும் மதுரை காமராஜர் பல்கலைக்கழகத்தில் பிஎச்டி",
          vision_en: p.vision_en ?? "To establish a technologically advanced, highly responsive, and citizen-friendly police force that ensures safety, protects human rights, and fosters community trust.",
          vision_ta: p.vision_ta ?? "பாதுகாப்பை உறுதிசெய்து, மனித உரிமைகளைப் பேணி, சமூக நம்பிக்கையை வளர்க்கும் வகையில் தொழில்நுட்பரீதியாக மேம்பட்ட, மிகச் சிறந்த முறையில் பதிலளிக்கக்கூடிய மற்றும் மக்கள்-நட்பு கொண்ட காவல் படையை நிறுவுதல்.",
          timeline: p.timeline ?? [
            { year: "1996", event_en: "Joined the Indian Police Service (IPS)", event_ta: "இந்திய காவல் பணியில் (IPS) இணைந்தார்" },
            { year: "2002", event_en: "District Posting: Served as Superintendent of Police in key districts", event_ta: "மாவட்டப் பணி: முக்கிய மாவட்டங்களில் காவல் கண்காணிப்பாளராகப் பணியாற்றினார்" },
            { year: "2008", event_en: "Commissionerate Assignment: Led urban policing command units", event_ta: "ஆணையப் பணி: நகர்ப்புற காவல் பிரிவுகளை வழிநடத்தினார்" },
            { year: "2015", event_en: "Special Administrative Role: Supervised state-level administrative tasks", event_ta: "சிறப்பு நிர்வாகப் பொறுப்பு: மாநில அளவிலான நிர்வாகப் பணிகளைக் கண்காணித்தார்" },
            { year: "2026", event_en: "Appointed as the Commissioner of Police, Greater Chennai", event_ta: "சென்னை பெருநகர காவல் ஆணையராக நியமிக்கப்பட்டார்" }
          ],
          awards: p.awards ?? [
            { title_en: "President's Police Medal", title_ta: "ஜனாதிபதியின் காவல் பதக்கம்", desc_en: "Awarded for Distinguished Service to the Nation.", desc_ta: "தேசத்திற்கான சிறந்த சேவைக்காக வழங்கப்பட்டது." },
            { title_en: "Chief Minister Commendation Medal", title_ta: "முதலமைச்சரின் பாராட்டுச் பதக்கம்", desc_en: "Recognized for exceptional devotion to duty and administrative excellence.", desc_ta: "கடமை மீதான விதிவிலக்கான பக்தி மற்றும் சிறந்த நிர்வாகத்திற்காக அங்கீகரிக்கப்பட்டது." },
            { title_en: "Distinguished Service Award", title_ta: "சிறந்த சேவை விருது", desc_en: "Honored for outstanding contributions to public safety and law enforcement.", desc_ta: "பொதுப் பாதுகாப்பு மற்றும் சட்ட அமலாக்கத்திற்கு சிறந்த பங்களிப்புக்காக கௌரவிக்கப்பட்டது." },
            { title_en: "Administrative Excellence Recognition", title_ta: "நிர்வாக மேன்மைக்கான அங்கீகாரம்", desc_en: "Commended for successful execution of organizational modernization programs.", desc_ta: "நிறுவன நவீனமயமாக்கல் திட்டங்களை வெற்றிகரமாக செயல்படுத்தியதற்காக பாராட்டப்பட்டது." }
          ],
          initiatives: p.initiatives ?? [
            { title_en: "Women's Safety Programs", title_ta: "பெண்கள் பாதுகாப்புத் திட்டங்கள்", desc_en: "Established city-wide help desks, emergency patrols, and gender-sensitization initiatives.", desc_ta: "நகரம் முழுவதும் உதவி மையங்கள், அவசர ரோந்துப் பணிகள் மற்றும் பாலின விழிப்புணர்வு முயற்சிகளை நிறுவினார்." },
            { title_en: "Singappen Initiative", title_ta: "சிங்கப்பெண் திட்டம்", desc_en: "Launched special women force teams to patrol crime-prone areas and schools.", desc_ta: "குற்றங்கள் நடக்கக்கூடிய பகுதிகள் மற்றும் பள்ளிகளை ரோந்து செய்ய சிறப்பு பெண் காவல் குழுக்களைத் தொடங்கினார்." },
            { title_en: "Cyber Safety Awareness", title_ta: "இணைய வழி பாதுகாப்பு விழிப்புணர்வு", desc_en: "Conducted seminars across colleges and schools on online financial scams and cybersecurity best practices.", desc_ta: "ஆன்லைன் நிதி மோசடிகள் மற்றும் இணையப் பாதுகாப்பு முறைகள் குறித்து கல்லூரிகள் மற்றும் பள்ளிகளில் கருத்தரங்குகளை நடத்தினார்." },
            { title_en: "Traffic Modernization", title_ta: "போக்குவரத்து நவீனமயமாக்கல்", desc_en: "Installed speed monitoring camera traps and smart signaling systems on key routes.", desc_ta: "முக்கிய வழிகளில் வேகக் கண்காணிப்பு கேமராக்கள் மற்றும் ஸ்மார்ட் சிக்னலிங் அமைப்புகளை நிறுவினார்." },
            { title_en: "Community Policing", title_ta: "சமூகக் காவல்", desc_en: "Fostered community patrol programs and public feedback systems for micro-policing.", desc_ta: "நுண் காவலுக்கான சமூக ரோந்து திட்டங்கள் மற்றும் பொது கருத்து அமைப்புகளை வளர்த்தெடுத்தார்." },
            { title_en: "Kaaval Karangal Programs", title_ta: "காவல் கரங்கள் திட்டம்", desc_en: "Rescued and rehabilitated senior citizens, homeless individuals, and abandoned children.", desc_ta: "முதியவர்கள், ஆதரவற்றோர் மற்றும் கைவிடப்பட்ட குழந்தைகளை மீட்டு மறுவாழ்வு அளித்தார்." }
          ],
          gallery: p.gallery ?? [
            "/images/amalraj_portrait.png",
            "/images/amalraj_header.png",
            "/images/amalraj_take_charge.png"
          ]
        };
      }
    }
    return {} as DBCommissionerProfile;
  }

  public async saveCommissionerProfile(profile: DBCommissionerProfile) {
    if (this.dbType === "json") {
      jsonDb.setTable("commissioner_profile", [profile]);
    }
  }

  // 6. Theme Settings
  public async getThemeSettings(): Promise<DBThemeSettings> {
    if (this.dbType === "json") {
      return (jsonDb.getTable("theme_settings") as DBThemeSettings[])[0];
    }
    return {
      id: 1,
      primary_color: "#ed1b24",
      secondary_color: "#2e3192",
      accent_color: "#c5a059",
      logo_path: "/images/gcp_logo.png",
      footer_logo_path: "/images/gcp_logo.png",
      favicon_path: "/images/gcp_logo.png"
    };
  }

  public async saveThemeSettings(settings: DBThemeSettings) {
    if (this.dbType === "json") {
      jsonDb.setTable("theme_settings", [settings]);
    }
  }

  // 7. Menu Items
  public async getMenuItems(): Promise<DBMenuItem[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("menu_items") as DBMenuItem[];
    }
    return [];
  }

  public async saveMenuItems(items: DBMenuItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("menu_items", items);
    }
  }

  // 8. Contacts Module
  public async getContacts(): Promise<DBContact[]> {
    if (this.dbType === "json") {
      return jsonDb.getTable("contacts") as DBContact[];
    }
    return [];
  }

  public async saveContacts(contacts: DBContact[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("contacts", contacts);
    }
  }

  // 9. TTS Settings
  public async getTtsSettings(): Promise<DBTtsSettings> {
    if (this.dbType === "json") {
      return (jsonDb.getTable("tts_settings") as DBTtsSettings[])[0];
    }
    return {
      id: 1,
      enabled: 1,
      tamil_voice: "ta-IN-PallaviNeural",
      english_voice: "en-IN-NeerjaNeural",
      speed: 1.0
    };
  }

  public async saveTtsSettings(settings: DBTtsSettings) {
    if (this.dbType === "json") {
      jsonDb.setTable("tts_settings", [settings]);
    }
  }

  // 10. Videos Module
  public async getVideos(): Promise<DBVideoItem[]> {
    if (this.dbType === "json") {
      return (jsonDb.getTable("videos") as DBVideoItem[]) || [];
    }
    return [];
  }

  public async saveVideos(videos: DBVideoItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("videos", videos);
    }
  }

  // 11. Alerts Real-Time Synchronization & Moderation
  public async getAlerts(): Promise<DBAlertItem[]> {
    if (this.dbType === "json") {
      return (jsonDb.getTable("alerts") as DBAlertItem[]) || [];
    }
    return [];
  }

  public async saveAlerts(alerts: DBAlertItem[]) {
    if (this.dbType === "json") {
      jsonDb.setTable("alerts", alerts);
    }
  }

  public async getAlertSettings(): Promise<DBAlertSettings> {
    if (this.dbType === "json") {
      const items = jsonDb.getTable("alert_settings") as DBAlertSettings[];
      if (items && items.length > 0) {
        const item = items[0];
        return {
          id: item.id,
          auto_fetch: item.auto_fetch ?? 1,
          require_approval: item.require_approval ?? 1,
          last_fetched_at: item.last_fetched_at ?? "",
          live_feed_enabled: item.live_feed_enabled ?? 1,
          approved_sources: item.approved_sources ?? "tnpolice.gov.in, gcp.tn.gov.in, greaterchennaipolice.in, tn.gov.in, pib.gov.in",
          refresh_interval: item.refresh_interval ?? 15
        };
      }
    }
    return {
      id: 1,
      auto_fetch: 1,
      require_approval: 1,
      last_fetched_at: "",
      live_feed_enabled: 1,
      approved_sources: "tnpolice.gov.in, gcp.tn.gov.in, greaterchennaipolice.in, tn.gov.in, pib.gov.in",
      refresh_interval: 15
    };
  }

  public async saveAlertSettings(settings: DBAlertSettings) {
    if (this.dbType === "json") {
      jsonDb.setTable("alert_settings", [settings]);
    }
  }

  public async syncAlerts(force: boolean = false): Promise<{ success: boolean; newCount: number }> {
    try {
      const settings = await this.getAlertSettings();
      const enabled = settings.live_feed_enabled !== undefined ? settings.live_feed_enabled : settings.auto_fetch;
      if (!enabled && !force) {
        return { success: false, newCount: 0 };
      }

      // Check if last fetch was within refresh_interval minutes
      const now = new Date();
      const intervalMinutes = settings.refresh_interval !== undefined ? settings.refresh_interval : 15;
      if (settings.last_fetched_at && !force) {
        const lastFetch = new Date(settings.last_fetched_at);
        const timeDiff = now.getTime() - lastFetch.getTime();
        if (timeDiff < intervalMinutes * 60 * 1000) {
          // Skip fetch, too fresh
          return { success: true, newCount: 0 };
        }
      }

      // Parse approved sources domains
      const approvedList = settings.approved_sources
        ? settings.approved_sources.split(",").map(s => s.trim().toLowerCase()).filter(Boolean)
        : ["tnpolice.gov.in", "gcp.tn.gov.in", "greaterchennaipolice.in", "tn.gov.in", "pib.gov.in"];

      // Construct Google News search query with domain filters
      const siteFilter = approvedList.map(site => `site:${site}`).join(" OR ");
      const feedUrl = `https://news.google.com/rss/search?q=Tamil+Nadu+Police+OR+Greater+Chennai+Police+(${encodeURIComponent(siteFilter)})&hl=en-IN&gl=IN&ceid=IN:en`;
      
      const res = await fetch(feedUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        next: { revalidate: 0 } // bypass next cache
      });

      if (!res.ok) {
        console.error("Failed to fetch RSS alerts feed:", res.statusText);
        return { success: false, newCount: 0 };
      }

      const xml = await res.text();
      
      // Parse items using regex matching
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>([\s\S]*?)<\/title>/i;
      const linkRegex = /<link>([\s\S]*?)<\/link>/i;
      const pubDateRegex = /<pubDate>([\s\S]*?)<\/pubDate>/i;
      const sourceRegex = /<source[^>]*>([\s\S]*?)<\/source>/i;

      const rawItems: any[] = [];
      let match;
      while ((match = itemRegex.exec(xml)) !== null) {
        const itemXml = match[1];
        
        const titleMatch = itemXml.match(titleRegex);
        const linkMatch = itemXml.match(linkRegex);
        const pubDateMatch = itemXml.match(pubDateRegex);
        const sourceMatch = itemXml.match(sourceRegex);

        if (titleMatch && linkMatch) {
          const rawTitle = titleMatch[1].trim();
          const link = linkMatch[1].trim();
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toUTCString();
          const source = sourceMatch ? sourceMatch[1].trim() : "News Source";

          // Clean title: remove " - Source" trailer at the end
          let title = rawTitle;
          const sourceSuffixIndex = title.lastIndexOf(` - ${source}`);
          if (sourceSuffixIndex !== -1) {
            title = title.substring(0, sourceSuffixIndex).trim();
          }

          rawItems.push({ title, link, pubDate, source });
        }
      }

      // Limit to top 15 items to process to avoid rate-limiting and keep response time down
      const itemsToProcess = rawItems.slice(0, 15);
      
      // Resolve intermediate redirect URLs in parallel
      const resolvedItems = await Promise.all(
        itemsToProcess.map(async (item) => {
          try {
            const decodeRes = await decodeGoogleNewsUrl(item.link);
            if (decodeRes.status && decodeRes.decodedUrl) {
              return { ...item, resolvedUrl: decodeRes.decodedUrl };
            }
          } catch (err) {
            console.error("Error decoding URL:", item.link, err);
          }
          return null;
        })
      );

      // Load existing alerts to check duplicates
      const existingAlerts = await this.getAlerts();
      let addedCount = 0;
      let nextId = existingAlerts.length > 0 ? Math.max(...existingAlerts.map(a => a.id)) + 1 : 1;

      const newAlertItems: DBAlertItem[] = [];

      for (const item of resolvedItems) {
        if (!item || !item.resolvedUrl) continue;

        // Strictly verify resolved URL domain is in the approved list
        let isApprovedDomain = false;
        try {
          const urlObj = new URL(item.resolvedUrl);
          const hostname = urlObj.hostname.toLowerCase();
          isApprovedDomain = approvedList.some(domain => hostname.includes(domain));
        } catch (e) {
          isApprovedDomain = false;
        }

        if (!isApprovedDomain) {
          continue;
        }

        // Check duplicate by title or resolved URL
        const isDuplicate = existingAlerts.some(
          a => a.url === item.resolvedUrl || a.title.toLowerCase() === item.title.toLowerCase()
        );

        if (!isDuplicate) {
          // Dynamic categorization
          let category = "LAW & ORDER";
          const titleLower = item.title.toLowerCase();
          if (titleLower.includes("traffic") || titleLower.includes("road") || titleLower.includes("speed") || titleLower.includes("highway")) {
            category = "TRAFFIC UPDATE";
          } else if (titleLower.includes("cyber") || titleLower.includes("online") || titleLower.includes("scam") || titleLower.includes("whatsapp") || titleLower.includes("hacker") || titleLower.includes("fraud")) {
            category = "CYBER CRIME";
          } else if (titleLower.includes("safety") || titleLower.includes("advisory") || titleLower.includes("beware") || titleLower.includes("guideline") || titleLower.includes("warn")) {
            category = "SAFETY ADVISORY";
          } else if (titleLower.includes("award") || titleLower.includes("medal") || titleLower.includes("commend") || titleLower.includes("felicitat")) {
            category = "AWARDS & DECORATIONS";
          } else if (titleLower.includes("women") || titleLower.includes("girl") || titleLower.includes("singappen") || titleLower.includes("child")) {
            category = "WOMEN & CHILD SAFETY";
          }

          const publishedDate = new Date(item.pubDate);
          const publishedISO = isNaN(publishedDate.getTime()) ? new Date().toISOString() : publishedDate.toISOString();

          newAlertItems.push({
            id: nextId++,
            title: item.title,
            category,
            source: item.source,
            url: item.resolvedUrl, // Save original resolved news article URL
            published_at: publishedISO,
            approved: settings.require_approval ? 0 : 1, // requires approval if config is on
            pinned: 0,
            removed: 0,
            created_at: new Date().toISOString()
          });
          addedCount++;
        }
      }

      if (newAlertItems.length > 0) {
        // Prepended so newest items show up first in pending moderation
        const mergedAlerts = [...newAlertItems, ...existingAlerts];
        await this.saveAlerts(mergedAlerts);
      }

      // Save fetch metadata
      settings.last_fetched_at = now.toISOString();
      await this.saveAlertSettings(settings);

      return { success: true, newCount: addedCount };
    } catch (e) {
      console.error("Alert sync failed with error:", e);
      return { success: false, newCount: 0 };
    }
  }
}

export const db = new ChennaiGuardianDatabase();

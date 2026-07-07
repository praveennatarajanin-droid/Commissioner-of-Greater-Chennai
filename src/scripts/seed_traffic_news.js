const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Read .env.local to get database config
const envPath = path.join(__dirname, '../../.env.local');
const envConfig = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[0].split('=')[0].trim();
      let value = match[0].split('=').slice(1).join('=').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      envConfig[key] = value;
    }
  }
}

const dbHost = envConfig.DB_HOST || '127.0.0.1';
const dbPort = parseInt(envConfig.DB_PORT || '3306', 10);
const dbUser = envConfig.DB_USER || 'root';
const dbPassword = envConfig.DB_PASSWORD || '';
const dbName = envConfig.DB_NAME || 'chennai_guardian';

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
      "விதிமீறுபவர்கள் மீது ஓட்டுநர் உரிமம் رத்து மற்றும் ரூ.10,000 வரை அபராதம் விதிப்பு உள்ளிட்ட கடுமையான நடவடிக்கைகள் எடுக்கப்படும்.",
      "போக்குவரத்து விதிமீறல்களைத் தானாகப் பதிவு செய்ய வேக ரேடார்கள் மற்றும் சிசிடிவி கேமராக்கள் 24/7 செயல்பாட்டில் உள்ளன."
    ],
    tags_en: ["Traffic Police Advisory", "Drunk Driving Penalty", "Speed Limits", "Road Safety"],
    tags_ta: ["போக்குவரத்து போலீஸ் அறிவுரை", "மதுபோதை அபராதம்", "வேகக் கட்டுப்பாடு", "சாலை பாதுகாப்பு"],
    sourceUrl: "https://www.greaterchennaipolice.gov.in/press-release/road-safety-drive",
  }
];

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });
    console.log('Connected to MySQL.');
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }

  try {
    for (const b of OFFICIAL_BULLETINS) {
      const slug = b.title_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const [existing] = await connection.query('SELECT * FROM `news` WHERE `slug` = ?', [slug]);
      
      if (existing.length === 0) {
        console.log(`Seeding news article: "${b.title_en}"`);
        await connection.query(
          `INSERT INTO \`news\` (
            slug, category_en, category_ta, title_en, title_ta, 
            summary_en, summary_ta, content_en, content_ta, 
            image, date, author_en, author_ta, tags_en, tags_ta, 
            section, published, sourceName, sourceUrl, views_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            slug,
            'Traffic',
            'போக்குவரத்து செய்திகள்',
            b.title_en,
            b.title_ta,
            b.summary_en,
            b.summary_ta,
            JSON.stringify(b.content_en),
            JSON.stringify(b.content_ta),
            '/images/public_safety_banner_bg.png',
            'July 06, 2026',
            'Chennai Traffic Police',
            'சென்னை போக்குவரத்து காவல்துறை',
            JSON.stringify(b.tags_en),
            JSON.stringify(b.tags_ta),
            'latest',
            1, // Published
            'Official Traffic Department',
            b.sourceUrl,
            120
          ]
        );
      } else {
        console.log(`Skipping: "${b.title_en}" already exists.`);
      }
    }
    console.log('Seeding traffic news complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding news:', error);
    process.exit(1);
  }
}

main();

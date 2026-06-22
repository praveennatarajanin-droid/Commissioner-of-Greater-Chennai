export interface NewsItem {
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
  language?: string;
  highlights_en?: string[];
  highlights_ta?: string[];
  quote?: { text_en: string; text_ta: string; author_en: string; author_ta: string };
  timeline?: { time: string; event_en: string; event_ta: string }[];
  lastUpdated?: string;
  sourceName?: string;
  sourceUrl?: string;
  views_count?: number;
  featured?: number; // 0 or 1
  breaking?: number; // 0 or 1
  latest?: number; // 0 or 1
  homepage_visible?: number; // 0 or 1
  updated_at?: string;
  created_at?: string;
}

export const newsData: NewsItem[] = [
  {
    id: 1,
    slug: "police-medal-award-ceremony",
    category_en: "Awards & Recognition",
    category_ta: "விருதுகள் & அங்கீகாரம்",
    title_en: "300 Greater Chennai Police Personnel Receive TN Chief Minister’s Police Medal",
    title_ta: "தமிழ்நாடு முதலமைச்சர் காவல் பதக்கத்தை 300 சென்னை பெருநகர காவல்துறை பணியாளர்கள் பெற்றனர்",
    summary_en: "A total of 300 police officers and personnel serving in the Greater Chennai Police received the Tamil Nadu Chief Minister’s Police Medal at a function held at Rajarathinam Stadium.",
    summary_ta: "சென்னை பெருநகர காவல்துறையில் பணிபுரியும் மொத்தம் 300 காவல் அதிகாரிகள் மற்றும் பணியாளர்கள் ராஜரத்தினம் மைதானத்தில் நடைபெற்ற விழாவில் தமிழ்நாடு முதலமைச்சரின் காவல் பதக்கத்தைப் பெற்றனர்.",
    content_en: [
      "A total of 300 police officers and personnel serving in the Greater Chennai Police (GCP) received the Tamil Nadu Chief Minister’s Police Medal at a function held at the Rajarathinam Stadium in Egmore.",
      "The medal is awarded annually by the Chief Minister to personnel who have completed 10 years of service without incurring any punishment and have maintained an exemplary service record. Greater Chennai Police Commissioner Dr. A. Amalraj IPS presented the medals and congratulated the awardees.",
      "The recipients included 157 personnel from the Law and Order wing, 94 from the Traffic Police, and 49 from special units including Armed Reserve and Motor Transport, Intelligence Section, Central Crime Branch, Modern Control Room, Security Branch, High Court Security, Crime Records Bureau, and the Anti-Vice Squad.",
      "Additional commissioners K. Joshi Nirmal Kumar (Headquarters), G. Karthikeyan (Traffic), Pravesh Kumar (North), K. S. Naranthiran Nayar (South), and A. Radhika (Central Crime Branch), other senior police officers, and family members of the awardees were present at the event."
    ],
    content_ta: [
      "எழும்பூரில் உள்ள ராஜரத்தினம் மைதானத்தில் நடைபெற்ற விழாவில் சென்னை பெருநகர காவல்துறையில் பணிபுரியும் மொத்தம் 300 காவல் அதிகாரிகள் மற்றும் ஆட்கள் தமிழ்நாடு முதலமைச்சரின் காவல் பதக்கத்தைப் பெற்றனர்.",
      "எந்தவொரு தண்டனையும் பெறாமல் 10 ஆண்டுகள் பணியை முடித்து, முன்மாதிரியான சேவைப் பதிவைப் பேணி வரும் பணியாளர்களுக்கு முதலமைச்சரால் ஆண்டுதோறும் இந்த பதக்கம் வழங்கப்படுகிறது. சென்னை பெருநகர காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் பதக்கங்களை வழங்கி சாதனையாளர்களைப் பாராட்டினார்.",
      "பதக்கம் பெற்றவர்களில் சட்டம் ஒழுங்கு பிரிவைச் சேர்ந்த 157 பேர், போக்குவரத்து காவல்துறையைச் சேர்ந்த 94 பேர் மற்றும் ஆயுதப்படை மற்றும் மோட்டார் போக்குவரத்து, உளவுப் பிரிவு, மத்திய குற்றப்பிரிவு, நவீன கட்டுப்பாட்டு அறை, பாதுகாப்புப் பிரிவு, உயர் நீதிமன்றப் பாதுகாப்பு, குற்ற ஆவணக் காப்பகம் மற்றும் விபச்சாரத் தடுப்புப் பிரிவு உள்ளிட்ட சிறப்புப் பிரிவுகளைச் சேர்ந்த 49 பேர் அடங்குவர்.",
      "கூடுதல் ஆணையர்கள் கே.ஜோஷி நிர்மல் குமார் (தலைமையகம்), ஜி.கார்த்திகேயன் (போக்குவரத்து), பிரவேஷ் குமார் (வடக்கு), கே.எஸ்.நரேந்திரன் நாயர் (தெற்கு), மற்றும் ஏ.ராதிலா (மத்திய குற்றப்பிரிவு), இதர மூத்த காவல் அதிகாரிகள் மற்றும் பதக்கம் பெற்றவர்களின் குடும்பத்தினர் இந்நிகழ்வில் கலந்துகொண்டனர்."
    ],
    image: "/images/police_medal.jpg",
    gallery: ["/images/police_medal.jpg", "/images/amalraj_portrait.png", "/images/amalraj_5150_appreciation.png"],
    date: "June 16, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Medals", "Awards", "Chennai Police", "Rajarathinam Stadium", "IPS"],
    tags_ta: ["பதக்கங்கள்", "விருதுகள்", "சென்னை போலீஸ்", "ராஜரத்தினம் மைதானம்", "ஐபிஎஸ்"],
    section: "activity",
    language: "English",
    highlights_en: [
      "300 GCP personnel received the Tamil Nadu Chief Minister's Police Medal.",
      "Awards presented by Greater Chennai Police Commissioner Dr. A. Amalraj IPS.",
      "Recipients represent Law and Order, Traffic, CCB, and specialized units.",
      "Medals recognize 10+ years of unblemished service."
    ],
    highlights_ta: [
      "300 சென்னை பெருநகர காவல் பணியாளர்கள் தமிழ்நாடு முதலமைச்சரின் காவல் பதக்கத்தைப் பெற்றனர்.",
      "விருதுகளை சென்னை பெருநகர காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் வழங்கினார்.",
      "பதக்கம் பெற்றவர்கள் சட்டம் ஒழுங்கு, போக்குவரத்து, மத்திய குற்றப்பிரிவு மற்றும் சிறப்புப் பிரிவுகளைச் சேர்ந்தவர்கள் ஆவர்.",
      "பதக்கங்கள் 10 ஆண்டுகளுக்கும் மேலான களங்கமற்ற சேவையைப் பாராட்டி வழங்கப்படுகின்றன."
    ],
    quote: {
      text_en: "Every medal represents a promise of dedication. I congratulate our officers who have served Chennai with honour and integrity.",
      text_ta: "ஒவ்வொரு பதக்கமும் அர்ப்பணிப்பின் வாக்குறுதியைக் குறிக்கிறது. சென்னையை நேர்மையுடனும் கண்ணியத்துடனும் பாதுகாத்த நமது அதிகாரிகளுக்கு எனது வாழ்த்துகள்.",
      author_en: "Dr. A. Amalraj IPS, Commissioner of Police",
      author_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ், காவல் ஆணையர்"
    },
    timeline: [
      { time: "09:00 AM", event_en: "Arrival of awardees and families at Rajarathinam Stadium", event_ta: "ராஜரத்தினம் மைதானத்திற்கு விருது பெறுபவர்கள் மற்றும் குடும்பத்தினர் வருகை" },
      { time: "10:00 AM", event_en: "Presentation of Medals by the Police Commissioner", event_ta: "காவல் ஆணையர் மூலம் பதக்கங்கள் வழங்குதல்" },
      { time: "11:30 AM", event_en: "High Tea and interactive session with families", event_ta: "குடும்பத்தினருடன் தேநீர் விருந்து மற்றும் கலந்துரையாடல்" }
    ],
    lastUpdated: "June 16, 2026, 06:00 PM",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com/news/cities/chennai/medals-awarded-to-300-chennai-police-personnel/article68291040.ece"
  },
  {
    id: 2,
    slug: "ed-bribery-arrest-case",
    category_en: "Anti-Corruption",
    category_ta: "ஊழல் தடுப்பு",
    title_en: "Tamil Nadu Police Arrest ED Officer in Alleged ₹20 Lakh Bribery Case",
    title_ta: "₹20 லட்சம் லஞ்ச வழக்கில் அமலாக்கத்துறை அதிகாரியை தமிழ்நாடு காவல்துறை கைது செய்தது",
    summary_en: "Tamil Nadu's Directorate of Vigilance and Anti-Corruption arrested an Enforcement Directorate officer after an alleged bribery transaction. Officials also conducted searches at related premises as part of the investigation.",
    summary_ta: "தமிழ்நாடு லஞ்ச ஒழிப்பு மற்றும் கண்காணிப்புத் துறை அமலாக்கத்துறை அதிகாரி ஒருவரை லஞ்சப் பணப் பரிவர்த்தனையின் போது கைது செய்தது. விசாரணையின் ஒரு பகுதியாக அதிகாரிகள் தொடர்புடைய இடங்களிலும் சோதனைகளை மேற்கொண்டனர்.",
    content_en: [
      "The Directorate of Vigilance and Anti-Corruption (DVAC) of the Tamil Nadu Police arrested an Enforcement Directorate (ED) officer in Madurai for allegedly accepting a bribe of ₹20 lakh from a government doctor.",
      "According to officials, the officer was caught red-handed while accepting the bribe. The bribe was allegedly demanded to close a case registered by the ED against the doctor in an ongoing investigation.",
      "Following the arrest, DVAC officials conducted extensive searches at the ED sub-zonal office in Madurai and other premises associated with the suspect to gather further evidence, including digital logs and financial ledgers.",
      "This action highlights the state command's strict stance against corruption at any administrative level and reinforces the integrity of enforcement agencies."
    ],
    content_ta: [
      "அரசு மருத்துவரிடமிருந்து ₹20 லட்சம் லஞ்சம் வாங்கியதாக மதுரை அமலாக்கத்துறை (ED) அதிகாரி ஒருவரை தமிழ்நாடு காவல்துறையின் லஞ்ச ஒழிப்பு மற்றும் கண்காணிப்புத் துறை (DVAC) கைது செய்தது.",
      "அதிகாரிகளின் கூற்றுப்படி, லஞ்சம் வாங்கும் போது அந்த அதிகாரி கையும் களவுமாகப் பிடிக்கப்பட்டார். தற்போதைய விசாரணையில் மருத்துவருக்கு எதிராக பதிவு செய்யப்பட்டுள்ள வழக்கை முடிப்பதற்காக இந்த லஞ்சம் கோரப்பட்டதாகக் கூறப்படுகிறது.",
      "கைது நடவடிக்கையைத் தொடர்ந்து, டிஜிட்டல் பதிவுகள் மற்றும் நிதிப் பேரேடுகள் உட்பட கூடுதல் ஆதாரங்களைச் சேகரிக்க மதுரையில் உள்ள அமலாக்கத்துறை துணை மண்டல அலுவலகம் மற்றும் சந்தேக நபர் தொடர்புடைய பிற இடங்களில் லஞ்ச ஒழிப்பு அதிகாரிகள் விரிவான சோதனைகளை நடத்தினர்.",
      "இந்த நடவடிக்கை எந்தவொரு நிர்வாக மட்டத்திலும் ஊழலுக்கு எதிரான மாநில அரசின் கடுமையான நிலைப்பாட்டை எடுத்துக்காட்டுகிறது மற்றும் அமலாக்க முகமைகளின் நேர்மையை வலுப்படுத்துகிறது."
    ],
    image: "/images/ed_logo.png",
    gallery: ["/images/ed_logo.png", "/images/gcp_headquarters.png"],
    date: "June 14, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Anti-Corruption", "DVAC", "Enforcement Directorate", "Bribery Case"],
    tags_ta: ["ஊழல் எதிர்ப்பு", "டிவிஏசி", "அமலாக்க இயக்குநரகம்", "லஞ்ச வழக்கு"],
    section: "activity",
    highlights_en: [
      "DVAC arrested an ED officer in Madurai.",
      "Accused was allegedly caught accepting a bribe of ₹20 lakh.",
      "Searches conducted at the ED sub-zonal office in Madurai.",
      "Action reinforces zero tolerance for corruption."
    ],
    highlights_ta: [
      "மதுரையில் அமலாக்கத்துறை அதிகாரியை லஞ்ச ஒழிப்புத் துறை கைது செய்தது.",
      "சந்தேக நபர் ₹20 லட்சம் லஞ்சம் பெற்றபோது கையும் களவுமாக சிக்கினார்.",
      "மதுரை துணை மண்டல அமலாக்கத்துறை அலுவலகத்தில் சோதனைகள் நடத்தப்பட்டன.",
      "ஊழலுக்கு எதிரான பூஜ்ஜிய சகிப்புத்தன்மை கொள்கையை இந்த நடவடிக்கை உறுதிப்படுத்துகிறது."
    ],
    quote: {
      text_en: "Law enforcement must command public trust. Anti-corruption checks are fundamental to maintaining administrative integrity.",
      text_ta: "சட்ட அமலாக்கம் பொது மக்களின் நம்பிக்கையைப் பெற வேண்டும். நிர்வாக நேர்மையைப் பேண ஊழல் தடுப்பு தணிக்கைகள் அவசியமானவை.",
      author_en: "DVAC Spokesperson",
      author_ta: "லஞ்ச ஒழிப்புத் துறை செய்தித் தொடர்பாளர்"
    },
    timeline: [
      { time: "02:00 PM", event_en: "Trap set by DVAC officials following a formal complaint", event_ta: "முறையான புகாரைத் தொடர்ந்து லஞ்ச ஒழிப்புத் துறையினர் பொறி அமைத்தல்" },
      { time: "04:30 PM", event_en: "Officer caught red-handed during the transaction", event_ta: "பரிவர்த்தனையின் போது அதிகாரி கையும் களவுமாக பிடிபட்டார்" },
      { time: "06:00 PM", event_en: "Searches initiated at the sub-zonal office premises", event_ta: "துணை மண்டல அலுவலக வளாகத்தில் சோதனைகள் தொடங்கப்பட்டன" }
    ],
    lastUpdated: "June 14, 2026, 09:30 PM",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/dvac-arrests-ed-officer-in-madurai-on-bribery-charges/article67593259.ece"
  },
  {
    id: 3,
    slug: "police-officer-transfers",
    category_en: "Police Administration",
    category_ta: "காவல்துறை நிர்வாகம்",
    title_en: "Tamil Nadu Government Transfers 56 Police Officers in Major Administrative Reshuffle",
    title_ta: "நிர்வாக மாற்றத்தில் 56 காவல்துறை அதிகாரிகளை தமிழ்நாடு அரசு இடமாற்றம் செய்தது",
    summary_en: "The State Government announced a large-scale transfer and posting order involving senior police officers across Greater Chennai Police, district units, specialised wings and commissionerates to strengthen policing and administrative efficiency.",
    summary_ta: "காவல்துறை மற்றும் நிர்வாகத் திறனை வலுப்படுத்துவதற்காக சென்னை பெருநகர காவல்துறை, மாவட்டப் பிரிவுகள், சிறப்புப் பிரிவுகள் மற்றும் ஆணையரகங்களில் பணியாற்றும் மூத்த காவல் அதிகாரிகளை உள்ளடக்கிய பெரிய அளவிலான இடமாற்ற மற்றும் நியமன உத்தரவை மாநில அரசு அறிவித்தது.",
    content_en: [
      "In a major administrative reshuffle, the Tamil Nadu government has ordered the transfer and posting of 56 IPS officers across the state.",
      "The reshuffle includes senior officials in Chennai City, as well as Superintendents of Police in several districts, to optimize field operations and administrative leadership.",
      "This restructuring is aimed at enhancing public safety, improving law and order enforcement, and ensuring an efficient command structure across regional divisions.",
      "Several key wings, including Traffic, Intelligence, and Crime Branches, received new leaders to bring fresh perspectives to policing operations."
    ],
    content_ta: [
      "ஒரு பெரிய நிர்வாக மாற்றத்தில், மாநிலம் முழுவதும் 56 ஐபிஎஸ் அதிகாரிகளை இடமாற்றம் மற்றும் நியமனம் செய்து தமிழ்நாடு அரசு உத்தரவிட்டுள்ளது.",
      "கள செயல்பாடுகள் மற்றும் நிர்வாகத் தலைமையினை மேம்படுத்தும் வகையில், சென்னை மாநகர மூத்த அதிகாரிகள் மற்றும் பல மாவட்டங்களின் காவல் கண்காணிப்பாளர்கள் (SP) இந்த மாற்றத்தில் அடங்குவர்.",
      "இந்த மறுசீரமைப்பு பொதுப் பாதுகாப்பை மேம்படுத்தவும், சட்டம் ஒழுங்கு அமலாக்கத்தை வலுப்படுத்தவும், பிராந்திய பிரிவுகளில் திறமையான செயல்பாட்டுக் கட்டமைப்பை உறுதி செய்யவும் நோக்கமாகக் கொண்டுள்ளது.",
      "போக்குவரத்து, உளவுத்துறை மற்றும் குற்றப்பிரிவு உள்ளிட்ட பல முக்கிய பிரிவுகளுக்குப் புதிய தலைவர்கள் நியமிக்கப்பட்டுள்ளனர்."
    ],
    image: "/images/tn_govt_secretariat.png",
    gallery: ["/images/tn_govt_secretariat.png", "/images/gcp_headquarters.png"],
    date: "June 12, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["IPS Transfers", "Police Administration", "Reshuffle", "Government Order"],
    tags_ta: ["ஐபிஎஸ் இடமாற்றங்கள்", "காவல்துறை நிர்வாகம்", "மாற்றம்", "அரசு உத்தரவு"],
    section: "activity",
    highlights_en: [
      "56 IPS officers transferred across Tamil Nadu.",
      "Reshuffle includes senior officers in Greater Chennai Police.",
      "Strategic placements designed to boost public safety and command efficiency."
    ],
    highlights_ta: [
      "தமிழ்நாடு முழுவதும் 56 ஐபிஎஸ் அதிகாரிகள் இடமாற்றம் செய்யப்பட்டனர்.",
      "சென்னை பெருநகர காவல்துறையின் மூத்த அதிகாரிகளும் இந்த மாற்றத்தில் உள்ளனர்.",
      "பொதுப் பாதுகாப்பை அதிகரிக்கவும் நிர்வாகத் திறனை வலுப்படுத்தவும் இந்த மாற்றங்கள் திட்டமிடப்பட்டுள்ளன."
    ],
    lastUpdated: "June 12, 2026, 08:00 PM",
    sourceName: "Indian Express",
    sourceUrl: "https://indianexpress.com/article/cities/chennai/tamil-nadu-police-reshuffle-ips-officers-transferred-9389201/"
  },
  {
    id: 4,
    slug: "singappen-special-force-response",
    category_en: "Women's Safety",
    category_ta: "பெண்கள் பாதுகாப்பு",
    title_en: "Singappen Special Force Responds Swiftly to Workplace Harassment Complaint",
    title_ta: "பணியிட பாலியல் புகார் மீது சிங்கப்பெண் சிறப்பு அதிரடிப்படை உடனடி நடவடிக்கை",
    summary_en: "The Singappen Special Force intervened after receiving information regarding a workplace harassment complaint in Chennai. The victim was provided protection and support, and legal action was initiated under relevant provisions.",
    summary_ta: "சென்னையில் பணியிட துன்புறுத்தல் புகார் குறித்த தகவல் கிடைத்ததும் சிங்கப்பெண் சிறப்பு அதிரடிப்படை விரைந்து செயல்பட்டது. பாதிக்கப்பட்ட பெண்ணுக்கு பாதுகாப்பும் ஆதரவும் வழங்கப்பட்டு சட்ட நடவடிக்கை தொடங்கப்பட்டது.",
    content_en: [
      "The newly launched Singappen Special Force of the Greater Chennai Police responded swiftly to a complaint of harassment reported by a female corporate employee in Chennai.",
      "The specialized team dispatched personnel to the site, ensured the victim's safety, and registered an FIR under the Prevention of Harassment of Women Act.",
      "Designed to offer rapid response and support, the Singappen Special Force works closely with local stations to investigate gender-based crimes and secure immediate relief for victims.",
      "The dedicated control unit will continue its monitoring programs across industrial sectors to maintain safe workspaces."
    ],
    content_ta: [
      "சென்னை பெருநகர காவல்துறையின் புதிதாகத் தொடங்கப்பட்ட 'சிங்கப்பெண்' சிறப்பு அதிரடிப்படை, சென்னை கார்ப்பரேட் பெண் ஊழியர் அளித்த துன்புறுத்தல் புகாருக்கு உடனடியாக நடவடிக்கை எடுத்தது.",
      "இந்தச் சிறப்புப் பிரிவு சம்பவ இடத்திற்குப் பெண் காவலர்களை அனுப்பி, பாதிக்கப்பட்ட பெண்ணின் பாதுகாப்பை உறுதிசெய்து, பெண்கள் வன்கொடுமை தடுப்புச் சட்டத்தின் கீழ் வழக்குப் பதிவு செய்தது.",
      "விரைவான பதில் மற்றும் ஆதரவை வழங்க வடிவமைக்கப்பட்ட சிங்கப்பெண் சிறப்புப் படை, பாலினம் சார்ந்த குற்றங்களை விசாரிப்பதற்கும் பாதிக்கப்பட்டவர்களுக்கு உடனடியாக நிவாரணம் வழங்குவதற்கும் உள்ளூர் காவல் நிலையங்களுடன் இணைந்து செயல்படுகிறது.",
      "பணியிடங்களைப் பாதுகாப்பாக வைத்திருக்க தொழில்துறை பிரிவுகளில் இந்த பிரத்யேகப் பிரிவு தொடர்ந்து கண்காணிப்புப் பணிகளை மேற்கொள்ளும்."
    ],
    image: "/images/singappen_ssf_poster.png",
    gallery: ["/images/singappen_ssf_poster.png", "/images/singapen_special_force.png"],
    date: "June 10, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Womens Safety", "Singappen Force", "Rapid Response", "Harassment Complaint"],
    tags_ta: ["பெண்கள் பாதுகாப்பு", "சிங்கப்பெண் படை", "விரைவு நடவடிக்கை", "துன்புறுத்தல் புகார்"],
    section: "activity",
    highlights_en: [
      "Singappen Special Force responded to corporate workplace harassment.",
      "Victim secured immediately and FIR registered under harassment laws.",
      "Force coordinates with local stations for rapid intervention."
    ],
    highlights_ta: [
      "நிறுவன பணியிடத் துன்புறுத்தலுக்கு சிங்கப்பெண் அதிரடிப்படை உடனடி நடவடிக்கை எடுத்தது.",
      "பாதிக்கப்பட்டவர் மீட்கப்பட்டு, வன்கொடுமை தடுப்புச் சட்டத்தில் வழக்குப் பதிவு செய்யப்பட்டது.",
      "உள்ளூர் காவல் நிலையங்களுடன் இணைந்து சிங்கப்பெண் அதிரடிப்படை செயல்படுகிறது."
    ],
    quote: {
      text_en: "Every woman's safety is our priority. Singappen Force is committed to creating a secure and fearless environment for all women in Chennai.",
      text_ta: "ஒவ்வொரு பெண்ணின் பாதுகாப்பும் எங்களின் முன்னுரிமையாகும். சென்னையில் உள்ள அனைத்துப் பெண்களுக்கும் பாதுகாப்பான மற்றும் பயமில்லாத சூழலை உருவாக்க சிங்கப்பெண் படை கடமைப்பட்டுள்ளது.",
      author_en: "Dr. A. Amalraj IPS, Commissioner of Police",
      author_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ், காவல் ஆணையர்"
    },
    lastUpdated: "June 10, 2026, 05:00 PM",
    sourceName: "DT Next",
    sourceUrl: "https://www.dtnext.in/news/city/chennai-police-singappen-special-force-launched-for-womens-safety-781200"
  },
  {
    id: 5,
    slug: "child-labour-pledge",
    category_en: "Social Awareness",
    category_ta: "சமூக விழிப்புணர்வு",
    title_en: "Greater Chennai Police Officials Take Child Labour Eradication Pledge",
    title_ta: "குழந்தை தொழிலாளர் ஒழிப்பு உறுதிமொழியை சென்னை பெருநகர காவல்துறை அதிகாரிகள் எடுத்தனர்",
    summary_en: "Senior officers, police personnel and ministerial staff participated in a pledge programme reaffirming their commitment toward eliminating child labour and promoting child welfare initiatives.",
    summary_ta: "குழந்தைத் தொழிலாளர்களை ஒழிப்பதற்கும், குழந்தைகள் நலத் திட்டங்களை மேம்படுத்துவதற்கும் தங்களது அர்ப்பணிப்பை உறுதிப்படுத்தும் உறுதிமொழி ஏற்கும் நிகழ்ச்சியில் மூத்த அதிகாரிகள், காவல்துறைப் பணியாளர்கள் மற்றும் அமைச்சக ஊழியர்கள் பங்கேற்றனர்.",
    content_en: [
      "Greater Chennai Police Commissioner Dr. A. Amalraj IPS led officers and personnel in taking a pledge against child labour on World Day Against Child Labour.",
      "The pledge was administered to officers at the GCP Headquarters, emphasizing the enforcement of child safety laws, rescue operations, and rehabilitation protocols.",
      "The department aims to maintain a zero-tolerance policy toward child employment in industrial or domestic environments in the metropolitan area.",
      "Joint operations with the Child Welfare Committee (CWC) are scheduled to identify and rescue minors engaged in hazardous occupations."
    ],
    content_ta: [
      "உலக குழந்தைத் தொழிலாளர் ஒழிப்பு தினத்தை முன்னிட்டு சென்னை பெருநகர காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் தலைமையில் அதிகாரிகள் மற்றும் ஆட்கள் குழந்தைத் தொழிலாளர்களுக்கு எதிரான உறுதிமொழியை ஏற்றுக்கொண்டனர்.",
      "காவல்துறை தலைமையகத்தில் அதிகாரிகளுக்கு இந்த உறுதிமொழி வழங்கப்பட்டது, இதில் குழந்தைப் பாதுகாப்புச் சட்டங்களின் அமலாக்கம், மீட்புப் பணிகள் மற்றும் மறுவாழ்வு நெறிமுறைகள் வலியுறுத்தப்பட்டன.",
      "பெருநகரப் பகுதியில் உள்ள தொழில் அல்லது வீட்டுச் சூழல்களில் குழந்தைகளைப் பணியமர்த்துவதற்கு எதிராகப் பூஜ்ஜிய சகிப்புத்தன்மைக் கொள்கையைப் பேணுவதை இந்தத் துறை நோக்கமாகக் கொண்டுள்ளது.",
      "அபாயகரமான தொழில்களில் ஈடுபட்டுள்ள சிறுவர்களைக் கண்டறிந்து மீட்பதற்காகக் குழந்தை நலக் குழுவுடன் (CWC) கூட்டுச் சோதனைகள் நடத்த திட்டமிடப்பட்டுள்ளன."
    ],
    image: "/images/child_labour_pledge.png",
    gallery: ["/images/child_labour_pledge.png", "/images/community_outreach.png"],
    date: "June 08, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Child Labour Eradication", "Pledge", "World Day Against Child Labour", "Welfare"],
    tags_ta: ["குழந்தைத் தொழிலாளர் ஒழிப்பு", "உறுதிமொழி", "உலக குழந்தைத் தொழிலாளர் ஒழிப்பு தினம்", "நலன்"],
    section: "activity",
    highlights_en: [
      "GCP Commissioner led World Day Against Child Labour pledge.",
      "Zero-tolerance policy declared for illegal child employment in Chennai.",
      "Joint raids with child safety agencies planned."
    ],
    highlights_ta: [
      "உலக குழந்தைத் தொழிலாளர் ஒழிப்பு தின உறுதிமொழியை காவல் ஆணையர் வழிநடத்தினார்.",
      "சென்னையில் சட்டவிரோத குழந்தைத் தொழிலாளர் முறைக்கு எதிராகப் பூஜ்ஜிய சகிப்புத்தன்மை கொள்கை அறிவிக்கப்பட்டுள்ளது.",
      "குழந்தைப் பாதுகாப்பு அமைப்புகளுடன் இணைந்து கூட்டுச் சோதனைகள் நடத்தத் திட்டமிடப்பட்டுள்ளது."
    ],
    lastUpdated: "June 08, 2026, 04:00 PM"
  },
  {
    id: 6,
    slug: "restricted-painkiller-arrest",
    category_en: "Crime Prevention",
    category_ta: "குற்றத் தடுப்பு",
    title_en: "Man Arrested for Possession of Large Quantity of Restricted Painkiller Tablets",
    title_ta: "அதிக அளவிலான தடைசெய்யப்பட்ட வலிநிவாரண மாத்திரைகளை வைத்திருந்த நபர் கைது",
    summary_en: "Police arrested an individual for allegedly storing pain-relief tablets for illegal sale. During the operation, approximately 1,000 tablets were seized and further investigation is underway.",
    summary_ta: "சட்டவிரோதமாக விற்பனை செய்வதற்காக வலிநிவாரண மாத்திரைகளைச் சேமித்து வைத்திருந்த நபரை காவல்துறையினர் கைது செய்தனர். இந்த நடவடிக்கையின் போது சுமார் 1,000 மாத்திரைகள் பறிமுதல் செய்யப்பட்டன.",
    content_en: [
      "As part of the ongoing drive against drug trafficking, the Chennai Police arrested a dealer for illegal possession and sale of restricted painkiller drugs.",
      "Following a tip-off, a special police team raided a warehouse and seized over 1,000 tablets of restricted painkillers, along with cash and mobile devices.",
      "The suspect was booked under the Narcotic Drugs and Psychotropic Substances (NDPS) Act. Police are investigating the supply chain behind the distribution network.",
      "Strong directives have been issued to check local pharmacies and online delivery lines for compliance with medical regulations."
    ],
    content_ta: [
      "போதைப்பொருள் கடத்தலுக்கு எதிரான தீவிர நடவடிக்கையின் ஒரு பகுதியாக, தடைசெய்யப்பட்ட வலிநிவாரண மருந்துகளைச் சட்டவிரோதமாக வைத்திருந்த மற்றும் விற்பனை செய்த வியாபாரி ஒருவரைச் சென்னை போலீஸார் கைது செய்தனர்.",
      "கிடைத்த ரகசிய தகவலின் பேரில், தனிப்படை போலீஸார் ஒரு கிடங்கில் சோதனை நடத்தி, தடைசெய்யப்பட்ட 1,000க்கும் மேற்பட்ட வலிநிவாரண மாத்திரைகளுடன் ரொக்கப் பணம் மற்றும் மொபைல் போன்களைப் பறிமுதல் செய்தனர்.",
      "சந்தேக நபர் போதைப்பொருள் தடுப்பு (NDPS) சட்டத்தின் கீழ் கைது செய்யப்பட்டார். விநியோக வலையமைப்பின் பின்னணியில் உள்ள விநியோகச் சங்கிலி குறித்து காவல்துறையினர் விசாரித்து வருகின்றனர்.",
      "மருத்துவ விதிமுறைகளுக்கு இணங்குவதை உறுதிப்படுத்த உள்ளூர் மருந்தகங்கள் மற்றும் ஆன்லைன் விநியோக வழிகளைச் சரிபார்க்கக் கடுமையான உத்தரவுகள் பிறப்பிக்கப்பட்டுள்ளன."
    ],
    image: "/images/painkiller_arrest.png",
    gallery: ["/images/painkiller_arrest.png", "/images/sexual_harassment_cmbt.jpg"],
    date: "June 05, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["NDPS Act", "Drug Seizure", "Painkiller Smuggling", "Crime Prevention"],
    tags_ta: ["என்.டி.பி.எஸ் சட்டம்", "போதைப்பொருள் பறிமுதல்", "மாத்திரைகள் கடத்தல்", "குற்றத் தடுப்பு"],
    section: "activity",
    highlights_en: [
      "Special raid leads to seizure of 1,000+ restricted painkiller tablets.",
      "Suspect arrested and booked under NDPS provisions.",
      "Pharmacies monitored for drug sale violations."
    ],
    highlights_ta: [
      "சிறப்புச் சோதனையில் 1,000க்கும் மேற்பட்ட தடைசெய்யப்பட்ட மாத்திரைகள் பறிமுதல் செய்யப்பட்டன.",
      "சந்தேக நபர் கைது செய்யப்பட்டு போதைப்பொருள் சட்டத்தின் கீழ் வழக்குப் பதிவு செய்யப்பட்டது.",
      "மருந்தகங்களில் மருந்துகள் விற்பனை விதிகள் மீறப்படுகிறதா என்று கண்காணிக்கப்படுகிறது."
    ],
    lastUpdated: "June 05, 2026, 03:00 PM",
    sourceName: "The Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com/city/chennai/chennai-man-held-with-restricted-painkillers/articleshow/110725510.cms"
  },
  {
    id: 7,
    slug: "amalraj-posted-commissioner",
    category_en: "Police Appointment",
    category_ta: "காவல்துறை நியமனம்",
    title_en: "ADGP A. Amalraj posted as Greater Chennai City Police Commissioner",
    title_ta: "கூடுதல் டிஜிபி ஏ. அமல்ராஜ் சென்னை பெருநகர காவல் ஆணையராக நியமனம்",
    summary_en: "ADGP A. Amalraj posted as Greater Chennai City Police Commissioner, bringing years of administrative experience to lead the city's police command.",
    summary_ta: "கூடுதல் டிஜிபி ஏ.அமல்ராஜ் சென்னை பெருநகர காவல் ஆணையராக நியமிக்கப்பட்டுள்ளார். அவர் சென்னை மாநகர காவல் துறையை வழிநடத்த தனது பல ஆண்டுகால நிர்வாக அனுபவத்தைக் கொண்டுவருகிறார்.",
    content_en: [
      "Additional Director General of Police (ADGP) A. Amalraj has been officially posted as the new Commissioner of Police for Greater Chennai City.",
      "He succeeds the outgoing commissioner and brings a wealth of experience in law and order, administrative command, and public safety initiatives.",
      "Dr. A. Amalraj IPS outlined his key priorities upon taking charge, highlighting crime prevention, women's security, community policing (Kaaval Karangal), and modernization of traffic operations.",
      "Officers across Greater Chennai welcomed the appointment and expressed support for his vision of integrated community policing."
    ],
    content_ta: [
      "கூடுதல் காவல்துறை தலைமை இயக்குநர் (ADGP) ஏ.அமல்ராஜ் சென்னை பெருநகர காவல் துறையின் புதிய காவல் ஆணையராக அதிகாரப்பூர்வமாக நியமிக்கப்பட்டுள்ளார்.",
      "அவர் முந்தைய ஆணையருக்குப் பின் பொறுப்பேற்றுள்ளார் மற்றும் சட்டம் ஒழுங்கு, நிர்வாகக் கட்டளை மற்றும் பொதுப் பாதுகாப்புத் திட்டங்களில் தனது விரிவான அனுபவத்தைக் கொண்டுவருகிறார்.",
      "டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் பொறுப்பேற்றவுடன் தனது முக்கிய முன்னுரிமைகளைக் கோடிட்டுக் காட்டினார், குற்றத் தடுப்பு, பெண்கள் பாதுகாப்பு, சமூகக் காவல் (காவல் கரங்கள்) மற்றும் போக்குவரத்துச் செயல்பாடுகளை நவீனமயமாக்குதல் ஆகியவற்றை முன்னிலைப்படுத்தினார்.",
      "சென்னை பெருநகரம் முழுவதிலும் உள்ள அதிகாரிகள் இந்த நியமனத்தை வரவேற்று, அவரது ஒருங்கிணைந்த சமூகக் காவல் பற்றிய பார்வைக்குத் தங்கள் ஆதரவை வெளிப்படுத்தினர்."
    ],
    image: "/images/amalraj_portrait.png",
    gallery: ["/images/amalraj_portrait.png", "/images/amalraj_header.png", "/images/amalraj_take_charge.png"],
    date: "May 21, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Appointment", "Amalraj IPS", "City Police Commissioner", "GCP Headquarters"],
    tags_ta: ["நியமனம்", "அமல்ராஜ் ஐபிஎஸ்", "மாநகர காவல் ஆணையர்", "தலைமையகம்"],
    section: "spotlight",
    highlights_en: [
      "ADGP A. Amalraj IPS takes charge as Chennai City Police Commissioner.",
      "Brings extensive administrative experience to the post.",
      "Focus areas declared: Community welfare, safety audits, and traffic technology."
    ],
    highlights_ta: [
      "கூடுதல் டிஜிபி ஏ.அமல்ராஜ் ஐபிஎஸ் சென்னை மாநகர காவல் ஆணையராகப் பொறுப்பேற்றார்.",
      "இப்பதவிக்கு விரிவான நிர்வாக அனுபவத்தைக் கொண்டுவருகிறார்.",
      "அறிவிக்கப்பட்ட முக்கிய பகுதிகள்: சமூக நலன், பாதுகாப்பு தணிக்கைகள் மற்றும் போக்குவரத்து தொழில்நுட்பம்."
    ],
    quote: {
      text_en: "Our department must combine technology with compassion. I am honored to lead the officers of Greater Chennai in keeping our city secure.",
      text_ta: "நமது துறை தொழில்நுட்பத்தையும் இரக்கத்தையும் இணைக்க வேண்டும். சென்னையைப் பாதுகாப்பாக வைத்திருப்பதில் சென்னை பெருநகர காவல் அதிகாரிகளை வழிநடத்துவதில் பெருமையடைகிறேன்.",
      author_en: "Dr. A. Amalraj IPS, Commissioner of Police",
      author_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ், காவல் ஆணையர்"
    },
    lastUpdated: "May 21, 2026, 02:00 PM",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/a-amalraj-assumes-charge-as-chennai-police-commissioner/article67025829.ece"
  },
  {
    id: 8,
    slug: "law-students-meeting",
    category_en: "Legal Outreach",
    category_ta: "சட்ட விழிப்புணர்வு",
    title_en: "Commissioner Briefs Law College Students on Police Procedures",
    title_ta: "சட்டக் கல்லூரி மாணவர்களுக்கு காவல் நடைமுறைகள் குறித்து ஆணையர் விளக்கம்",
    summary_en: "Commissioner Briefs Law College Students on Police Procedures to promote awareness and transparency between future legal professionals and the law enforcement agency.",
    summary_ta: "வருங்கால சட்ட வல்லுநர்கள் மற்றும் சட்ட அமலாக்க முகமைகளுக்கு இடையே விழிப்புணர்வு மற்றும் வெளிப்படைத்தன்மையை மேம்படுத்துவதற்காகச் சட்டக் கல்லூரி மாணவர்களுக்குக் காவல் நடைமுறைகள் குறித்து ஆணையர் விளக்கினார்.",
    content_en: [
      "In a bid to bridge the gap between academia and law enforcement, Greater Chennai Police Commissioner Dr. A. Amalraj IPS hosted an interactive session with students from major law colleges in the city.",
      "The Commissioner explained standard operating procedures, custody protocols, investigation guidelines, and the role of police under new legal frameworks.",
      "Students had the opportunity to ask questions regarding cyber investigation challenges, forensic evidence collection, and digital records maintenance in modern policing.",
      "The initiatives will continue as quarterly briefings to ensure continuous outreach to legal institutions."
    ],
    content_ta: [
      "கல்வித்துறை மற்றும் சட்ட அமலாக்கத்திற்கு இடையிலான இடைவெளியைக் குறைக்கும் முயற்சியாக, சென்னை பெருநகர காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் நகரின் முக்கிய சட்டக் கல்லூரிகளைச் சேர்ந்த மாணவர்களுடன் கலந்துரையாடல் கூட்டத்தை நடத்தினார்.",
      "ஆணையர் நிலையான செயல்பாட்டு நடைமுறைகள், காவல் நெறிமுறைகள், விசாரணை வழிகாட்டுதல்கள் மற்றும் புதிய சட்டக் கட்டமைப்புகளின் கீழ் காவல்துறையின் பங்கு ஆகியவற்றை விளக்கினார்.",
      "மாணவர்களுக்கு சைபர் விசாரணை சவால்கள், தடய அறிவியல் ஆதாரங்களைச் சேகரித்தல் மற்றும் நவீன காவலில் டிஜிட்டல் பதிவுகளைப் பராமரித்தல் குறித்துக் கேள்விகளைக் கேட்க வாய்ப்பு கிடைத்தது.",
      "சட்ட நிறுவனங்களுடனான தொடர்ச்சியான தொடர்பை உறுதி செய்வதற்காக இந்தத் திட்டம் காலாண்டு சந்திப்புகளாகத் தொடரும்."
    ],
    image: "/images/law_students_meeting.png",
    gallery: ["/images/law_students_meeting.png", "/images/amalraj_5150_appreciation.png"],
    date: "June 09, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Legal Outreach", "Law Students", "Police Procedures", "Academic Briefing"],
    tags_ta: ["சட்ட விழிப்புணர்வு", "சட்ட மாணவர்கள்", "காவல் நடைமுறைகள்", "கல்வி விளக்கக்கூட்டம்"],
    section: "spotlight",
    highlights_en: [
      "Interactive session hosted at Chennai Police Headquarters.",
      "Commissioner clarified custody protocols and forensic standards.",
      "Encourages transparency between law students and officers."
    ],
    highlights_ta: [
      "சென்னை போலீஸ் தலைமையகத்தில் கலந்துரையாடல் கூட்டம் நடத்தப்பட்டது.",
      "காவல் நெறிமுறைகள் மற்றும் தடய அறிவியல் தரநிலைகளை ஆணையர் விளக்கினார்.",
      "சட்ட மாணவர்களுக்கும் காவலர்களுக்கும் இடையே வெளிப்படைத்தன்மையை ஊக்குவிக்கிறது."
    ],
    lastUpdated: "June 09, 2026, 04:00 PM"
  },
  {
    id: 9,
    slug: "marina-beach-night-patrol",
    category_en: "Security Audit",
    category_ta: "பாதுகாப்பு தணிக்கை",
    title_en: "Marina Beach Night Patrolling Security and Lighting Audit lead by Commissioner",
    title_ta: "மெரினா கடற்கரையில் ஆணையர் தலைமையில் இரவு நேர பாதுகாப்பு மற்றும் விளக்கு தணிக்கை",
    summary_en: "Marina Beach Night Patrolling Security and Lighting Audit lead by Commissioner to enhance safety for evening visitors and families.",
    summary_ta: "மாலை நேர பார்வையாளர்கள் மற்றும் குடும்பங்களின் பாதுகாப்பை மேம்படுத்துவதற்காக ஆணையர் தலைமையில் மெரினா கடற்கரையில் இரவு நேர ரோந்துப் பாதுகாப்பு மற்றும் விளக்கு தணிக்கை நடத்தப்பட்டது.",
    content_en: [
      "Commissioner Dr. A. Amalraj IPS led a late-night security and lighting audit at Chennai's Marina Beach to identify dark spots and security gaps.",
      "Accompanied by senior officers and municipal representatives, the Commissioner inspected patrol routes, CCTV coverage, and high-mast lighting installations along the promenade.",
      "Instructions were issued to increase patrol vehicle density, install additional high-definition cameras, and maintain clean public areas to deter unsocial activities during night hours.",
      "The Pink Patrol and beach dune buggies will increase frequency to ensure female visitors feel completely safe."
    ],
    content_ta: [
      "சென்னை மெரினா கடற்கரையில் இருண்ட பகுதிகள் மற்றும் பாதுகாப்பு குறைபாடுகளைக் கண்டறிய காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் நள்ளிரவில் பாதுகாப்பு மற்றும் விளக்கு தணிக்கையை மேற்கொண்டார்.",
      "மூத்த அதிகாரிகள் மற்றும் மாநகராட்சிப் பிரதிநிதிகளுடன் சென்ற ஆணையர், கடற்கரை உலாப் பாதையில் ரோந்து வழிகள், சிசிடிவி கவரேஜ் மற்றும் உயர்மின் விளக்கு அமைப்புகளை ஆய்வு செய்தார்.",
      "இரவு நேரங்களில் சமூக விரோதச் செயல்களைத் தடுக்க, ரோந்து வாகனங்களின் எண்ணிக்கையை அதிகரிக்கவும், கூடுதல் உயர்ரக கேமராக்களை நிறுவவும், பொது இடங்களை சுத்தமாக வைத்திருக்கவும் உத்தரவுகள் பிறப்பிக்கப்பட்டன.",
      "பெண் பார்வையாளர்கள் முழுப் பாதுகாப்பை உணர்வதை உறுதி செய்ய பிங்க் ரோந்து (Pink Patrol) மற்றும் கடற்கரை வாகனங்களின் ரோந்து அதிர்வெண் அதிகரிக்கப்படும்."
    ],
    image: "/images/night_patrol.png",
    gallery: ["/images/night_patrol.png", "/images/gcp_headquarters.png"],
    date: "June 13, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Marina Beach", "Night Patrolling", "Lighting Audit", "CCTV Inspection"],
    tags_ta: ["மெரினா கடற்கரை", "இரவு ரோந்து", "விளக்கு தணிக்கை", "சிசிடிவி ஆய்வு"],
    section: "spotlight",
    highlights_en: [
      "Late-night security audit conducted on Marina Beach promenade.",
      "CCTV expansion and high-mast lighting updates planned.",
      "Patrol density boosted including Pink Patrol coverage."
    ],
    highlights_ta: [
      "மெரினா கடற்கரை உலாப் பாதையில் நள்ளிரவு பாதுகாப்பு தணிக்கை நடத்தப்பட்டது.",
      "சிசிடிவி விரிவாக்கம் மற்றும் உயர்மின் விளக்கு மேம்பாடுகள் திட்டமிடப்பட்டுள்ளன.",
      "பிங்க் ரோந்து உட்பட ரோந்துப் பணியின் தீவிரம் அதிகரிக்கப்பட்டுள்ளது."
    ],
    lastUpdated: "June 13, 2026, 11:30 PM",
    sourceName: "DT Next",
    sourceUrl: "https://www.dtnext.in/news/city/chennai-police-commissioner-conducts-night-patrol-audit-at-marina-782410"
  },
  {
    id: 10,
    slug: "kaaval-karangal-reunites-senior-woman",
    category_en: "Community Support",
    category_ta: "சமூக ஆதரவு",
    title_en: "Kaaval Karangal Reunites Senior Woman",
    title_ta: "குஜராத் மூதாட்டி காவல் கரங்கள் மூலம் குடும்பத்துடன் இணைப்பு",
    summary_en: "Greater Chennai Police's Kaaval Karangal division coordinated with social workers in Gujarat to bring the senior citizen home. She was wandering without support or identity in Madurai earlier, and then moved towards Gujarat.",
    summary_ta: "குஜராத் மாநிலத்தில் ஆதரவின்றி சுற்றித்திரிந்த தாம்பரம் பகுதியைச் சேர்ந்த 65 வயது மூதாட்டி, சென்னை பெருநகர காவல்துறையின் காவல் கரங்கள் உதவி மையத்தின் முயற்சியால் மீட்கப்பட்டு, நேற்று அவரது குடும்பத்தினருடன் மீண்டும் இணைத்து வைக்கப்பட்டார்.",
    content_en: [
      "Greater Chennai Police's Kaaval Karangal division coordinated with social workers in Gujarat to bring the senior citizen home. She was wandering without support or identity in Madurai earlier, and then moved towards Gujarat.",
      "Kaaval Karangal team tracked down her relatives through database records and coordinated transport to bring her back safely. This initiative highlights the humanitarian face of metropolitan policing.",
      "Over the last 5 years, Kaaval Karangal has rescued over 10,163 individuals and reunited 4,229 families, bringing comfort to thousands of abandoned citizens."
    ],
    content_ta: [
      "சென்னை பெருநகர காவல்துறையின் 'காவல் கரங்கள்' பிரிவு குஜராத்தில் உள்ள சமூக ஆர்வலர்களுடன் ஒருங்கிணைந்து முதியவரை வீட்டிற்கு அழைத்து வந்தது. அவர் முன்னதாக மதுரையில் ஆதரவோ அல்லது அடையாளமோ இன்றி சுற்றித் திரிந்தார், பின்னர் குஜராத் நோக்கிச் சென்றார்.",
      "காவல் கரங்கள் குழு தரவுத்தள பதிவுகள் மூலம் அவரது உறவினர்களைக் கண்டுபிடித்து, அவரைப் பாதுகாப்பாக மீட்டுக் கொண்டுவர போக்குவரத்து வசதிகளை ஒருங்கிணைத்தது. இந்த முயற்சி பெருநகரக் காவல் துறையின் மனிதாபிமான முகத்தை எடுத்துக்காட்டுகிறது.",
      "கடந்த 5 ஆண்டுகளில், காவல் கரங்கள் 10,163க்கும் மேற்பட்ட நபர்களை மீட்டு, 4,229 குடும்பங்களை இணைத்து, கைவிடப்பட்ட ஆயிரக்கணக்கான குடிமக்களுக்கு நிம்மதி அளித்துள்ளது."
    ],
    image: "/images/reunion_gujarat.png",
    gallery: ["/images/reunion_gujarat.png", "/images/community_outreach.png"],
    date: "June 15, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Kaaval Karangal", "Family Reunion", "Senior Citizen Care", "Social Welfare"],
    tags_ta: ["காவல் கரங்கள்", "குடும்ப இணைப்பு", "முதியோர் பராமரிப்பு", "சமூக நலம்"],
    section: "media-story",
    highlights_en: [
      "65-year-old Chennai woman rescued from Gujarat.",
      "Reunited with family through Kaaval Karangal coordination.",
      "Kaaval Karangal reports 10,000+ rescues in five years."
    ],
    highlights_ta: [
      "குஜராத்தில் இருந்து 65 வயது சென்னை மூதாட்டி மீட்கப்பட்டார்.",
      "காவல் கரங்கள் ஒருங்கிணைப்பு மூலம் குடும்பத்துடன் மீண்டும் இணைக்கப்பட்டார்.",
      "ஐந்து ஆண்டுகளில் 10,000க்கும் மேற்பட்டோர் மீட்கப்பட்டதாக காவல் கரங்கள் தெரிவிக்கிறது."
    ],
    quote: {
      text_en: "Kaaval Karangal represents our commitment to the most vulnerable. Rejoining families is our greatest reward.",
      text_ta: "கைவிடப்பட்ட மற்றும் மிகவும் நலிந்த மக்களுக்கு நாங்கள் வழங்கும் அர்ப்பணிப்பை காவல் கரங்கள் பிரதிபலிக்கிறது. குடும்பங்களை இணைப்பதே எங்களுக்குக் கிடைக்கும் மிகப்பெரிய வெகுமதியாகும்.",
      author_en: "Dr. A. Amalraj IPS, Commissioner of Police",
      author_ta: "டாக்டர் ஏ. அமல்ராஜ் ஐபிஎஸ், காவல் ஆணையர்"
    },
    lastUpdated: "June 15, 2026, 04:00 PM",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com/news/cities/chennai/chennai-polices-kaaval-karangal-reunites-elderly-woman-with-family/article67923410.ece"
  },
  {
    id: 11,
    slug: "modern-traffic-intersections",
    category_en: "Traffic Tech",
    category_ta: "போக்குவரத்து தொழில்நுட்பம்",
    title_en: "Commissioner inspects modern traffic intersections in Central Chennai.",
    title_ta: "மத்திய சென்னையில் நவீன போக்குவரத்து சந்திப்புகளை ஆணையர் ஆய்வு செய்தார்",
    summary_en: "Commissioner inspects modern traffic intersections in Central Chennai to review smart signal operations and pedestrian safety protocols.",
    summary_ta: "ஸ்மார்ட் சிக்னல் செயல்பாடுகள் மற்றும் பாதசாரிகள் பாதுகாப்பு நெறிமுறைகளை ஆய்வு செய்ய மத்திய சென்னையில் நவீன போக்குவரத்து சந்திப்புகளை ஆணையர் ஆய்வு செய்தார்.",
    content_en: [
      "Commissioner Dr. A. Amalraj IPS conducted a site inspection of several key traffic intersections in Central Chennai equipped with automated signals and pedestrian sensors.",
      "The department is upgrading intersections to utilize AI-driven traffic optimization systems, which automatically adjust signal timings based on vehicle density.",
      "Special emphasis was placed on creating accessible walkways, clear lane markings, and countdown timers to aid senior citizens and disabled pedestrians crossing busy routes.",
      "Digital enforcement cameras have also been deployed to catch signal violations automatically and generate instant e-challans."
    ],
    content_ta: [
      "காவல் ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் மத்திய சென்னையில் தானியங்கி சிக்னல்கள் மற்றும் பாதசாரி சென்சார்கள் பொருத்தப்பட்ட பல முக்கிய போக்குவரத்து சந்திப்புகளை ஆய்வு செய்தார்.",
      "வாகனங்களின் அடர்த்திக்கு ஏற்ப சிக்னல் நேரங்களைத் தானாகவே சரிசெய்யும் AI-ஆல் இயக்கப்படும் போக்குவரத்து அமைப்புகளைப் பயன்படுத்த இந்தத் துறை சந்திப்புகளை மேம்படுத்தி வருகிறது.",
      "முதியவர்கள் மற்றும் மாற்றுத்திறனாளி பாதசாரிகள் கடப்பதற்கு ஏதுவாக அணுகக்கூடிய நடைபாதைகள், தெளிவான வழித்தடக் குறியீடுகள் மற்றும் கவுண்ட்டவுன் டைமர்களை உருவாக்குவதில் சிறப்பு கவனம் செலுத்தப்பட்டது.",
      "சிக்னல் விதிமீறல்களைத் தானாகவே கண்டறிந்து உடனடியாக இ-சல்லான்களை உருவாக்க டிஜிட்டல் அமலாக்க கேமராக்களும் பயன்படுத்தப்பட்டுள்ளன."
    ],
    image: "/images/control-center.png",
    gallery: ["/images/control-center.png", "/images/night_patrol.png"],
    date: "June 14, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Smart Traffic", "AI Signals", "Pedestrian Safety", "E-Challan"],
    tags_ta: ["ஸ்மார்ட் போக்குவரத்து", "AI சிக்னல்கள்", "பாதசாரிகள் பாதுகாப்பு", "இ-சல்லான்"],
    section: "latest",
    highlights_en: [
      "AI-driven traffic signals inspected in Central Chennai.",
      "Automated sensor timers adjust signaling based on density.",
      "Enhanced pedestrian walkways and electronic crossing guides."
    ],
    highlights_ta: [
      "மத்திய சென்னையில் AI சிக்னல்கள் ஆய்வு செய்யப்பட்டன.",
      "தானியங்கி சென்சார் டைமர்கள் வாகன அடர்த்திக்கு ஏற்ப நேரத்தை சரிசெய்கின்றன.",
      "மேம்படுத்தப்பட்ட பாதசாரி நடைபாதைகள் மற்றும் மின்னணு வழிகாட்டிகள்."
    ],
    lastUpdated: "June 14, 2026, 03:00 PM"
  },
  {
    id: 12,
    slug: "cybercrime-awareness-cell",
    category_en: "Cyber Safety",
    category_ta: "சைபர் பாதுகாப்பு",
    title_en: "New cybercrime awareness cell inaugurated for collegiate networks.",
    title_ta: "கல்லூரிகளுக்கான புதிய சைபர் குற்ற விழிப்புணர்வு பிரிவு தொடக்கம்",
    summary_en: "New cybercrime awareness cell inaugurated for collegiate networks to train students in identifying and reporting digital frauds.",
    summary_ta: "டிஜிட்டல் மோசடிகளைக் கண்டறிந்து புகாரளிக்க மாணவர்களுக்குப் பயிற்சி அளிப்பதற்காகக் கல்லூரிகளுக்கான புதிய சைபர் குற்ற விழிப்புணர்வுப் பிரிவு தொடங்கப்பட்டது.",
    content_en: [
      "In response to rising online scams, the Greater Chennai Police inaugurated a dedicated Cybercrime Awareness Cell aimed at college students.",
      "The cell will train student coordinators to serve as digital safety ambassadors within their respective campuses, spreading awareness on phishing, financial frauds, and cyber hygiene.",
      "Commissioner Dr. A. Amalraj IPS urged students to remain vigilant and utilize the national cybercrime reporting hotline 1930 for immediate assistance in case of financial frauds.",
      "Special student workshops will cover safety protocols on online gaming, digital identity theft, and loan app threats."
    ],
    content_ta: [
      "அதிகரித்து வரும் ஆன்லைன் மோசடிகளுக்குப் பதிலளிக்கும் விதமாக, சென்னை பெருநகர காவல்துறை கல்லூரி மாணவர்களை இலக்காகக் கொண்ட ஒரு பிரத்யேக சைபர் குற்ற விழிப்புணர்வு பிரிவைத் தொடங்கியது.",
      "இப்பிரிவு மாணவர் ஒருங்கிணைப்பாளர்களுக்கு அந்தந்த வளாகங்களில் டிஜிட்டல் பாதுகாப்பு தூதர்களாகச் செயல்படப் பயிற்சி அளிக்கும், ஃபிஷிங், நிதி மோசடிகள் மற்றும் சைபர் சுகாதாரம் குறித்த விழிப்புணர்வை ஏற்படுத்தும்.",
      "நிதி மோசடிகள் ஏற்பட்டால் உடனடியாகப் புகாரளிக்க தேசிய சைபர் குற்றப் புகார் எண் 1930 ஐப் பயன்படுத்துமாறு ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ் மாணவர்களை வலியுறுத்தினார்.",
      "சிறப்பு மாணவர் பயிலரங்குகள் ஆன்லைன் கேமிங், டிஜிட்டல் அடையாளத் திருட்டு மற்றும் கடன் செயலி அச்சுறுத்தல்கள் குறித்த பாதுகாப்பு வழிகாட்டுதல்களை உள்ளடக்கும்."
    ],
    image: "/images/welfare_highlight.png",
    gallery: ["/images/welfare_highlight.png", "/images/law_students_meeting.png"],
    date: "June 12, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Cybercrime Awareness", "Collegiate Network", "Digital Safety", "Hotline 1930"],
    tags_ta: ["சைபர் குற்ற விழிப்புணர்வு", "கல்லூரி நெட்வொர்க்", "டிஜிட்டல் பாதுகாப்பு", "ஹோட்லைன் 1930"],
    section: "latest",
    highlights_en: [
      "Collegiate Cyber Awareness Cell launched in Chennai.",
      "Hotline 1930 promoted for swift reporting of cyber thefts.",
      "Student coordinators trained as cyber safety ambassadors."
    ],
    highlights_ta: [
      "சென்னையில் கல்லூரி சைபர் விழிப்புணர்வு பிரிவு தொடங்கப்பட்டது.",
      "சைபர் திருட்டுகள் குறித்து விரைவாகப் புகாரளிக்க 1930 உதவி எண் விளம்பரப்படுத்தப்பட்டது.",
      "மாணவர் ஒருங்கிணைப்பாளர்கள் சைபர் பாதுகாப்பு தூதர்களாகப் பயிற்றுவிக்கப்பட்டனர்."
    ],
    lastUpdated: "June 12, 2026, 02:00 PM",
    sourceName: "Indian Express",
    sourceUrl: "https://indianexpress.com/article/cities/chennai/chennai-cyber-crime-cell-awareness-drive-students-936214/"
  },
  {
    id: 13,
    slug: "kaaval-karangal-reunite-abandoned",
    category_en: "Community Support",
    category_ta: "சமூக ஆதரவு",
    title_en: "Kaaval Karangal teams reunite 14 abandoned senior citizens with families.",
    title_ta: "ஆதரவற்ற 14 முதியவர்களை காவல் கரங்கள் குழுவினர் குடும்பத்தினருடன் இணைத்தனர்",
    summary_en: "Kaaval Karangal teams reunite 14 abandoned senior citizens with families during a weekly outreach campaign.",
    summary_ta: "வாராந்திர விழிப்புணர்வு மற்றும் மீட்புப் பிரச்சாரத்தின் போது கைவிடப்பட்ட 14 முதியவர்களை காவல் கரங்கள் குழுக்கள் அவர்களது குடும்பத்தினருடன் இணைத்தன.",
    content_en: [
      "In a major social outreach drive, the Kaaval Karangal division of the Chennai Police successfully traced the families of 14 abandoned senior citizens.",
      "These individuals, who had been staying at government-run and private shelters, were reunited with their relatives after a systematic mapping and counseling process.",
      "The division continues to operate shelter rehabilitation and health outreach services for homeless and vulnerable citizens across metropolitan Chennai.",
      "Coordination with municipal health centers ensures medical services are available immediately upon rescue."
    ],
    content_ta: [
      "ஒரு முக்கிய சமூக விழிப்புணர்வுப் பணியில், சென்னை காவல்துறையின் காவல் கரங்கள் பிரிவு கைவிடப்பட்ட 14 முதியவர்களின் குடும்பங்களை வெற்றிகரமாகக் கண்டறிந்தது.",
      "அரசு மற்றும் தனியார் காப்பகங்களில் தங்கியிருந்த இந்த நபர்கள், முறையான அடையாள வரைபடம் மற்றும் ஆலோசனைகளுக்குப் பிறகு தங்கள் உறவினர்களுடன் இணைக்கப்பட்டனர்.",
      "இப்பிரிவு பெருநகர சென்னை முழுவதும் வீடற்ற மற்றும் நலிந்த குடிமக்களுக்குக் காப்பக மறுவாழ்வு மற்றும் சுகாதாரச் சேவைகளைத் தொடர்ந்து வழங்கி வருகிறது.",
      "மாநகராட்சி சுகாதார மையங்களுடன் ஒருங்கிணைப்பதன் மூலம் மீட்புக்குப் பின் உடனடியாக மருத்துவ சேவைகள் கிடைப்பது உறுதி செய்யப்படுகிறது."
    ],
    image: "/images/community_outreach.png",
    gallery: ["/images/community_outreach.png", "/images/reunion_gujarat.png"],
    date: "June 10, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Kaaval Karangal", "Rehab Services", "Elderly Support", "Chennai Outreach"],
    tags_ta: ["காவல் கரங்கள்", "மறுவாழ்வு சேவைகள்", "முதியோர் ஆதரவு", "சென்னை விழிப்புணர்வு"],
    section: "latest",
    highlights_en: [
      "14 homeless senior citizens reunited with families.",
      "Counseling and identity mapping used to locate relatives.",
      "Integrated health support provided during rehab phase."
    ],
    highlights_ta: [
      "வீடற்ற 14 முதியவர்கள் தங்களது குடும்பங்களுடன் இணைக்கப்பட்டனர்.",
      "உறவினர்களைக் கண்டறிய ஆலோசனை மற்றும் அடையாளத் தேடல் பயன்படுத்தப்பட்டது.",
      "மறுவாழ்வு கட்டத்தில் ஒருங்கிணைந்த சுகாதார ஆதரவு வழங்கப்பட்டது."
    ],
    lastUpdated: "June 10, 2026, 01:00 PM"
  },
  {
    id: 14,
    slug: "patrol-force-density",
    category_en: "Women Safety",
    category_ta: "பெண்கள் பாதுகாப்பு",
    title_en: "Patrol force density increased around women colleges and transit zones.",
    title_ta: "பெண்கள் கல்லூரிகள் மற்றும் போக்குவரத்து பகுதிகளில் ரோந்துப் பணி தீவிரம்",
    summary_en: "Patrol force density increased around women colleges and transit zones to ensure secure commutes for women.",
    summary_ta: "பெண்களின் பாதுகாப்பான பயணத்தை உறுதி செய்வதற்காக பெண்கள் கல்லூரிகள் மற்றும் முக்கிய போக்குவரத்துப் பகுதிகளில் ரோந்து வாகனங்களின் அடர்த்தி அதிகரிக்கப்பட்டுள்ளது.",
    content_en: [
      "Greater Chennai Police has increased the presence of patrol units, including Pink Patrol vehicles, near women's colleges, IT corridors, and major transit stations.",
      "This deployment is intended to prevent instances of eve-teasing, harassment, and to ensure emergency help is always within minutes of reach.",
      "Women are encouraged to download the Kaaval Uthavi app and report any security concerns directly to the dispatch team.",
      "Local wardens are also integrated into the reporting network to keep areas surrounding campuses safe."
    ],
    content_ta: [
      "சென்னை பெருநகர காவல்துறை பெண்கள் கல்லூரிகள், ஐடி காரிடார்கள் மற்றும் முக்கிய போக்குவரத்து நிலையங்களுக்கு அருகில் பிங்க் ரோந்து (Pink Patrol) வாகனங்கள் உள்ளிட்ட ரோந்துப் பிரிவுகளின் எண்ணிக்கையை அதிகரித்துள்ளது.",
      "பெண்களுக்கு எதிரான வம்புகள், துன்புறுத்தல்களைத் தடுக்கவும், அவசர உதவி எப்போதும் சில நிமிடங்களில் கிடைப்பதை உறுதி செய்யவும் இந்த ரோந்துகள் தீவிரப்படுத்தப்பட்டுள்ளன.",
      "பெண்கள் 'காவல் உதவி' (Kaaval Uthavi) செயலியைப் பதிவிறக்கம் செய்து தங்களின் பாதுகாப்புப் புகார்களை நேரடியாகத் தெரிவிக்க ஊக்குவிக்கப்படுகிறார்கள்.",
      "வளாகங்களைச் சுற்றியுள்ள பகுதிகளைப் பாதுகாப்பாக வைத்திருக்க உள்ளூர் கண்காணிப்பாளர்களும் இந்த பாதுகாப்பு நெட்வொர்க்கில் ஒருங்கிணைக்கப்பட்டுள்ளனர்."
    ],
    image: "/images/night_patrol.png",
    gallery: ["/images/night_patrol.png", "/images/singapen_special_force.png"],
    date: "June 08, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Pink Patrol", "Womens Safety", "Collegiate Security", "Kaaval Uthavi"],
    tags_ta: ["பிங்க் ரோந்து", "பெண்கள் பாதுகாப்பு", "கல்லூரி பாதுகாப்பு", "காவல் உதவி"],
    section: "latest",
    highlights_en: [
      "Increased patrols in high-risk zones, colleges, and transit points.",
      "Coordination with Pink Patrol vehicles for immediate response.",
      "Kaaval Uthavi App promoted for instant location sharing."
    ],
    highlights_ta: [
      "அதிக ஆபத்துள்ள பகுதிகள், கல்லூரிகள் மற்றும் போக்குவரத்து நிலையங்களில் ரோந்து அதிகரிப்பு.",
      "உடனடி பதிலுக்காக பிங்க் ரோந்து வாகனங்களுடன் ஒருங்கிணைப்பு.",
      "உடனடி இருப்பிடப் பகிர்வுக்காக காவல் உதவி செயலி மேம்படுத்தப்பட்டது."
    ],
    lastUpdated: "June 08, 2026, 11:00 AM"
  },
  {
    id: 15,
    slug: "singappen-awareness-initiative",
    category_en: "Women's Safety",
    category_ta: "பெண்கள் பாதுகாப்பு",
    title_en: "Singapen Women's Safety Awareness Initiative",
    title_ta: "சிங்கப்பெண் பெண்கள் பாதுகாப்பு விழிப்புணர்வு முயற்சி",
    summary_en: "Singapen.com is an independent women's safety awareness and educational platform. In emergencies, citizens should contact official government emergency services.",
    summary_ta: "சிங்கப்பெண் விழிப்புணர்வு தளம் ஒரு தன்னாட்சிப் பெண்கள் பாதுகாப்பு மற்றும் கல்வி அமைப்பாகும். அவசர காலங்களில் குடிமக்கள் அதிகாரப்பூர்வ அரசு சேவைகளைத் தொடர்பு கொள்ள வேண்டும்.",
    content_en: [
      "The Singapen Women's Safety Initiative represents a collaborative effort to raise awareness on personal safety, digital security, and legal remedies available for women.",
      "The platform offers self-defense resources, educational programs, and contact directories for public welfare agencies.",
      "Greater Chennai Police continues to support social safety programs, advising citizens to leverage formal hotlines such as 1091 or 112 for urgent emergency responses.",
      "The initiative will host training capsules in schools and residential blocks to build self-reliance."
    ],
    content_ta: [
      "சிங்கப்பெண் பெண்கள் பாதுகாப்பு முயற்சி என்பது பெண்களுக்கான தனிப்பட்ட பாதுகாப்பு, டிஜிட்டல் பாதுகாப்பு மற்றும் சட்ட ரீதியான தீர்வுகள் குறித்த விழிப்புணர்வை ஏற்படுத்துவதற்கான ஒரு கூட்டு முயற்சியாகும்.",
      "இத்தளம் தற்காப்புப் பயிற்சிப் பொருட்கள், கல்வித் திட்டங்கள் மற்றும் பொது நல அமைப்புகளுக்கான தொடர்பு எண்களை வழங்குகிறது.",
      "சென்னை பெருநகர காவல்துறை சமூகப் பாதுகாப்புத் திட்டங்களைத் தொடர்ந்து ஆதரித்து வருகிறது, அவசர உதவிகளுக்கு 1091 அல்லது 112 போன்ற முறையான ஹாட்லைன்களைப் பயன்படுத்துமாறு அறிவுறுத்துகிறது.",
      "இந்தத் திட்டத்தின் கீழ் தற்சார்பை உருவாக்கப் பள்ளிகள் மற்றும் குடியிருப்புப் பகுதிகளில் பயிற்சி முகாம்கள் நடத்தப்படும்."
    ],
    image: "/images/singapen_special_force.png",
    gallery: ["/images/singapen_special_force.png", "/images/singappen_ssf_poster.png"],
    date: "June 16, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Singappen Initiative", "Awareness Drive", "Womens Safety", "Emergency Support"],
    tags_ta: ["சிங்கப்பெண் விழிப்புணர்வு", "பாதுகாப்புப் பிரச்சாரம்", "பெண்கள் பாதுகாப்பு", "அவசர உதவி"],
    section: "press",
    highlights_en: [
      "Independent educational resource for women's self-protection.",
      "Public workshops scheduled on safety strategies and local law resources.",
      "Emergency helpline numbers 1091 and 112 highlighted."
    ],
    highlights_ta: [
      "பெண்கள் தற்காப்புக்கான தன்னாட்சி கல்வித் திட்டம்.",
      "பாதுகாப்பு உத்திகள் மற்றும் உள்ளூர் சட்ட வளங்கள் குறித்து பொதுப் பயிலரங்குகள்.",
      "அவசர உதவி எண்கள் 1091 மற்றும் 112 முன்னிலைப்படுத்தப்பட்டன."
    ],
    lastUpdated: "June 16, 2026, 10:00 AM"
  },
  {
    id: 16,
    slug: "nepalese-national-arrested-harassment",
    category_en: "Crime Prevention",
    category_ta: "குற்றத் தடுப்பு",
    title_en: "Nepalese national arrested for sexually harassing a woman while she was asleep at her residence.",
    title_ta: "வீட்டில் தூங்கிக்கொண்டிருந்த பெண்ணிடம் பாலியல் சீண்டலில் ஈடுபட்ட நேபாள நபர் கைது",
    summary_en: "A Nepalese national was arrested for sexually harassing a woman while she was asleep at her residence.",
    summary_ta: "கோயம்பேடு (CMBT) பகுதியில் வீட்டில் தூங்கிக்கொண்டிருந்த பெண்ணிடம் தவறாக நடக்க முயன்ற நேபாள நாட்டைச் சேர்ந்த நபர் ஒருவரைச் சென்னை போலீஸார் கைது செய்தனர்.",
    content_en: [
      "The Chennai Police arrested a Nepalese national working in the city on charges of breaking into a residence and attempting to harass a woman in the CMBT area.",
      "Local patrol units responded immediately to the victim's distress call, apprehending the suspect within the vicinity. He has been remanded to judicial custody under relevant sections of the BNS.",
      "Security guidelines have been re-issued to residential complexes to verify employee backgrounds and maintain lock controls."
    ],
    content_ta: [
      "கோயம்பேடு பகுதியில் வீட்டுக்குள் புகுந்து பெண்ணுக்குத் தொல்லை கொடுக்க முயன்றதாக நகரில் பணிபுரியும் நேபாள நாட்டைச் சேர்ந்த நபரைச் சென்னை போலீஸார் கைது செய்தனர்.",
      "பாதிக்கப்பட்ட பெண்ணின் அவசர அழைப்புக்கு உள்ளூர் ரோந்துப் பிரிவினர் உடனடியாகப் பதிலளித்து, சந்தேக நபரை அருகில் வைத்துப் பிடித்தனர். அவர் நீதிமன்றக் காவலுக்கு அனுப்பப்பட்டுள்ளார்.",
      "ஊழியர்களின் பின்னணியைச் சரிபார்க்கவும், பூட்டு கட்டுப்பாடுகளைப் பராமரிக்கவும் குடியிருப்பு வளாகங்களுக்குப் பாதுகாப்பு வழிகாட்டுதல்கள் மீண்டும் வழங்கப்பட்டுள்ளன."
    ],
    image: "/images/sexual_harassment_cmbt.jpg",
    gallery: ["/images/sexual_harassment_cmbt.jpg", "/images/painkiller_arrest.png"],
    date: "June 15, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Crime Prevention", "Arrest", "Patrol Response", "Night Security", "CMBT"],
    tags_ta: ["குற்றத் தடுப்பு", "கைது", "ரோந்து நடவடிக்கை", "இரவு பாதுகாப்பு", "கோயம்பேடு"],
    section: "press",
    highlights_en: [
      "Nepalese employee arrested for residential harassment near CMBT.",
      "Rapid patrol units apprehended suspect within minutes.",
      "Background verification guidelines emphasized for residential employees."
    ],
    highlights_ta: [
      "கோயம்பேடு அருகே வீட்டுத் துன்புறுத்தலில் ஈடுபட்ட நேபாள ஊழியர் கைது.",
      "விரைவு ரோந்துப் பிரிவினர் சில நிமிடங்களில் சந்தேக நபரைக் கைது செய்தனர்.",
      "குடியிருப்பு ஊழியர்களுக்குப் பின்னணி சரிபார்ப்பு வழிகாட்டுதல்கள் வலியுறுத்தப்பட்டன."
    ],
    lastUpdated: "June 15, 2026, 05:00 PM"
  },
  {
    id: 17,
    slug: "udhayanidhi-law-order-meeting",
    category_en: "Law and Order",
    category_ta: "சட்டம் ஒழுங்கு",
    title_en: "Udhayanidhi Demands High-Level Police Meeting to Discuss Law and Order in Tamil Nadu",
    title_ta: "தமிழ்நாட்டின் சட்டம் ஒழுங்கு குறித்து விவாதிக்க உயர்மட்ட காவல் கூட்டத்திற்கு உதயநிதி கோரிக்கை",
    summary_en: "Mr. Udhayanidhi Stalin urged the Tamil Nadu Chief Minister to convene a high-level meeting of police officers and issue directions to regional and district-level officers.",
    summary_ta: "தமிழ்நாட்டின் பிராந்திய சட்டம் ஒழுங்கு நிலை குறித்து விவாதிக்க காவல்துறை அதிகாரிகளின் உயர்மட்டக் கூட்டத்தைக் கூட்டுமாறு துணை முதலமைச்சர் திரு. உதயநிதி ஸ்டாலின் கேட்டுக்கொண்டார்.",
    content_en: [
      "Deputy Chief Minister Udhayanidhi Stalin requested a high-level security meeting at the Secretariat to discuss the regional law and order situation in Tamil Nadu.",
      "The review aims to evaluate patrolling protocols, anti-social containment measures, and the implementation of special task forces in sensitive districts.",
      "Senior police leadership presented current statistics, security grids, and action plans to optimize surveillance and public safety administration.",
      "Further guidelines were set to coordinate crime database sharing between district command centers."
    ],
    content_ta: [
      "தமிழ்நாட்டில் சட்டம் ஒழுங்கு நிலை குறித்து விவாதிப்பதற்காகத் தலைமைச் செயலகத்தில் உயர்மட்டப் பாதுகாப்பு ஆலோசனைக் கூட்டத்திற்குத் துணை முதலமைச்சர் உதயநிதி ஸ்டாலின் வேண்டுகோள் விடுத்தார்.",
      "இந்த ஆய்வானது ரோந்து நெறிமுறைகள், சமூக விரோத ஒடுக்குமுறை நடவடிக்கைகள் மற்றும் உணர்திறன் மிக்க மாவட்டங்களில் சிறப்புப் படைகளைச் செயல்படுத்துவதை மதிப்பிடுவதை நோக்கமாகக் கொண்டுள்ளது.",
      "கண்காணிப்பு மற்றும் பொதுப் பாதுகாப்பு நிர்வாகத்தை மேம்படுத்துவதற்கான தற்போதைய புள்ளிவிவரங்கள், பாதுகாப்பு அமைப்புகள் மற்றும் செயல் திட்டங்களை மூத்த காவல்துறைத் தலைமை சமர்ப்பித்தது.",
      "மாவட்டக் கட்டுப்பாட்டு மையங்களுக்கு இடையே குற்றத் தரவுத்தளப் பகிர்வை ஒருங்கிணைக்க கூடுதல் வழிகாட்டுதல்கள் அமைக்கப்பட்டன."
    ],
    image: "/images/udhayanidhi.png",
    gallery: ["/images/udhayanidhi.png", "/images/vijay.png"],
    date: "June 14, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Law and Order", "Secretariat Meeting", "IPS Review", "Tamil Nadu Govt"],
    tags_ta: ["சட்டம் ஒழுங்கு", "தலைமைச் செயலகக் கூட்டம்", "ஐபிஎஸ் ஆய்வு", "தமிழ்நாடு அரசு"],
    section: "event",
    highlights_en: [
      "Law and order high-level review proposed at the Secretariat.",
      "Coordination of district patrol divisions and data sharing reviewed.",
      "Commitment to modernizing surveillance infrastructure reaffirmed."
    ],
    highlights_ta: [
      "தலைமைச் செயலகத்தில் சட்டம் ஒழுங்கு குறித்து உயர்மட்ட ஆய்வு முன்மொழியப்பட்டது.",
      "மாவட்ட ரோந்துப் பிரிவுகளின் ஒருங்கிணைப்பு மற்றும் தரவுப் பகிர்வு ஆய்வு செய்யப்பட்டது.",
      "கண்காணிப்புக் கட்டமைப்பை நவீனமயமாக்குவதற்கான அர்ப்பணிப்பு மீண்டும் உறுதி செய்யப்பட்டது."
    ],
    lastUpdated: "June 14, 2026, 06:00 PM",
    sourceName: "The Hindu",
    sourceUrl: "https://www.thehindu.com/news/national/tamil-nadu/udhayanidhi-stalin-chairs-law-and-order-review-meeting-in-chennai/article68221040.ece"
  },
  {
    id: 18,
    slug: "police-quarters-cleaning",
    category_en: "Clean Campus",
    category_ta: "தூய்மையான வளாகம்",
    title_en: "Clean Campus maintenance ensured in Police Quarters",
    title_ta: "காவலர் குடியிருப்புகளில் 'தூய்மையான வளாகம்' பராமரிப்பு உறுதி",
    summary_en: "As part of the Swachh Bharat clean campus initiative, Greater Chennai Police launched a sanitation drive across all major police quarters housing families of personnel.",
    summary_ta: "சென்னை பெருநகர காவல்துறையின் எல்லைக்குட்பட்ட அனைத்து காவலர் குடியிருப்பு வளாகங்கள் மற்றும் அவற்றின் சுற்றுப்புற பகுதிகளில் தூய்மை பணிகள் மேற்கொள்ளப்பட்டு பராமரிக்கப்பட்டு வருகிறது.",
    content_en: [
      "As part of the Swachh Bharat clean campus initiative, Greater Chennai Police launched a sanitation drive across all major police quarters housing families of personnel.",
      "Staff and families participated in waste sorting, plastic elimination drives, and clearing stagnated water to prevent seasonal outbreaks of vector-borne illnesses.",
      "Commissioner Dr. A. Amalraj IPS commended the coordination and instructed to conduct health audits on a monthly schedule."
    ],
    content_ta: [
      "தூய்மைப் பாரதத் திட்டத்தின் ஒரு பகுதியாக, சென்னை பெருநகர காவல்துறை தங்களது காவலர் குடியிருப்புகள் முழுவதும் சுகாதார விழிப்புணர்வு மற்றும் தூய்மைப் பணிகளைத் தொடங்கியது.",
      "பணியாளர்கள் மற்றும் குடும்பத்தினர் கழிவுகளைப் பிரித்தல், நெகிழி ஒழிப்பு மற்றும் பருவகால நோய்களைத் தடுக்கத் தேங்கியுள்ள தண்ணீரை அகற்றுதல் ஆகியவற்றில் பங்கேற்றனர்.",
      "கூட்டுப் பணியைப் பாராட்டிய ஆணையர் டாக்டர் ஏ.அமல்ராஜ் ஐபிஎஸ், மாதாந்திர அட்டவணையில் சுகாதார தணிக்கைகளை நடத்த உத்தரவிட்டார்."
    ],
    image: "/images/police_quarters_cleaning.jpg",
    gallery: ["/images/police_quarters_cleaning.jpg", "/images/community_outreach.png"],
    date: "June 16, 2026",
    author_en: "Greater Chennai Police Media Desk",
    author_ta: "சென்னை பெருநகர காவல் ஊடகப் பிரிவு",
    tags_en: ["Clean Campus", "Police Quarters", "Sanitation Drive", "Welfare"],
    tags_ta: ["தூய்மையான வளாகம்", "காவலர் குடியிருப்பு", "சுகாதார இயக்கம்", "நலன்"],
    section: "event",
    highlights_en: [
      "Clean Campus campaign launched across all Chennai police quarters.",
      "Families and personnel join in plastic removal and sanitation audits.",
      "Commended by Commissioner for environmental awareness."
    ],
    highlights_ta: [
      "சென்னை காவலர் குடியிருப்புகளில் தூய்மை வளாக பிரச்சாரம் தொடங்கப்பட்டது.",
      "நெகிழி அகற்றம் மற்றும் சுகாதார சோதனைகளில் குடும்பத்தினரும் பணியாளர்களும் இணைந்தனர்.",
      "சுற்றுச்சூழல் விழிப்புணர்வுக்காக ஆணையர் பாராட்டினார்."
    ],
    lastUpdated: "June 16, 2026, 04:00 PM",
    sourceName: "The Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com/city/chennai/police-quarters-cleaning-drive-launched-in-chennai/articleshow/110912401.cms"
  }
];

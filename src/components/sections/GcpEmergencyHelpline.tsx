"use client";

import React from "react";
import { PhoneCall, Mail, AlertTriangle, Shield, HeartPulse, UserCheck, ShieldAlert } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface Helpline {
  number: string;
  label_en: string;
  label_ta: string;
  desc_en: string;
  desc_ta: string;
  icon: React.ReactNode;
  color: string;
}

const helplines: Helpline[] = [
  {
    number: "100",
    label_en: "Police Control Room",
    label_ta: "காவல் கட்டுப்பாட்டு அறை",
    desc_en: "Immediate emergency police assistance citywide.",
    desc_ta: "மாநகரம் முழுவதும் உடனடி அவசர காவல் உதவி.",
    icon: <ShieldAlert className="w-5 h-5" />,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  {
    number: "112",
    label_en: "National Emergency Support",
    label_ta: "தேசிய அவசர உதவி எண்",
    desc_en: "Unified emergency services (Police, Fire, Ambulance).",
    desc_ta: "ஒருங்கிணைந்த அவசர கால சேவைகள் (காவல், தீயணைப்பு, ஆம்புலன்ஸ்).",
    icon: <PhoneCall className="w-5 h-5" />,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  {
    number: "1930",
    label_en: "Cyber Crime Helpline",
    label_ta: "சைபர் குற்றத் தடுப்பு உதவி எண்",
    desc_en: "Report online financial fraud within the golden hour.",
    desc_ta: "ஆன்லைன் நிதி மோசடிகளை உடனடியாகத் தெரிவிக்கவும்.",
    icon: <Shield className="w-5 h-5" />,
    color: "bg-[#c5a059]/10 text-brand-gold border-[#c5a059]/20",
  },
  {
    number: "1091",
    label_en: "Women Helpline Desk",
    label_ta: "பெண்கள் உதவி மையம்",
    desc_en: "Safety assistance & rescue services for women in distress.",
    desc_ta: "பாதிப்பிற்குள்ளாகும் பெண்களுக்கான பாதுகாப்பு உதவி.",
    icon: <UserCheck className="w-5 h-5" />,
    color: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  },
  {
    number: "1098",
    label_en: "Child Helpline Service",
    label_ta: "குழந்தைகள் உதவி மையம்",
    desc_en: "Emergency protection & rescue for children.",
    desc_ta: "குழந்தைகளுக்கான அவசர பாதுகாப்பு மற்றும் மீட்புப் பணிகள்.",
    icon: <HeartPulse className="w-5 h-5" />,
    color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  },
];

interface EmailId {
  id: string;
  dept_en: string;
  dept_ta: string;
  email: string;
  desc_en: string;
  desc_ta: string;
}

const emails: EmailId[] = [
  {
    id: "cop",
    dept_en: "Commissioner of Police Office",
    dept_ta: "காவல் ஆணையர் அலுவலகம்",
    email: "cop@gcp.tn.gov.in",
    desc_en: "Direct communications to the Commissioner's executive desk.",
    desc_ta: "காவல் ஆணையரின் செயலகத்திற்கு நேரடித் தொடர்புகள்.",
  },
  {
    id: "cyber",
    dept_en: "Cyber Crime Investigation Cell",
    dept_ta: "சைபர் குற்றப் புலனாய்வு பிரிவு",
    email: "cybercell@gcp.tn.gov.in",
    desc_en: "Report digital scams, identity theft, and hacking.",
    desc_ta: "டிஜிட்டல் மோசடிகள் மற்றும் அடையாள திருட்டுகளைப் புகாரளிக்க.",
  },
  {
    id: "awps",
    dept_en: "Women & Children Safety Desk",
    dept_ta: "பெண்கள் மற்றும் குழந்தைகள் பாதுகாப்பு",
    email: "awps.safety@gcp.tn.gov.in",
    desc_en: "Grievances regarding domestic issues or children welfare.",
    desc_ta: "குடும்ப பிரச்சனைகள் அல்லது குழந்தைகள் நலன் சார்ந்த புகார்கள்.",
  },
  {
    id: "grievance",
    dept_en: "Public Grievance Redressal Portal",
    dept_ta: "பொது மக்கள் குறைதீர்க்கும் பிரிவு",
    email: "grievance@gcp.tn.gov.in",
    desc_en: "Submit administrative petitions and track resolution progress.",
    desc_ta: "நிர்வாக மனுக்களை சமர்ப்பிக்க மற்றும் தீர்வு நிலையை கண்காணிக்க.",
  },
];

export default function GcpEmergencyHelpline() {
  const { language } = useTranslation();

  return (
    <section id="helplines" className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 p-6 md:p-8 shadow-sm text-left scroll-mt-24">
      <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
        <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
        <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
          {language === "ta" ? "அவசர உதவி மற்றும் மின்னஞ்சல்கள்" : "Emergency Helplines & Contacts"}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Helpline Grid (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-250 flex items-center gap-2">
            <AlertTriangle className="w-4.5 h-4.5 text-brand-maroon" /> {language === "ta" ? "அதிவேக அவசர உதவி எண்கள்" : "High-Priority Emergency Numbers"}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {helplines.map((h) => {
              const label = language === "ta" ? h.label_ta : h.label_en;
              const desc = language === "ta" ? h.desc_ta : h.desc_en;

              return (
                <div
                  key={h.number}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 p-4 rounded-xl flex items-start gap-4 hover:border-brand-maroon/20 transition-colors"
                >
                  <div className={`p-2 rounded-lg shrink-0 border ${h.color}`}>
                    {h.icon}
                  </div>
                  
                  <div className="space-y-1 min-w-0">
                    <p className="font-display font-black text-xl text-stone-900 dark:text-white tracking-tight leading-none">
                      {h.number}
                    </p>
                    <h4 className="font-bold text-xs text-stone-850 dark:text-stone-250 truncate">
                      {label}
                    </h4>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-normal line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3.5 bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-855 rounded-xl text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
            ⚠️ {language === "ta"
              ? "அவசரக் காலங்களில் உடனடியாக 100 அல்லது 112 எண்களைத் தொடர்பு கொள்ளவும். தவறான அழைப்புகளைத் தவிர்க்கவும்."
              : "For immediate safety emergencies, dial 100 or 112. Kindly avoid prank or non-emergency dial-ins."}
          </div>
        </div>

        {/* Right Column: Email IDs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="font-display font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-250 flex items-center gap-2">
            <Mail className="w-4.5 h-4.5 text-[#c5a059]" /> {language === "ta" ? "அதிகாரப்பூர்வ மின்னஞ்சல் முகவரிகள்" : "Official Department Email IDs"}
          </h3>

          <div className="space-y-3.5">
            {emails.map((e) => {
              const dept = language === "ta" ? e.dept_ta : e.dept_en;
              const desc = language === "ta" ? e.desc_ta : e.desc_en;

              return (
                <div
                  key={e.id}
                  className="bg-stone-50 dark:bg-stone-950 border border-stone-200/60 dark:border-stone-850 p-4 rounded-xl space-y-2 hover:border-[#c5a059]/30 transition-colors duration-350"
                >
                  <div>
                    <h4 className="font-extrabold text-xs text-stone-900 dark:text-stone-100">
                      {dept}
                    </h4>
                    <p className="text-[9.5px] text-stone-500 dark:text-stone-450 mt-0.5">
                      {desc}
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-stone-200/50 dark:border-stone-800/40">
                    <a
                      href={`mailto:${e.email}`}
                      className="font-mono text-xs text-brand-blue hover:text-brand-blue-dark dark:text-brand-gold dark:hover:text-brand-gold-light font-bold flex items-center gap-1 w-max"
                    >
                      <Mail className="w-3.5 h-3.5" /> {e.email}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

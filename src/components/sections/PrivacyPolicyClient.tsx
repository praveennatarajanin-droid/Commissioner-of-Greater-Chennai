"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  Server,
  Cookie,
  ExternalLink,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Info
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function PrivacyPolicyClient() {
  const { language } = useTranslation();
  const isTamil = language === "ta";

  // Dynamic policy date
  const lastUpdatedDate = "September 22, 2026";
  const lastUpdatedDateTa = "22 செப்டம்பர் 2026";

  const [activeSection, setActiveSection] = useState<string>("intro");

  const sections = [
    {
      id: "intro",
      number: "1",
      icon: ShieldCheck,
      title_en: "Introduction",
      title_ta: "அறிமுகம்",
      content_en: (
        <div className="space-y-3">
          <p>
            The Greater Chennai Police Commissionerate ("GCP") is committed to protecting the privacy, confidentiality, and security of visitors to this official web portal (<strong>chennaipolice.tn.gov.in</strong> / Chennai Guardian Portal).
          </p>
          <p>
            This Privacy Policy outlines the practices and principles governing the collection, usage, management, and safeguarding of information when you access and use this web portal. As a public service portal of the Government of Tamil Nadu, we operate with transparency, strict administrative accountability, and adherence to applicable digital governance standards.
          </p>
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3">
            <Info className="w-5 h-5 shrink-0 text-[#1e40af] dark:text-blue-400 mt-0.5" />
            <span>
              This portal may collect limited technical information required strictly for cybersecurity defense, performance optimization, accessibility features, and seamless service operation.
            </span>
          </div>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            சென்னை பெருநகர காவல் ஆணையரகம் ("GCP") தனது அதிகாரப்பூர்வ இணையதளத்தை (<strong>chennaipolice.tn.gov.in</strong> / சென்னை கார்டியன் போர்டல்) பார்வையிடும் பயனர்களின் தனியுரிமை மற்றும் தரவுப் பாதுகாப்பைப் பேண உறுதிபூண்டுள்ளது.
          </p>
          <p>
            இக்கொள்கை, எங்கள் இணையதளத்தை அணுகும்போது பெறப்படும் தொழில்நுட்பத் தகவல்களின் பயன்பாடு, பாதுகாப்பு மற்றும் மேலாண்மை நடைமுறைகளை விளக்குகிறது. தமிழ்நாடு அரசின் வழிகாட்டுதல்கள் மற்றும் தகவல் தொழில்நுட்ப விதிமுறைகளின்படி இத்தளம் வெளிப்படைத்தன்மையுடன் நிர்வகிக்கப்படுகிறது.
          </p>
        </div>
      )
    },
    {
      id: "info-collect",
      number: "2",
      icon: Eye,
      title_en: "Information We Collect",
      title_ta: "நாங்கள் சேகரிக்கும் தகவல்கள்",
      content_en: (
        <div className="space-y-3">
          <p>
            We adhere strictly to the principle of data minimization. We do not automatically capture personal information (such as your name, residential address, or personal identifiers) without your explicit knowledge or consent.
          </p>
          <p>
            Information collected via this portal is categorized broadly into:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-[#1e40af]">
            <li><strong>Technical and System Logs:</strong> Non-personally identifiable diagnostic and traffic data generated automatically during your web browser session.</li>
            <li><strong>Visitor-Provided Information:</strong> Voluntary inputs provided when submitting inquiries, service feedback, or accessibility preferences.</li>
          </ul>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            பயனர்களின் அனுமதியின்றி எந்தவொரு தனிப்பட்ட விவரங்களும் (பெயர், முகவரி போன்றவை) தானாக சேகரிக்கப்படுவதில்லை.
          </p>
          <p>
            இணையதளத்தின் சீரான இயக்கம், பாதுகாப்பு தணிக்கை மற்றும் சேவைத் தர மேம்பாட்டிற்கான அடிப்படை தொழில்நுட்பத் தகவல்கள் மட்டுமே தற்காலிகமாகப் பதிவு செய்யப்படுகின்றன.
          </p>
        </div>
      )
    },
    {
      id: "visitor-info",
      number: "3",
      icon: FileText,
      title_en: "Information Provided by Visitors",
      title_ta: "பார்வையாளர்களால் வழங்கப்படும் தகவல்கள்",
      content_en: (
        <div className="space-y-3">
          <p>
            Certain features of the portal—such as feedback forms, helpline queries, and official communication desks—allow visitors to voluntarily provide contact details (such as name, email address, or phone number).
          </p>
          <p>
            Any personal information voluntarily furnished is used solely to respond to your specific inquiry or process your official communication. We do not sell, rent, lease, or trade visitor contact information with commercial entities or unauthorized third parties under any circumstances.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            கருத்து படிவங்கள் அல்லது தொடர்பு பக்கங்கள் மூலம் பார்வையாளர்கள் தாமாக முன்வந்து வழங்கும் தொடர்புத் தகவல்கள், அவர்களின் குறிப்பிட்ட கேள்விகளுக்குப் பதிலளிக்க மட்டுமே பயன்படுத்தப்படும்.
          </p>
          <p>
            எந்தவொரு வணிக நோக்கத்திற்காகவும் பார்வையாளர்களின் தகவல்கள் பகிரப்படவோ அல்லது விற்கப்படவோ மாட்டாது.
          </p>
        </div>
      )
    },
    {
      id: "portal-usage",
      number: "4",
      icon: Server,
      title_en: "Portal Usage Information",
      title_ta: "இணையதளப் பயன்பாட்டுத் தகவல்கள்",
      content_en: (
        <div className="space-y-3">
          <p>
            When you browse, read pages, or access public safety advisories on this web portal, our web hosting servers automatically record standard anonymous HTTP server access logs. This data includes:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-[#1e40af]">
            <li>Internet Protocol (IP) address of the requesting network device</li>
            <li>Date, time, and duration of the portal visit</li>
            <li>Web pages accessed and documents viewed</li>
            <li>Operating system and web browser type/version</li>
            <li>Referring website address or search engine queries</li>
          </ul>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            These logs are analyzed in the aggregate to evaluate portal traffic patterns, troubleshoot technical latency, and protect the server infrastructure against malicious cyber intrusions or Denial of Service (DoS) attempts.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            இணையதளத்தை அணுகும்போது கணினி நெட்வொர்க் முகவரி (IP Address), வருகை நேரம், பார்வையிடப்பட்ட பக்கங்கள் மற்றும் உலாவி வகை போன்ற அடிப்படை சர்வர் பதிவுகள் தானாகப் பதிவு செய்யப்படுகின்றன.
          </p>
          <p>
            இப்பதிவுகள் இணையதளத்தின் பாதுகாப்பு மற்றும் சர்வர் திறன் மேம்பாட்டிற்காக மட்டுமே ஒருங்கிணைந்த முறையில் ஆராயப்படுகின்றன.
          </p>
        </div>
      )
    },
    {
      id: "cookies",
      number: "5",
      icon: Cookie,
      title_en: "Cookies and Similar Technologies",
      title_ta: "குக்கீகள் மற்றும் தொடர்புடைய தொழில்நுட்பங்கள்",
      content_en: (
        <div className="space-y-3">
          <p>
            A cookie is a small data file transferred to your browser to maintain state across pages. This web portal utilizes essential, non-invasive session cookies and client storage strictly to:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-[#1e40af]">
            <li>Preserve user accessibility preferences (such as high-contrast mode and text-scaling factors)</li>
            <li>Retain language selection (English or Tamil) throughout your session</li>
            <li>Maintain authorized administrative sessions for privileged console access</li>
          </ul>
          <p>
            We do NOT use third-party commercial advertising cookies, cross-site trackers, or behavioral profiling mechanisms. You may choose to disable cookies in your browser settings; core informational content will remain accessible.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            மொழித் தேர்வு (தமிழ்/ஆங்கிலம்) மற்றும் அணுகல்தன்மை விருப்பங்கள் (எழுத்து அளவு, உயர்தர மாறுபாடு) போன்ற பயனர் அமைப்புகளை நினைவில் வைத்திருக்க மட்டுமே அத்தியாவசிய குக்கீகள் பயன்படுகின்றன.
          </p>
          <p>
            வணிக ரீதியான அல்லது விளம்பரக் குக்கீகள் இத்தளத்தில் பயன்படுத்தப்படுவதில்லை.
          </p>
        </div>
      )
    },
    {
      id: "use-of-info",
      number: "6",
      icon: CheckCircle2,
      title_en: "Use of Information",
      title_ta: "தகவல்களின் பயன்பாடு",
      content_en: (
        <div className="space-y-3">
          <p>
            Information collected through the portal is utilized exclusively for legitimate public governance objectives:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-[#1e40af]">
            <li>Delivering public safety bulletins, traffic advisories, and police updates</li>
            <li>Ensuring technical stability, uptime, and accessibility compliance</li>
            <li>Responding directly to citizen queries or feedback submitted through official channels</li>
            <li>Conducting mandatory government cybersecurity audits and threat mitigations</li>
          </ul>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            சேகரிக்கப்படும் தகவல்கள் பொதுப் பாதுகாப்பு செய்திகளை வழங்குதல், குடிமக்கள் கேள்விகளுக்குப் பதிலளித்தல் மற்றும் இணையதளத்தின் பாதுகாப்பை உறுதிப்படுத்துதல் ஆகியவற்றிற்காக மட்டுமே பயன்படுத்தப்படுகின்றன.
          </p>
        </div>
      )
    },
    {
      id: "third-party",
      number: "7",
      icon: ExternalLink,
      title_en: "External / Third-Party Links",
      title_ta: "வெளிப்புற மற்றும் மூன்றாம் தரப்பு இணைப்புகள்",
      content_en: (
        <div className="space-y-3">
          <p>
            This portal contains hyperlinks pointing to external websites and statutory portals (including Tamil Nadu State Portal, National Cyber Crime Portal, e-Challan payment systems, and official social media profiles).
          </p>
          <p>
            Once you navigate away from the Greater Chennai Police web portal via an external link, you become subject to the terms of service and privacy policies of the destination website. The Greater Chennai Police is not responsible for the privacy practices, content, or cybersecurity posture of external web entities.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            இத்தளத்தில் தமிழ்நாடு அரசு இணையதளங்கள், தேசிய இணையக் குற்ற போர்டல் மற்றும் இதர வெளி இணைப்புகள் வழங்கப்பட்டுள்ளன.
          </p>
          <p>
            பயனர்கள் வெளி இணைப்புகளை அணுகும்போது, அந்தந்த தளங்களின் தனியுரிமைக் கொள்கைகளே பொருந்தும். வெளி இணையதளங்களின் செயல்பாட்டிற்கு சென்னை பெருநகர காவல் பொறுப்பேற்காது.
          </p>
        </div>
      )
    },
    {
      id: "security",
      number: "8",
      icon: Lock,
      title_en: "Security",
      title_ta: "தரவுப் பாதுகாப்பு",
      content_en: (
        <div className="space-y-3">
          <p>
            The Greater Chennai Police implements rigorous multi-layered technical, administrative, and physical safeguards to protect information against unauthorized access, alteration, disclosure, or destruction. Security measures include:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 marker:text-[#1e40af]">
            <li>Industry-standard TLS 1.3 encryption across all web sessions</li>
            <li>Web Application Firewall (WAF) and automated rate limiting</li>
            <li>Role-based server authorization and cryptographic session signing</li>
            <li>Strict input sanitization to prevent Cross-Site Scripting (XSS) and injection threats</li>
          </ul>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            இணையதளத்தின் பாதுகாப்பு நவீன TLS குறியாக்கம், பயர்வால் அமைப்புகள் மற்றும் கடுமையான அணுகல் கட்டுப்பாடுகள் மூலம் உறுதி செய்யப்பட்டுள்ளது.
          </p>
        </div>
      )
    },
    {
      id: "citizen-services",
      number: "9",
      icon: ShieldCheck,
      title_en: "Citizen Services and External Services",
      title_ta: "குடிமக்கள் சேவைகள் மற்றும் வெளிப்புற சேவைகள்",
      content_en: (
        <div className="space-y-3">
          <p>
            Certain citizen services accessible through our directory (e.g., online FIR status tracking, verification portals, or traffic fine settlements) are hosted and processed on designated state government servers or specialized departmental backends.
          </p>
          <p>
            When transacting on integrated government gateways, data is processed in accordance with the specific statutory rules and privacy mandates governing those individual public services.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            குடிமக்கள் சேவைகள் (ஆன்லைன் புகார், சரிபார்ப்பு சேவைகள் போன்றவை) அந்தந்த துறை சார்ந்த அரசு சர்வர்களில் பாதுகாப்பாக செயலாக்கப்படுகின்றன.
          </p>
        </div>
      )
    },
    {
      id: "data-retention",
      number: "10",
      icon: Clock,
      title_en: "Data Retention",
      title_ta: "தரவு தக்கவைப்பு",
      content_en: (
        <div className="space-y-3">
          <p>
            Technical server logs are retained strictly for the duration necessary to satisfy security monitoring, statistical aggregation, and statutory compliance under the Information Technology Act of India.
          </p>
          <p>
            Once the retention threshold expires, raw diagnostic logs are permanently purged or anonymized.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            தொழில்நுட்ப பதிவுகள் மற்றும் கணினி லாக்கள் சட்டப்பூர்வ தேவைகளுக்கு ஏற்ப குறிப்பிட்ட காலத்திற்கு மட்டுமே பராமரிக்கப்பட்டு, பின்னர் பாதுகாப்பாக நீக்கப்படும்.
          </p>
        </div>
      )
    },
    {
      id: "privacy-updates",
      number: "11",
      icon: RefreshCw,
      title_en: "Privacy Updates",
      title_ta: "தனியுரிமைக் கொள்கை மாற்றங்கள்",
      content_en: (
        <div className="space-y-3">
          <p>
            The Greater Chennai Police reserves the right to revise or amend this Privacy Policy periodically to reflect technological advancements, legal developments, or enhanced administrative workflows.
          </p>
          <p>
            Any modifications will be promptly posted on this page with an updated revision date. Visitors are encouraged to review this page periodically to remain informed of our privacy protections.
          </p>
        </div>
      ),
      content_ta: (
        <div className="space-y-3">
          <p>
            தொழில்நுட்ப மற்றும் நிர்வாக தேவைகளுக்கேற்ப இத்தனியுரிமைக் கொள்கை அவ்வப்போது புதுப்பிக்கப்படலாம். மாற்றங்கள் இப்பக்கத்தில் தெளிவாகக் குறிப்பிடப்படும்.
          </p>
        </div>
      )
    },
    {
      id: "contact",
      number: "12",
      icon: Mail,
      title_en: "Contact Information",
      title_ta: "தொடர்பு விவரங்கள்",
      content_en: (
        <div className="space-y-4">
          <p>
            For questions, clarifications, or feedback regarding this Privacy Policy or web portal governance, please reach out through our official communication channels:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1">
              <div className="flex items-center gap-2 text-[#1e40af] dark:text-brand-gold font-bold text-xs uppercase">
                <MapPin className="w-4 h-4" />
                <span>Headquarters</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300 font-medium leading-relaxed">
                Office of the Commissioner of Police,<br />
                Greater Chennai Police,<br />
                No. 132, Commissioner Office Building, EVK Sampath Road, Vepery, Chennai – 600 007.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2">
              <div className="flex items-center gap-2 text-[#1e40af] dark:text-brand-gold font-bold text-xs uppercase">
                <Mail className="w-4 h-4" />
                <span>Electronic Contact</span>
              </div>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                <strong>Email:</strong> cop@gcp.tn.gov.in
              </p>
              <p className="text-xs text-stone-700 dark:text-stone-300">
                <strong>Control Room:</strong> 044-23452300 / 100 / 112
              </p>
            </div>
          </div>
        </div>
      ),
      content_ta: (
        <div className="space-y-4">
          <p>
            இத்தனியுரிமைக் கொள்கை தொடர்பான கேள்விகள் அல்லது சந்தேகங்களுக்கு எங்களை பின்வரும் முகவரியில் தொடர்பு கொள்ளலாம்:
          </p>
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-2 text-xs">
            <p className="font-bold text-stone-900 dark:text-stone-100">காவல் ஆணையர் அலுவலகம், சென்னை பெருநகர காவல்,</p>
            <p className="text-stone-600 dark:text-stone-300">எண். 132, ஈ.வி.கே. சம்பத் சாலை, வேப்பேரி, சென்னை – 600 007.</p>
            <p className="text-stone-600 dark:text-stone-300">மின்னஞ்சல்: cop@gcp.tn.gov.in | தொலைபேசி: 044-23452300</p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-[1150px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* ── Breadcrumbs ── */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
          <li>
            <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-gold transition">
              {isTamil ? "முகப்பு" : "Home"}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-stone-800 dark:text-stone-200 font-black" aria-current="page">
            {isTamil ? "தனியுரிமைக் கொள்கை" : "Privacy Policy"}
          </li>
        </ol>
      </nav>

      {/* ── Page Header ── */}
      <header className="text-center max-w-3xl mx-auto space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[#1e40af] dark:text-blue-300 text-xs font-black uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>{isTamil ? "அதிகாரப்பூர்வ கொள்கை" : "Official Government Policy"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-display uppercase">
          {isTamil ? "தனியுரிமைக் கொள்கை" : "PRIVACY POLICY"}
        </h1>
        <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
          {isTamil ? "கடைசியாக புதுப்பிக்கப்பட்டது:" : "Last Updated:"}{" "}
          <span className="text-[#1e40af] dark:text-brand-gold font-mono font-bold">
            {isTamil ? lastUpdatedDateTa : lastUpdatedDate}
          </span>
        </p>
      </header>

      {/* ── Main Layout: Table of Contents + Content Blocks ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Navigation Sidebar */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="sticky top-28 bg-white dark:bg-stone-900 rounded-2xl p-5 border border-slate-200 dark:border-stone-800 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-stone-500 pb-2 border-b border-slate-100 dark:border-stone-800">
              {isTamil ? "பிரிவுகளின் பட்டியல்" : "Table of Contents"}
            </h3>
            <nav className="space-y-1 text-xs">
              {sections.map((sec) => {
                const isCurrent = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#section-${sec.id}`}
                    onClick={() => setActiveSection(sec.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-bold transition duration-150 ${
                      isCurrent
                        ? "bg-[#1e40af] text-white shadow-xs"
                        : "text-slate-600 dark:text-stone-300 hover:bg-slate-100 dark:hover:bg-stone-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span className="truncate pr-2">
                      {sec.number}. {isTamil ? sec.title_ta : sec.title_en}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Policy Content Sections */}
        <main className="lg:col-span-8 space-y-6">
          {sections.map((sec) => {
            const IconComp = sec.icon;
            return (
              <section
                key={sec.id}
                id={`section-${sec.id}`}
                className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-stone-800 shadow-xs space-y-4 scroll-mt-28 transition-all hover:border-slate-300 dark:hover:border-stone-700"
              >
                {/* Section Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-stone-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#1e40af] dark:text-blue-300 shrink-0">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase text-brand-maroon dark:text-brand-gold tracking-widest block">
                      Section {sec.number}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight font-display">
                      {isTamil ? sec.title_ta : sec.title_en}
                    </h2>
                  </div>
                </div>

                {/* Section Body */}
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  {isTamil ? sec.content_ta : sec.content_en}
                </div>
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

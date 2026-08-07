"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Landmark, Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface FooterProps {
  customProfile?: { phone?: string; email?: string; office_address_en?: string; office_address_ta?: string };
}

export default function Footer({ customProfile }: FooterProps = {}) {
  const { t, language } = useTranslation();
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/crud/config")
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data && data.footer_config) {
          setConfig(data.footer_config);
        }
      })
      .catch((err) => console.warn("Failed to load footer config:", err));
  }, []);

  if (config && config.footer_visible === false) {
    return null;
  }

  const phone = config?.phone || customProfile?.phone || "044-23452300 (Office)";
  const email = config?.email || customProfile?.email || "cop@gcp.tn.gov.in";
  
  const addressVal = config 
    ? (language === "ta" ? config.address_ta : config.address_en) 
    : (customProfile 
        ? (language === "ta" ? customProfile.office_address_ta : customProfile.office_address_en) 
        : null);

  const websiteName = config
    ? (language === "ta" ? config.website_name_ta : config.website_name_en)
    : (language === "ta" ? "சென்னை கார்டியன் செய்திகள்" : "CHENNAI GUARDIAN NEWS");

  const description = config
    ? (language === "ta" ? config.description_ta : config.description_en)
    : (language === "ta"
        ? "சென்னையின் முன்னணி சட்டம் ஒழுங்கு, குற்றப் புலனாய்வு மற்றும் மக்கள் விழிப்புணர்வு செய்திகளை உடனுக்குடன் வழங்கும் அதிகாரப்பூர்வ செய்தி ஊடகம்."
        : "Official news platform of Chennai Guardian News, providing 24/7 updates on public safety, cyber alerts, and community-centered policing initiatives.");

  const googleMapLink = config?.google_map_link || "https://maps.google.com/?q=Greater+Chennai+Police+Commissioner+Office+Vepery";
  
  const copyrightText = config
    ? (language === "ta" ? config.copyright_text_ta : config.copyright_text_en)
    : (language === "ta" ? "© 2026 Chennai Guardian. All Rights Reserved." : "© 2026 Chennai Guardian. All Rights Reserved.");

  const developerCredit = config
    ? (language === "ta" ? config.developer_credit_ta : config.developer_credit_en)
    : (language === "ta" ? "சென்னை பெருநகர காவல் ஊடகக் குழுவால் உருவாக்கப்பட்டது" : "Designed & Developed by MCC MRF Innovation Park");

  // Fallback Quick Links
  const finalQuickLinks = config?.quick_links && config.quick_links.length > 0
    ? config.quick_links.filter((l: any) => l.active)
    : [
        { id: "ql1", label_en: "Home", label_ta: "முகப்பு", url: "/" },
        { id: "ql2", label_en: "Crime News", label_ta: "குற்றம்", url: "/category/crime" },
        { id: "ql3", label_en: "Cyber Safety", label_ta: "இணைய பாதுகாப்பு", url: "/category/cyber-safety" },
        { id: "ql4", label_en: "Women Safety", label_ta: "பெண்கள் பாதுகாப்பு", url: "/category/women-safety" },
        { id: "ql5", label_en: "About Us", label_ta: "எங்களைப் பற்றி", url: "/about" },
        { id: "ql6", label_en: "Achievements", label_ta: "சாதனைகள்", url: "/achievements" },
        { id: "ql7", label_en: "Police Stations", label_ta: "காவல் நிலையங்கள்", url: "/stations" }
      ];

  // Fallback Gov Links
  const finalGovLinks = config?.government_links && config.government_links.length > 0
    ? config.government_links.filter((l: any) => l.active)
    : [
        { id: "gl1", label_en: "Tamil Nadu Government", label_ta: "தமிழ்நாடு அரசு", url: "https://www.tn.gov.in", target_blank: true },
        { id: "gl2", label_en: "GCP Official Site", label_ta: "சென்னை காவல்துறை", url: "https://www.chennaipolice.gov.in", target_blank: true },
        { id: "gl3", label_en: "Cyber Portal", label_ta: "இணைய குற்றவியல் போர்டல்", url: "https://www.cybercrime.gov.in", target_blank: true }
      ];

  const customStyles = {
    backgroundColor: config?.background_color || undefined,
    color: config?.text_color || undefined,
  };

  return (
    <footer 
      className="bg-[#1e40af] text-white/85 pt-16 pb-8 border-t-4 border-brand-gold print:bg-white print:text-slate-900 print:border-t print:border-stone-300 print:pt-6 print:pb-4 transition-colors duration-300"
      style={customStyles}
    >
      <div className="max-w-[1700px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 gap-12 mb-12">
        
        {/* Col 1: Brand details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 bg-white rounded-full p-0.5 border border-brand-gold/30">
              <Image
                src={config?.logo || "/images/gcp_logo.png"}
                alt="Greater Chennai Police Logo"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div>
              <span className="font-display font-black tracking-wider text-lg text-white uppercase block leading-tight">
                {websiteName}
              </span>
              <span className="text-xs tracking-widest uppercase font-bold text-brand-gold block mt-0.5">
                {language === "ta" ? "24/7 தமிழ் செய்தித் தொலைக்காட்சி" : "24/7 News Network"}
              </span>
            </div>
          </div>
          <p className="text-sm text-white/70 font-normal leading-relaxed">
            {description}
          </p>
          <div className="flex items-center gap-2 text-xs uppercase font-black text-brand-gold tracking-wider">
            <Globe className="w-3.5 h-3.5" /> {language === "ta" ? "தமிழ்நாடு செய்தி வலையமைப்பு" : "Tamil Nadu News Network"}
          </div>
        </div>

        {/* Col 2: Directory index */}
        <div className="space-y-4 print:hidden">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">
            {language === "ta" ? "செய்தி பிரிவுகள்" : "News Sections"}
          </h4>
          <ul className="space-y-2.5 text-sm font-normal text-white/80">
            {finalQuickLinks.map((link: any, idx: number) => (
              <li key={idx}>
                <Link 
                  href={link.url} 
                  target={link.target_blank ? "_blank" : undefined}
                  className="hover:text-brand-gold transition"
                >
                  {language === "ta" ? (link.label_ta || link.label_en) : (link.label_en || link.label_ta)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Contact Directory */}
        <div className="space-y-4">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">
            {t("footer.contactDir")}
          </h4>
          <ul className="space-y-4 text-sm font-normal text-white/80">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4.5 h-4.5 text-brand-gold shrink-0 mt-0.5" />
              <span className="text-white/75 leading-relaxed">
                {addressVal ? addressVal : (
                  <>
                    {t("footer.commOffice")},<br />
                    {t("footer.gcp")},<br />
                    {t("footer.veperyAddress")}
                  </>
                )}
              </span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4.5 h-4.5 text-brand-gold shrink-0" />
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-white/75 hover:text-brand-gold transition">
                {phone}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-brand-gold shrink-0" />
              <a href={`mailto:${email}`} className="text-white/75 hover:text-brand-gold transition">
                {email}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-brand-gold shrink-0" />
              <a href="mailto:gcp.itdepartment@gmail.com" className="text-white/75 hover:text-brand-gold transition">
                gcp.itdepartment@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Col 4: Location Map Placeholder */}
        <div className="space-y-4 print:hidden">
          <h4 className="font-display font-black text-sm uppercase tracking-widest text-white border-b border-white/10 pb-2">
            {t("footer.location")}
          </h4>
          <div className="rounded-xl overflow-hidden border border-white/15 bg-white/5 p-3.5 space-y-3 shadow-sm hover:border-brand-gold/30 transition-all duration-300">
            {/* Headquarters Image */}
            <div className="relative w-full h-[120px] rounded-lg overflow-hidden bg-stone-900 border border-white/10">
              <Image
                src="/images/gcp_headquarters.png"
                alt="Greater Chennai Police Commissioner Office Headquarters"
                fill
                sizes="(max-w-768px) 100vw, 250px"
                className="object-cover object-center"
                priority={true}
              />
            </div>
            
            {/* Address Details */}
            <div className="space-y-2 text-xs font-normal">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div className="text-white/85 leading-relaxed">
                  <p className="font-bold text-white">{t("footer.commOffice")}</p>
                  <p className="font-medium text-white/90">{t("footer.gcp")}</p>
                  <p className="text-white/80">{t("footer.veperyAddress")}</p>
                </div>
              </div>
              
              {/* View on Map Link */}
              <div className="pt-1 pl-6">
                <a 
                  href={googleMapLink}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1 text-[11px] font-black text-brand-gold uppercase tracking-wider hover:text-white transition"
                >
                  {t("footer.viewOnMap")} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── State Gateways: centered single row ── */}
      <div className="max-w-[1700px] mx-auto px-6 py-5 border-t border-white/10 print:hidden">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-white/70 text-xs uppercase font-black tracking-widest">
          {finalGovLinks.map((link: any, idx: number) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-white/25 select-none hidden sm:inline">|</span>}
              <a
                href={link.url}
                target={link.target_blank ? "_blank" : undefined}
                className="hover:text-brand-gold transition-colors duration-200 flex items-center gap-1.5"
              >
                {language === "ta" ? (link.label_ta || link.label_en) : (link.label_en || link.label_ta)}{" "}
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Copyright & Designer Credit: centered ── */}
      <div className="max-w-[1700px] mx-auto px-6 pt-5 pb-2 border-t border-white/10 flex flex-col items-center gap-2 text-center">
        <div className="text-xs font-bold tracking-wider space-y-1">
          {(developerCredit || "").split("\n").map((line: string, i: number) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        <p className="text-white/55 text-sm font-normal mt-1">
          {copyrightText}
        </p>
      </div>
    </footer>
  );
}

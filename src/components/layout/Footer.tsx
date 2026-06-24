"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Landmark, Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface FooterProps {
  customProfile?: { phone?: string; email?: string; office_address_en?: string; office_address_ta?: string };
}

export default function Footer({ customProfile }: FooterProps = {}) {
  const { t, language } = useTranslation();

  const phone = customProfile?.phone || "044-23452300 (Office)";
  const email = customProfile?.email || "cop@gcp.tn.gov.in";
  const address = customProfile 
    ? (language === "ta" ? customProfile.office_address_ta : customProfile.office_address_en) 
    : null;

  return (
    <footer className="bg-brand-blue text-white/85 pt-16 pb-8 border-t-4 border-brand-gold print:bg-white print:text-slate-900 print:border-t print:border-stone-300 print:pt-6 print:pb-4">
      <div className="max-w-[1700px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 gap-12 mb-12">
        
        {/* Col 1: Brand details */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 shrink-0 bg-white rounded-full p-0.5 border border-brand-gold/30">
              <Image
                src="/images/gcp_logo.png"
                alt="Greater Chennai Police Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-display font-black tracking-wider text-lg text-white uppercase block leading-tight">
                {language === "ta" ? "சென்னை கார்டியன் செய்திகள்" : "CHENNAI GUARDIAN NEWS"}
              </span>
              <span className="text-xs tracking-widest uppercase font-bold text-brand-gold block mt-0.5">
                {language === "ta" ? "24/7 தமிழ் செய்தித் தொலைக்காட்சி" : "24/7 News Network"}
              </span>
            </div>
          </div>
          <p className="text-sm text-white/70 font-normal leading-relaxed">
            {language === "ta"
              ? "சென்னையின் முன்னணி சட்டம் ஒழுங்கு, குற்றப் புலனாய்வு மற்றும் மக்கள் விழிப்புணர்வு செய்திகளை உடனுக்குடன் வழங்கும் அதிகாரப்பூர்வ செய்தி ஊடகம்."
              : "Official news platform of Chennai Guardian News, providing 24/7 updates on public safety, cyber alerts, and community-centered policing initiatives."}
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
            <li>
              <Link href="/" className="hover:text-brand-gold transition">{language === "ta" ? "முகப்பு" : "Home"}</Link>
            </li>
            <li>
              <Link href="/category/crime" className="hover:text-brand-gold transition">{language === "ta" ? "குற்றம்" : "Crime News"}</Link>
            </li>
            <li>
              <Link href="/category/cyber-safety" className="hover:text-brand-gold transition">{language === "ta" ? "இணைய பாதுகாப்பு" : "Cyber Safety"}</Link>
            </li>
            <li>
              <Link href="/category/women-safety" className="hover:text-brand-gold transition">{language === "ta" ? "பெண்கள் பாதுகாப்பு" : "Women Safety"}</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-brand-gold transition">{language === "ta" ? "எங்களைப் பற்றி" : "About Us"}</Link>
            </li>
            <li>
              <Link href="/achievements" className="hover:text-brand-gold transition">{language === "ta" ? "சாதனைகள்" : "Achievements"}</Link>
            </li>
            <li>
              <Link href="/citizen-outreach" className="hover:text-brand-gold transition">{language === "ta" ? "மனுக்கள்" : "Citizen Outreach"}</Link>
            </li>
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
                {address ? address : (
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
              <span className="text-white/75">{phone}</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4.5 h-4.5 text-brand-gold shrink-0" />
              <span className="text-white/75">{email}</span>
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
                  href="https://maps.google.com/?q=Greater+Chennai+Police+Commissioner+Office+Vepery" 
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

      {/* State gateways */}
      <div className="max-w-[1700px] mx-auto px-6 py-4 border-t border-white/10 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/60 text-xs uppercase font-black tracking-widest print:hidden">
        <span>{t("footer.gateways")}</span>
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <a
            href="https://www.tnpolice.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-gold transition flex items-center gap-1"
          >
            {t("footer.tnPolice")} <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.tn.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-gold transition flex items-center gap-1"
          >
            {t("footer.govTN")} <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://www.cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-gold transition flex items-center gap-1"
          >
            {t("footer.cyberPortal")} <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-[1700px] mx-auto px-6 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50 text-sm font-normal">
        <p>© 2026 {t("footer.title")}. {t("footer.referenceStructure")}</p>
        <p className="italic text-xs">
          {t("footer.designCredit")}
        </p>
      </div>
    </footer>
  );
}


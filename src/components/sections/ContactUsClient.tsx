"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock, Shield, AlertTriangle, UserCheck, HeartPulse,
  PhoneCall, Send, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  MessageSquare, Navigation, Search, BookOpen, Globe, Wifi, Users,
  CheckCircle, Loader2
} from "lucide-react";
import Image from "next/image";
import { useTranslation } from "@/context/LanguageContext";

// Social media icon helpers (inline SVGs)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

/* ───────── CONTACT DESK DATA ───────── */
const contactDesks = [
  {
    id: "general",
    icon: <Phone className="w-6 h-6" />,
    title: "General Enquiry",
    phone: "044-23452300",
    email: "cop@tncctns.gov.in",
    color: "bg-brand-blue/10 text-brand-blue border-brand-blue/20",
    iconBg: "bg-brand-blue/10 text-brand-blue",
  },
  {
    id: "cyber",
    icon: <Wifi className="w-6 h-6" />,
    title: "Cyber Crime Help",
    phone: "1930",
    email: "cybercrime@tncctns.gov.in",
    color: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    iconBg: "bg-violet-500/10 text-violet-600",
  },
  {
    id: "women",
    icon: <UserCheck className="w-6 h-6" />,
    title: "Women Safety Desk",
    phone: "1091",
    email: "women.safety@tncctns.gov.in",
    color: "bg-pink-500/10 text-pink-600 border-pink-500/20",
    iconBg: "bg-pink-500/10 text-pink-600",
  },
  {
    id: "child",
    icon: <HeartPulse className="w-6 h-6" />,
    title: "Child Helpline",
    phone: "1098",
    email: "child.help@tncctns.gov.in",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-emerald-600",
  },
  {
    id: "emergency",
    icon: <AlertTriangle className="w-6 h-6" />,
    title: "Emergency Control Room",
    phone: "100",
    email: "control.room@tncctns.gov.in",
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    iconBg: "bg-red-500/10 text-red-600",
  },
  {
    id: "lost-doc",
    icon: <BookOpen className="w-6 h-6" />,
    title: "Lost Document Support",
    phone: "044-23452311",
    email: "lost.doc@tncctns.gov.in",
    color: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    iconBg: "bg-amber-500/10 text-amber-600",
  },
  {
    id: "passport",
    icon: <Globe className="w-6 h-6" />,
    title: "Passport Verification",
    phone: "044-23452320",
    email: "passport.verify@tncctns.gov.in",
    color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    iconBg: "bg-cyan-500/10 text-cyan-600",
  },
  {
    id: "outreach",
    icon: <Users className="w-6 h-6" />,
    title: "Citizen Outreach Desk",
    phone: "044-23452330",
    email: "outreach@tncctns.gov.in",
    color: "bg-teal-500/10 text-teal-600 border-teal-500/20",
    iconBg: "bg-teal-500/10 text-teal-600",
  },
];

/* ───────── EMERGENCY NUMBERS ───────── */
const emergencyNumbers = [
  { number: "100", label: "Police Control Room", desc: "24/7 Emergency Response", color: "bg-red-600", icon: <Shield className="w-8 h-8" /> },
  { number: "112", label: "National Emergency", desc: "All Emergencies", color: "bg-brand-blue", icon: <PhoneCall className="w-8 h-8" /> },
  { number: "1930", label: "Cyber Crime Helpline", desc: "Online Fraud & Cyber Crimes", color: "bg-violet-600", icon: <Wifi className="w-8 h-8" /> },
  { number: "1091", label: "Women Helpline", desc: "Women Safety & Support", color: "bg-pink-600", icon: <UserCheck className="w-8 h-8" /> },
  { number: "1098", label: "Child Helpline", desc: "Child Welfare & Protection", color: "bg-emerald-600", icon: <HeartPulse className="w-8 h-8" /> },
];

/* ───────── HOW WE HELP CARDS ───────── */
const helpCards = [
  { icon: <AlertTriangle className="w-7 h-7" />, title: "Report Crime", desc: "Report incidents and crimes directly via TN Police E-Services.", href: "https://eservices.tnpolice.gov.in", color: "text-red-500" },
  { icon: <Search className="w-7 h-7" />, title: "Track Complaint", desc: "Check status online via the official CCTNS tracking portal.", href: "https://eservices.tnpolice.gov.in", color: "text-brand-blue" },
  { icon: <MapPin className="w-7 h-7" />, title: "Find Police Station", desc: "Locate your nearest police station with map directions.", href: "/stations", color: "text-brand-maroon" },
  { icon: <PhoneCall className="w-7 h-7" />, title: "Emergency Contacts", desc: "Access all emergency helpline numbers instantly.", href: "#emergency", color: "text-orange-500" },
  { icon: <MessageSquare className="w-7 h-7" />, title: "Citizen Services", desc: "Apply for verification, NOC, and other services.", href: "/stations", color: "text-teal-500" },
  { icon: <Wifi className="w-7 h-7" />, title: "Cyber Safety Resources", desc: "Learn how to stay safe from online threats.", href: "/category/cyber-safety", color: "text-violet-500" },
];

/* ───────── FAQs ───────── */
const faqs = [
  {
    q: "How do I file a complaint?",
    a: "You can file a complaint by visiting your nearest police station, calling 100 (Police Control Room), or using the online Tamil Nadu Police E-Services portal at eservices.tnpolice.gov.in. You will receive a receipt number to track your complaint."
  },
  {
    q: "How can I contact a police station?",
    a: "Visit our Police Stations Directory at /stations to find the phone number, address, and map location of every police station in Greater Chennai. You can also call 044-23452300 to be directed to the right precinct."
  },
  {
    q: "How do I report cyber fraud?",
    a: "Immediately call the National Cyber Crime Helpline at 1930. You can also file a complaint at cybercrime.gov.in or visit the Cyber Crime Division of your nearest police station."
  },
  {
    q: "How do I apply for passport verification?",
    a: "Passport police verification requests can be submitted through the Police Stations Directory (/stations) by selecting 'Passport Verification Check' in the Citizen Services Desk form. The verification is processed within 15 working days."
  },
  {
    q: "How do I track my complaint?",
    a: "You can track your complaint status online via the Tamil Nadu Police E-Services portal (eservices.tnpolice.gov.in) using your receipt/FIR number, or by contacting your local police station directly."
  },
];

/* ───────── CATEGORY OPTIONS ───────── */
const categories = [
  "General Enquiry",
  "Crime Reporting",
  "Cyber Crime",
  "Women Safety",
  "Child Protection",
  "Lost Document",
  "Passport Verification",
  "Feedback / Suggestion",
  "Other",
];

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
export default function ContactUsClient() {
  const { t, language } = useTranslation();

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <div className="w-full max-w-[1700px] mx-auto px-4 py-0 space-y-0">

      {/* ══════════════════════════════════════
          SECTION 1 – HERO BANNER (IMAGE ONLY)
      ══════════════════════════════════════ */}
      <section className="relative w-full h-[280px] sm:h-[380px] md:h-[480px] overflow-hidden rounded-2xl shadow-md">
        <Image
          src="/images/contact.png"
          alt="Contact Us Banner"
          fill
          priority
          className="object-cover"
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 – CONTACT INFORMATION
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 bg-stone-50 dark:bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3 mb-10">
            <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
              Commissioner&apos;s Office Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <MapPin className="w-6 h-6" />, label: "Address", value: "Commissioner Office, Vepery, Chennai – 600007, Tamil Nadu, India.", color: "text-brand-maroon" },
              { icon: <Phone className="w-6 h-6" />, label: "Phone", value: "044-23452300", color: "text-brand-blue", href: "tel:04423452300" },
              { icon: <Mail className="w-6 h-6" />, label: "Email", value: "cop@tncctns.gov.in", color: "text-brand-gold", href: "mailto:cop@tncctns.gov.in" },
              { icon: <Clock className="w-6 h-6" />, label: "Working Hours", value: "Mon – Sat\n09:00 AM – 06:00 PM", color: "text-emerald-600" },
            ].map((item) => (
              <div key={item.label} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition group">
                <div className={`p-2.5 rounded-xl w-max bg-stone-100 dark:bg-stone-950 ${item.color} group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <div>
                  <span className="text-[9px] uppercase font-black tracking-wider text-stone-400 block mb-1">{item.label}</span>
                  {item.href ? (
                    <a href={item.href} className={`font-bold text-sm ${item.color} hover:underline whitespace-pre-line`}>{item.value}</a>
                  ) : (
                    <p className="font-bold text-sm text-stone-800 dark:text-stone-200 whitespace-pre-line">{item.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 – INTERACTIVE CONTACT DESKS
      ══════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3 mb-10">
            <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
              Department Contact Desks
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {contactDesks.map((desk) => (
              <div key={desk.id} className={`bg-white dark:bg-stone-900 border ${desk.color} rounded-2xl p-5 space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col`}>
                <div className={`p-3 rounded-xl w-max ${desk.iconBg}`}>
                  {desk.icon}
                </div>
                <div className="space-y-1 flex-grow">
                  <h3 className="font-black text-sm uppercase tracking-wide text-stone-900 dark:text-white">{desk.title}</h3>
                  <p className="text-xs font-mono font-bold text-stone-600 dark:text-stone-300">📞 {desk.phone}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 truncate">✉️ {desk.email}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <a href={`tel:${desk.phone}`} className="flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wide bg-stone-50 dark:bg-stone-955 hover:bg-brand-gold hover:text-stone-955 dark:hover:bg-brand-gold dark:hover:text-stone-955 text-stone-700 dark:text-stone-300 rounded-lg border border-stone-200 dark:border-stone-800 transition cursor-pointer">
                    📞 Call
                  </a>
                  <a href={`mailto:${desk.email}`} className="flex-1 py-2 text-center text-[10px] font-black uppercase tracking-wide bg-stone-50 dark:bg-stone-955 hover:bg-brand-blue hover:text-white dark:hover:bg-brand-blue dark:hover:text-white text-stone-700 dark:text-stone-300 rounded-lg border border-stone-200 dark:border-stone-800 transition cursor-pointer">
                    ✉️ Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          SECTION 5 – EMERGENCY QUICK ACCESS
      ══════════════════════════════════════ */}
      <section id="emergency" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3 mb-10">
            <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
              Emergency Quick Access
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {emergencyNumbers.map((e) => (
              <a key={e.number} href={`tel:${e.number}`} className={`${e.color} rounded-2xl p-6 text-white flex flex-col items-center gap-3 hover:opacity-90 hover:scale-[1.03] transition-all duration-200 shadow-lg cursor-pointer text-center group`}>
                <div className="bg-white/20 rounded-xl p-3 group-hover:bg-white/30 transition">
                  {e.icon}
                </div>
                <span className="font-display font-black text-4xl leading-none">{e.number}</span>
                <div>
                  <p className="font-black text-xs uppercase tracking-wider">{e.label}</p>
                  <p className="text-white/70 text-[10px] mt-0.5">{e.desc}</p>
                </div>
                <div className="w-full py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-black uppercase tracking-widest transition">
                  📞 Tap to Call
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 – MAP SECTION
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 bg-stone-50 dark:bg-stone-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2.5 border-b border-stone-200 dark:border-stone-800 pb-3 mb-10">
            <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
            <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
              Commissioner&apos;s Office Location
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-800 shadow-md h-80">
              <iframe
                title="Commissioner Office Map"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://www.openstreetmap.org/export/embed.html?bbox=80.259%2C13.078%2C80.270%2C13.088&layer=mapnik&marker=13.083%2C80.264"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 space-y-3 flex-grow">
                <h3 className="font-black text-sm uppercase tracking-wide text-stone-900 dark:text-white">Commissioner Office</h3>
                <div className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                  <p className="flex gap-2 items-start"><MapPin className="w-4 h-4 text-brand-maroon shrink-0 mt-0.5" /> Commissioner Office, Vepery, Chennai – 600007, Tamil Nadu, India.</p>
                  <p className="flex gap-2 items-center"><Phone className="w-4 h-4 text-brand-blue shrink-0" /> 044-23452300</p>
                  <p className="flex gap-2 items-center"><Clock className="w-4 h-4 text-emerald-600 shrink-0" /> Mon – Sat, 9 AM – 6 PM</p>
                </div>
              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Greater+Chennai+Police+Commissioner+Office+Vepery"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Maps
              </a>
              <a
                href="https://www.google.com/maps/dir/?api=1&destination=Greater+Chennai+Police+Commissioner+Office+Vepery"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-brand-maroon hover:bg-brand-maroon-dark text-white rounded-xl text-xs font-black uppercase tracking-widest transition shadow cursor-pointer"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 – HOW CAN WE HELP
      ══════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tight text-stone-900 dark:text-white">
              How Can We Help You?
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto rounded-full mt-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {helpCards.map((card) => (
              <Link key={card.title} href={card.href} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 flex gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className={`shrink-0 p-3 rounded-xl bg-stone-100 dark:bg-stone-950 ${card.color} group-hover:scale-110 transition-transform`}>
                  {card.icon}
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide text-stone-900 dark:text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 8 – SOCIAL MEDIA
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gradient-to-br from-brand-maroon/5 to-brand-blue/5 dark:from-stone-900 dark:to-stone-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-stone-900 dark:text-white mb-2">
            Follow Us on Social Media
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mb-10">Stay updated with the latest news and safety alerts from Greater Chennai Police.</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { name: "Facebook", handle: "@Chennai.Police", href: "https://www.facebook.com/Chennai.Police/", icon: <FacebookIcon className="w-7 h-7" />, color: "bg-blue-600 hover:bg-blue-700" },
              { name: "Twitter / X", handle: "@chennaipolice_", href: "https://x.com/chennaipolice_", icon: <TwitterIcon className="w-7 h-7" />, color: "bg-stone-900 hover:bg-black dark:bg-white dark:hover:bg-stone-100 dark:text-black" },
              { name: "Instagram", handle: "@greater_chennai_police_", href: "https://www.instagram.com/greater_chennai_police_/", icon: <InstagramIcon className="w-7 h-7" />, color: "bg-gradient-to-tr from-pink-600 via-violet-600 to-orange-500 hover:opacity-90" },
              { name: "YouTube", handle: "GCP Channel", href: "#", icon: <YoutubeIcon className="w-7 h-7" />, color: "bg-red-600 hover:bg-red-700" },
            ].map(s => (
              <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className={`${s.color} text-white rounded-2xl p-6 flex flex-col items-center gap-3 transition shadow-md cursor-pointer group`}>
                <div className="bg-white/20 group-hover:bg-white/30 rounded-xl p-3 transition">{s.icon}</div>
                <div>
                  <p className="font-black text-sm">{s.name}</p>
                  <p className="text-white/70 text-[10px] font-medium">{s.handle}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 9 – FAQ ACCORDION
      ══════════════════════════════════════ */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-black text-2xl uppercase tracking-tight text-stone-900 dark:text-white mb-2">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-brand-maroon mx-auto rounded-full" />
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-bold text-sm text-stone-900 dark:text-white hover:bg-stone-50 dark:hover:bg-stone-855 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-5 h-5 text-brand-maroon shrink-0" />
                    : <ChevronDown className="w-5 h-5 text-stone-400 shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-stone-600 dark:text-stone-400 leading-relaxed border-t border-stone-100 dark:border-stone-800 pt-4 animate-fadeIn">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 10 – FOOTER CTA
      ══════════════════════════════════════ */}
      <section className="py-16 px-4 bg-gradient-to-r from-brand-maroon to-brand-blue text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5">
            <Shield className="w-4 h-4 text-brand-gold" />
            <span className="text-xs font-black uppercase tracking-widest">24/7 Citizen Support</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Need Immediate Assistance?
          </h2>
          <p className="text-white/70 text-base max-w-xl mx-auto">
            We are here to help you round the clock. Call, visit, or message us for any police-related assistance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <a href="tel:100" className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition shadow cursor-pointer">
              <PhoneCall className="w-4 h-4" /> Call Emergency (100)
            </a>
            <Link href="/stations" className="flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl font-black text-sm uppercase tracking-widest transition backdrop-blur-sm cursor-pointer">
              <MapPin className="w-4 h-4" /> Locate Police Station
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

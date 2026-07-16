"use client";

import React, { useState } from "react";
import { Smartphone, Mail, Send, CheckCircle, Loader2, MessageSquare, ClipboardList, Info, HelpCircle } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function GcpCitizenServices() {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState<"trace" | "feedback">("trace");

  // Form states - Trace My Mobile
  const [traceName, setTraceName] = useState("");
  const [traceMobile, setTraceMobile] = useState("");
  const [traceEmail, setTraceEmail] = useState("");
  const [traceBrand, setTraceBrand] = useState("");
  const [traceImei1, setTraceImei1] = useState("");
  const [traceImei2, setTraceImei2] = useState("");
  const [traceDate, setTraceDate] = useState("");
  const [tracePlace, setTracePlace] = useState("");
  const [traceRemarks, setTraceRemarks] = useState("");

  const [traceSubmitting, setTraceSubmitting] = useState(false);
  const [traceSubmitted, setTraceSubmitted] = useState(false);
  const [traceReceiptHtml, setTraceReceiptHtml] = useState("");

  // Form states - Feedback
  const [feedName, setFeedName] = useState("");
  const [feedEmail, setFeedEmail] = useState("");
  const [feedPhone, setFeedPhone] = useState("");
  const [feedType, setFeedType] = useState("appreciation");
  const [feedSubject, setFeedSubject] = useState("");
  const [feedMessage, setFeedMessage] = useState("");

  const [feedSubmitting, setFeedSubmitting] = useState(false);
  const [feedSubmitted, setFeedSubmitted] = useState(false);
  const [feedReceiptHtml, setFeedReceiptHtml] = useState("");

  const handleTraceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTraceSubmitting(true);
    try {
      const res = await fetch("/api/trace-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: traceName,
          mobile: traceMobile,
          email: traceEmail,
          brand: traceBrand,
          imei1: traceImei1,
          imei2: traceImei2,
          date: traceDate,
          place: tracePlace,
          remarks: traceRemarks
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setTraceReceiptHtml(data.emailHtml);
        setTraceSubmitted(true);
      } else {
        alert(language === "ta" ? "கைபேசி கண்காணிப்பு பதிவில் பிழை. மீண்டும் முயலவும்." : "Failed to register trace request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(language === "ta" ? "சர்வர் சேவையுடன் இணைப்பதில் பிழை." : "Error connecting to service.");
    } finally {
      setTraceSubmitting(false);
    }
  };

  const handleFeedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedName,
          email: feedEmail,
          phone: feedPhone,
          feedbackType: feedType,
          subject: feedSubject,
          message: feedMessage
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setFeedReceiptHtml(data.emailHtml);
        setFeedSubmitted(true);
      } else {
        alert(language === "ta" ? "கருத்துக்களை சமர்ப்பிப்பதில் பிழை. மீண்டும் முயலவும்." : "Failed to register feedback. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(language === "ta" ? "சர்வர் சேவையுடன் இணைப்பதில் பிழை." : "Error connecting to service.");
    } finally {
      setFeedSubmitting(false);
    }
  };

  return (
    <section id="citizen-services" className="w-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-850 p-6 md:p-8 shadow-sm text-left scroll-mt-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 rounded-full bg-brand-maroon" />
          <h2 className="font-display font-black text-sm uppercase tracking-widest text-stone-900 dark:text-white">
            {language === "ta" ? "பொது மக்கள் சேவைகள் & கருத்துக்கள்" : "GCP Citizen Services Desk"}
          </h2>
        </div>

        {/* Tab switchers */}
        <div className="inline-flex p-1 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg">
          <button
            onClick={() => setActiveTab("trace")}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "trace"
                ? "bg-brand-maroon text-white shadow"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            {language === "ta" ? "மொபைல் கண்காணிப்பு" : "Trace My Mobile"}
          </button>
          <button
            onClick={() => setActiveTab("feedback")}
            className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "feedback"
                ? "bg-brand-maroon text-white shadow"
                : "text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
            }`}
          >
            {language === "ta" ? "கருத்துக்கணிப்பு" : "Feedback Desk"}
          </button>
        </div>
      </div>

      {/* Render Panel: Trace My Mobile */}
      {activeTab === "trace" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left Column: Workflow Description (5 cols) */}
          <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-950 p-5 sm:p-6 rounded-xl border border-stone-200/60 dark:border-stone-850 space-y-4">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-brand-blue dark:text-brand-gold flex items-center gap-2">
              <ClipboardList className="w-5.5 h-5.5" />
              {language === "ta" ? "மொபைல் மீட்பு செயல்முறை" : "Recovery Workflow Details"}
            </h3>

            <div className="space-y-4 text-xs text-stone-600 dark:text-stone-350 leading-relaxed">
              <p>
                {language === "ta"
                  ? "சென்னை பெருநகர காவல்துறை தங்களது தொலைந்த அல்லது திருடப்பட்ட மொபைல் கைபேசிகளை கண்டறிய இந்த அதிவேக சேவையை வழங்குகிறது."
                  : "This cell assists citizens in locating lost or stolen mobile handsets by placing immediate IMEI network traces."}
              </p>
              
              <ol className="list-decimal pl-4 space-y-2.5">
                <li>
                  <strong>{language === "ta" ? "விவரப் பதிவு:" : "Submit Details:"}</strong>{" "}
                  {language === "ta"
                    ? "கைபேசியின் பிராண்ட் மற்றும் இரண்டு தனித்துவமான 15-இலக்க IMEI எண்களை உள்ளிடவும்."
                    : "Fill in the losses form below including both 15-digit hardware IMEI identifiers."}
                </li>
                <li>
                  <strong>{language === "ta" ? "தொடர்பு மின்னஞ்சல்:" : "Official Contact:"}</strong>{" "}
                  {language === "ta"
                    ? "நேரடி உதவிகளுக்கு, tracemymobile@gcp.tn.gov.in என்ற முகவரியைத் தொடர்பு கொள்ளவும்."
                    : "For status requests, directly email tracemymobile@gcp.tn.gov.in."}
                </li>
                <li>
                  <strong>{language === "ta" ? "கைபேசி மீட்பு:" : "Device Recovery:"}</strong>{" "}
                  {language === "ta"
                    ? "கைபேசி கண்டறியப்பட்டவுடன், தங்களது தொடர்பு எண்ணிற்கு குறுஞ்செய்தி மற்றும் அழைப்பு மூலம் தகவல் தெரிவிக்கப்படும்."
                    : "Once cellular services trigger geolocation updates, local units retrieve the phone and notify you."}
                </li>
              </ol>
            </div>
            
            <div className="p-3.5 rounded-lg bg-[#c5a059]/10 text-brand-gold border border-[#c5a059]/20 text-[10px] leading-relaxed">
              <strong>{language === "ta" ? "குறிப்பு:" : "NOTE:"}</strong>{" "}
              {language === "ta"
                ? "IMEI எண்களை அறிய தங்களது கைபேசி பெட்டியை அல்லது வாங்கிய ரசீதை சரிபார்க்கவும்."
                : "IMEI numbers can be retrieved from your purchase receipt, original billing, or device retail box."}
            </div>
          </div>

          {/* Right Column: Interactive Form (7 cols) */}
          <div className="lg:col-span-7 bg-stone-50 dark:bg-stone-950 p-5 sm:p-6 rounded-xl border border-stone-200/60 dark:border-stone-850 relative overflow-hidden">
            {traceSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400 uppercase">
                    {language === "ta" ? "கைபேசி பதிவு வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது!" : "Complaint Registered Successfully!"}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    {language === "ta"
                      ? "தங்களது கோரிக்கை வெற்றிகரமாக பதிவு செய்யப்பட்டுள்ளது. குறிப்பு விவரங்கள் மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்டுள்ளது."
                      : "A tracking request has been registered and logged. Detailed receipt printed below."}
                  </p>
                </div>

                {traceReceiptHtml && (
                  <div className="text-left border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-white max-h-[220px] overflow-y-auto p-1.5 shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: traceReceiptHtml }} />
                  </div>
                )}

                <button
                  onClick={() => {
                    setTraceSubmitted(false);
                    setTraceName("");
                    setTraceMobile("");
                    setTraceEmail("");
                    setTraceBrand("");
                    setTraceImei1("");
                    setTraceImei2("");
                    setTraceDate("");
                    setTracePlace("");
                    setTraceRemarks("");
                  }}
                  className="px-4 py-2 rounded bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  {language === "ta" ? "மற்றொரு படிவம்" : "Register Another Device"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleTraceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "விண்ணப்பதாரர் பெயர் *" : "Applicant Name *"}</label>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={traceName}
                      onChange={(e) => setTraceName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "தொடர்பு எண் *" : "Mobile Number *"}</label>
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={traceMobile}
                      onChange={(e) => setTraceMobile(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "மின்னஞ்சல் முகவரி *" : "Email Address *"}</label>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={traceEmail}
                      onChange={(e) => setTraceEmail(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "கைபேசி பிராண்ட்/மாடல் *" : "Handset Brand/Model *"}</label>
                    <input
                      type="text"
                      required
                      placeholder="iPhone, Samsung, etc."
                      value={traceBrand}
                      onChange={(e) => setTraceBrand(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">IMEI 1 (15 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      pattern="\d{15}"
                      placeholder="Enter 15 digits"
                      value={traceImei1}
                      onChange={(e) => setTraceImei1(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">IMEI 2 (15 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      pattern="\d{15}"
                      placeholder="Enter 15 digits"
                      value={traceImei2}
                      onChange={(e) => setTraceImei2(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "தொலைந்த தேதி *" : "Date of Loss *"}</label>
                    <input
                      type="date"
                      required
                      value={traceDate}
                      onChange={(e) => setTraceDate(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "தொலைந்த இடம் *" : "Place of Loss *"}</label>
                    <input
                      type="text"
                      required
                      placeholder="Location area"
                      value={tracePlace}
                      onChange={(e) => setTracePlace(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "கூடுதல் விவரங்கள் (தேவைப்பட்டால்)" : "Additional Details (Optional)"}</label>
                  <textarea
                    rows={3}
                    placeholder="Enter any additional details about the incident..."
                    value={traceRemarks}
                    onChange={(e) => setTraceRemarks(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={traceSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-maroon hover:bg-brand-maroon-dark text-white font-black text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {traceSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {traceSubmitting ? (language === "ta" ? "பதிவு செய்யப்படுகிறது..." : "Submitting Tracing Request...") : (language === "ta" ? "கைபேசி தேடலைப் பதிவு செய்" : "Register Tracking Request")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Render Panel: Feedback mechanism */}
      {activeTab === "feedback" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          
          {/* Left Column: Description & Instructions (5 cols) */}
          <div className="lg:col-span-5 bg-stone-50 dark:bg-stone-950 p-5 sm:p-6 rounded-xl border border-stone-200/60 dark:border-stone-850 space-y-4">
            <h3 className="font-display font-black text-xs uppercase tracking-wider text-brand-blue dark:text-brand-gold flex items-center gap-2">
              <MessageSquare className="w-5.5 h-5.5" />
              {language === "ta" ? "மக்கள் கருத்துக்கணிப்பு" : "Public Feedback Mechanism"}
            </h3>

            <div className="space-y-4 text-xs text-stone-600 dark:text-stone-350 leading-relaxed">
              <p>
                {language === "ta"
                  ? "சென்னை பெருநகர காவல்துறை மக்களின் நேர்மறையான கருத்துக்கள், ஆலோசனைகள் மற்றும் புகார்களை வரவேற்கிறது."
                  : "We appreciate your feedback to improve police services, enhance safety, and recognize outstanding actions."}
              </p>
              
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" />
                  <p><strong>{language === "ta" ? "மின்னஞ்சல் மூலம் தொடர்பு:" : "Email Notification:"}</strong> feedback@gcp.tn.gov.in</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold shrink-0 mt-1.5" />
                  <p><strong>{language === "ta" ? "நோக்கம்:" : "Scope:"}</strong> {language === "ta" ? "ரோந்து கண்காணிப்பு, காவல் செயல்பாடுகள் மற்றும் பிற ஆலோசனைகள்." : "Covers police behavior, patrolling frequencies, traffic regulations, and citizen grievances."}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3.5 rounded-lg bg-brand-blue/5 dark:bg-brand-gold/5 border border-brand-blue/10 dark:border-brand-gold/10 text-[10px] leading-relaxed text-stone-500 dark:text-stone-400">
              {language === "ta"
                ? "தங்களது கருத்துக்கள் இரகசியமாக வைக்கப்பட்டு, சேவைகளை மேம்படுத்த மட்டுமே பயன்படுத்தப்படும்."
                : "All feedback inputs are strictly confidential and will be utilized solely to improve public safety operations."}
            </div>
          </div>

          {/* Right Column: Feedback Form (7 cols) */}
          <div className="lg:col-span-7 bg-stone-50 dark:bg-stone-950 p-5 sm:p-6 rounded-xl border border-stone-200/60 dark:border-stone-850 relative overflow-hidden">
            {feedSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-sm text-emerald-600 dark:text-emerald-400 uppercase">
                    {language === "ta" ? "கருத்து வெற்றிகரமாகப் பதிவு செய்யப்பட்டது!" : "Feedback Received Successfully!"}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto">
                    {language === "ta"
                      ? "உங்களது மதிப்புமிக்க கருத்துக்கள் பதிவு செய்யப்பட்டுள்ளது. மின்னஞ்சல் விவரங்கள் அனுப்பப்பட்டுள்ளது."
                      : "Thank you for sharing your thoughts. Form outbox receipt details are printed below."}
                  </p>
                </div>

                {feedReceiptHtml && (
                  <div className="text-left border border-stone-200 dark:border-stone-800 rounded-lg overflow-hidden bg-white max-h-[220px] overflow-y-auto p-1.5 shadow-inner">
                    <div dangerouslySetInnerHTML={{ __html: feedReceiptHtml }} />
                  </div>
                )}

                <button
                  onClick={() => {
                    setFeedSubmitted(false);
                    setFeedName("");
                    setFeedEmail("");
                    setFeedPhone("");
                    setFeedType("appreciation");
                    setFeedSubject("");
                    setFeedMessage("");
                  }}
                  className="px-4 py-2 rounded bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  {language === "ta" ? "மற்றொரு கருத்துப் பதிவு" : "Submit Another Feedback"}
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "பெயர் *" : "Full Name *"}</label>
                    <input
                      type="text"
                      required
                      placeholder="Name"
                      value={feedName}
                      onChange={(e) => setFeedName(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "மின்னஞ்சல் *" : "Email Address *"}</label>
                    <input
                      type="email"
                      required
                      placeholder="Email"
                      value={feedEmail}
                      onChange={(e) => setFeedEmail(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-normal">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "தொடர்பு எண் *" : "Phone Number *"}</label>
                    <input
                      type="tel"
                      required
                      placeholder="Phone"
                      value={feedPhone}
                      onChange={(e) => setFeedPhone(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "கருத்து வகை *" : "Feedback Type *"}</label>
                    <select
                      value={feedType}
                      onChange={(e) => setFeedType(e.target.value)}
                      className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="appreciation">{language === "ta" ? "பாராட்டுக்கள்" : "Appreciation / Praise"}</option>
                      <option value="suggestion">{language === "ta" ? "ஆலோசனைகள்" : "Suggestion / Improvement"}</option>
                      <option value="complaint">{language === "ta" ? "புகார்கள்" : "Grievance / Complaint"}</option>
                      <option value="general">{language === "ta" ? "பொதுவான கருத்துக்கள்" : "General Inquiry"}</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "தலைப்பு *" : "Subject *"}</label>
                  <input
                    type="text"
                    required
                    placeholder="Short summary of feedback"
                    value={feedSubject}
                    onChange={(e) => setFeedSubject(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] uppercase font-black text-stone-550 dark:text-stone-400 block">{language === "ta" ? "விவரங்கள் *" : "Detailed Message *"}</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Write details of your feedback here..."
                    value={feedMessage}
                    onChange={(e) => setFeedMessage(e.target.value)}
                    className="w-full bg-white dark:bg-stone-900 border border-stone-250 dark:border-stone-800 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold text-stone-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={feedSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-maroon hover:bg-brand-maroon-dark text-white font-black text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {feedSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {feedSubmitting ? (language === "ta" ? "சமர்ப்பிக்கப்படுகிறது..." : "Registering Feedback...") : (language === "ta" ? "கருத்தைச் சமர்ப்பி" : "Submit Feedback Details")}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

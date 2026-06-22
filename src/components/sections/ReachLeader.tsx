"use client";

import React, { useState } from "react";
import { Mail, Phone, Landmark, Send, CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export default function ReachLeader() {
  const { t, language } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [grievance, setGrievance] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sentPreviewHtml, setSentPreviewHtml] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mobile, grievance }),
      });
      const data = await response.json();
      if (data.success) {
        setSentPreviewHtml(data.emailHtml);
        setSubmitted(true);
      } else {
        alert(language === "ta" ? "மனுவைச் சமர்ப்பிக்க முடியவில்லை. மீண்டும் முயலவும்." : "Failed to submit grievance. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert(language === "ta" ? "நிர்வாக மேசை சேவையுடன் இணைப்பதில் பிழை." : "Error connecting to the administrative desk service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="resources" className="w-full bg-white dark:bg-stone-950 py-20 px-6 border-b border-stone-200 dark:border-stone-855">
      <div className="max-w-[1700px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Directives & Guidelines (6 cols) - Premium info card */}
        <div className="lg:col-span-6 bg-gradient-to-br from-stone-50/90 via-slate-50/70 to-white dark:from-stone-900/60 dark:via-stone-900/30 dark:to-stone-950/40 p-5 sm:p-7 md:p-8 rounded-[20px] border border-stone-200/60 dark:border-stone-800/80 shadow-lg space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] sm:text-[10.5px] uppercase tracking-widest font-black text-brand-maroon dark:text-brand-gold block text-left">
              {t("contact.citizenOutreach")}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-display font-black tracking-tight text-slate-900 dark:text-white text-left leading-tight">
              {t("contact.title")}
            </h2>
            <p className="text-sm sm:text-base text-slate-650 dark:text-stone-300 font-normal leading-relaxed text-left animate-fade-in mt-1.5">
              {language === "ta"
                ? "நேரடி அறிவிப்புகள், உள்ளூர் பாதுகாப்பு கவலைகள் மற்றும் பொது ஒத்துழைப்பு அறிக்கைகளை நாங்கள் வரவேற்கிறோம். பின்வரும் வழிமுறைகளைப் பயன்படுத்தி எங்களது நிர்வாக மையத்தைத் தொடர்பு கொள்ளவும்:"
                : "We welcome direct notifications, local safety concerns, and public cooperation reports. Reach out to our admin center using the following instructions:"}
            </p>
          </div>

          <div className="space-y-5 text-left">
            <div className="flex gap-3.5 items-start text-left">
              <div className="p-2.5 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold shrink-0 shadow-sm">
                <Landmark className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white text-left">{t("contact.physicalTitle")}</h4>
                <p className="text-[11.5px] sm:text-xs text-slate-550 dark:text-stone-400 text-left leading-relaxed">{t("contact.physicalDesc")}</p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start text-left">
              <div className="p-2.5 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold shrink-0 shadow-sm">
                <Phone className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white text-left">{t("contact.emergencyTitle")}</h4>
                <p className="text-[11.5px] sm:text-xs text-slate-550 dark:text-stone-400 text-left leading-relaxed">{t("contact.emergencyDesc")}</p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start text-left">
              <div className="p-2.5 rounded-xl bg-brand-maroon/5 dark:bg-brand-gold/10 text-brand-maroon dark:text-brand-gold shrink-0 shadow-sm">
                <Mail className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white text-left">{t("contact.cyberTitle")}</h4>
                <p className="text-[11.5px] sm:text-xs text-slate-550 dark:text-stone-400 text-left leading-relaxed">{t("contact.cyberDesc")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Floating Contact Form Card */}
        <div className="lg:col-span-6 flex justify-center w-full">
          <div className="w-full max-w-lg bg-white dark:bg-stone-900 p-5 sm:p-7 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-maroon dark:bg-brand-gold" />

            {submitted ? (
              <div className="py-6 text-center space-y-5">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-display font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                    {language === "ta" ? "மின்னஞ்சல் வெற்றிகரமாக அனுப்பப்பட்டது!" : "Email Sent Successfully!"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-normal leading-relaxed">
                    {language === "ta" 
                      ? "உங்கள் கோரிக்கை விவரங்கள் வெற்றிகரமாகப் பதிவு செய்யப்பட்டு, " 
                      : "Your grievance details have been successfully registered and sent to "}
                    <strong className="text-brand-maroon dark:text-brand-gold font-bold">prasathragul75@gmail.com</strong>
                    {language === "ta" ? " என்ற மின்னஞ்சல் முகவரிக்கு அனுப்பப்பட்டது." : "."}
                  </p>
                </div>

                {/* Simulated Email Preview Container */}
                {sentPreviewHtml && (
                  <div className="w-full text-left border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-inner bg-stone-50 dark:bg-stone-950 max-h-[260px] overflow-y-auto overflow-x-hidden p-1 my-3">
                    <div className="bg-stone-100 dark:bg-stone-900 p-2.5 text-[9px] font-black text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-stone-800 flex justify-between items-center sticky top-0 z-10 uppercase tracking-wider">
                      <span>{t("contact.sentLogs")}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t("contact.sentSuccess")}
                      </span>
                    </div>
                    <div className="p-3 bg-white email-preview-container" dangerouslySetInnerHTML={{ __html: sentPreviewHtml }} />
                    <style dangerouslySetInnerHTML={{ __html: `
                      .email-preview-container .email-card {
                        width: 100% !important;
                        max-width: 100% !important;
                        border-radius: 8px !important;
                        box-shadow: none !important;
                        border: none !important;
                      }
                      .email-preview-container .email-header {
                        padding: 16px 12px !important;
                      }
                      .email-preview-container .email-body {
                        padding: 16px 12px !important;
                      }
                      .email-preview-container .email-table {
                        display: block !important;
                        width: 100% !important;
                      }
                      .email-preview-container .email-table tbody {
                        display: block !important;
                        width: 100% !important;
                      }
                      .email-preview-container .email-row {
                        display: block !important;
                        width: 100% !important;
                      }
                      .email-preview-container .email-label {
                        display: block !important;
                        width: 100% !important;
                        padding-top: 6px !important;
                        padding-bottom: 2px !important;
                        box-sizing: border-box !important;
                      }
                      .email-preview-container .email-val {
                        display: block !important;
                        width: 100% !important;
                        padding-bottom: 8px !important;
                        box-sizing: border-box !important;
                        word-break: break-all !important;
                      }
                      .email-preview-container .email-title {
                        font-size: 14px !important;
                      }
                      .email-preview-container .email-subtitle {
                        font-size: 8px !important;
                        letter-spacing: 1px !important;
                      }
                    `}} />
                  </div>
                )}

                <button
                  onClick={() => {
                    setSubmitted(false);
                    setName("");
                    setEmail("");
                    setMobile("");
                    setGrievance("");
                    setSentPreviewHtml("");
                  }}
                  className="px-5 py-2.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-xs font-black uppercase tracking-wider transition-colors text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  {t("contact.anotherForm")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="border-b border-stone-100 dark:border-stone-800 pb-3 text-left">
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white text-left">{t("contact.outreachForm")}</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-normal text-left">{t("contact.outreachFormDesc")}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block text-left">{t("contact.name")}</label>
                    <input
                      type="text"
                      required
                      placeholder={t("contact.namePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-250 dark:border-stone-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold focus:bg-white dark:focus:bg-stone-850 text-slate-900 dark:text-white transition"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block text-left">{t("contact.email")}</label>
                    <input
                      type="email"
                      required
                      placeholder={t("contact.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-250 dark:border-stone-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold focus:bg-white dark:focus:bg-stone-850 text-slate-900 dark:text-white transition"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block text-left">{t("contact.mobile")}</label>
                  <input
                    type="tel"
                    required
                    placeholder={t("contact.mobilePlaceholder")}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-250 dark:border-stone-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold focus:bg-white dark:focus:bg-stone-850 text-slate-900 dark:text-white transition"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] uppercase font-black text-slate-500 dark:text-slate-400 block text-left">{t("contact.grievance")}</label>
                  <textarea
                    required
                    rows={4}
                    placeholder={t("contact.grievancePlaceholder")}
                    value={grievance}
                    onChange={(e) => setGrievance(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-250 dark:border-stone-700 rounded-lg py-2 px-3 text-xs focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold focus:bg-white dark:focus:bg-stone-850 text-slate-900 dark:text-white transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-brand-maroon dark:bg-brand-gold hover:bg-brand-maroon-dark dark:hover:bg-brand-gold-light text-white dark:text-slate-955 font-black text-xs uppercase tracking-wider transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {isSubmitting ? t("contact.submitProgress") : (language === "ta" ? "படிவத்தை சமர்ப்பிக்கவும்" : "Submit Outreach Form")}
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}

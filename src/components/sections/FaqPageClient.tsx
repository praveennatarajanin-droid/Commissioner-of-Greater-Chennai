"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Tag,
  Phone,
  Shield,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Info,
  X
} from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

export interface PublicFaq {
  id: number;
  question: string;
  question_ta?: string;
  answer: string;
  answer_ta?: string;
  category: string;
  display_order: number;
}

interface FaqPageClientProps {
  initialFaqs?: PublicFaq[];
  initialCategories?: string[];
}

export default function FaqPageClient({ initialFaqs = [], initialCategories = [] }: FaqPageClientProps) {
  const { language } = useTranslation();
  const [faqs, setFaqs] = useState<PublicFaq[]>(initialFaqs);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [loading, setLoading] = useState(initialFaqs.length === 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIds, setOpenIds] = useState<number[]>([]);

  // Fetch FAQs from API on mount
  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.success && Array.isArray(data.data)) {
          setFaqs(data.data);
          if (Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
          // Open first FAQ by default if none are opened
          if (data.data.length > 0 && openIds.length === 0) {
            setOpenIds([data.data[0].id]);
          }
        }
      })
      .catch((err) => console.warn("Failed to fetch public FAQs:", err))
      .finally(() => setLoading(false));
  }, []);

  // Filter FAQs based on search and category
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      const q = (language === "ta" ? (faq.question_ta || faq.question) : (faq.question || faq.question_ta)) || "";
      const a = (language === "ta" ? (faq.answer_ta || faq.answer) : (faq.answer || faq.answer_ta)) || "";
      const cat = faq.category || "";

      const matchesSearch =
        !searchTerm ||
        q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        activeCategory === "all" || cat.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchTerm, activeCategory, language]);

  // Toggle single accordion
  const toggleFaq = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Expand all / Collapse all
  const handleExpandAll = () => {
    if (openIds.length === filteredFaqs.length) {
      setOpenIds([]);
    } else {
      setOpenIds(filteredFaqs.map((f) => f.id));
    }
  };

  const isTamil = language === "ta";

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
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
            {isTamil ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "FAQ"}
          </li>
        </ol>
      </nav>

      {/* ── Header Banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-[#1e40af] via-[#1e3a8a] to-[#0f172a] text-white p-8 sm:p-12 shadow-xl border border-white/10 mb-10">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-brand-gold text-xs font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>{isTamil ? "உதவி மற்றும் வழிகாட்டி" : "Help & Guidance Portal"}</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight font-display text-white">
            {isTamil ? "அடிக்கடி கேட்கப்படும் கேள்விகள்" : "Frequently Asked Questions"}
          </h1>
          
          <p className="text-sm sm:text-base text-white/80 font-normal leading-relaxed">
            {isTamil
              ? "சென்னை பெருநகர காவல் ஆணையர் போர்டல் மற்றும் அதன் சேவைகள் பற்றிய பொதுவான கேள்விகளுக்கான பதில்களைக் கண்டறியவும்."
              : "Find answers to common questions about the Greater Chennai Police Commissioner Portal and its services."}
          </p>

          {/* Search Bar inside Hero */}
          <div className="pt-4 max-w-2xl">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
              <input
                type="text"
                id="faq-search-input"
                aria-label={isTamil ? "கேள்விகளைத் தேடுக" : "Search FAQs"}
                placeholder={
                  isTamil
                    ? "கேள்விகள், சேவைகள் அல்லது தலைப்புகளைத் தேடுக..."
                    : "Search questions, citizen services, police stations, traffic..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl text-sm font-medium text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:bg-white/20 transition"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
                  title={isTamil ? "தேடலை அழிக்கவும்" : "Clear search"}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Filter Pills & Controls ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div
          role="tablist"
          aria-label="FAQ Categories"
          className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto max-w-full no-scrollbar sm:flex-wrap"
        >
          <button
            role="tab"
            aria-selected={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
              activeCategory === "all"
                ? "bg-[#1e40af] text-white shadow-md"
                : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
            }`}
          >
            {isTamil ? "அனைத்தும்" : "All Questions"} ({faqs.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={activeCategory.toLowerCase() === cat.toLowerCase()}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                activeCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[#1e40af] text-white shadow-md"
                  : "bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700"
              }`}
            >
              {cat} ({faqs.filter((f) => f.category.toLowerCase() === cat.toLowerCase()).length})
            </button>
          ))}
        </div>

        {/* Expand / Collapse All Toggle */}
        {filteredFaqs.length > 0 && (
          <button
            onClick={handleExpandAll}
            className="text-xs font-black uppercase tracking-wider text-[#1e40af] dark:text-brand-gold hover:underline cursor-pointer whitespace-nowrap self-end sm:self-auto"
          >
            {openIds.length === filteredFaqs.length
              ? (isTamil ? "அனைத்தையும் மூடு" : "Collapse All")
              : (isTamil ? "அனைத்தையும் விரி" : "Expand All")}
          </button>
        )}
      </div>

      {/* ── FAQ Accordion Section ── */}
      <div className="space-y-4 mb-16">
        {loading ? (
          <div className="p-12 text-center text-stone-400 space-y-3">
            <div className="w-8 h-8 rounded-full border-4 border-[#1e40af] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider">
              {isTamil ? "கேள்விகள் ஏற்றப்படுகின்றன..." : "Loading FAQs..."}
            </p>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-12 text-center space-y-3">
            <Info className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
              {isTamil ? "கேள்விகள் எதுவும் கிடைக்கவில்லை" : "No FAQs Found"}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              {searchTerm || activeCategory !== "all"
                ? (isTamil
                    ? "உங்கள் தேடல் அல்லது வடிகட்டியை மாற்றி முயற்சிக்கவும்."
                    : "Try adjusting your search query or selecting a different category.")
                : (isTamil
                    ? "விரைவில் கூடுதல் கேள்விகள் சேர்க்கப்படும்."
                    : "No frequently asked questions are currently published.")}
            </p>
            {(searchTerm || activeCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="mt-2 text-xs font-bold text-[#1e40af] dark:text-brand-gold hover:underline cursor-pointer"
              >
                {isTamil ? "வடிகட்டிகளை மீட்டமை" : "Clear filters"}
              </button>
            )}
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIds.includes(faq.id);
            const questionText = isTamil
              ? faq.question_ta || faq.question
              : faq.question || faq.question_ta;
            const answerText = isTamil
              ? faq.answer_ta || faq.answer
              : faq.answer || faq.answer_ta;
            const headerId = `faq-header-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white dark:bg-stone-900 border-[#1e40af]/30 dark:border-brand-gold/30 shadow-md ring-1 ring-[#1e40af]/10 dark:ring-brand-gold/10"
                    : "bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                }`}
              >
                {/* Accordion Trigger Button */}
                <button
                  type="button"
                  id={headerId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleFaq(faq.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleFaq(faq.id);
                    }
                  }}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e40af] rounded-2xl"
                >
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                        Q{index + 1}.
                      </span>
                      {faq.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {faq.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 leading-snug">
                      {questionText}
                    </h2>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "bg-[#1e40af] text-white rotate-180"
                        : "bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* Accordion Collapsible Panel */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={headerId}
                  hidden={!isOpen}
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? "block opacity-100" : "hidden opacity-0"
                  }`}
                >
                  <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed border-t border-stone-100 dark:border-stone-800/80 mt-1">
                    <div className="bg-stone-50/80 dark:bg-stone-950/40 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800">
                      <p className="whitespace-pre-line font-normal">{answerText}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Still have questions? Help Card ── */}
      <div className="rounded-3xl bg-linear-to-r from-stone-100 to-stone-50 dark:from-stone-900 dark:to-stone-950 border border-stone-200 dark:border-stone-800 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-brand-maroon dark:text-brand-gold font-black text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>{isTamil ? "மேலும் தகவல் தேவையா?" : "Still Need Assistance?"}</span>
          </div>
          <h3 className="text-xl font-black text-stone-900 dark:text-stone-100 font-display">
            {isTamil ? "நாங்கள் உங்களுக்கு உதவ தயாராக உள்ளோம்" : "Can't find the answer you are looking for?"}
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl font-normal">
            {isTamil
              ? "சென்னை பெருநகர காவல் உதவி மையத்தை தொடர்பு கொள்ளவும் அல்லது குடிமக்கள் சேவைகளை நேரடியாக அணுகவும்."
              : "Get in touch with the official Greater Chennai Police helpdesk or explore online citizen services directly."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
          <Link
            href="/citizen-services"
            className="px-5 py-3 rounded-xl bg-[#1e40af] hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>{isTamil ? "குடிமக்கள் சேவைகள்" : "Citizen Services"}</span>
          </Link>
          <Link
            href="/contact-us"
            className="px-5 py-3 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-black uppercase tracking-wider transition flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            <span>{isTamil ? "தொடர்பு கொள்ள" : "Contact Us"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

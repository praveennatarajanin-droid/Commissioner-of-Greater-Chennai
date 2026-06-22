"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  User, 
  Clock, 
  Share2, 
  Printer, 
  ChevronRight, 
  Search, 
  FileText, 
  Check, 
  Play,
  Pause,
  Square,
  ExternalLink
} from "lucide-react";
import { NewsItem, newsData } from "@/data/newsData";
import { useTranslation } from "@/context/LanguageContext";

// Custom SVG Icons for Social Share
const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V1.3h-4.2c-4.6 0-5.7 3.3-5.7 5.3v2.8H5.8v3.9h2.8v10h4.2v-10h3.5l.5-3.9z" />
  </svg>
);

const TwitterIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function NewsDetailClient({ article }: { article: NewsItem }) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);

  // Get localized content paragraphs
  const contentParagraphs = language === "ta" ? article.content_ta : article.content_en;

  // Speech segments structure
  interface SpeechSegment {
    id: number;
    text: string;
    type: "headline" | "highlight" | "paragraph" | "quote";
    subIndex: number;
  }

  const segments: SpeechSegment[] = React.useMemo(() => {
    const list: SpeechSegment[] = [];
    let id = 0;

    // 1. Headline
    const headlineText = language === "ta" ? article.title_ta : article.title_en;
    if (headlineText) {
      list.push({ id: id++, text: headlineText, type: "headline", subIndex: 0 });
    }

    // 2. Highlights
    const activeHighlights = language === "ta" ? article.highlights_ta : article.highlights_en;
    if (activeHighlights && activeHighlights.length > 0) {
      activeHighlights.forEach((highlight, idx) => {
        list.push({ id: id++, text: highlight, type: "highlight", subIndex: idx });
      });
    }

    // 3. Paragraphs
    const activeParagraphs = language === "ta" ? article.content_ta : article.content_en;
    if (activeParagraphs && activeParagraphs.length > 0) {
      activeParagraphs.forEach((para, idx) => {
        list.push({ id: id++, text: para, type: "paragraph", subIndex: idx });
      });
    }

    // 4. Quote
    if (article.quote) {
      const quoteText = language === "ta" ? article.quote.text_ta : article.quote.text_en;
      if (quoteText) {
        list.push({ id: id++, text: quoteText, type: "quote", subIndex: 0 });
      }
    }

    return list;
  }, [article, language]);

  // TTS Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const [currentTime, setCurrentTime] = useState(0);

  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Derive active paragraph index to highlight in UI
  const currentSegment = activeSegmentIndex >= 0 ? segments[activeSegmentIndex] : null;
  const activeParagraphIndex = currentSegment && currentSegment.type === "paragraph" ? currentSegment.subIndex : -1;

  // Detect if text contains Tamil characters
  const isTamilText = (text: string) => /[\u0B80-\u0BFF]/.test(text);

  // Time format helper
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Word & Pause count to estimate duration
  const totalWords = React.useMemo(() => {
    return segments.reduce((sum, seg) => {
      const words = seg.text.trim().split(/\s+/).filter(Boolean).length;
      return sum + words;
    }, 0);
  }, [segments]);

  const totalPausesSeconds = React.useMemo(() => {
    return segments.reduce((sum, seg, idx) => {
      if (idx === segments.length - 1) return sum; // no pause after last segment
      let pause = 0.6;
      if (seg.type === "headline") pause = 1.0;
      else if (seg.type === "highlight") pause = 0.8;
      else if (seg.type === "paragraph") pause = 0.6;
      else if (seg.type === "quote") pause = 1.0;
      return sum + pause;
    }, 0);
  }, [segments]);

  const estimatedDuration = React.useMemo(() => {
    const wps = language === "ta" ? 2.0 : 2.5;
    const speechDuration = totalWords / wps;
    return (speechDuration + totalPausesSeconds) / playbackSpeed;
  }, [totalWords, totalPausesSeconds, language, playbackSpeed]);

  // Segment Start Time Calculator
  const getSegmentStartTime = (targetIdx: number): number => {
    let elapsedWords = 0;
    let elapsedPauses = 0;
    const wps = language === "ta" ? 2.0 : 2.5;

    for (let i = 0; i < targetIdx; i++) {
      const seg = segments[i];
      const words = seg.text.trim().split(/\s+/).filter(Boolean).length;
      elapsedWords += words;

      let pause = 0.6;
      if (seg.type === "headline") pause = 1.0;
      else if (seg.type === "highlight") pause = 0.8;
      else if (seg.type === "paragraph") pause = 0.6;
      else if (seg.type === "quote") pause = 1.0;
      elapsedPauses += pause;
    }

    return (elapsedWords / wps + elapsedPauses) / playbackSpeed;
  };

  // Keep progress timer ticking during fallback SpeechSynthesis
  useEffect(() => {
    if (isPlaying && !isPaused && !audioRef.current) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= estimatedDuration) {
            if (timerRef.current) clearInterval(timerRef.current);
            return estimatedDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, isPaused, estimatedDuration]);

  // Sync current time on segment transitions
  useEffect(() => {
    if (activeSegmentIndex >= 0 && isPlaying) {
      setCurrentTime(getSegmentStartTime(activeSegmentIndex));
    }
  }, [activeSegmentIndex]);

  // Clean up speech synthesis/audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Handle language switch cleanup
  useEffect(() => {
    handleStop();
  }, [language]);

  // Speak a specific segment index (uses API route audio, falls back to Web Speech API)
  const speakSegment = (index: number) => {
    if (typeof window === "undefined") return;

    if (index >= segments.length) {
      resetTTS();
      return;
    }

    setActiveSegmentIndex(index);

    const segment = segments[index];
    if (segment.type === "paragraph") {
      const el = paragraphRefs.current[segment.subIndex];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    const text = segment.text;
    const isTa = isTamilText(text) || language === "ta";
    const lang = isTa ? "ta" : "en";

    // Clean up any active audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }

    // Clean up any active Web Speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Construct URL for backend API
    const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${lang}`;
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.playbackRate = playbackSpeed;

    audio.onended = () => {
      let pauseDelay = 600; // default paragraph pause
      if (segment.type === "headline") pauseDelay = 1000;
      else if (segment.type === "highlight") pauseDelay = 800;
      else if (segment.type === "paragraph") pauseDelay = 600;
      else if (segment.type === "quote") pauseDelay = 1000;

      const adjustedDelay = pauseDelay / playbackSpeed;

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      // During the pause, set progress to the next segment's start time
      setCurrentTime(getSegmentStartTime(index + 1));

      pauseTimeoutRef.current = setTimeout(() => {
        speakSegment(index + 1);
      }, adjustedDelay);
    };

    audio.ontimeupdate = () => {
      if (audioRef.current === audio) {
        const segStart = getSegmentStartTime(index);
        setCurrentTime(segStart + audio.currentTime);
      }
    };

    audio.onerror = (e) => {
      console.warn("Audio playback error, falling back to browser SpeechSynthesis...", e);
      speakFallback(index);
    };

    audio.play().catch((err) => {
      console.warn("Audio play failed, falling back to browser SpeechSynthesis:", err);
      speakFallback(index);
    });
  };

  // Fallback to local browser SpeechSynthesis if the backend API fails
  const speakFallback = (index: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resetTTS();
      return;
    }

    if (index >= segments.length) {
      resetTTS();
      return;
    }

    setActiveSegmentIndex(index);

    const segment = segments[index];
    const text = segment.text;
    const utterance = new SpeechSynthesisUtterance(text);

    const isTa = isTamilText(text) || language === "ta";
    const lang = isTa ? "ta-IN" : "en-US";
    utterance.lang = lang;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (isTa) {
      selectedVoice = voices.find((v) => v.lang === "ta-IN" || v.lang.startsWith("ta"));
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.name.toLowerCase().includes("tamil") || v.lang.toLowerCase().includes("ta"));
      }
    } else {
      selectedVoice = voices.find((v) => v.name.toLowerCase().includes("natural") && v.lang.startsWith("en"));
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.name.toLowerCase().includes("google") && v.lang.startsWith("en"));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.name.toLowerCase().includes("microsoft") && v.lang.startsWith("en"));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en"));
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    const baseRate = isTa ? 0.85 : 0.90;
    utterance.rate = baseRate * playbackSpeed;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      let pauseDelay = 600;
      if (segment.type === "headline") pauseDelay = 1000;
      else if (segment.type === "highlight") pauseDelay = 800;
      else if (segment.type === "paragraph") pauseDelay = 600;
      else if (segment.type === "quote") pauseDelay = 1000;

      const adjustedDelay = pauseDelay / playbackSpeed;

      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }

      setCurrentTime(getSegmentStartTime(index + 1));

      pauseTimeoutRef.current = setTimeout(() => {
        speakFallback(index + 1);
      }, adjustedDelay);
    };

    utterance.onerror = (e) => {
      if (e.error !== "interrupted") {
        console.error("SpeechSynthesis fallback error:", e);
        resetTTS();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Audio controls
  const handlePlay = () => {
    if (typeof window === "undefined") return;

    if (isPaused) {
      setIsPaused(false);
      if (audioRef.current) {
        audioRef.current.play().catch((err) => {
          console.error("Failed to play audio:", err);
          speakFallback(activeSegmentIndex >= 0 ? activeSegmentIndex : 0);
        });
      } else if (typeof window !== "undefined" && window.speechSynthesis && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      } else {
        speakSegment(activeSegmentIndex >= 0 ? activeSegmentIndex : 0);
      }
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(true);
      setIsPaused(false);
      speakSegment(activeSegmentIndex >= 0 ? activeSegmentIndex : 0);
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setIsPaused(true);
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.ontimeupdate = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = null;
    }
    resetTTS();
  };

  const resetTTS = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setActiveSegmentIndex(-1);
    setCurrentTime(0);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
    if (isPlaying && !isPaused && !audioRef.current && activeSegmentIndex >= 0) {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
        pauseTimeoutRef.current = null;
      }
      speakFallback(activeSegmentIndex);
    }
  };

  // Safely get window URL after mount
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  // Reading progress scroll listener
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle outside clicks to close search suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Copy article link to clipboard
  const handleCopyLink = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Trigger browser print dialog
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = (platform: "facebook" | "twitter" | "whatsapp") => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    const title = language === "ta" ? article.title_ta : article.title_en;
    
    let shareLink = "";
    if (platform === "facebook") {
      shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === "twitter") {
      shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    } else if (platform === "whatsapp") {
      shareLink = `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
  };

  // Filter suggestion results in real-time
  const suggestions = searchQuery.trim() 
    ? newsData.filter(
        (item) => {
          const matchTitle = (language === "ta" ? item.title_ta : item.title_en).toLowerCase().includes(searchQuery.toLowerCase());
          const matchCategory = (language === "ta" ? item.category_ta : item.category_en).toLowerCase().includes(searchQuery.toLowerCase());
          const tags = language === "ta" ? item.tags_ta : item.tags_en;
          const matchTags = tags ? tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) : false;
          return matchTitle || matchCategory || matchTags;
        }
      ).slice(0, 5)
    : [];

  // Smart related stories (category match, max 4, exclude current)
  const relatedStories = newsData
    .filter((item) => item.category_en === article.category_en && item.id !== article.id)
    .slice(0, 4);

  // Fallback to general stories if no category match
  const fallbackStories = relatedStories.length > 0 
    ? relatedStories 
    : newsData.filter((item) => item.id !== article.id).slice(0, 4);

  // Recommended premium articles (max 3, exclude current)
  const recommendedStories = newsData
    .filter((item) => item.id !== article.id)
    .slice(0, 3);

  // Estimate reading time based on English length or Tamil approximation
  const wordCount = (language === "ta" ? article.content_ta : article.content_en).join(" ").split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 180));

  const highlights = language === "ta" ? article.highlights_ta : article.highlights_en;

  return (
    <>
      <div className="print:hidden">
        {/* 1. Reading Progress Bar (Top Sticky border) */}
      <div 
        className="fixed top-0 left-0 h-1 bg-brand-gold dark:bg-amber-500 z-[100] transition-all duration-100 print:hidden" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* 2. Breadcrumbs Bar */}
      <nav className="w-full bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 py-3.5 px-6 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400">
          <Link href="/" className="hover:text-brand-maroon dark:hover:text-brand-gold transition-colors flex items-center gap-1">
            {t("navbar.home")}
          </Link>
          <span className="mx-2 text-stone-400 dark:text-stone-600">/</span>
          <Link href="/#media" className="hover:text-brand-maroon dark:hover:text-brand-gold transition-colors">
            {t("navbar.news")}
          </Link>
          <span className="mx-2 text-stone-400 dark:text-stone-600">/</span>
          <span className="text-slate-800 dark:text-stone-100 font-extrabold truncate max-w-xs md:max-w-lg text-left">
            {language === "ta" ? article.title_ta : article.title_en}
          </span>
        </div>
      </nav>

      {/* Main Grid Section */}
      <div className="max-w-7xl mx-auto py-10 px-6 print:py-4 print:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 print:block">
          
          {/* ================== LEFT SIDE: MAIN ARTICLE (8 COLS) ================== */}
          <article className="lg:col-span-8 space-y-8 print:w-full print:p-0 print:m-0">
            
            {/* Header News Content */}
            <div className="space-y-4 text-left">
              <span className="inline-flex px-3 py-1 rounded bg-brand-maroon/10 text-brand-maroon dark:bg-brand-gold/15 dark:text-brand-gold text-xs font-black uppercase tracking-widest border border-brand-maroon/20 dark:border-brand-gold/30">
                {language === "ta" ? article.category_ta : article.category_en}
              </span>
              
              <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-tight text-left">
                {language === "ta" ? article.title_ta : article.title_en}
              </h1>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-stone-400 font-bold border-y border-stone-200/60 dark:border-stone-800/80 py-3.5 text-left">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-brand-maroon dark:text-brand-gold">
                  <User className="w-4 h-4 shrink-0" />
                  {language === "ta" ? article.author_ta : article.author_en}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {article.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  {readingTime} {t("article.readTime")}
                </span>
                {article.language && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-stone-800 text-slate-655 dark:text-stone-300 font-extrabold">
                    {t("article.source")}: {article.language}
                  </span>
                )}
              </div>
            </div>

            {/* Compact TTS Audio Utility */}
            <div className="py-2.5 px-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-none max-w-xl print:hidden space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                
                {/* Title and duration */}
                <div className="flex items-center gap-2 text-slate-700 dark:text-stone-300 font-bold uppercase tracking-wider text-[10px] text-left">
                  <span>🎧 {isPlaying && !isPaused ? (language === "ta" ? "கட்டுரையைக் கேட்கிறீர்கள்" : "Listening to Article") : t("article.listen")}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-350 dark:bg-stone-700" />
                  <span className="text-slate-455 dark:text-stone-500 font-bold">{readingTime} {t("article.readTime")}</span>
                </div>

                {/* Playback rate */}
                <div className="flex items-center gap-1">
                  {[1, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => handleSpeedChange(speed)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                        playbackSpeed === speed
                          ? "bg-brand-maroon text-white dark:bg-brand-gold"
                          : "text-slate-500 hover:bg-slate-200/80 dark:text-stone-400 dark:hover:bg-stone-800"
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                {isPlaying && !isPaused ? (
                  <button
                    onClick={handlePause}
                    className="flex items-center justify-center p-1.5 rounded-full bg-slate-900 hover:bg-black text-white hover:text-brand-gold transition duration-200 cursor-pointer"
                    title="Pause"
                  >
                    <Pause className="w-3 h-3 fill-current" />
                  </button>
                ) : (
                  <button
                    onClick={handlePlay}
                    className="flex items-center justify-center p-1.5 rounded-full bg-brand-maroon hover:bg-brand-maroon-dark text-white hover:text-brand-gold transition duration-200 cursor-pointer"
                    title="Play"
                  >
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </button>
                )}

                {/* Stop Button */}
                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleStop}
                    className="flex items-center justify-center p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-700 dark:text-stone-300 transition duration-200 cursor-pointer"
                    title="Stop"
                  >
                    <Square className="w-2.5 h-2.5 fill-current" />
                  </button>
                )}

                {/* Progress track */}
                <div className="flex-grow flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-550 dark:text-stone-400 w-8 text-right">
                    {formatTime(currentTime)}
                  </span>
                  
                  <div className="flex-grow h-1.5 bg-slate-200 dark:bg-stone-800 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = clickX / rect.width;
                    const targetTime = pct * estimatedDuration;
                    
                    let targetSegmentIdx = 0;
                    for (let i = 0; i < segments.length; i++) {
                      const segTime = getSegmentStartTime(i + 1);
                      if (targetTime < segTime) {
                        targetSegmentIdx = i;
                        break;
                      }
                      targetSegmentIdx = i;
                    }
                    
                    if (isPlaying) {
                      window.speechSynthesis.cancel();
                      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
                      speakSegment(targetSegmentIdx);
                    } else {
                      setActiveSegmentIndex(targetSegmentIdx);
                      setCurrentTime(getSegmentStartTime(targetSegmentIdx));
                    }
                  }}>
                    <div 
                      className="absolute left-0 top-0 h-full bg-brand-maroon dark:bg-brand-gold transition-all duration-300"
                      style={{ width: `${estimatedDuration > 0 ? (currentTime / estimatedDuration) * 100 : 0}%` }}
                    />
                  </div>

                  <span className="text-[9px] font-mono text-slate-550 dark:text-stone-400 w-8 text-left">
                    {formatTime(estimatedDuration)}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Featured Image — full image, no crop, natural aspect ratio */}
            <div className="w-full rounded-2xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 flex items-center justify-center print:bg-transparent print:border-none print:shadow-none print:my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.image}
                alt={language === "ta" ? article.title_ta : article.title_en}
                className="w-full h-auto max-h-[80vh] object-contain block print:max-w-[85%] print:mx-auto print:rounded-lg print:shadow-sm"
                style={{ display: "block" }}
              />
            </div>

            {/* Key Highlights box */}
            {highlights && highlights.length > 0 && (
              <div className="p-6 bg-slate-50 dark:bg-stone-900 border-l-4 border-brand-maroon dark:border-brand-gold rounded-r-xl space-y-3 text-left">
                <h3 className="font-display font-black uppercase text-xs tracking-wider text-slate-900 dark:text-white flex items-center gap-2 text-left">
                  <FileText className="w-4 h-4 text-brand-maroon dark:text-brand-gold" />
                  {t("article.highlights")}
                </h3>
                <ul className="space-y-2 list-disc pl-4 text-sm text-slate-700 dark:text-stone-350 font-normal leading-relaxed text-left">
                  {highlights.map((highlight, index) => (
                    <li key={index} className="text-left">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Newspaper-style Article Body Content */}
            <div className="font-serif text-slate-800 dark:text-stone-200 text-lg leading-relaxed space-y-6 max-w-none prose dark:prose-invert text-left print:text-black print:text-base print:leading-relaxed print:text-justify">
              {contentParagraphs.map((paragraph, index) => (
                <p 
                  key={index} 
                  ref={(el) => {
                    paragraphRefs.current[index] = el;
                  }}
                  className={`transition-all duration-300 text-left ${
                    activeParagraphIndex === index 
                      ? "bg-amber-100/50 dark:bg-amber-955/30 border-l-4 border-brand-gold pl-4 -ml-5 rounded-r-lg" 
                      : ""
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Custom Blockquote block */}
            {article.quote && (
              <blockquote className="p-6 my-6 bg-stone-50 dark:bg-stone-900 border-l-4 border-brand-maroon dark:border-brand-gold rounded-r-xl italic font-serif text-slate-700 dark:text-stone-300 leading-relaxed relative text-left">
                <span className="absolute top-2 left-2 text-6xl text-brand-maroon/10 dark:text-brand-gold/15 font-serif select-none">“</span>
                <p className="pl-4 relative z-10 text-lg font-medium text-left">
                  {language === "ta" ? article.quote.text_ta : article.quote.text_en}
                </p>
                <cite className="block text-right mt-3 text-xs uppercase font-sans font-black text-slate-900 dark:text-white tracking-widest not-italic">
                  — {language === "ta" ? article.quote.author_ta : article.quote.author_en}
                </cite>
              </blockquote>
            )}

            {/* Custom Timeline Cards */}
            {article.timeline && article.timeline.length > 0 && (
              <div className="space-y-4 text-left">
                <h3 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white border-b border-stone-200 dark:border-stone-800 pb-2 text-left">
                  {t("article.timeline")}
                </h3>
                <div className="relative border-l-2 border-brand-maroon/20 dark:border-brand-gold/20 ml-2.5 pl-6 space-y-6 py-2 text-left">
                  {article.timeline.map((event, index) => (
                    <div key={index} className="relative text-left">
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-brand-maroon dark:bg-brand-gold ring-4 ring-white dark:ring-stone-950" />
                      <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-150 dark:border-stone-855/70 shadow-sm space-y-1 text-left">
                        <span className="text-[10px] font-black text-brand-maroon dark:text-brand-gold uppercase tracking-wider block text-left">
                          {event.time}
                        </span>
                        <p className="text-sm text-slate-800 dark:text-stone-300 font-medium leading-relaxed text-left">
                          {language === "ta" ? event.event_ta : event.event_en}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Article Integration */}
            {article.sourceName && article.sourceUrl && (
              <div className="p-5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl space-y-3 mt-6 text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] text-slate-450 dark:text-stone-500 font-extrabold uppercase tracking-wider block text-left">
                      {t("article.originalPublication")}
                    </span>
                    <p className="text-sm text-slate-800 dark:text-stone-300 font-medium text-left">
                      {t("article.source")}: <span className="font-extrabold text-brand-maroon dark:text-brand-gold">{article.sourceName}</span>
                    </p>
                  </div>
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors duration-250 cursor-pointer shadow-sm border border-brand-gold/25"
                  >
                    {t("article.viewOriginal")} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* Source Information & Utilities Footer Card */}
            <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 mt-8 print:hidden space-y-6 text-left">
              <div>
                <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white pb-2.5 border-b border-stone-200 dark:border-stone-850 text-left">
                  {t("article.sourceInfo")}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4 text-xs text-left">
                  <div className="space-y-1 text-left">
                    <span className="text-slate-450 dark:text-stone-500 font-bold uppercase tracking-wider text-[9px] block text-left">
                      {t("article.publishedBy")}
                    </span>
                    <p className="text-slate-800 dark:text-stone-200 font-extrabold text-sm text-left">
                      {language === "ta" ? article.author_ta : article.author_en}
                    </p>
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-slate-450 dark:text-stone-500 font-bold uppercase tracking-wider text-[9px] block text-left">
                      {t("article.referenceSource")}
                    </span>
                    <p className="text-slate-800 dark:text-stone-200 font-extrabold text-sm text-left">
                      {article.sourceName || (language === "ta" ? "சென்னை பெருநகர காவல் ஊடகப் பிரிவு" : "Greater Chennai Police Media Desk")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-stone-200 dark:border-stone-800 text-left">
                <button
                  onClick={() => setShowShareOptions(!showShareOptions)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-800 dark:text-stone-200 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> {language === "ta" ? "பகிர்க" : "Share Article"}
                </button>

                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-maroon hover:bg-brand-maroon-dark text-white text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer border border-brand-gold/30"
                  >
                    {t("article.readOriginalSource")}
                  </a>
                )}

                <Link
                  href="/#media"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-slate-700 dark:text-stone-300 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  {t("sidebar.backToNews")}
                </Link>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-slate-700 dark:text-stone-300 text-xs font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer md:ml-auto"
                >
                  <Printer className="w-3.5 h-3.5" /> {t("article.print")}
                </button>
              </div>

              {/* Share Options Panel */}
              {showShareOptions && (
                <div className="flex flex-wrap items-center gap-2.5 p-4 bg-white dark:bg-stone-955 border border-stone-150 dark:border-stone-850 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mr-2 text-left">
                    {t("article.share")}
                  </span>
                  
                  {/* WhatsApp */}
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    <WhatsappIcon /> Whatsapp
                  </button>

                  {/* Facebook */}
                  <button
                    onClick={() => handleShare("facebook")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#3b5998] hover:bg-[#2d4373] text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-sm"
                  >
                    <FacebookIcon /> Facebook
                  </button>

                  {/* X (Twitter) */}
                  <button
                    onClick={() => handleShare("twitter")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-wider rounded-md transition-colors cursor-pointer shadow-sm border border-white/5"
                  >
                    <TwitterIcon /> X
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-855 dark:hover:bg-stone-750 text-slate-800 dark:text-stone-205 text-[10px] font-black uppercase tracking-wider rounded-md border border-stone-200 dark:border-stone-750 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> {t("article.copied")}
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" /> {t("article.copyLink")}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Recommended Reading */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-10 mt-10 print:hidden space-y-6 text-left">
              <h3 className="font-display font-black text-sm uppercase tracking-widest text-brand-maroon dark:text-brand-gold text-left">
                {t("article.interested")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recommendedStories.map((item) => (
                  <Link 
                    key={item.id} 
                    href={`/news/${item.slug}`}
                    className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-xl border border-stone-150 dark:border-stone-850 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-350 block cursor-pointer"
                  >
                    <div className="w-full h-32 relative bg-stone-100 dark:bg-stone-800">
                      <Image
                        src={item.image}
                        alt={language === "ta" ? item.title_ta : item.title_en}
                        fill
                        sizes="250px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 flex-grow flex flex-col justify-between space-y-2 text-left">
                      <div className="space-y-1 text-left">
                        <span className="text-[8px] uppercase font-black text-brand-gold block tracking-wider text-left">
                          {language === "ta" ? item.category_ta : item.category_en}
                        </span>
                        <h4 className="font-bold text-[11px] text-slate-900 dark:text-white line-clamp-2 leading-snug text-left">
                          {language === "ta" ? item.title_ta : item.title_en}
                        </h4>
                      </div>
                      <span className="text-[9px] text-slate-400 block text-left">{item.date}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </article>

          {/* ================== RIGHT SIDE: SIDEBAR (4 COLS) ================== */}
          <aside className="lg:col-span-4 space-y-8 print:hidden">
            
            {/* 1. News Search widget with real-time Suggestions dropdown */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 shadow-sm p-4 space-y-3 relative text-left" ref={searchRef}>
              <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white text-left">
                {t("sidebar.search")}
              </h4>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t("sidebar.searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-full bg-stone-50 dark:bg-stone-955 border border-stone-200 dark:border-stone-800 rounded-lg py-2 pl-3.5 pr-10 text-xs text-slate-900 dark:text-stone-100 placeholder:text-slate-400 focus:outline-none focus:border-brand-maroon dark:focus:border-brand-gold transition-colors duration-300"
                />
                <Search className="w-4 h-4 text-slate-455 dark:text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Suggestions Overlay Dropdown */}
              {searchFocused && suggestions.length > 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl z-50 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800 text-left animate-fade-in">
                  {suggestions.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchFocused(false);
                        router.push(`/news/${item.slug}`);
                      }}
                      className="w-full text-left p-3 hover:bg-stone-50 dark:hover:bg-stone-850/80 transition-colors block space-y-0.5 cursor-pointer"
                    >
                      <span className="text-[9px] uppercase font-black text-brand-gold tracking-wider block text-left">
                        [{language === "ta" ? item.category_ta : item.category_en}]
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white block line-clamp-2 leading-snug text-left">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchFocused && searchQuery.trim() && suggestions.length === 0 && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg shadow-xl z-50 p-4 text-center text-xs text-slate-455 dark:text-slate-500">
                  {language === "ta" ? "கட்டுரைகள் எதுவும் காணப்படவில்லை" : "No matching articles found"}
                </div>
              )}
            </div>

            {/* 2. News Statistics widget */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 shadow-sm p-4 space-y-4 text-left">
              <h4 className="font-display font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white border-b border-stone-100 dark:border-stone-800 pb-2 text-left">
                {t("sidebar.info")}
              </h4>
              <div className="divide-y divide-stone-100 dark:divide-stone-800/80 text-xs font-normal text-left">
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-450 dark:text-stone-500 font-medium">{t("sidebar.articleId")}</span>
                  <span className="text-slate-800 dark:text-white font-extrabold uppercase">GCP-{article.id.toString().padStart(4, "0")}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-450 dark:text-stone-500 font-medium">{t("sidebar.category")}</span>
                  <span className="text-brand-maroon dark:text-brand-gold font-extrabold uppercase tracking-wide">{language === "ta" ? article.category_ta : article.category_en}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-450 dark:text-stone-500 font-medium">{t("sidebar.publishedDate")}</span>
                  <span className="text-slate-800 dark:text-white font-bold">{article.date}</span>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-slate-450 dark:text-stone-500 font-medium">{t("sidebar.lastUpdated")}</span>
                  <span className="text-slate-800 dark:text-white font-bold">{article.lastUpdated || article.date}</span>
                </div>
              </div>
            </div>

            {/* 3. Commissioner Message Box Widget */}
            <div className="bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 shadow-sm p-5 space-y-4 flex flex-col justify-between text-left">
              <div className="flex items-center gap-3 text-left">
                <div className="relative w-11 h-11 shrink-0 bg-white border border-brand-gold/30 rounded-full overflow-hidden shadow-inner">
                  <Image
                    src="/images/amalraj_portrait.png"
                    alt="Dr. A. Amalraj IPS portrait"
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-stone-500 block text-left">
                    {t("sidebar.pledgeTitle")}
                  </span>
                  <span className="text-xs uppercase font-black text-slate-900 dark:text-white block text-left">
                    {t("sidebar.pledgeAuthor")}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-655 dark:text-stone-300 font-medium leading-relaxed italic border-l-2 border-brand-maroon dark:border-brand-gold pl-3 text-left">
                {language === "ta" 
                  ? "\"பொதுப் பாதுகாப்பு, நவீனமயமாக்கப்பட்ட சட்ட அமலாக்கம் மற்றும் சமூக நலனுக்காக அர்ப்பணிக்கப்பட்டது.\"" 
                  : "\"Committed to Public Safety, Modernized Law Enforcement, and Community Welfare.\""}
              </p>
            </div>

            {/* 4. Latest News Sidebar (Sticky while scrolling) */}
            <div className="sticky top-20 space-y-6 text-left">
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-855 shadow-sm overflow-hidden text-left">
                <div className="bg-slate-900 text-white px-4 py-3 border-b border-brand-gold flex items-center justify-between">
                  <span className="font-display font-black text-xs uppercase tracking-wider">
                    {t("sidebar.recentReleases")}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="p-3 divide-y divide-stone-100 dark:divide-stone-800/80 text-left">
                  {newsData.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/news/${item.slug}`}
                      className="py-3 hover:bg-stone-50/50 dark:hover:bg-stone-850/50 transition-colors block space-y-1 block first:pt-1 last:pb-1 text-left"
                    >
                      <span className="text-[8px] uppercase font-black text-brand-gold tracking-wider block text-left">
                        [{language === "ta" ? item.category_ta : item.category_en}]
                      </span>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-white hover:text-brand-maroon dark:hover:text-brand-gold transition leading-snug line-clamp-2 text-left">
                        {language === "ta" ? item.title_ta : item.title_en}
                      </h5>
                      <div className="flex items-center justify-between mt-1.5 text-left">
                        <span className="text-[9px] text-slate-450 dark:text-stone-500 block text-left">
                          {item.date}
                        </span>
                        <span className="text-[8px] font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider">
                          {t("article.readMore")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* 5. Back to News button */}
              <Link
                href="/#media"
                className="w-full py-3 px-4 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border border-brand-gold/30 cursor-pointer shadow-md text-center"
              >
                {t("sidebar.backToNews")}
              </Link>
            </div>

          </aside>

        </div>

        {/* ================== RELATED NEWS SECTION (FULL WIDTH) ================== */}
        <section className="border-t border-stone-200 dark:border-stone-800 pt-12 mt-12 print:hidden space-y-8 text-left">
          <div className="space-y-1 text-left">
            <h2 className="font-display font-black text-lg sm:text-xl md:text-2xl tracking-tight text-slate-900 dark:text-white uppercase text-left">
              {t("article.related")}
            </h2>
            <p className="text-xs text-slate-455 dark:text-stone-500 font-bold uppercase tracking-wider text-left">
              {t("article.relatedSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {fallbackStories.map((item) => (
              <div 
                key={item.id}
                className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-150 dark:border-stone-855 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-350 text-left"
              >
                {/* Thumbnail image */}
                <div className="w-full h-[150px] relative bg-stone-100 dark:bg-stone-800">
                  <Image
                    src={item.image}
                    alt={language === "ta" ? item.title_ta : item.title_en}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                </div>
                
                {/* Content body */}
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3 text-left">
                  <div className="space-y-1.5 text-left">
                    <span className="text-[9px] uppercase font-black text-brand-gold tracking-widest block text-left">
                      {language === "ta" ? item.category_ta : item.category_en}
                    </span>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug text-left">
                      {language === "ta" ? item.title_ta : item.title_en}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-stone-400 font-light leading-relaxed line-clamp-3 text-left">
                      {language === "ta" ? item.summary_ta : item.summary_en}
                    </p>
                  </div>

                  {/* Read More button */}
                  <div className="pt-2.5 border-t border-stone-50 dark:border-stone-800/80 flex items-center justify-between text-left">
                    <span className="text-[9px] font-bold text-slate-400 block text-left">
                      {item.date}
                    </span>
                    <Link
                      href={`/news/${item.slug}`}
                      className="text-[10px] font-black uppercase text-brand-maroon dark:text-brand-gold hover:text-brand-maroon-dark dark:hover:text-brand-gold-light tracking-wider flex items-center gap-0.5"
                    >
                      {t("article.readMore")}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
      </div>

      {/* Dedicated Print Layout (A4 Newspaper style) */}
      <div className="article-print-container hidden print:block bg-white text-black p-4 font-serif leading-relaxed text-justify max-w-[21cm] mx-auto">
        {/* Top Header */}
        <div className="border-b-4 border-double border-stone-800 pb-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/images/gcp_logo.png" alt="GCP Logo" className="w-16 h-16 object-contain" />
            <div className="text-left">
              <h1 className="font-display font-black text-2xl tracking-tight text-black uppercase leading-none">CHENNAI GUARDIAN</h1>
              <span className="text-[10px] font-sans font-bold text-stone-600 uppercase tracking-widest block mt-1">GREATER CHENNAI POLICE OFFICIAL PORTAL</span>
            </div>
          </div>
          <div className="text-right flex flex-col justify-center items-end">
            <span className="text-[10px] font-sans font-black uppercase tracking-wider text-stone-500">Official Release</span>
            <span className="text-[10px] font-sans font-bold text-black uppercase">Government of Tamil Nadu</span>
          </div>
        </div>

        {/* Category & Title */}
        <div className="mb-6 text-left">
          <span className="inline-block border border-black px-2 py-0.5 text-[9px] uppercase font-black tracking-widest text-black mb-2 rounded">
            {language === "ta" ? article.category_ta : article.category_en}
          </span>
          <h2 className="text-2xl font-black font-display text-black leading-tight mb-3">
            {language === "ta" ? article.title_ta : article.title_en}
          </h2>
          
          {/* Metadata Row */}
          <div className="border-y border-stone-300 py-2.5 text-[10px] font-sans font-bold text-stone-600 uppercase tracking-wider flex justify-between">
            <span>Published: {article.date}</span>
            <span>Author: {language === "ta" ? article.author_ta : article.author_en}</span>
            {article.sourceName && <span>Source: {article.sourceName}</span>}
          </div>
        </div>

        {/* Featured Image */}
        {article.image && (
          <div className="w-full mb-6 flex justify-center break-inside-avoid">
            <img 
              src={article.image} 
              alt={language === "ta" ? article.title_ta : article.title_en} 
              className="w-full max-h-[350px] object-cover rounded-lg border border-stone-300 shadow-sm" 
            />
          </div>
        )}

        {/* Key Highlights */}
        {highlights && highlights.length > 0 && (
          <div className="bg-stone-100 border border-stone-300 rounded-xl p-4 mb-6 break-inside-avoid text-left">
            <h4 className="font-sans font-black uppercase text-[10px] tracking-widest text-black mb-2">Key Highlights</h4>
            <ul className="space-y-1.5 list-disc pl-4 text-xs text-stone-850">
              {highlights.map((hl, idx) => (
                <li key={idx} className="leading-relaxed">{hl}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Commissioner Quote */}
        {article.quote && (
          <blockquote className="p-4 my-6 bg-stone-50 border-l-4 border-stone-800 rounded-r-xl italic text-left text-xs leading-relaxed text-stone-800 break-inside-avoid">
            <p className="font-semibold mb-1">"{language === "ta" ? article.quote.text_ta : article.quote.text_en}"</p>
            <cite className="block text-right text-[9px] uppercase font-sans font-black text-stone-900 tracking-wider not-italic">
              — {language === "ta" ? article.quote.author_ta : article.quote.author_en}
            </cite>
          </blockquote>
        )}

        {/* Article Body Content */}
        <div className="text-xs leading-relaxed space-y-4 text-justify font-serif text-black mb-8">
          {contentParagraphs.map((paragraph, index) => (
            <p key={index} className="break-inside-avoid">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Timeline */}
        {article.timeline && article.timeline.length > 0 && (
          <div className="space-y-3 text-left mb-6 break-inside-avoid">
            <h3 className="font-sans font-black text-[10px] uppercase tracking-widest text-black border-b border-stone-300 pb-1.5">
              {t("article.timeline")}
            </h3>
            <div className="divide-y divide-stone-200 text-xs">
              {article.timeline.map((event, index) => (
                <div key={index} className="py-2 flex gap-4">
                  <span className="font-sans font-black text-stone-500 w-16 text-[10px] tracking-wider shrink-0 uppercase">{event.time}</span>
                  <span className="text-stone-855">{language === "ta" ? event.event_ta : event.event_en}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Footer */}
        <div className="border-t-2 border-stone-800 pt-4 mt-8 flex justify-between items-center text-[9px] font-sans font-black uppercase tracking-widest text-stone-500 break-inside-avoid">
          {article.sourceName && article.sourceUrl ? (
            <span>Source: {article.sourceName}</span>
          ) : (
            <span>Official Greater Chennai Police Bulletin</span>
          )}
          <span>Printed from Chennai Guardian Portal</span>
        </div>
      </div>
    </>
  );
}

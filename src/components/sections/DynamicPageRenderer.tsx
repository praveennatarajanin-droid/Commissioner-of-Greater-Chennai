"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "@/context/LanguageContext";

interface SectionBlock {
  id?: number;
  section_type: string; // 'banner' | 'heading' | 'description' | 'image' | 'cards' | 'cta_buttons'
  section_title: string;
  content_json: any;
  display_order: number;
}

interface DynamicPageRendererProps {
  sections: SectionBlock[];
}

// Helper to resolve Lucide icons dynamically by string name
function DynamicIcon({ name, className = "w-6 h-6 text-brand-gold" }: { name: string; className?: string }) {
  const IconComp = (LucideIcons as any)[name];
  if (IconComp) {
    return <IconComp className={className} />;
  }
  // Fallback icon
  const HelpIcon = LucideIcons.HelpCircle;
  return <HelpIcon className={className} />;
}

export default function DynamicPageRenderer({ sections }: DynamicPageRendererProps) {
  const { language } = useTranslation();
  if (!sections || sections.length === 0) return null;

  // Sort sections by display order to guarantee layout sequence
  const sortedSections = [...sections].sort((a, b) => a.display_order - b.display_order);

  return (
    <div className="space-y-16">
      {sortedSections.map((section, sIdx) => {
        const data = section.content_json || {};
        const heading = language === "ta" ? data.heading_ta || data.heading_en : data.heading_en;
        const text = language === "ta" ? data.text_ta || data.text_en : data.text_en;
        const title = language === "ta" ? data.title_ta || data.title_en : data.title_en;
        const subtitle = language === "ta" ? data.subtitle_ta || data.subtitle_en : data.subtitle_en;

        switch (section.section_type) {
          case "banner": {
            const bgImage = data.bg_image || "/images/about_hero.jpg";
            const ctaText = language === "ta" ? data.cta_text_ta || data.cta_text_en : data.cta_text_en;
            const ctaLink = data.cta_link;

            return (
              <section key={section.id || sIdx} className="w-full relative min-h-[400px] md:min-h-[500px] flex items-center justify-center text-white overflow-hidden">
                {/* Background Image with Dark Overlay */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={bgImage}
                    alt={title || "Banner"}
                    fill
                    priority={sIdx === 0}
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute inset-0 bg-stone-950/70" />
                </div>

                <div className="relative z-10 max-w-4xl mx-auto text-center px-6 py-12 space-y-6">
                  {title && (
                    <motion.h1
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="font-display font-black text-3xl md:text-5xl uppercase tracking-wider leading-tight"
                    >
                      {title}
                    </motion.h1>
                  )}
                  {subtitle && (
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                      className="text-stone-300 text-sm md:text-lg max-w-2xl mx-auto uppercase tracking-widest font-semibold"
                    >
                      {subtitle}
                    </motion.p>
                  )}
                  {ctaText && ctaLink && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                      className="pt-4"
                    >
                      <Link
                        href={ctaLink}
                        className="inline-block px-8 py-3.5 bg-brand-gold hover:bg-amber-600 text-stone-950 font-black uppercase text-xs tracking-widest rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {ctaText}
                      </Link>
                    </motion.div>
                  )}
                </div>
              </section>
            );
          }

          case "heading": {
            if (!heading) return null;
            return (
              <section key={section.id || sIdx} className="max-w-[1700px] mx-auto px-4 md:px-6">
                <div className="flex items-center gap-3 border-b border-stone-200 dark:border-stone-850 pb-3">
                  <div className="w-1.5 h-6 bg-brand-maroon rounded-full" />
                  <h2 className="font-display font-black text-lg md:text-2xl uppercase tracking-wider text-stone-900 dark:text-white">
                    {heading}
                  </h2>
                </div>
              </section>
            );
          }

          case "description": {
            if (!text) return null;
            return (
              <section key={section.id || sIdx} className="max-w-[1700px] mx-auto px-4 md:px-6">
                <div
                  className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 text-sm md:text-base leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: text }}
                />
              </section>
            );
          }

          case "image": {
            const imageUrl = data.image_url;
            const altText = data.alt_text || "Page content image";
            const caption = language === "ta" ? data.caption_ta || data.caption_en : data.caption_en;
            if (!imageUrl) return null;

            return (
              <section key={section.id || sIdx} className="max-w-[1700px] mx-auto px-4 md:px-6 flex flex-col items-center">
                <div className="relative w-full max-w-4xl h-[300px] md:h-[450px] rounded-xl overflow-hidden shadow-md">
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1200px) 100vw, 1200px"
                  />
                </div>
                {caption && (
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 text-center italic">
                    {caption}
                  </p>
                )}
              </section>
            );
          }

          case "cards": {
            const cardItems = data.cards || [];
            if (cardItems.length === 0) return null;

            return (
              <section key={section.id || sIdx} className="max-w-[1700px] mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {cardItems.map((card: any, cIdx: number) => {
                    const cTitle = language === "ta" ? card.title_ta || card.title_en : card.title_en;
                    const cDesc = language === "ta" ? card.desc_ta || card.desc_en : card.desc_en;
                    const cIcon = card.icon || "Shield";
                    const cLink = card.link;

                    const CardWrapper = cLink ? Link : "div";

                    return (
                      <motion.div
                        key={cIdx}
                        whileHover={cLink ? { y: -6 } : {}}
                        transition={{ duration: 0.3 }}
                        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-4">
                          <div className="w-12 h-12 bg-brand-blue/10 rounded-xl flex items-center justify-center">
                            <DynamicIcon name={cIcon} className="w-6 h-6 text-brand-blue-light dark:text-brand-gold" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-display font-bold text-sm md:text-base text-stone-900 dark:text-white uppercase tracking-wide">
                              {cTitle}
                            </h3>
                            <p className="text-xs md:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                              {cDesc}
                            </p>
                          </div>
                        </div>
                        {cLink && (
                          <CardWrapper
                            href={cLink}
                            className="text-xs text-brand-gold hover:text-amber-500 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-6 self-start"
                          >
                            <span>Learn More</span>
                            <LucideIcons.ArrowRight className="w-3.5 h-3.5" />
                          </CardWrapper>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            );
          }

          case "cta_buttons": {
            const buttons = data.buttons || [];
            if (buttons.length === 0) return null;

            return (
              <section key={section.id || sIdx} className="max-w-[1700px] mx-auto px-4 md:px-6 flex flex-wrap gap-4 items-center justify-center">
                {buttons.map((btn: any, bIdx: number) => {
                  const bText = language === "ta" ? btn.text_ta || btn.text_en : btn.text_en;
                  const bLink = btn.link;
                  const bStyle = btn.style || "primary"; // 'primary' | 'secondary'
                  const openNew = btn.open_in_new_tab === 1;

                  return (
                    <Link
                      key={bIdx}
                      href={bLink || "#"}
                      target={openNew ? "_blank" : undefined}
                      className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-300 ${
                        bStyle === "primary"
                          ? "bg-brand-maroon hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                          : "bg-white hover:bg-stone-100 text-brand-blue border border-stone-200 dark:border-stone-850 dark:bg-stone-900 dark:text-white dark:hover:bg-stone-800"
                      }`}
                    >
                      {bText}
                    </Link>
                  );
                })}
              </section>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
